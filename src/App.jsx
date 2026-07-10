import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';

import AdminLayout from './components/AdminLayout';
import AdminOverview from './pages/AdminOverview';
import AdminStudents from './pages/AdminStudents';
import AdminAttendance from './pages/AdminAttendance';
import AdminMarks from './pages/AdminMarks';
import AdminSettings from './pages/AdminSettings';
import AdminHelp from './pages/AdminHelp';
import AdminStudentPreview from './pages/AdminStudentPreview';

import StudentLayout from './components/StudentLayout';
import StudentOverview from './pages/StudentOverview';
import StudentAttendanceHistory from './pages/StudentAttendanceHistory';
import StudentMarksView from './pages/StudentMarksView';
import StudentHelp from './pages/StudentHelp';

// Protects a route - redirects to the login page if the right role isn't logged in
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-center">Loading...</div>;
  }

  if (!user || user.role !== requiredRole) {
    return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/student/login'} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Login pages */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/student/login" element={<StudentLogin />} />

      {/* Admin protected area */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="students/:studentId" element={<AdminStudentPreview />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="marks" element={<AdminMarks />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="help" element={<AdminHelp />} />
      </Route>

      {/* Student protected area */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentOverview />} />
        <Route path="attendance" element={<StudentAttendanceHistory />} />
        <Route path="marks" element={<StudentMarksView />} />
        <Route path="help" element={<StudentHelp />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
