# EduSync Frontend Gap Audit

**Audit date:** October 15, 2026  
**Scope:** `apps/web`, `apps/desktop`, and `packages/ui`  
**Purpose:** Document the screens, UI states, navigation, and end-to-end user flows that are missing or incomplete in the current frontend.

## Implementation status — October 17, 2026

This status block supersedes the original-state descriptions below, which are retained as the acceptance checklist and historical baseline.

- **Verified:** shared web/desktop routes, protected routes, permission-aware navigation, session bootstrap/logout, not-found/access-denied handling, tenant-partitioned local storage, outbox synchronization, idempotent server mutations, pull cursors, and interactive conflict resolution.
- **Implemented; final journey verification pending:** student CRUD/details/archive, academic setup and timetable allocations, daily attendance, assessments/marks, CSV/XLSX import upload/mapping/validation/local commit, staff directory/profile/account permissions, fee ledger/payment/receipt/defaulter flows, dashboard local metrics, tenant settings, notifications, responsive navigation, PWA shell caching/update flow, and hardened Electron renderer boundaries.
- **Deferred with reason:** provider-backed SMS/email delivery requires deployment credentials; payroll/payslips require a separately approved payroll ruleset; signed installers require platform signing identities; first-visit offline support is impossible before the web app shell has been cached.
- **Release gate:** items are not considered verified until `npm run check` passes and the primary web and packaged-desktop journeys have been exercised. Any failure returns the affected item to **pending**.

## 1. Executive Summary

EduSync currently has a broad set of polished frontend screens, but most modules are prototypes rather than complete product flows. Authentication, school registration, school approval, password setup, and part of the staff directory are connected to API hooks. Students, fees, academics, imports, settings, permissions, dashboard metrics, and synchronization mainly use static data or controls without behavior.

The largest frontend gaps are:

1. Web and desktop do not expose the same routes.
2. Authenticated pages are not protected.
3. Most list pages lack working filters, pagination, details, editing, and empty/error states.
4. Most forms do not persist or share state between steps.
5. Several visible actions have no click handler.
6. There is no real local database, mutation queue, sync state, or conflict resolution behind the offline UI.
7. The product mentions attendance, invoices, grading, and timetables, but some of these modules have no screens.
8. Staff directory and user/permission management are separate, inconsistent experiences.

## 2. Status Definitions

- **Present:** The screen and its primary behavior exist.
- **Partial:** Some UI or API behavior exists, but the flow is incomplete.
- **Mock:** The screen exists but displays hard-coded data.
- **Dead control:** A visible button, link, filter, or field has no useful behavior.
- **Missing:** No screen or implementation currently exists.
- **Parity gap:** The feature differs between web and desktop.

## 3. Existing Screen Inventory

### Public and onboarding

- Login
- School registration
- Set up password
- Developer/platform approval page

### Authenticated application

- Dashboard
- Student list
- Add student wizard
- Fees collection
- Receipt print preview
- Fee defaulters
- User management and permissions
- Staff directory
- Staff profile
- Academics
- Import upload
- Import field mapping
- Import review
- Sync status
- Sync conflict resolution
- School settings

## 4. Cross-Cutting Missing UI and Behavior

### 4.1 Authentication and authorization

Current authenticated-looking routes can be opened directly without a valid session.

Missing:

- Protected-route wrapper for school users.
- Super-admin-only route guard for `/dev-admin`.
- Permission-aware route guard for module access.
- Permission-aware sidebar visibility.
- Session bootstrap/loading screen while `/auth/me` is checked.
- Expired-session dialog and redirect.
- Unauthorized and forbidden pages.
- Proper logout behavior that clears tokens, cached user data, and sensitive local data according to policy.
- Role-appropriate landing routes after login.
- Offline session status and explanation when online reauthentication is required.

### 4.2 Shared application shell

The shell uses static user and storage information.

Missing:

