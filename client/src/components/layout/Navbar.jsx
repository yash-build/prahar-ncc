import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import NotificationBell from './NotificationBell';

const Navbar = ({ onMenuToggle }) => {
  const { user } = useAuthStore();

  return (
    <div className="w-full flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button
          onClick={onMenuToggle}
          className="text-[#c8b98a] hover:text-white transition-colors p-1"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb / Page title area */}
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest hidden sm:flex">
          <span className="text-[#c8b98a] font-semibold">PRAHAR</span>
          <span className="text-[#4a5240]">/</span>
          <span className="text-[#7a8a6e]">Command Center</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <NotificationBell />

        {/* Role badge */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-[#1a1d16] border border-[#4a5240] rounded-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="font-mono text-xs text-[#dde3d8] font-semibold tracking-wider">{user?.name}</span>
          <span className="font-mono text-[10px] bg-[#4a5240] text-[#dde3d8] px-2 py-0.5 rounded-sm tracking-widest">{user?.role}</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
