import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './auth/ProtectedRoute';
import { AcademicsManagementPage } from './pages/AcademicsManagementPage';
import { AddStudentPage } from './pages/AddStudentPage';
import { AttendancePage } from './pages/AttendancePage';
import { DashboardPage } from './pages/DashboardPage';
import { DefaultersPage } from './pages/DefaultersPage';
import { DevAdminPage } from './pages/DevAdminPage';
import { FeeConfigurationPage } from './pages/FeeConfigurationPage';
import { FeesPage } from './pages/FeesPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { GradesPage } from './pages/GradesPage';
import { ImportMapPage } from './pages/ImportMapPage';
import { ImportReviewPage } from './pages/ImportReviewPage';
import { ImportUploadPage } from './pages/ImportUploadPage';
import { LoginPage } from './pages/LoginPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrintReceiptPage } from './pages/PrintReceiptPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SettingsPage } from './pages/SettingsPage';
import { SetupPasswordPage } from './pages/SetupPasswordPage';
import { StaffDirectoryPage } from './pages/StaffDirectoryPage';
import { StaffPage } from './pages/StaffPage';
import { StaffProfilePage } from './pages/StaffProfilePage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentDetailsPage } from './pages/StudentDetailsPage';
import { SyncConflictPage } from './pages/SyncConflictPage';
import { SyncPage } from './pages/SyncPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/setup-password" element={<SetupPasswordPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/legal/:document" element={<LegalPage />} />
      <Route
        path="/dev-admin"
        element={
          <ProtectedRoute roles={['super_admin']}>
            <DevAdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute module={MODULES.DASHBOARD}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute module={MODULES.STUDENTS}>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/add"
        element={
          <ProtectedRoute module={MODULES.STUDENTS} level={ACCESS_LEVELS.MANAGE}>
            <AddStudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <ProtectedRoute module={MODULES.STUDENTS}>
            <StudentDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id/edit"
        element={
          <ProtectedRoute module={MODULES.STUDENTS} level={ACCESS_LEVELS.MANAGE}>
            <AddStudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute module={MODULES.ATTENDANCE} level={ACCESS_LEVELS.MANAGE}>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fees"
        element={
          <ProtectedRoute module={MODULES.FEES}>
            <FeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fees/configuration"
        element={
          <ProtectedRoute module={MODULES.FEES}>
            <FeeConfigurationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fees/print"
        element={
          <ProtectedRoute module={MODULES.FEES}>
            <PrintReceiptPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fees/payments/:paymentId/receipt"
        element={
          <ProtectedRoute module={MODULES.FEES}>
            <PrintReceiptPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/defaulters"
        element={
          <ProtectedRoute module={MODULES.FEES}>
            <DefaultersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/academics"
        element={
          <ProtectedRoute module={MODULES.ACADEMICS}>
            <AcademicsManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/grades"
        element={
          <ProtectedRoute module={MODULES.ACADEMICS} level={ACCESS_LEVELS.MANAGE}>
            <GradesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute module={MODULES.USERS} level={ACCESS_LEVELS.MANAGE}>
            <StaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute module={MODULES.STAFF}>
            <StaffDirectoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/:id"
        element={
          <ProtectedRoute module={MODULES.STAFF}>
            <StaffProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/import"
        element={
          <ProtectedRoute module={MODULES.STUDENTS} level={ACCESS_LEVELS.MANAGE}>
            <ImportUploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/import/map"
        element={
          <ProtectedRoute module={MODULES.STUDENTS} level={ACCESS_LEVELS.MANAGE}>
            <ImportMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/import/review"
        element={
          <ProtectedRoute module={MODULES.STUDENTS} level={ACCESS_LEVELS.MANAGE}>
            <ImportReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sync"
        element={
          <ProtectedRoute module={MODULES.SYNC}>
            <SyncPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sync/conflicts"
        element={
          <ProtectedRoute module={MODULES.SYNC} level={ACCESS_LEVELS.MANAGE}>
            <SyncConflictPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute module={MODULES.SETTINGS} level={ACCESS_LEVELS.MANAGE}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
