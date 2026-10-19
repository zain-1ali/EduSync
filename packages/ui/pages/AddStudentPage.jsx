import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';
import { Stepper } from '../components/Stepper';

const initialForm = {
  name: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  address: '',
  photoDataUrl: '',
  admissionNumber: '',
  admissionDate: '',
  classId: '',
  className: '',
  sectionId: '',
  sectionName: '',
  rollNumber: '',
  guardianName: '',
  guardianRelationship: '',
  guardianPhone: '',
  guardianEmail: '',
  status: 'active',
};

const fieldClass =
  'w-full h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 focus:outline-none focus:ring-2 focus:ring-primary';

function Field({ label, name, form, setForm, type = 'text', required = false }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        value={form[name]}
        onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
        className={fieldClass}
      />
    </label>
  );
}

export function AddStudentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const students = useLocalCollection('students');
  const programs = useLocalCollection('programs');
  const sections = useLocalCollection('sections');
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!id || !students.repository) return;
    students.repository.get(id).then((record) => {
      if (record) setForm({ ...initialForm, ...record });
    });
  }, [id, students.repository]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const next = (event) => {
    event.preventDefault();
    setCurrentStep((step) => Math.min(3, step + 1));
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');
    const duplicate = students.data.find(
      (student) =>
        student.admissionNumber?.toLowerCase() === form.admissionNumber.toLowerCase() &&
        student.id !== id
    );
    if (duplicate) {
      setError('Admission number is already assigned to another student.');
      return;
    }
    try {
      if (id) await students.update(id, form);
      else await students.create(form);
      setDirty(false);
      navigate('/students');
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  const updateForm = (updater) => {
    setDirty(true);
    setForm(updater);
  };

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Choose a JPG, PNG, or WebP photo no larger than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateForm((current) => ({ ...current, photoDataUrl: String(reader.result) }));
    reader.onerror = () => setError('The selected photo could not be read.');
    reader.readAsDataURL(file);
  };

  const chooseClass = (event) => {
    const program = programs.data.find((item) => item.id === event.target.value);
    updateForm((current) => ({
      ...current,
      classId: program?.id || '',
      className: program?.name || '',
      sectionId: '',
      sectionName: '',
    }));
  };

  const chooseSection = (event) => {
    const section = sections.data.find((item) => item.id === event.target.value);
    updateForm((current) => ({
      ...current,
      sectionId: section?.id || '',
      sectionName: section?.name || '',
    }));
  };

  return (
    <Layout title={id ? 'Edit Student' : 'Registration'}>
      <div className="p-6 md:p-8 max-w-[960px] w-full mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-black">{id ? 'Edit student' : 'Add new student'}</h1>
          <p className="text-slate-500">The record is saved locally first and queued for synchronization.</p>
        </div>
        <Stepper currentStep={currentStep} />
        <form onSubmit={currentStep === 3 ? save : next} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full legal name" name="name" form={form} setForm={updateForm} required />
              <Field label="Date of birth" name="dateOfBirth" form={form} setForm={updateForm} type="date" required />
              <label className="space-y-2"><span className="text-sm font-bold">Gender</span><select value={form.gender} required onChange={(event) => updateForm((current) => ({ ...current, gender: event.target.value }))} className={fieldClass}><option value="">Select</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></label>
              <Field label="Blood group" name="bloodGroup" form={form} setForm={updateForm} />
              <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">Student photo</span><div className="flex items-center gap-4">{form.photoDataUrl && <img src={form.photoDataUrl} alt="Student preview" className="size-20 rounded-lg object-cover" />}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} /><button type="button" disabled={!form.photoDataUrl} onClick={() => updateForm((current) => ({ ...current, photoDataUrl: '' }))} className="text-sm font-bold text-red-600 disabled:opacity-40">Remove</button></div></label>
              <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">Address</span><textarea value={form.address} onChange={(event) => updateForm((current) => ({ ...current, address: event.target.value }))} className={`${fieldClass} h-24 py-3`} /></label>
            </div>
          )}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Admission number" name="admissionNumber" form={form} setForm={updateForm} required />
              <Field label="Admission date" name="admissionDate" form={form} setForm={updateForm} type="date" required />
              <label className="space-y-2"><span className="text-sm font-bold">Class / program</span><select value={form.classId} onChange={chooseClass} required className={fieldClass}><option value="">Select</option>{programs.data.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="space-y-2"><span className="text-sm font-bold">Section</span><select value={form.sectionId} onChange={chooseSection} required className={fieldClass}><option value="">Select</option>{sections.data.filter((item) => item.programId === form.classId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <Field label="Roll number" name="rollNumber" form={form} setForm={updateForm} />
            </div>
          )}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Guardian name" name="guardianName" form={form} setForm={updateForm} required />
              <Field label="Relationship" name="guardianRelationship" form={form} setForm={updateForm} required />
              <Field label="Primary phone" name="guardianPhone" form={form} setForm={updateForm} required />
              <Field label="Email" name="guardianEmail" form={form} setForm={updateForm} type="email" />
            </div>
          )}
          {error && <p className="mt-5 text-red-600 font-semibold" role="alert">{error}</p>}
          <div className="mt-7 flex justify-between gap-3">
            <button type="button" onClick={() => currentStep === 1 ? (!dirty || window.confirm('Discard unsaved student changes?')) && navigate('/students') : setCurrentStep((step) => step - 1)} className="h-11 px-5 rounded-lg border border-slate-300 font-bold">{currentStep === 1 ? 'Cancel' : 'Back'}</button>
            <button type="submit" className="h-11 px-6 rounded-lg bg-primary text-white font-bold">{currentStep === 3 ? 'Save student' : 'Continue'}</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}