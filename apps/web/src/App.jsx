import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, DashboardPage, StudentsPage, AddStudentPage, FeesPage, PrintReceiptPage, StaffPage, SyncPage,SyncConflictPage, SettingsPage, DefaultersPage,ImportUploadPage, ImportMapPage, ImportReviewPage, AcademicsPage,StaffDirectoryPage,StaffProfilePage } from '@school/ui';
// import { StaffDirectoryPage } from '@school/ui/pages/StaffDirectoryPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/add" element={<AddStudentPage />} />
        <Route path="/fees" element={<FeesPage />} />
        <Route path="/fees/print" element={<PrintReceiptPage />} />
        <Route path="/user-management" element={<StaffPage />} />
        <Route path="/sync" element={<SyncPage />} />
        <Route path="/sync/conflicts" element={<SyncConflictPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/defaulters" element={<DefaultersPage />} />
        <Route path="/import" element={<ImportUploadPage />} />
        <Route path="/import/map" element={<ImportMapPage />} />
        <Route path="/academics" element={<AcademicsPage />} />
        <Route path="/staff" element={<StaffDirectoryPage />} />
        <Route path="/staff/:id" element={<StaffProfilePage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;