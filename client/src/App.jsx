/**
 * App.jsx — Root component with all routes defined
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing       from './pages/Landing';
import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import CadetRegistry from './pages/CadetRegistry';
import CadetDetail   from './pages/CadetDetail';
import AttendancePanel from './pages/AttendancePanel';
import NoticeBoard   from './pages/NoticeBoard';
import HonorBoard    from './pages/HonorBoard';
import AdminPanel    from './pages/AdminPanel';
import NotFound      from './pages/NotFound';

// Components
import Navbar          from './components/Navbar';
import ProtectedRoute  from './components/ProtectedRoute';
import LoadingSpinner  from './components/LoadingSpinner';

// Inner app — needs auth context
const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" label="Loading SHASTRA..." />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/honor-board" element={<HonorBoard />} />
        <Route path="/cadets"     element={<CadetRegistry />} />
        <Route path="/cadets/:id" element={<CadetDetail />} />
        <Route path="/notices"    element={<NoticeBoard />} />

        {/* Protected routes — any logged-in user */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/attendance" element={
          <ProtectedRoute>
            <AttendancePanel />
          </ProtectedRoute>
        } />

        {/* ANO-only route */}
        <Route path="/admin" element={
          <ProtectedRoute requireANO>
            <AdminPanel />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c2128',
              color:      '#e8e4dc',
              border:     '1px solid #2d3748',
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontSize:   '14px',
            },
            success: { iconTheme: { primary: '#27ae60', secondary: '#1c2128' } },
            error:   { iconTheme: { primary: '#c0392b', secondary: '#1c2128' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
