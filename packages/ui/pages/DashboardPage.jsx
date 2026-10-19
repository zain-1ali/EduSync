import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useLocalData } from '../data/LocalDataProvider';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';
import { receiptPath } from '../components/fees/ledger';

const BRANDING_KEY = 'branding';
const PAID_CHARGE_STATUSES = new Set(['paid', 'settled', 'void', 'cancelled', 'canceled', 'waived']);
const VOID_PAYMENT_STATUSES = new Set(['void', 'cancelled', 'canceled', 'failed', 'refunded']);
const PRESETS = [
  { id: 'month', label: 'This month' },
  { id: '30-days', label: 'Last 30 days' },
  { id: 'academic-year', label: 'Academic year' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom' },
];

function localDay(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function shiftDay(day, amount) {
  const [year, month, date] = day.split('-').map(Number);
  const value = new Date(year, (month || 1) - 1, date || 1);
  value.setDate(value.getDate() + amount);
  return localDay(value);
}

function resolveRange(preset, year, customFrom, customTo, today) {
  if (preset === 'all') return { from: '', to: '' };
  if (preset === 'custom') {
    if (customFrom && customTo && customFrom > customTo) return { from: customTo, to: customFrom };
    return { from: customFrom, to: customTo };
  }
  if (preset === 'academic-year') {
    if (!year?.startDate) return { from: '', to: '' };
    return { from: String(year.startDate).slice(0, 10), to: String(year.endDate || today).slice(0, 10) };
  }
  if (preset === '30-days') return { from: shiftDay(today, -29), to: today };
  return { from: `${today.slice(0, 7)}-01`, to: today };
}

function dayNumber(day) {
  const [year, month, date] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, date) / 86400000;
}

function previousRange(range) {
  if (!range.from || !range.to || range.from > range.to) return null;
  const days = dayNumber(range.to) - dayNumber(range.from) + 1;
  const prevTo = shiftDay(range.from, -1);
  return { from: shiftDay(prevTo, -(days - 1)), to: prevTo };
}

function recordDay(record, keys) {
  for (const key of keys) {
    if (record?.[key]) return String(record[key]).slice(0, 10);
  }
  return '';
}

function matchesRange(day, range) {
  if (!range.from && !range.to) return true;
  if (!day) return false;
  if (range.from && day < range.from) return false;
  if (range.to && day > range.to) return false;
  return true;
}

function matchesTaggedYear(record, yearId) {
  if (!yearId || !record.academicYearId) return true;
  return record.academicYearId === yearId;
}

function isActiveStudent(student) {
  const status = String(student.status || 'active').toLowerCase();
  return status === 'active' || status === 'enrolled';
}

function studentInYear(student, yearId, programIds) {
  if (!yearId) return true;
  if (student.academicYearId) return student.academicYearId === yearId;
  if (!programIds.size) return true;
  return programIds.has(student.classId);
}

function numberOrNull(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function paymentAmount(payment) {
  return numberOrNull(payment.amount) ?? numberOrNull(payment.amountPaid) ?? numberOrNull(payment.paidAmount) ?? numberOrNull(payment.total) ?? 0;
}

function isCollectedPayment(payment) {
  return !VOID_PAYMENT_STATUSES.has(String(payment.status || 'paid').toLowerCase());
}

function chargeOutstanding(charge) {
  const status = String(charge.status || 'pending').toLowerCase();
  if (PAID_CHARGE_STATUSES.has(status)) return 0;
  const balance = numberOrNull(charge.balance) ?? numberOrNull(charge.outstanding);
  if (balance != null) return Math.max(0, balance);
  const amount = numberOrNull(charge.amount) ?? numberOrNull(charge.total) ?? 0;
  const paid = numberOrNull(charge.amountPaid) ?? numberOrNull(charge.paidAmount) ?? 0;
  return Math.max(0, amount - paid);
}

function timeValue(value) {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function titleCase(value) {
  const text = String(value || '').replaceAll('_', ' ').trim();
  if (!text) return '—';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function classLabel(student) {
  return [student?.className, student?.sectionName].filter(Boolean).join(' / ');
}

function formatDelta(current, previous) {
  if (previous == null) return null;
  const delta = current - previous;
  if (delta === 0) return { text: '0%', direction: 'flat' };
  if (previous === 0) return { text: delta > 0 ? `+${delta}` : String(delta), direction: delta > 0 ? 'up' : 'down' };
  const percent = Math.round((delta / previous) * 100);
  return { text: `${percent > 0 ? '+' : ''}${percent}%`, direction: percent > 0 ? 'up' : 'down' };
}

function formatMoney(value, currency) {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  const code = /^[A-Z]{3}$/.test(currency || '') ? currency : 'USD';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(amount);
  } catch {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount);
  }
}

function formatSchoolDate(day, dateFormat) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(day || ''));
  if (!match) return day || '—';
  const [, year, month, date] = match;
  if (dateFormat === 'DD/MM/YYYY') return `${date}/${month}/${year}`;
  if (dateFormat === 'MM/DD/YYYY') return `${month}/${date}/${year}`;
  return `${year}-${month}-${date}`;
}

