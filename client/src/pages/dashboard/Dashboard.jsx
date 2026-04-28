import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import DemoSeedButton from '../../components/ui/DemoSeedButton';
import AnimatedPage from '../../components/layout/AnimatedPage';

const KPI_CARDS = [
  { label: 'Enrolled Cadets', value: '142', delta: '+3 this month', color: 'border-t-blue-500',   icon: '👤' },
  { label: 'Avg Attendance',  value: '87%', delta: '+2% vs last',   color: 'border-t-emerald-500', icon: '📋' },
  { label: 'Active Notices',  value: '8',   delta: '2 high priority',color: 'border-t-amber-500',  icon: '📢' },
  { label: 'Upcoming Events', value: '3',   delta: 'Next: 15 Nov',  color: 'border-t-purple-500',  icon: '🏕️' },
];

const attendanceData = [
  { name: 'Jan', rate: 85 }, { name: 'Feb', rate: 88 }, { name: 'Mar', rate: 82 },
  { name: 'Apr', rate: 89 }, { name: 'May', rate: 94 }, { name: 'Jun', rate: 91 },
  { name: 'Jul', rate: 87 }, { name: 'Aug', rate: 90 },
];

const wingData = [
  { name: 'SD (Boys)', value: 105 },
  { name: 'SW (Girls)', value: 37 },
];
const COLORS = ['#2c3128', '#c8b98a'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-olive-dark border border-khaki/20 px-3 py-2 rounded-sm shadow-xl">
      <p className="font-mono text-2xs text-olive-faint/60 mb-1">{label}</p>
      <p className="font-heading font-bold text-khaki text-sm">{payload[0].value}{payload[0].name === 'rate' ? '%' : ''}</p>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ totalCadets: 0, totalSessions: 0, totalNotices: 0 });
  const [wingData, setWingData] = useState([{ name: 'SD Wing', value: 0 }, { name: 'SW Wing', value: 0 }]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    // Fetch live counts
    Promise.all([
      api.get('/cadets', { params: { limit: 200 } }),
      api.get('/notices/public'),
    ]).then(([cadetRes, noticeRes]) => {
      const cadets = cadetRes.data?.cadets || [];
      const notices = noticeRes.data?.notices || [];
      setStats({
        totalCadets: cadets.length,
        totalSessions: 0,
        totalNotices: notices.length,
      });
      setWingData([
        { name: 'SD Wing', value: cadets.filter(c => c.wing === 'SD').length },
        { name: 'SW Wing', value: cadets.filter(c => c.wing === 'SW').length },
      ]);
    }).catch(() => {});
    // Fetch recent audit logs
    api.get('/audit').then(r => {
      if (r.data.success) setRecentLogs(r.data.logs.slice(0, 5));
    }).catch(() => {});
  }, []);

  const KPI_CARDS = [
    { label: 'Enrolled Cadets', value: stats.totalCadets, delta: 'Active in registry', color: 'border-t-blue-500',   icon: '👤' },
    { label: 'SD Wing',         value: wingData[0].value,  delta: 'Senior Division',   color: 'border-t-emerald-500', icon: '🪖' },
    { label: 'SW Wing',         value: wingData[1].value,  delta: 'Senior Wing',       color: 'border-t-amber-500',  icon: '🎖️' },
    { label: 'Active Notices',  value: stats.totalNotices, delta: 'Published',          color: 'border-t-purple-500',  icon: '📢' },
  ];

  return (
    <AnimatedPage className="page-shell">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">OVERVIEW</div>
          <h1 className="section-title">Command Center</h1>
          <p className="font-mono text-xs text-olive-muted mt-1">Training Year 2024-25 · Live Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-sm">
            <span className="status-dot-active" />
            <span className="font-mono text-xs text-emerald-700 font-semibold">All Systems Operational</span>
          </div>
          <DemoSeedButton />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`stat-card border-t-2 ${kpi.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="font-mono text-2xs text-olive-muted uppercase tracking-military">{kpi.label}</span>
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <div className="font-display text-5xl text-olive-dark leading-none mb-2">{kpi.value}</div>
            <div className="font-mono text-2xs text-olive-muted/70">{kpi.delta}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Attendance trend — wider */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card lg:col-span-3 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-semibold text-olive-dark uppercase tracking-wide">Attendance Trend</h3>
              <p className="font-mono text-2xs text-olive-muted mt-0.5">Last 8 months, all sessions</p>
            </div>
            <span className="badge-green">↑ +5% YoY</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#6b7a69' }} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#6b7a69' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" fill="#2c3128" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Wing distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="card lg:col-span-2 p-6"
        >
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-olive-dark uppercase tracking-wide">Wing Distribution</h3>
            <p className="font-mono text-2xs text-olive-muted mt-0.5">Current active cadets</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {wingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d16', border: '1px solid #4a5240', borderRadius: '2px' }}
                  itemStyle={{ color: '#c8b98a', fontFamily: 'IBM Plex Mono', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="card p-6"
      >
        <h3 className="font-heading font-semibold text-olive-dark uppercase tracking-wide mb-5">Recent Activity</h3>
        <div className="space-y-3">
          {recentLogs.length === 0 ? (
            <div className="text-center py-6 font-mono text-xs text-olive-muted">No activity logged yet. Actions by staff will appear here.</div>
          ) : recentLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 py-2.5 border-b border-stone-100 last:border-0">
              <span className="status-dot status-dot-active shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-sans text-sm text-olive-dark">{log.action.replace(/_/g, ' ')}</span>
                <span className="font-mono text-2xs text-olive-muted ml-2">by {log.performedBy?.name || 'System'}</span>
              </div>
              <span className="font-mono text-2xs text-olive-muted/60 shrink-0">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatedPage>
  );
};

export default Dashboard;
