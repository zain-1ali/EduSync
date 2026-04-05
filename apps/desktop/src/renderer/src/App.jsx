import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, DashboardPage, StudentsPage, AddStudentPage, FeesPage, PrintReceiptPage } from '@school/ui';

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
      </Routes>
    </HashRouter>
  );
}

export default App;