function formatSchoolWhen(value, dateFormat) {
  if (!value) return '—';
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return formatSchoolDate(text, dateFormat);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return formatSchoolDate(text, dateFormat);
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${formatSchoolDate(localDay(date), dateFormat)}, ${time}`;
}

function readBranding(records) {
  const matches = records.filter((record) => record.key === BRANDING_KEY);
  matches.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return matches[0] || null;
}

function periodLabel(range, preset, dateFormat) {
  if (preset === 'academic-year' && !range.from && !range.to) return 'Academic year dates are not set, so every date is included';
  if (!range.from && !range.to) return 'All dates';
  if (range.from && range.to) return `${formatSchoolDate(range.from, dateFormat)} to ${formatSchoolDate(range.to, dateFormat)}`;
  if (range.from) return `From ${formatSchoolDate(range.from, dateFormat)}`;
  return `Through ${formatSchoolDate(range.to, dateFormat)}`;
}

function tally(records) {
  const counts = { present: 0, absent: 0, late: 0, leave: 0, other: 0 };
  for (const record of records) {
    const status = String(record.status || '').toLowerCase();
    if (Object.hasOwn(counts, status)) counts[status] += 1;
    else counts.other += 1;
  }
  return counts;
}

function buildSearchResults({ query, students, payments, staff, canStudents, canFees, canStaff }) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const includes = (...parts) => parts.some((part) => String(part || '').toLowerCase().includes(needle));
  const results = [];
  if (canStudents) {
    for (const student of students) {
      if (!includes(student.name, student.admissionNumber, student.className, student.sectionName)) continue;
      results.push({
        id: `search-student-${student.id}`,
        label: student.name || 'Student',
        detail: [student.admissionNumber, classLabel(student)].filter(Boolean).join(' · ') || 'Student',
        to: `/students/${student.id}`,
      });
    }
  }
  if (canFees) {
    for (const payment of payments) {
      const student = students.find((item) => item.id === payment.studentId);
      if (!includes(payment.receiptNumber, payment.id, student?.name, payment.status)) continue;
      results.push({
        id: `search-payment-${payment.id}`,
        label: student?.name || 'Fee payment',
        detail: [payment.receiptNumber ? `Receipt ${payment.receiptNumber}` : 'Payment', payment.id].join(' · '),
        to: payment.studentId && canStudents ? `/students/${payment.studentId}` : '/fees',
      });
    }
  }
  if (canStaff) {
    for (const member of staff) {
      if (!includes(member.name, member.employeeId, member.role)) continue;
      results.push({
        id: `search-staff-${member.id}`,
        label: member.name || 'Staff',
        detail: [member.employeeId, member.role].filter(Boolean).join(' · ') || 'Staff',
        to: `/staff/${member.id}`,
      });
    }
  }
  return results.slice(0, 8);
}

function buildDashboardModel({ students, payments, charges, attendance, programs, sections, yearId, range, previous, today, permissions }) {
  const programIds = new Set();
  if (yearId) {
    for (const program of programs) {
      if (program.academicYearId === yearId) programIds.add(program.id);
    }
  }
  const sectionIds = new Set();
  if (yearId) {
    for (const section of sections) {
      if (section.academicYearId === yearId || programIds.has(section.programId)) sectionIds.add(section.id);
    }
  }
  const studentsById = new Map(students.map((student) => [student.id, student]));
  const inYear = (student) => studentInYear(student, yearId, programIds);
  const attendanceInScope = (record) => {
    if (!yearId) return true;
    if (record.academicYearId) return record.academicYearId === yearId;
    if (!sectionIds.size) return true;
    return sectionIds.has(record.sectionId);
  };

  const activeStudents = students
    .filter((student) => isActiveStudent(student) && inYear(student))
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

  const countNew = (window) => students.filter((student) => inYear(student) && matchesRange(recordDay(student, ['admissionDate', 'createdAt']), window)).length;

  const collectPayments = (window) => {
    const rows = [];
    let total = 0;
    for (const payment of payments) {
      if (!isCollectedPayment(payment) || !matchesTaggedYear(payment, yearId)) continue;
      if (!matchesRange(recordDay(payment, ['paidAt', 'createdAt', 'updatedAt']), window)) continue;
      const amount = paymentAmount(payment);
      total += amount;
      rows.push({ payment, amount });
    }
    rows.sort((a, b) => timeValue(b.payment.paidAt || b.payment.createdAt) - timeValue(a.payment.paidAt || a.payment.createdAt));
    return { total, rows };
  };

  const collectDues = (window) => {
    const rows = [];
    for (const charge of charges) {
      if (!matchesTaggedYear(charge, yearId)) continue;
      if (!matchesRange(recordDay(charge, ['dueDate', 'createdAt']), window)) continue;
      const outstanding = chargeOutstanding(charge);
      if (outstanding <= 0) continue;
      rows.push({ charge, outstanding });
    }
    rows.sort((a, b) => b.outstanding - a.outstanding);
    const total = rows.reduce((sum, row) => sum + row.outstanding, 0);
    return { total, rows };
  };

  const groupDefaulters = (dueRows) => {
    const groups = new Map();
    for (const row of dueRows) {
      const studentId = row.charge.studentId || '';
      const key = studentId ? `student:${studentId}` : `charge:${row.charge.id}`;
      const current = groups.get(key) || {
        id: key,
        studentId,
        name: studentsById.get(studentId)?.name || 'Unlinked charge',
        amount: 0,
        count: 0,
        syncStatus: row.charge.syncStatus,
      };
      current.amount += row.outstanding;
      current.count += 1;
      if (row.charge.syncStatus === 'pending') current.syncStatus = 'pending';
      groups.set(key, current);
    }
    return [...groups.values()].sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
  };

  const collected = collectPayments(range);
  const previousCollected = previous ? collectPayments(previous) : null;
  const dues = collectDues(range);
  const previousDues = previous ? collectDues(previous) : null;
  const defaulters = groupDefaulters(dues.rows);
  const previousDefaulters = previous ? groupDefaulters(previousDues.rows) : null;
  const todayAttendance = attendance.filter((record) => recordDay(record, ['date', 'createdAt']) === today && attendanceInScope(record));
  const periodAttendance = attendance.filter((record) => attendanceInScope(record) && matchesRange(recordDay(record, ['date', 'createdAt']), range));

  const studentHref = (studentId, fallback) => (studentId && permissions.canStudents ? `/students/${studentId}` : fallback);

  const drills = {};
  if (permissions.canStudents) {
    drills.students = {
      title: 'Active students',
      description: `${activeStudents.length} active student${activeStudents.length === 1 ? '' : 's'} in this view`,
      href: '/students',
      hrefLabel: 'Open student directory',
      rows: activeStudents.map((student) => ({
        id: student.id,
        href: `/students/${student.id}`,
        primary: student.name || 'Student',
        secondary: [student.admissionNumber, classLabel(student)].filter(Boolean).join(' · ') || 'No class assigned',
        amount: null,
        status: titleCase(student.status || 'active'),
        syncStatus: student.syncStatus,
      })),
    };
  }
  if (permissions.canFees) {
    drills.collected = {
      title: 'Fees collected',
      description: `${formatMoney(collected.total, permissions.currency)} from ${collected.rows.length} payment${collected.rows.length === 1 ? '' : 's'}`,
      href: '/fees',
      hrefLabel: 'Open fee management',
      rows: collected.rows.map(({ payment, amount }) => ({
        id: payment.id,
        href: studentHref(payment.studentId, '/fees'),
        primary: studentsById.get(payment.studentId)?.name || 'Fee payment',
        secondary: [payment.receiptNumber ? `Receipt ${payment.receiptNumber}` : 'No receipt number', `Payment ${payment.id}`].join(' · '),
        amount,
        status: titleCase(payment.status || 'paid'),
        syncStatus: payment.syncStatus,
        actionHref: receiptPath(payment.id),
        actionLabel: `Print receipt ${payment.receiptNumber || payment.id}`,
        actionText: 'Print receipt',
      })),
    };
    drills.dues = {
      title: 'Pending dues',
      description: `${formatMoney(dues.total, permissions.currency)} across ${dues.rows.length} open charge${dues.rows.length === 1 ? '' : 's'}`,
      href: '/defaulters',
      hrefLabel: 'Open defaulters',
      rows: dues.rows.map(({ charge, outstanding }) => ({
        id: charge.id,
        href: studentHref(charge.studentId, '/defaulters'),
        primary: studentsById.get(charge.studentId)?.name || 'Unlinked charge',
        secondary: [charge.description || charge.name || 'Charge', recordDay(charge, ['dueDate']) ? `Due ${recordDay(charge, ['dueDate'])}` : '', charge.id].filter(Boolean).join(' · '),
        amount: outstanding,
        status: titleCase(charge.status || 'pending'),
        syncStatus: charge.syncStatus,
      })),
    };
    drills.defaulters = {
      title: 'Defaulters',
      description: `${defaulters.length} student${defaulters.length === 1 ? '' : 's'} owing ${formatMoney(dues.total, permissions.currency)}`,
      href: '/defaulters',
      hrefLabel: 'Open defaulters',
      rows: defaulters.map((row) => ({
        id: row.id,
        href: studentHref(row.studentId, '/defaulters'),
        primary: row.name,
        secondary: `${row.count} open charge${row.count === 1 ? '' : 's'}`,
        amount: row.amount,
        status: 'Outstanding',
        syncStatus: row.syncStatus,
      })),
    };
  }
  if (permissions.canAttendance) {
    drills.attendance = {
      title: 'Marked today',
      description: `${todayAttendance.length} attendance mark${todayAttendance.length === 1 ? '' : 's'} for ${formatSchoolDate(today, permissions.dateFormat)}`,
      href: permissions.canManageAttendance ? '/attendance' : '',
      hrefLabel: 'Open attendance register',
      rows: todayAttendance.map((record) => ({
        id: record.id,
        href: studentHref(record.studentId, permissions.canManageAttendance ? '/attendance' : ''),
        primary: record.studentName || studentsById.get(record.studentId)?.name || 'Student',
        secondary: [record.date, record.sectionName].filter(Boolean).join(' · ') || 'Attendance',
        amount: null,
        status: titleCase(record.status || 'present'),
        syncStatus: record.syncStatus,
      })),
    };
  }

  const activity = [];
  if (permissions.canFees) {
    for (const payment of payments) {
      if (!matchesTaggedYear(payment, yearId)) continue;
      const at = payment.paidAt || payment.createdAt || payment.updatedAt;
      if (!matchesRange(recordDay(payment, ['paidAt', 'createdAt', 'updatedAt']), range)) continue;
      activity.push({
        id: `payment-${payment.id}`,
        at,
        href: studentHref(payment.studentId, '/fees'),
        primary: studentsById.get(payment.studentId)?.name || 'Fee payment',
        secondary: [payment.receiptNumber ? `Receipt ${payment.receiptNumber}` : 'Payment', `Payment ${payment.id}`].join(' · '),
        amount: paymentAmount(payment),
        status: titleCase(payment.status || 'paid'),
        syncStatus: payment.syncStatus,
        actionHref: receiptPath(payment.id),
        actionLabel: `Print receipt ${payment.receiptNumber || payment.id}`,
        actionText: 'Print receipt',
      });
    }
  }
  if (permissions.canStudents) {
    for (const student of students) {
      if (!inYear(student)) continue;
      const at = student.createdAt || student.admissionDate || student.updatedAt;
      if (!matchesRange(recordDay(student, ['admissionDate', 'createdAt']), range)) continue;
      activity.push({
        id: `student-${student.id}`,
        at,
        href: `/students/${student.id}`,
        primary: student.name || 'Student',
        secondary: [student.admissionNumber, classLabel(student)].filter(Boolean).join(' · ') || 'Student record',
        amount: null,
        status: titleCase(student.status || 'active'),
        syncStatus: student.syncStatus,
      });
    }
  }
  if (permissions.canAttendance) {
    const groups = new Map();
    for (const record of periodAttendance) {
      const day = recordDay(record, ['date', 'createdAt']) || 'undated';
      const key = `${day}:${record.sectionId || 'all'}`;
      const group = groups.get(key) || {
        id: `attendance-${key}`,
        at: record.updatedAt || record.createdAt || day,
        day,
        sectionName: record.sectionName || '',
        counts: { present: 0, absent: 0, late: 0, leave: 0 },
        syncStatus: record.syncStatus,
      };
      const status = String(record.status || '').toLowerCase();
      if (Object.hasOwn(group.counts, status)) group.counts[status] += 1;
      if (timeValue(record.updatedAt) > timeValue(group.at)) group.at = record.updatedAt;
      if (record.syncStatus === 'pending') group.syncStatus = 'pending';
      groups.set(key, group);
    }
    for (const group of groups.values()) {
      activity.push({
        id: group.id,
        at: group.at,
        href: permissions.canManageAttendance ? '/attendance' : '',
        primary: 'Attendance',
        secondary: [formatSchoolDate(group.day, permissions.dateFormat), group.sectionName, `${group.counts.present} present`, `${group.counts.absent} absent`].filter(Boolean).join(' · '),
        amount: null,
        status: group.syncStatus === 'pending' ? 'Pending sync' : 'Saved',
        syncStatus: group.syncStatus,
      });
    }
  }
  activity.sort((a, b) => timeValue(b.at) - timeValue(a.at));

  return {
    activeStudents,
    newStudents: countNew(range),
    newStudentTrend: formatDelta(countNew(range), previous ? countNew(previous) : null),
    collected,
    collectedTrend: formatDelta(collected.total, previousCollected ? previousCollected.total : null),
    dues,
    duesTrend: formatDelta(dues.total, previousDues ? previousDues.total : null),
    defaulters,
    defaulterTrend: formatDelta(defaulters.length, previousDefaulters ? previousDefaulters.length : null),
    todayAttendance,
    todayCounts: tally(todayAttendance),
    periodCounts: tally(periodAttendance),
    drills,
    activity: activity.slice(0, 8),
    activityHref: permissions.canFees ? '/fees' : permissions.canStudents ? '/students' : permissions.canManageAttendance ? '/attendance' : '',
    activityHrefLabel: permissions.canFees ? 'View all transactions' : permissions.canStudents ? 'View students' : 'View attendance',
    schoolEmpty: students.length === 0 && payments.length === 0 && charges.length === 0 && attendance.length === 0,
  };
}

function SearchField({ students, payments, staff, canStudents, canFees, canStaff }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const deferred = useDeferredValue(query);
  const results = useMemo(
    () => buildSearchResults({ query: deferred, students, payments, staff, canStudents, canFees, canStaff }),
    [deferred, students, payments, staff, canStudents, canFees, canStaff]
  );
  const safeIndex = results.length ? Math.min(activeIndex, results.length - 1) : 0;
  const active = results[safeIndex];
  const listOpen = open && query.trim().length > 0;

  const go = (result) => {
    if (!result) return;
    setOpen(false);
    navigate(result.to);
  };

  return (
    <form
      role="search"
      className="relative w-full max-w-[10rem] sm:max-w-xs md:max-w-sm"
      onSubmit={(event) => {
        event.preventDefault();
        go(active);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor="dashboard-search" className="sr-only">Search records</label>
      <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
      <input
        id="dashboard-search"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listOpen}
        aria-controls="dashboard-search-results"
        aria-activedescendant={listOpen && active ? active.id : undefined}
        value={query}
        placeholder="Search records"
        autoComplete="off"
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => (results.length ? (current + 1) % results.length : 0));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => (results.length ? (current - 1 + results.length) % results.length : 0));
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
        className="w-full h-10 pl-10 pr-3 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {listOpen ? (
        <ul id="dashboard-search-results" role="listbox" className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No matching records</li>
          ) : results.map((result, index) => (
            <li key={result.id} role="presentation">
              <button
                type="button"
                id={result.id}
                role="option"
                aria-selected={index === safeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => go(result)}
                className={`w-full text-left px-4 py-3 ${index === safeIndex ? 'bg-primary/10' : ''}`}
              >
                <span className="block font-bold text-sm">{result.label}</span>
                <span className="block text-xs text-slate-500 break-words">{result.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

function trendClass(direction, positiveIsGood) {
  if (!direction || direction === 'flat') return 'text-slate-500';
  const good = positiveIsGood ? direction === 'up' : direction === 'down';
  return good ? 'text-emerald-600' : 'text-rose-600';
}

function KpiCard({ pressed, onSelect, icon, iconClass, title, value, note, trend, positiveIsGood }) {
  const direction = trend?.direction;
  const iconName = direction === 'down' ? 'trending_down' : direction === 'up' ? 'trending_up' : 'trending_flat';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={pressed}
      aria-controls={pressed ? 'dashboard-drill' : undefined}
      className={`bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border text-left shadow-sm flex flex-col gap-4 min-h-36 focus:outline-none focus:ring-2 focus:ring-primary ${pressed ? 'border-primary' : 'border-slate-200 dark:border-slate-800'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`material-symbols-outlined ${iconClass} p-2 rounded-lg`} aria-hidden="true">{icon}</span>
        {trend ? (
          <span className={`${trendClass(direction, positiveIsGood)} text-sm font-medium inline-flex items-center gap-1`}>
            <span className="sr-only">Compared with the previous period</span>
            {trend.text}
            <span className="material-symbols-outlined text-xs" aria-hidden="true">{iconName}</span>
          </span>
        ) : null}
      </div>
      <span>
        <span className="block text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</span>
        <span className="block text-2xl sm:text-3xl font-bold mt-1 break-words">{value}</span>
        <span className="block text-xs text-slate-500 mt-1">{note}</span>
      </span>
    </button>
  );
}

