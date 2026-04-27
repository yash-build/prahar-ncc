/**
 * Navbar — top navigation bar
 * Shows different links based on auth state and role
 */

import { useState }           from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth }            from '../context/AuthContext';
import {
  Shield, Menu, X, LogOut, LayoutDashboard,
  Users, Bell, Star, ClipboardCheck, Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isANO, logout } = useAuth();
  const navigate                = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all
     ${isActive
       ? 'bg-[#4a5240] text-[#e8e4dc]'
       : 'text-[#8a9080] hover:text-[#e8e4dc] hover:bg-[#1c2128]'
     }`;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-[#2d3748]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#4a5240] rounded flex items-center justify-center
                            group-hover:bg-[#6b7560] transition-colors">
              <Shield size={16} className="text-[#c8b87a]" />
            </div>
            <div>
              <span className="text-[#e8e4dc] font-bold text-base tracking-tight font-serif">
                SHASTRA
              </span>
              <span className="hidden sm:block text-[9px] text-[#6b7560] tracking-widest uppercase leading-none">
                NCC Management
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/cadets"     className={navLinkClass}>
              <Users size={14} /> Cadets
            </NavLink>
            <NavLink to="/notices"    className={navLinkClass}>
              <Bell size={14} /> Notices
            </NavLink>
            <NavLink to="/honor-board" className={navLinkClass}>
              <Star size={14} /> Honor Board
            </NavLink>

            {user && (
              <>
                <NavLink to="/dashboard"  className={navLinkClass}>
                  <LayoutDashboard size={14} /> Dashboard
                </NavLink>
                <NavLink to="/attendance" className={navLinkClass}>
                  <ClipboardCheck size={14} /> Attendance
                </NavLink>
                {isANO && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <Settings size={14} /> Admin
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-[#e8e4dc] font-medium leading-tight">{user.name}</p>
                  <p className="text-[10px] text-[#6b7560] tracking-wider">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs">
                  <LogOut size={13} /> Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-4 text-xs">
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#8a9080] hover:text-[#e8e4dc] p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#2d3748] py-3 space-y-1">
            {[
              { to: '/cadets',     icon: <Users size={14} />,      label: 'Cadets' },
              { to: '/notices',    icon: <Bell size={14} />,       label: 'Notices' },
              { to: '/honor-board',icon: <Star size={14} />,       label: 'Honor Board' },
              ...(user ? [
                { to: '/dashboard',   icon: <LayoutDashboard size={14} />, label: 'Dashboard' },
                { to: '/attendance',  icon: <ClipboardCheck size={14} />, label: 'Attendance' },
                ...(isANO ? [{ to: '/admin', icon: <Settings size={14} />, label: 'Admin' }] : []),
              ] : []),
            ].map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={navLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                {icon} {label}
              </NavLink>
            ))}

            <div className="pt-2 border-t border-[#2d3748]">
              {user ? (
                <button onClick={handleLogout} className="btn-ghost w-full flex items-center gap-2 text-sm">
                  <LogOut size={14} /> Logout ({user.name})
                </button>
              ) : (
                <Link to="/login" className="btn-primary block text-center text-sm" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
