import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { LoginPage, DashboardPage, StudentsPage, AddStudentPage, FeesPage, PrintReceiptPage, StaffPage, SyncPage } from '@school/ui';
import { LoginPage, DashboardPage, StudentsPage, AddStudentPage, FeesPage, PrintReceiptPage, StaffPage, SyncPage,SyncConflictPage, SettingsPage, DefaultersPage,ImportUploadPage, ImportMapPage, ImportReviewPage } from '@school/ui';


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/add" element={<AddStudentPage />} />
        <Route path="/fees" element={<FeesPage />} />
        <Route path="/fees/print" element={<PrintReceiptPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/sync" element={<SyncPage />} />
        <Route path="/sync/conflicts" element={<SyncConflictPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/defaulters" element={<DefaultersPage />} />
        <Route path="/import" element={<ImportUploadPage />} />
        <Route path="/import/map" element={<ImportMapPage />} />
        <Route path="/import/review" element={<ImportReviewPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;