- Real signed-in user name, role, avatar, and tenant.
- School switcher or school identity display, if a user can access multiple schools.
- Notification panel and unread state.
- Global search results or removal of the non-functional search affordance.
- Real online/offline and sync indicators.
- Real local-storage usage.
- Responsive/mobile navigation.
- Breadcrumbs for nested detail and edit screens.
- Permission-aware navigation.
- Accessible keyboard focus, labels, and dialog behavior.
- Standard loading, empty, error, retry, and offline states.
- Not-found page for unmatched routes.

Current issues:

- Several sidebar elements use `class` instead of `className`.
- Defaulters is not available from the sidebar.
- The logout link only navigates to login.
- The profile is hard-coded as “Sarah Jenkins.”

### 4.3 Web and desktop route parity

The applications currently expose different products from the same shared UI.

| Route or feature | Web | Desktop | Gap |
| --- | --- | --- | --- |
| `/user-management` | Present | Missing | Desktop sidebar link can lead to no matching route |
| `/staff` | Staff directory | User management | Same URL has different meaning |
| `/staff/:id` | Present, but mock | Missing | Staff profiles unavailable on desktop |
| `/academics` | Present | Missing | Desktop sidebar points to a missing route |
| `/import/review` | Missing route | Present | Web import cannot reach review |
| `/dev-admin` | Present | Missing | Platform operations are web-only |

Required resolution:

- Define one shared route manifest.
- Give `/staff` one meaning on both platforms.
- Use `/user-management` for account and permission management.
- Register all applicable routes in both applications.
- Keep platform administration separate from school-facing desktop navigation.

## 5. Module-by-Module Gap Analysis

## 5.1 Login and Account Recovery

**Existing screen:** `packages/ui/pages/LoginPage.jsx`

Present:

- Email and password inputs.
- Login mutation.
- Token and user storage.
- Navigation to the dashboard after successful login.

Incomplete or dead UI:

- “Remember this device” has no behavior.
- “Forgot password” points to `#`.
- Help, support, privacy, and terms links point to `#`.
- There is no password visibility toggle.
- There is no caps-lock warning.
- Login does not restore or validate an existing session.

Missing screens:

- Forgot-password request screen.
- Reset-password screen.
- Email-sent confirmation.
- Password-reset success screen.
- Session-expired screen or dialog.
- Access-denied screen.

Required complete flow:

1. User submits credentials.
2. The app establishes a session and fetches the current user, school, role, and permissions.
3. The app initializes the correct tenant-local database.
4. The user is routed to an allowed landing page.
5. Expired or revoked sessions are handled consistently.
6. Logout clears the session and returns to login.

## 5.2 School Registration and Tenant Onboarding

**Existing screens:** `RegistrationPage.jsx`, `SetupPasswordPage.jsx`, `DevAdminPage.jsx`

Present:

- School registration form.
- Pending-school list for a developer admin.
- School approval action.
- Setup-password token flow.

Incomplete UI:

- Registration has no resumable draft.
- Approval has no detailed application review screen.
- Approval is the only decision; rejection and “request more information” are missing.
- Setup-password token errors do not offer a clear recovery path.
- There is no visible onboarding progress after approval.

Missing screens:

- Registration status lookup.
- School application detail.
- Reject application dialog with reason.
- Request-more-information flow.
- Approved-school detail.
- Tenant suspension/reactivation.
- Initial school setup wizard.
- First administrator invitation status.
- Platform tenant list and search.

Required complete flow:

1. Applicant registers a school.
2. Platform admin reviews full application details.
3. Admin approves, rejects, or requests changes.
4. Approval provisions the tenant and sends an expiring setup link.
5. School administrator creates a password.
6. First login opens the initial school configuration wizard.
7. Audit history records all decisions.

## 5.3 Dashboard

**Existing screen:** `DashboardPage.jsx`

Current state: mock statistics and mock recent transactions.

Dead or incomplete UI:

- Header search has no results or handler.
- “View All Transactions” does nothing.
- Pending-dues stat has no destination.
- Notifications button does nothing.
- Receipt actions do not include a receipt or payment ID.

