/**
 * Login.jsx — ANO / SUO Login Page
 */

import { useState }           from 'react';
import { useNavigate, Link }  from 'react-router-dom';
import { useAuth }            from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import toast                  from 'react-hot-toast';

const Login = () => {
  const { login, user } = useAuth();
  const navigate        = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);

  // Already logged in → go to dashboard
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Enter email and password');
      return;
    }
    setLoading(true);
    try {
      const loggedUser = await login(form.email, form.password);
      toast.success(`Welcome, ${loggedUser.name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 bg-[#0f1117]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,#4a5240 0,#4a5240 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />

      <div className="w-full max-w-md animate-fade-up">
        {/* Card */}
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#4a5240] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield size={26} className="text-[#c8b87a]" />
            </div>
            <h1 className="text-2xl font-bold text-[#e8e4dc] font-serif">SHASTRA Login</h1>
            <p className="text-[#6b7560] text-sm mt-1">ANO &amp; SUO access only</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-[#8a9080] text-xs font-medium uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5240]" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ano@unit.ncc"
                  value={form.email}
                  onChange={handleChange}
                  className="input pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[#8a9080] text-xs font-medium uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5240]" />
                <input
                  name="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="input pl-9 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7560] hover:text-[#e8e4dc]"
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Demo credentials hint */}
            <div className="bg-[#1c2810] border border-[#3a5020] rounded p-3 text-xs text-[#8a9080]">
              <p className="font-semibold text-[#6b8a40] mb-1">Demo Credentials</p>
              <p>ANO: <span className="font-mono text-[#c8b87a]">ano@shastra.ncc</span> / <span className="font-mono text-[#c8b87a]">ANOpassword@123</span></p>
              <p>SUO: <span className="font-mono text-[#c8b87a]">suo@shastra.ncc</span> / <span className="font-mono text-[#c8b87a]">SUOpassword@123</span></p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#6b7560] border-t-[#c8b87a] rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : 'Login to SHASTRA'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#4a5240] text-xs mt-6">
          <Link to="/" className="hover:text-[#6b7560] transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
