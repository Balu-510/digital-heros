import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { Home } from './pages/public/Home';
import { AuthPage } from './pages/auth/AuthPage'
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DashboardLayout } from './layouts/DashboardLayout';


function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Registered Subscriber Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            {/* Other protected pages can go here */}
          </Route>
        </Route>

        {/* Administrator Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;