Missing UI:

- Date range and academic-year selector.
- Role-specific dashboard layouts.
- Real KPI loading and error states.
- Empty states for new schools.
- Recent attendance summary.
- Sync queue and conflict alerts driven by real data.
- Quick actions based on permission.
- Dashboard drill-down pages.

Required complete flow:

- Each card opens the exact filtered list behind its number.
- Recent activity opens the related student, payment, receipt, or audit event.
- Dashboard data reads from local storage and updates after local writes.

## 5.4 Students and Student Information System

**Existing screens:** `StudentsPage.jsx`, `AddStudentPage.jsx`

Current state:

- Student list is hard-coded.
- The add-student wizard changes steps but does not save a student.
- Search, filters, pagination, edit, and ledger controls are non-functional.

Missing screens:

- Student details/overview.
- Edit student.
- Student guardian and emergency-contact management.
- Enrollment history.
- Transfer student.
- Promote student to a new class/year.
- Withdraw/archive student.
- Student documents.
- Student attendance history.
- Student fee ledger.
- Student activity/audit history.
- Duplicate-student review.
- Bulk student actions.

Missing UI and behavior:

- Shared form state across all wizard steps.
- Field names, validation, and inline errors.
- Save draft and resume.
- Working cancel/back confirmation.
- Actual photo selection, preview, replacement, and removal.
- Dynamic class and section options from Academics.
- Admission-number uniqueness feedback.
- Unsaved-change warning.
- Successful-save confirmation and destination.
- Search debouncing, filter state, and real pagination.
- Row selection and bulk operations.
- Loading, empty, error, and offline-pending states.

Required add-student flow:

1. User enters personal details.
2. User selects academic year, class, and section.
3. User enters guardian and emergency contacts.
4. The app validates required and unique fields.
5. The student is written locally immediately.
6. The list and dashboard update.
7. A pending-sync marker remains until server acknowledgement.
8. Conflict or validation rejection is surfaced with a correction flow.

## 5.5 Attendance

Current state: no attendance module exists, although attendance is mentioned in product copy and permissions.

Missing screens:

- Daily class attendance register.
- Mark all present and individual status controls.
- Late/absent/leave reason entry.
- Attendance submission summary.
- Student attendance history.
- Class/month attendance report.
- Correction request or edit history.
- Teacher “My Classes” attendance entry.

Missing states:

- Offline-saved attendance.
- Pending-sync status.
- Already-submitted warning.
- Concurrent-edit conflict.
- Closed/locked attendance period.

Required flow:

1. Teacher selects date and assigned class.
2. Local roster loads without requiring connectivity.
3. Teacher records attendance and saves locally.
4. Data syncs when online.
5. Authorized users can correct records with an audit trail.

## 5.6 Academics and Curriculum

**Existing screen:** `AcademicsPage.jsx`

Current state:

- One mock program is displayed.
- Create Program, Create Batch, and Allocate Teacher drawers open.
- Save, edit, delete, and allocation behavior is not connected.
- Desktop route is missing.

Missing screens:

- Academic years and terms.
- Program/class list.
- Program/class details.
- Section/batch details.
- Subject catalog.
- Curriculum or subject-to-class assignment.
- Teacher allocation list.
- Room management.
- Timetable builder.
- Timetable view by class, teacher, and room.
- Enrollment/capacity management.
- Grading scheme setup.

Missing UI:

- Real cards/list data.
- Create/edit validation.
- Delete confirmation and dependency explanation.
- Capacity and date validation.
- Teacher schedule conflict warning.
- Room conflict warning.
- Empty and archived states.
- Academic-year switching.

Required flow:

1. Administrator creates an academic year.
2. Administrator creates classes/programs and sections/batches.
3. Subjects are assigned.
4. Teachers, days, times, and rooms are allocated.
5. Students can be enrolled into valid sections.
6. Student and staff screens consume the same academic records.

