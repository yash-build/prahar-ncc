/**
 * Dashboard.jsx — Post-login hub
 * Shows summary stats, quick actions, recent notices, defaulter count
 */

import { useEffect, useState } from 'react';
import { Link }                from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import {
  Users, ClipboardCheck, Bell, Star, AlertTriangle,
  TrendingUp, PlusCircle, Lock, ChevronRight,
} from 'lucide-react';
import { cadetService, attendanceService, noticeService } from '../services/services';
import NoticeCard   from '../components/NoticeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast        from 'react-hot-toast';

const StatCard = ({ icon, label, value, sub, to, color = '#4a5240' }) => (
  <Link to={to} className="card p-5 group flex items-start gap-4">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
         style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-[#e8e4dc] font-serif leading-none">{value ?? '—'}</p>
      <p className="text-xs text-[#8a9080] mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-[#4a5240] mt-0.5">{sub}</p>}
    </div>
    <ChevronRight size={14} className="text-[#2d3748] group-hover:text-[#4a5240] ml-auto mt-1 transition-colors" />
  </Link>
);

const Dashboard = () => {
  const { user, isANO } = useAuth();
  const [data,    setData]    = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cadetRes, defaulterRes, sessionRes, noticeRes] = await Promise.all([
          cadetService.getAll({}),
          cadetService.getDefaulters(),
          attendanceService.getSessions({ wing: 'ALL' }),
          noticeService.getAll({}),
        ]);

        setData({
          totalCadets:   cadetRes.data.count,
          sdCount:       cadetRes.data.cadets.filter(c => c.wing === 'SD').length,
          swCount:       cadetRes.data.cadets.filter(c => c.wing === 'SW').length,
          defaulters:    defaulterRes.data.count,
          totalSessions: sessionRes.data.sessions.length,
          recentSession: sessionRes.data.sessions[0] || null,
        });
        setNotices(noticeRes.data.notices.slice(0, 4));
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e8e4dc] font-serif">
          Welcome, {user?.name}
        </h1>
        <p className="text-[#6b7560] text-sm mt-1">
          {user?.role} Dashboard ·{' '}
          <span className="text-[#4a5240]">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={18} />}
          label="Total Cadets"
          value={data?.totalCadets}
          sub={`SD: ${data?.sdCount}  SW: ${data?.swCount}`}
          to="/cadets"
          color="#5bbcff"
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Defaulters (<75%)"
          value={data?.defaulters}
          sub={data?.defaulters > 0 ? 'Action required' : 'All clear'}
          to="/cadets"
          color={data?.defaulters > 0 ? '#c0392b' : '#27ae60'}
        />
        <StatCard
          icon={<ClipboardCheck size={18} />}
          label="Sessions (6 months)"
          value={data?.totalSessions}
          sub={data?.recentSession
            ? `Last: ${new Date(data.recentSession.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
            : 'No sessions yet'}
          to="/attendance"
          color="#c8b87a"
        />
        <StatCard
          icon={<Bell size={18} />}
          label="Active Notices"
          value={notices.length}
          sub="Tap to view all"
          to="/notices"
          color="#a78bfa"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm text-[#6b7560] uppercase tracking-widest font-semibold mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/attendance" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <PlusCircle size={15} /> Mark Attendance
          </Link>
          <Link to="/notices" className="btn-ghost flex items-center gap-2 text-sm py-2 px-4">
            <Bell size={15} /> Post Notice
          </Link>
          <Link to="/cadets" className="btn-ghost flex items-center gap-2 text-sm py-2 px-4">
            <Users size={15} /> Cadet Registry
          </Link>
          {isANO && (
            <Link to="/admin" className="btn-ghost flex items-center gap-2 text-sm py-2 px-4">
              <Lock size={15} /> Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Bottom grid: Notices + Defaulters warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent notices */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-[#6b7560] uppercase tracking-widest font-semibold">
              Recent Notices
            </h2>
            <Link to="/notices" className="text-xs text-[#4a5240] hover:text-[#6b7560]">
              View all →
            </Link>
          </div>

          {notices.length === 0 ? (
            <div className="card p-6 text-center text-[#6b7560] text-sm">
              No active notices
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map(n => (
                <NoticeCard key={n._id} notice={n} canDelete={false} />
              ))}
            </div>
          )}
        </div>

        {/* Defaulter alert */}
        <div>
          <h2 className="text-sm text-[#6b7560] uppercase tracking-widest font-semibold mb-3">
            Attendance Alert
          </h2>
          {data?.defaulters > 0 ? (
            <div className="card p-5 border-red-900/50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-red-400 text-sm font-bold">
                  {data.defaulters} Defaulter{data.defaulters > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[#8a9080] text-xs leading-relaxed mb-4">
                These cadets have attendance below 75% in the last 6 months.
                Immediate action is recommended.
              </p>
              <Link to="/cadets?defaulters=true" className="btn-danger text-xs w-full block text-center py-2">
                View Defaulters
              </Link>
            </div>
          ) : (
            <div className="card p-5 border-green-900/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-green-400" />
                <span className="text-green-400 text-sm font-bold">All Clear</span>
              </div>
              <p className="text-[#8a9080] text-xs">
                No cadets are currently below 75% attendance threshold.
              </p>
            </div>
          )}

          {/* Honor Board quick link */}
          <div className="card p-5 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-[#c8b87a]" fill="currentColor" />
              <span className="text-[#c8b87a] text-sm font-bold">Honor Board</span>
            </div>
            <p className="text-[#8a9080] text-xs mb-3">
              Recognize cadets for exceptional performance.
            </p>
            <Link to="/honor-board" className="btn-ghost text-xs w-full block text-center py-2">
              View Honor Board
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
