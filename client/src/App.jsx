import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import api from './services/api';

// Public pages
import Landing       from './pages/public/Landing';
import Yearbook      from './pages/public/Yearbook';
import Gallery       from './pages/public/Gallery';
import Achievements  from './pages/public/Achievements';
import PublicNotices from './pages/public/PublicNotices';
import GalleryDetailPage from './pages/public/GalleryDetailPage';
import EventDetailPage   from './pages/public/EventDetailPage';
import AchievementDetailPage from './pages/public/AchievementDetailPage';

// Auth
import Login from './pages/auth/Login';
import Setup from './pages/auth/Setup';

// Dashboard pages
import Dashboard          from './pages/dashboard/Dashboard';
import CadetRegistry      from './pages/dashboard/CadetRegistry';
import CadetDetail        from './pages/CadetDetail';
import AttendancePage     from './pages/dashboard/AttendancePage';
import NoticesPage        from './pages/dashboard/NoticesPage';
import NoticeDetail       from './pages/dashboard/NoticeDetail';
import HonorRoll          from './pages/dashboard/HonorRoll';
import GalleryManage      from './pages/dashboard/GalleryManage';
import AchievementsManage from './pages/dashboard/AchievementsManage';
import EventsPage         from './pages/dashboard/EventsPage';
import ReportsPage        from './pages/dashboard/ReportsPage';
import BatchPage          from './pages/dashboard/BatchPage';
import SettingsPage       from './pages/dashboard/SettingsPage';
import AuditLog           from './pages/dashboard/AuditLog';

// Portal pages
import PortalHome       from './pages/portal/PortalHome';
import MyAttendancePage  from './pages/portal/MyAttendancePage';
import MyNoticesPage     from './pages/portal/MyNoticesPage';
import MyEventsPage      from './pages/portal/MyEventsPage';
import MyAchievementsPage from './pages/portal/MyAchievementsPage';
import MyProfilePage     from './pages/portal/MyProfilePage';
// Remaining stubs that still need real implementations
import { MyCertificates } from './pages/portal/stubs';

// God Mode
import YTGodMode from './pages/yt/YTGodMode';

// Layouts
import AppShell     from './components/layout/AppShell';
import PublicLayout from './components/layout/PublicLayout';
import PortalShell  from './components/layout/PortalShell';
import OfflineBanner from './components/ui/OfflineBanner';
import HydrationGate from './components/layout/HydrationGate';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// ── Loading Spinner ─────────────────────────────────────
const FullPageSpinner = () => (
  <div style={{
    position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#1f2a1d', zIndex: 9999
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48, border: '3px solid rgba(194,178,128,0.2)',
        borderTop: '3px solid #c2b280', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
      }} />
      <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(232,239,230,0.4)', letterSpacing: '0.2em' }}>
        AUTHENTICATING...
      </div>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Protected Route ─────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, token, isHydrated } = useAuthStore();
  
  if (!isHydrated) return null;
  
  if (!token || !user) {
    console.log('[PRAHAR ROUTE] No auth → /login');
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user.role)) {
    const redirect = user.role === 'cadet' ? '/portal' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }
  
  return children;
};

// ── Smart login redirect (if already logged in) ─────────
const AuthRoute = ({ children }) => {
  const { user, token, isHydrated } = useAuthStore();
  if (!isHydrated) return null;
  if (token && user) {
    const dest = (user.role === 'ANO' || user.role === 'SUO') ? '/dashboard' : '/portal';
    return <Navigate to={dest} replace />;
  }
  return children;
};

// ── Token verifier on app mount ─────────────────────────
const AuthVerifier = () => {
  const { token, setAuth, logout, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return; // wait for rehydration first
    if (!token) return;

    const verify = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          console.log('[AuthVerifier] Token valid, user:', data.user?.role);
          setAuth(data.user, token);
        }
      } catch (err) {
        console.error('[AuthVerifier] Token invalid, logging out', err.message);
        logout();
      }
    };
    verify();
  }, [isHydrated]); // run once after rehydration

  return null;
};

// ── Main App ────────────────────────────────────────────
const AppContent = () => {
  const location = useLocation();
  return (
    <HydrationGate>
      <AuthVerifier />
      <OfflineBanner />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2a1d',
            color: '#e8efe6',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '12px',
            borderRadius: '2px',
            border: '1px solid rgba(194,178,128,0.2)',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#1f2a1d' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#1f2a1d' } },
        }}
      />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>

          {/* ── PUBLIC ROUTES ── */}
          <Route element={<PublicLayout />}>
            <Route path="/"             element={<Landing />} />
            <Route path="/yearbook"     element={<Yearbook />} />
            <Route path="/cadets/:id"   element={<CadetDetail />} />
            <Route path="/gallery"      element={<Gallery />} />
            <Route path="/gallery/:id"  element={<GalleryDetailPage />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/achievements/:id" element={<AchievementDetailPage />} />
            <Route path="/events/:id"   element={<EventDetailPage />} />
            <Route path="/notices"      element={<PublicNotices />} />
          </Route>

          {/* ── AUTH ── */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/setup" element={<Setup />} />

          {/* ── DASHBOARD (ANO + SUO) ── */}
          <Route element={
            <ProtectedRoute roles={['ANO', 'SUO']}>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route path="/dashboard"              element={<Dashboard />} />
            <Route path="/dashboard/cadets"       element={<CadetRegistry />} />
            <Route path="/dashboard/cadets/:id"   element={<CadetDetail />} />
            <Route path="/dashboard/attendance"   element={<AttendancePage />} />
            <Route path="/dashboard/notices"      element={<NoticesPage />} />
            <Route path="/dashboard/notices/:id"  element={<NoticeDetail />} />
            <Route path="/dashboard/honor-roll"   element={<HonorRoll />} />
            <Route path="/dashboard/gallery"      element={<GalleryManage />} />
            <Route path="/dashboard/achievements" element={<AchievementsManage />} />
            <Route path="/dashboard/events"       element={<EventsPage />} />
            <Route path="/dashboard/reports"      element={<ReportsPage />} />
            <Route path="/dashboard/batch"        element={
              <ProtectedRoute roles={['ANO']}><BatchPage /></ProtectedRoute>
            } />
            <Route path="/dashboard/settings"     element={
              <ProtectedRoute roles={['ANO']}><SettingsPage /></ProtectedRoute>
            } />
            <Route path="/dashboard/audit"        element={
              <ProtectedRoute roles={['ANO']}><AuditLog /></ProtectedRoute>
            } />
          </Route>

          {/* ── CADET PORTAL ── */}
          <Route element={
            <ProtectedRoute roles={['cadet', 'SUO', 'ANO']}>
              <PortalShell />
            </ProtectedRoute>
          }>
            <Route path="/portal"               element={<PortalHome />} />
            <Route path="/portal/attendance"    element={<MyAttendancePage />} />
            <Route path="/portal/notices"       element={<MyNoticesPage />} />
            <Route path="/portal/events"        element={<MyEventsPage />} />
            <Route path="/portal/achievements"  element={<MyAchievementsPage />} />
            <Route path="/portal/certificates"  element={<MyCertificates />} />
            <Route path="/portal/profile"       element={<MyProfilePage />} />
          </Route>

          {/* ── GOD MODE ── hidden, not linked from anywhere ── */}
          <Route path="/yt-command" element={<YTGodMode />} />

          {/* ── 404 ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AnimatePresence>
    </HydrationGate>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