## 5.7 Grading and Assessments

Current state: no grading or assessment screens exist, despite grading being part of the stated academics scope.

Missing screens:

- Grading scale setup.
- Assessment/exam creation.
- Subject marks entry.
- Bulk marks import.
- Marks review and locking.
- Student report card.
- Class result summary.
- Result publication.
- Correction and audit history.

Required flow:

- Authorized teachers enter marks for assigned subjects, save offline, sync later, and submit for review or locking.

## 5.8 Staff and HR Directory

**Existing screens:** `StaffDirectoryPage.jsx`, `StaffProfilePage.jsx`, `AddStaffDrawer.jsx`

Present:

- Staff list and statistics API hooks.
- Add-staff mutation.
- Staff status mutation.

Incomplete:

- “View Profile” and “Edit Details” are not wired.
- Profile ignores the route ID and displays a fixed person.
- Desktop lacks directory and profile routes.
- Pagination is decorative.
- Photo upload is not implemented.
- Profile tabs show mock timetable, payroll, and personal data.

Missing screens:

- Edit staff.
- Employment history.
- Qualification and document management.
- Leave request/list/calendar.
- Staff attendance.
- Staff invitation/account-linking.
- Deactivate/terminate confirmation.
- Staff audit history.
- Staff report/export configuration.

Missing UI:

- Real profile loading/error/not-found states.
- Status history.
- Form validation and unique employee ID handling.
- Photo upload preview.
- Confirmation for status changes.
- Pending-sync indicators.
- Permission-aware access to sensitive HR and payroll fields.

Required flow:

1. HR adds a staff person.
2. HR optionally creates or invites a login account.
3. Roles and permissions are assigned to the user account, not confused with the HR job role.
4. Teaching staff can be allocated in Academics.
5. Profile, status, and employment changes are auditable and syncable.

## 5.9 User Management and RBAC

**Existing screen:** `StaffPage.jsx` with `StaffList.jsx` and `PermissionsPanel.jsx`

Current state:

- User list is mock data.
- Selecting, creating, saving, and canceling permission changes are incomplete or non-functional.
- Permission switches use uncontrolled defaults.
- Desktop route is missing.

Missing screens:

- User account list separate from staff directory.
- Invite user.
- Link existing staff to account.
- User details.
- Role list.
- Create/edit custom role.
- Permission matrix.
- Account lock/unlock.
- Revoke sessions.
- Access audit history.

Missing UI:

- Unsaved-permission warning.
- Permission inheritance explanation.
- “None / View / Manage” controls at module level.
- Effective-permissions preview.
- Super-admin override display.
- Last login and active-session information.
- Confirmation for security-sensitive changes.

Required flow:

1. Administrator selects or invites a user.
2. User is linked to the correct school and optional staff record.
3. Administrator assigns a role or custom permissions.
4. UI navigation updates from effective permissions.
5. API independently enforces the same permissions.

## 5.10 Fees and Payments

**Existing screen:** `FeesPage.jsx`

Current state:

- Student list and fee information are mock data.
- Selected student is fixed.
- Status tabs, refresh, payment mode, and submission controls do not work.
- Daily report export does not work.

Missing screens:

- Fee category and fee structure setup.
- Fee assignment to class or student.
- Discounts, scholarships, and waivers.
- Student fee account/ledger.
- Invoice or charge details.
- Payment details.
- Payment reversal/refund.
- Receipt history.
- Daily collection report.
- Financial transaction search.
- Closing/reconciliation report.

Missing UI:

- Real selected-student state.
- Search and status filters.
- Partial payment allocation.
- Multiple outstanding charge selection.
- Payment validation.
- Cheque/reference fields that depend on payment method.
- Duplicate-submission protection.
- Offline payment warning and pending-sync marker.
- Confirmation before recording.
- Success state with print/download/share actions.
- Permission checks for recording or reversing money.

Required payment flow:

