import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageCourses from './pages/admin/ManageCourses';
import AdminAssignments from './pages/admin/Assignments';
import Students from './pages/admin/Students';
import EnrollmentRequests from './pages/admin/EnrollmentRequests';
import StudentDoubts from './pages/admin/Doubts';
import Reports from './pages/admin/Reports';
import AdminProfile from './pages/admin/Profile';
import AdminLiveClasses from './pages/admin/LiveClasses';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Courses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import StudentAssignments from './pages/student/Assignments';
import ProblemTracker from './pages/student/ProblemTracker';
import ContestTracker from './pages/student/ContestTracker';
import Leaderboard from './pages/student/Leaderboard';
import StudentProfile from './pages/student/Profile';
import StudentLiveClasses from './pages/student/LiveClasses';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <Navigate to="/login" replace />
      } />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Register />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/live" element={<ProtectedRoute role="admin"><AdminLiveClasses /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute role="admin"><ManageCourses /></ProtectedRoute>} />
      <Route path="/admin/assignments" element={<ProtectedRoute role="admin"><AdminAssignments /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute role="admin"><Students /></ProtectedRoute>} />
      <Route path="/admin/enrollment" element={<ProtectedRoute role="admin"><EnrollmentRequests /></ProtectedRoute>} />
      <Route path="/admin/doubts" element={<ProtectedRoute role="admin"><StudentDoubts /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/live" element={<ProtectedRoute role="student"><StudentLiveClasses /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
      <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute role="student"><StudentAssignments /></ProtectedRoute>} />
      <Route path="/problems" element={<ProtectedRoute role="student"><ProblemTracker /></ProtectedRoute>} />
      <Route path="/contests" element={<ProtectedRoute role="student"><ContestTracker /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute role="student"><Leaderboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#14142a', color: '#fff', border: '1px solid rgba(99,102,241,0.3)' },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