function RecordList({ rows, currency, empty }) {
  if (!rows.length) return <p className="p-6 text-sm text-slate-500 text-center">{empty}</p>;
  const visible = rows.slice(0, 50);
  return (
    <>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {visible.map((row) => (
          <li key={row.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="min-w-0">
              {row.href ? (
                <Link to={row.href} className="font-bold text-primary hover:underline break-words">{row.primary}</Link>
              ) : (
                <span className="font-bold break-words">{row.primary}</span>
              )}
              <p className="text-sm text-slate-500 break-words">{row.secondary}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {row.amount != null ? <span className="font-bold">{formatMoney(row.amount, currency)}</span> : null}
              <span className="text-xs font-bold uppercase text-slate-500">{row.status}</span>
              {row.syncStatus === 'pending' ? <span className="text-xs font-bold text-amber-700">Pending sync</span> : null}
              {row.actionHref ? (
                <Link to={row.actionHref} aria-label={row.actionLabel} className="inline-flex items-center gap-1 min-h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">print</span>
                  {row.actionText}
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {rows.length > visible.length ? <p className="px-4 py-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">Showing {visible.length} of {rows.length}</p> : null}
    </>
  );
}

export function DashboardPage() {
  const { hasAccess } = useAuth();
  const { status } = useLocalData();
  const students = useLocalCollection('students');
  const payments = useLocalCollection('payments');
  const charges = useLocalCollection('charges');
  const attendance = useLocalCollection('attendance');
  const academicYears = useLocalCollection('academicYears');
  const programs = useLocalCollection('programs');
  const sections = useLocalCollection('sections');
  const settings = useLocalCollection('settings');
  const staff = useLocalCollection('staff');
  const branding = useMemo(() => readBranding(settings.data), [settings.data]);
  const [yearChoice, setYearChoice] = useState(null);
  const [rangePreset, setRangePreset] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [drill, setDrill] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const drillRef = useRef(null);

  const canStudents = hasAccess(MODULES.STUDENTS);
  const canManageStudents = hasAccess(MODULES.STUDENTS, ACCESS_LEVELS.MANAGE);
  const canFees = hasAccess(MODULES.FEES);
  const canAttendance = hasAccess(MODULES.ATTENDANCE);
  const canManageAttendance = hasAccess(MODULES.ATTENDANCE, ACCESS_LEVELS.MANAGE);
  const canStaff = hasAccess(MODULES.STAFF);
  const canViewSync = hasAccess(MODULES.SYNC);
  const canManageSync = hasAccess(MODULES.SYNC, ACCESS_LEVELS.MANAGE);
  const canManageSettings = hasAccess(MODULES.SETTINGS, ACCESS_LEVELS.MANAGE);
  const yearId = yearChoice === null ? branding?.academicYearId || '' : yearChoice;
  const today = localDay();
  const currency = /^[A-Z]{3}$/.test(branding?.currency || '') ? branding.currency : 'USD';
  const dateFormat = branding?.dateFormat || 'YYYY-MM-DD';
  const selectedYear = academicYears.data.find((year) => year.id === yearId) || null;
  const range = useMemo(
    () => resolveRange(rangePreset, selectedYear, customFrom, customTo, today),
    [rangePreset, selectedYear, customFrom, customTo, today]
  );
  const previous = useMemo(() => previousRange(range), [range]);

  const model = useMemo(
    () => buildDashboardModel({
      students: students.data,
      payments: payments.data,
      charges: charges.data,
      attendance: attendance.data,
      programs: programs.data,
      sections: sections.data,
      yearId,
      range,
      previous,
      today,
      permissions: { canStudents, canFees, canAttendance, canManageAttendance, currency, dateFormat },
    }),
    [students.data, payments.data, charges.data, attendance.data, programs.data, sections.data, yearId, range, previous, today, canStudents, canFees, canAttendance, canManageAttendance, currency, dateFormat]
  );

  const collections = [students, payments, charges, attendance, academicYears, programs, sections, settings, staff];
  const loadError = collections.find((collection) => collection.error)?.error || null;
  const hasAnyData = collections.some((collection) => collection.data.length > 0);
  const stillLoading = collections.some((collection) => collection.isLoading);
  const isInitialLoading = stillLoading && !hasAnyData && !loadError;
  const descriptor = drill ? model.drills[drill] : null;
  const yearOptions = useMemo(
    () => [...academicYears.data].sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || ''))),
    [academicYears.data]
  );

  useEffect(() => {
    if (!drill) return;
    drillRef.current?.focus();
  }, [drill]);

  const retry = async () => {
    setRetrying(true);
    try {
      await Promise.all(collections.map((collection) => collection.refresh()));
    } finally {
      setRetrying(false);
    }
  };

  const quickActions = [
    canManageStudents && { to: '/students/add', label: 'Add student', icon: 'person_add' },
    canManageAttendance && { to: '/attendance', label: 'Mark attendance', icon: 'fact_check' },
    canFees && { to: '/fees', label: 'Record a fee', icon: 'payments' },
    canManageStudents && { to: '/import', label: 'Import students', icon: 'upload_file' },
    canViewSync && { to: '/sync', label: 'Review sync', icon: 'sync' },
    canManageSettings && { to: '/settings', label: 'School settings', icon: 'settings' },
  ].filter(Boolean);

  const cards = [
    canStudents && {
      id: 'students',
      title: 'Active students',
      value: String(model.activeStudents.length),
      note: !range.from && !range.to ? 'All local students' : `${model.newStudents} new in this period`,
      trend: model.newStudentTrend,
      positiveIsGood: true,
      icon: 'person_celebrate',
      iconClass: 'text-primary bg-primary/10',
    },
    canFees && {
      id: 'collected',
      title: 'Fees collected',
      value: formatMoney(model.collected.total, currency),
      note: `${model.collected.rows.length} payment${model.collected.rows.length === 1 ? '' : 's'}`,
      trend: model.collectedTrend,
      positiveIsGood: true,
      icon: 'account_balance_wallet',
      iconClass: 'text-emerald-600 bg-emerald-500/10',
    },
    canFees && {
      id: 'dues',
      title: 'Pending dues',
      value: formatMoney(model.dues.total, currency),
      note: `${model.dues.rows.length} open charge${model.dues.rows.length === 1 ? '' : 's'}`,
      trend: model.duesTrend,
      positiveIsGood: false,
      icon: 'pending_actions',
      iconClass: 'text-amber-500 bg-amber-500/10',
    },
    canFees && {
      id: 'defaulters',
      title: 'Defaulters',
      value: String(model.defaulters.length),
      note: formatMoney(model.dues.total, currency),
      trend: model.defaulterTrend,
      positiveIsGood: false,
      icon: 'warning',
      iconClass: 'text-rose-600 bg-rose-500/10',
    },
    canAttendance && {
      id: 'attendance',
      title: 'Marked today',
      value: String(model.todayAttendance.length),
      note: model.todayAttendance.length ? `${model.todayCounts.present} present · ${model.todayCounts.absent} absent` : 'No attendance saved today',
      trend: null,
      positiveIsGood: true,
      icon: 'fact_check',
      iconClass: 'text-primary bg-primary/10',
    },
  ].filter(Boolean);

  const conflictHref = canManageSync ? '/sync/conflicts' : canViewSync ? '/sync' : '';

  return (
    <Layout
      title="Overview"
      headerActions={(
        <SearchField
          students={students.data}
          payments={payments.data}
          staff={staff.data}
          canStudents={canStudents}
          canFees={canFees}
          canStaff={canStaff}
        />
      )}
    >
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 flex-grow w-full max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-3" aria-label="Sync status">
          <p className="text-sm text-slate-500">
            {status.online ? 'Online' : 'Offline'}
            {' · '}
            {status.lastSyncAt ? `Last sync ${formatSchoolWhen(status.lastSyncAt, dateFormat)}` : 'Not synced yet'}
            {status.pending > 0 ? ` · ${status.pending} pending` : ''}
            {status.running ? ' · Syncing' : ''}
          </p>
          {!status.online ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200" role="status">
              This device is offline. Figures come from local records and stay available.
            </p>
          ) : null}
          {status.failed > 0 ? (
            <p className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300" role="status">
              {status.failed} sync item{status.failed === 1 ? '' : 's'} failed.
              {canViewSync ? <> <Link to="/sync" className="font-bold underline">Review sync</Link></> : null}
            </p>
          ) : null}
          {status.conflicts > 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200" role="status">
              {status.conflicts} sync conflict{status.conflicts === 1 ? '' : 's'} need review.
              {conflictHref ? <> <Link to={conflictHref} className="font-bold underline">Open conflicts</Link></> : null}
            </p>
          ) : null}
          {status.pending > 0 ? (
            <p className="text-sm text-amber-700" role="status">
              {status.pending} local change{status.pending === 1 ? '' : 's'} waiting to sync.
              {canViewSync ? <> <Link to="/sync" className="font-bold underline">View queue</Link></> : null}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row xl:items-end gap-4 justify-between">
            <div className="flex flex-col gap-2 min-w-0">
              <label htmlFor="dashboard-year" className="text-sm font-bold">Academic year</label>
              <select id="dashboard-year" value={yearId} onChange={(event) => setYearChoice(event.target.value)} className="h-11 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 max-w-full">
                <option value="">All years</option>
                {yearId && !yearOptions.some((year) => year.id === yearId) ? <option value={yearId}>Saved academic year</option> : null}
                {yearOptions.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
              </select>
            </div>
            <div role="group" aria-label="Reporting period" className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button key={preset.id} type="button" aria-pressed={rangePreset === preset.id} onClick={() => setRangePreset(preset.id)} className={`min-h-10 px-3 rounded-lg text-sm font-bold ${rangePreset === preset.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          {rangePreset === 'custom' ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex flex-col gap-1 text-sm font-bold">From<input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="h-11 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 font-normal" /></label>
              <label className="flex flex-col gap-1 text-sm font-bold">To<input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="h-11 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 font-normal" /></label>
            </div>
          ) : null}
          <p className="text-sm text-slate-500">{periodLabel(range, rangePreset, dateFormat)}</p>
        </div>

        {quickActions.length ? (
          <div className="flex flex-wrap gap-2" aria-label="Quick actions">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to} className="min-h-10 inline-flex items-center gap-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold">
                <span aria-hidden="true" className="material-symbols-outlined text-base">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}

        {isInitialLoading ? (
          <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-slate-500" role="status" aria-busy="true">Loading dashboard records from this device…</p>
        ) : null}

        {!isInitialLoading && loadError && !hasAnyData ? (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 p-6" role="alert">
            <p className="font-bold text-red-700 dark:text-red-300">Local records could not be read.</p>
            <p className="text-sm mt-1 text-red-700 dark:text-red-300">{loadError.message}</p>
            <button type="button" onClick={retry} disabled={retrying} className="mt-4 h-10 px-4 rounded-lg bg-white font-bold disabled:opacity-40">{retrying ? 'Trying…' : 'Try again'}</button>
          </div>
        ) : null}

        {!isInitialLoading && (hasAnyData || !loadError) ? (
          <>
            {loadError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300" role="alert">
                Some local records could not be refreshed. {loadError.message}
                <button type="button" onClick={retry} disabled={retrying} className="ml-2 font-bold underline disabled:opacity-40">{retrying ? 'Trying…' : 'Try again'}</button>
              </div>
            ) : null}
            {stillLoading && hasAnyData ? <p className="text-sm text-slate-500" role="status">Refreshing local records…</p> : null}
            {model.schoolEmpty ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 sm:p-8 text-center">
                <p className="font-bold">This school has no local records yet.</p>
                <p className="text-sm text-slate-500 mt-1">Add a student, mark attendance, or record a fee. Totals stay on this device and update after each local save.</p>
              </div>
            ) : null}

            {cards.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {cards.map((card) => (
                  <KpiCard key={card.id} {...card} pressed={drill === card.id} onSelect={() => setDrill((current) => (current === card.id ? null : card.id))} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Your role does not include student, fee, or attendance records on this dashboard.</p>
            )}

            {canAttendance ? (
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">Attendance in this period</h3>
                  {canManageAttendance ? <Link to="/attendance" className="text-primary text-sm font-bold">Open attendance register</Link> : null}
                </div>
                {model.periodCounts.present + model.periodCounts.absent + model.periodCounts.late + model.periodCounts.leave + model.periodCounts.other === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No attendance has been saved for this period.</p>
                ) : (
                  <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      ['Present', model.periodCounts.present],
                      ['Absent', model.periodCounts.absent],
                      ['Late', model.periodCounts.late],
                      ['Leave', model.periodCounts.leave],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
                        <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
                        <dd className="text-2xl font-black">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            ) : null}

            {descriptor ? (
              <section id="dashboard-drill" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden" aria-labelledby="dashboard-drill-title">
                <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 ref={drillRef} tabIndex={-1} id="dashboard-drill-title" className="text-lg font-bold rounded focus:outline-none focus:ring-2 focus:ring-primary">{descriptor.title}</h3>
                    <p className="text-sm text-slate-500">{descriptor.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {descriptor.href ? <Link to={descriptor.href} className="text-primary text-sm font-bold">{descriptor.hrefLabel}</Link> : null}
                    <button type="button" onClick={() => setDrill(null)} className="text-sm font-bold text-slate-500">Close details</button>
                  </div>
                </div>
                <RecordList rows={descriptor.rows} currency={currency} empty="No records match this card for the selected period." />
              </section>
            ) : null}

            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Recent activity</h3>
                  <p className="text-sm text-slate-500">{periodLabel(range, rangePreset, dateFormat)}</p>
                </div>
                {model.activityHref ? <Link to={model.activityHref} className="text-primary text-sm font-semibold hover:underline">{model.activityHrefLabel}</Link> : null}
              </div>
              {model.activity.length === 0 ? (
                <p className="p-10 text-center text-slate-500">No activity in this period.</p>
              ) : (
                <>
                  <ul className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {model.activity.map((item) => (
                      <li key={item.id} className="p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {item.href ? <Link to={item.href} className="font-bold text-primary break-words">{item.primary}</Link> : <span className="font-bold">{item.primary}</span>}
                            <p className="text-sm text-slate-500 break-words">{item.secondary}</p>
                          </div>
                          {item.amount != null ? <span className="font-bold shrink-0">{formatMoney(item.amount, currency)}</span> : null}
                        </div>
                        <p className="text-xs text-slate-500">{formatSchoolWhen(item.at, dateFormat)} · {item.status}{item.syncStatus === 'pending' ? ' · Pending sync' : ''}</p>
                        {item.actionHref ? <Link to={item.actionHref} aria-label={item.actionLabel} className="inline-flex items-center gap-1 text-xs font-bold text-primary"><span aria-hidden="true" className="material-symbols-outlined text-sm">print</span>{item.actionText}</Link> : null}
                      </li>
                    ))}
                  </ul>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <caption className="sr-only">Recent local activity</caption>
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          {['When', 'Record', 'Detail', 'Amount', 'Status', 'Actions'].map((heading) => (
                            <th key={heading} scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{heading}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {model.activity.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formatSchoolWhen(item.at, dateFormat)}</td>
                            <td className="px-6 py-4 text-sm font-semibold">{item.href ? <Link to={item.href} className="text-primary hover:underline">{item.primary}</Link> : item.primary}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{item.secondary}</td>
                            <td className="px-6 py-4 text-sm font-bold">{item.amount != null ? formatMoney(item.amount, currency) : '—'}</td>
                            <td className="px-6 py-4 text-sm">{item.status}{item.syncStatus === 'pending' ? ' · Pending sync' : ''}</td>
                            <td className="px-6 py-4 text-right">
                              {item.actionHref ? (
                                <Link to={item.actionHref} aria-label={item.actionLabel} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold">
                                  <span aria-hidden="true" className="material-symbols-outlined text-sm">print</span>
                                  {item.actionText}
                                </Link>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