1. Cashier selects a student.
2. The app shows the local canonical fee ledger.
3. Cashier chooses charges/months, amount, date, and payment method.
4. The payment is validated and recorded locally with an idempotency key.
5. A receipt is generated from the payment ID.
6. Sync cannot duplicate the payment after retries.
7. Reversals create audit entries instead of deleting the payment.

## 5.11 Receipts

**Existing screen:** `PrintReceiptPage.jsx`

Current state:

- Browser printing works.
- All receipt data is hard-coded.
- “Download PDF” is non-functional.
- Receipt branding settings are not connected.

Missing UI:

- Receipt loading by payment ID.
- Receipt-not-found state.
- Duplicate/copy label.
- Tenant logo and configured header/footer.
- Download PDF.
- Reprint reason/audit, if required.
- Print-friendly error handling.

Required flow:

- Payment success navigates to `/fees/payments/:paymentId/receipt`, which can be safely reopened and always renders the same immutable transaction.

## 5.12 Fee Defaulters

**Existing screen:** `DefaultersPage.jsx`

Current state:

- Statistics and rows are hard-coded and inconsistent.
- Filters, export, bulk SMS, notices, row actions, and pagination do not work.
- The page is not in the sidebar.

Missing screens:

- Defaulter detail or filtered student ledger.
- Reminder history.
- Notice preview.
- Bulk-action result.

Missing UI:

- Functional filters and saved filter state.
- Selection across pagination.
- Export progress/result.
- Reminder channel and template selection.
- Confirmation and partial-failure reporting.
- No-provider configuration state for SMS.

## 5.13 Data Import

**Existing screens:** `ImportUploadPage.jsx`, `ImportMapPage.jsx`, `ImportReviewPage.jsx`

Current state:

- Drop UI exists, but “Select File” is not backed by a file input.
- Upload Continue only logs output.
- Mapping uses static fields and data.
- Back, Save Draft, Download Template, and Continue to Review do not work.
- Review simulates progress with a timer.
- Web has no route for the review screen.
- Flagged-record correction is not implemented.

Missing screens or states:

- Import history.
- Resume draft.
- Import job details.
- Duplicate-resolution screen.
- Import completion summary.
- Partial-failure download.
- Rollback/reversal, where safe.

Required complete flow:

1. User selects CSV/XLSX.
2. The app validates file type and size.
3. File is parsed locally.
4. User maps source columns to EduSync fields.
5. Mapping can be saved as a reusable template.
6. Rows are validated and duplicates are detected.
7. User edits, skips, or resolves flagged rows.
8. Valid records are committed locally in a transaction.
9. Import result links to the student list.
10. New records sync through the normal outbox.

## 5.14 Sync Status and Conflict Resolution

**Existing screens:** `SyncPage.jsx`, `SyncConflictPage.jsx`

Current state:

- Metrics, logs, queue counts, and conflicts are mock data.
- “Sync Now” navigates to the conflict demo instead of syncing.
- Keep Local and Keep Cloud only log to the console.
- Review Later, Cancel Sync, and log download are non-functional.

Missing screens or UI:

- Real queue list with entity, action, time, retry, and error.
- Real sync history.
- Failed-item detail and retry.
- Conflict list.
- Conflict detail by entity and record ID.
- Field-level merge controls.
- Sync pause/resume state.
- Connectivity and last-successful-sync state.
- Initial-sync progress.
- Device registration/status.
- Storage quota warning.
- Database migration/recovery state.

Required local-first flow:

1. Every mutation writes locally and enters the outbox.
2. UI immediately shows the changed local state.
3. Background sync pushes mutations in dependency order.
4. Server acknowledgements update local versions.
5. Rejected validation changes return to an actionable error state.
6. Concurrent changes create a conflict.
7. User chooses local, server, or per-field merged values.
8. Resolution is queued and synced idempotently.

## 5.15 Settings and School Branding

**Existing screen:** `SettingsPage.jsx`

Current state:

- Forms use hard-coded default values.
- Save, Save All, Discard, Preview Receipt, logo change, and logo removal do not work.

