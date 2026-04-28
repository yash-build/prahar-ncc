import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import NCCBackground from '../../components/ui/NCCBackground';

const Login = () => {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const { setAuth }             = useAuthStore();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (attempts >= 5) {
      setErrorMsg('Too many failed attempts. Please wait before retrying.');
      return;
    }

    console.log('[Login] Attempting login for:', form.email);

    try {
      setLoading(true);
      const res = await api.post('/auth/login', form);

      console.log('[Login] Success:', res.data.user?.role);

      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name} 🎖️`);

      const role = res.data.user.role;
      const dest = (role === 'ANO' || role === 'SUO') ? '/dashboard' : '/portal';
      console.log('[Login] Redirecting to:', dest);
      navigate(dest, { replace: true });

    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Check credentials.';
      console.error('[Login] Error:', msg, err.response?.status);
      setAttempts(p => p + 1);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      {/* Full NCC animated background */}
      <NCCBackground />

      {/* ── Left Panel — Identity (visible on lg+) ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden z-10"
      >
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Emblem */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-28 h-28 mx-auto mb-10 flex items-center justify-center"
            style={{
              background: 'rgba(194,178,128,0.08)',
              border: '1px solid rgba(194,178,128,0.25)',
              borderRadius: 2,
              boxShadow: '0 0 60px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: '#c2b280', letterSpacing: '0.05em' }}>
              NCC
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 88,
              color: '#e8efe6',
              letterSpacing: '0.12em',
              lineHeight: 1,
              marginBottom: 16,
            }}>
              PRAHAR
            </div>
            <div className="gold-divider mx-auto mb-5 w-24" />
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(232,239,230,0.4)', letterSpacing: '0.3em', marginBottom: 6 }}>
              LCIT COLLEGE BILASPUR
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(232,239,230,0.22)', letterSpacing: '0.25em' }}>
              DIGITAL COMMAND SYSTEM · v2.0
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 48 }}
          >
            {[{ v: '17 CG BN', l: 'Unit' }, { v: '142+', l: 'Cadets' }, { v: '3', l: 'Wings' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#c2b280' }}>{s.v}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(232,239,230,0.3)', letterSpacing: '0.2em' }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom motto */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center' }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(232,239,230,0.2)', letterSpacing: '0.3em', fontStyle: 'italic' }}>
            "Unity and Discipline"
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right Panel — Form ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 z-10 relative"
      >
        {/* Glassmorphism card */}
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(194,178,128,0.2)',
          borderRadius: 4,
          padding: '2.5rem',
          boxShadow: '0 25px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)',
        }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, background: '#1f2a1d',
                display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2,
              }}>
                <Shield style={{ width: 18, height: 18, color: '#c2b280' }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: '#1f2a1d', letterSpacing: '0.08em' }}>
                  SECURE ACCESS
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b7a69', letterSpacing: '0.18em' }}>
                  PRAHAR COMMAND PORTAL
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(46,59,44,0.15), rgba(194,178,128,0.6), transparent)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="label">Service Email</label>
              <input
                type="email"
                className="input"
                placeholder="your.email@lcit.edu.in"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  style={{ paddingRight: 48 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#6b7a69',
                    display: 'flex', padding: 0,
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 2, padding: '10px 12px',
                  }}
                >
                  <AlertCircle size={14} style={{ color: '#dc2626', marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#b91c1c', lineHeight: 1.5 }}>
                    {errorMsg}
                    {attempts > 0 && ` (${attempts}/5 attempts)`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || attempts >= 5}
              className="btn-primary"
              style={{ marginTop: 4, padding: '14px 24px', fontSize: 13, justifyContent: 'center' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(194,178,128,0.3)',
                    borderTop: '2px solid #c2b280', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', display: 'inline-block',
                  }} />
                  Authenticating...
                </span>
              ) : 'Authenticate & Enter'}
            </button>
          </form>

          {/* Footer note */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f0eb' }}>
            <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(107,122,105,0.6)', textAlign: 'center', lineHeight: 1.7 }}>
              Access restricted to authorized NCC personnel.<br />
              Contact your ANO for credential issues.
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