Missing screens or sections:

- General school profile.
- Academic defaults.
- Locale, timezone, currency, and date format.
- Numbering sequences for admissions, invoices, and receipts.
- Notification templates.
- Sync/device settings.
- Data export and backup.
- Security/session policy.
- Audit log.

Missing UI:

- Controlled form state and validation.
- Dirty-state tracking.
- Per-section save feedback.
- Logo upload, crop/preview, and size/type validation.
- Receipt preview using current unsaved settings.
- Permission-aware sensitive settings.
- Offline-save and pending-sync state.

## 5.16 Notifications and Communication

Current state: header notification icon and defaulter SMS actions exist as affordances only.

Missing screens:

- Notification center.
- Notification detail.
- Communication templates.
- Send message/reminder.
- Delivery history and failures.
- Provider configuration state.

## 5.17 Reports and Exports

Current state: isolated export buttons exist but do not work.

Missing screens:

- Report catalog.
- Student enrollment report.
- Attendance reports.
- Fee collection report.
- Outstanding/defaulter report.
- Staff report.
- Audit report.
- Export history.

Missing UI:

- Date/class/status filters.
- Column selection.
- CSV/PDF export.
- Progress, completion, and failure states.
- Offline limitation messaging for reports requiring server aggregation.

## 6. Missing Standard States for Every Data Screen

Every list, details page, form, and drawer should explicitly support:

- Initial loading.
- Background refresh.
- Empty result.
- No search results.
- Validation failure.
- Network unavailable.
- Local save successful but sync pending.
- Sync failure requiring action.
- Server conflict.
- Forbidden by permission.
- Record deleted or not found.
- Unexpected error with retry.
- Unsaved changes.
- Destructive-action confirmation.
- Successful completion and clear next action.

## 7. Priority Order

### P0 — Required before feature expansion

- Fix web/desktop route parity.
- Add protected routes, permission guards, logout, and session bootstrap.
- Establish real local storage and sync status.
- Replace misleading static online/offline/storage text.
- Add standard loading/error/empty states.

### P1 — Core school operations

- Student CRUD and details.
- Academics setup used by enrollment.
- Attendance.
- Fee structure, student ledger, payment, and receipt.
- Staff details/edit and linked user accounts.
- RBAC management and enforcement.

### P2 — Operational completeness

- Import end-to-end.
- Defaulters and reminders.
- Dashboard drill-downs.
- Settings and branding.
- Reports and exports.
- Timetables and grading.

### P3 — Advanced product operations

- Platform tenant lifecycle management.
- Payroll and payslips.
- Communication provider integrations.
- Advanced analytics.
- Device management and recovery tooling.

## 8. Definition of “Flow Complete”

A frontend flow should not be considered complete merely because its screen exists. A flow is complete only when:

1. The user can reach it through normal navigation.
2. Access is correctly restricted by authentication and permission.
3. It displays real local data rather than inline mock records.
4. Inputs are controlled, validated, and accessible.
5. Submit/cancel/back actions behave correctly.
6. The operation writes to the local database first.
7. The UI updates immediately and shows pending-sync status.
8. Synchronization is idempotent and errors are actionable.
9. Loading, empty, offline, error, and conflict states are implemented.
10. The flow works consistently in web and desktop.
11. Automated tests cover its primary success, validation, permission, offline, and conflict paths.

## 9. Key Files Reviewed

- `apps/web/src/App.jsx`
- `apps/desktop/src/renderer/src/App.jsx`
- `packages/ui/index.jsx`
- `packages/ui/Layout.jsx`
- `packages/ui/components/Sidebar.jsx`
- `packages/ui/pages/*.jsx`
- `packages/ui/components/**/*.jsx`
- `packages/ui/staff/*.jsx`
- `packages/ui/api/axiosClient.js`
- `packages/ui/api/hooks/*.js`

This document should be updated as each module is implemented so it remains the source of truth for frontend product completeness.
