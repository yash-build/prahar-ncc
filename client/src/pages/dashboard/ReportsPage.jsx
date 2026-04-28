import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const COLORS = ['#2e3b2c','#c2b280','#d4af37','#4a5a48','#a89060'];

const ReportsPage = () => {
  const [cadets, setCadets] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleExport = () => {
    const rows = cadets.map(c => ({
      'Service No': c.serviceNumber,
      'Name': c.name,
      'Rank': c.rank,
      'Wing': c.wing,
      'Year': c.yearOfStudy,
      'Batch': c.batchYear,
      'Gender': c.gender,
      'Phone': c.phone,
      'Email': c.email,
      'Status': c.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cadet Report');
    XLSX.writeFile(wb, `prahar-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  useEffect(() => {
    api.get('/cadets', { params: { limit: 200 } })
      .then(r => { if (r.data.success) setCadets(r.data.cadets); })
      .finally(() => setLoading(false));
  }, []);

  const wingData = [
    { name: 'SD Wing', count: cadets.filter(c => c.wing === 'SD').length },
    { name: 'SW Wing', count: cadets.filter(c => c.wing === 'SW').length },
  ];

  const yearData = [1,2,3].map(y => ({ name: `Year ${y}`, count: cadets.filter(c => c.yearOfStudy === y).length }));

  const rankCounts = {};
  cadets.forEach(c => { rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1; });
  const rankData = Object.entries(rankCounts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);

  const CustomTooltip = ({ active, payload, label }) => active && payload?.length ? (
    <div className="bg-olive-dark border border-khaki/20 px-3 py-2 rounded-sm shadow-xl">
      <p className="font-mono text-2xs text-white/50 mb-1">{label}</p>
      <p className="font-heading font-bold text-khaki">{payload[0].value} cadets</p>
    </div>
  ) : null;

  return (
    <AnimatedPage className="page-shell">
      <div className="flex items-center justify-between">
        <div><div className="font-mono text-2xs text-olive-muted tracking-military mb-1">ANALYTICS</div><h1 className="section-title">Reports & Analytics</h1></div>
        {!loading && cadets.length > 0 && (
          <button onClick={handleExport} className="btn-primary">
            ↓ Export XLSX
          </button>
        )}
      </div>

      {loading ? <div className="text-center py-20 text-olive-muted font-mono text-sm">Generating report...</div> : (
        <>
          <div className="grid grid-cols-3 gap-5">
            {[{ label:'Total Cadets',value:cadets.length },{ label:'SD Wing',value:wingData[0].count },{ label:'SW Wing',value:wingData[1].count }].map((s,i) => (
              <div key={i} className="stat-card text-center">
                <div className="font-display text-5xl text-olive-dark">{s.value}</div>
                <div className="font-mono text-2xs text-olive-muted tracking-military mt-2">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-heading font-bold text-olive-dark uppercase mb-5">Year Distribution</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearData} margin={{ left: -30 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#6b7a69' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#6b7a69' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#2e3b2c" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-heading font-bold text-olive-dark uppercase mb-5">Wing Split</h3>
              <div className="h-56 flex items-center">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie data={wingData} dataKey="count" innerRadius={55} outerRadius={80} paddingAngle={3}>
                      {wingData.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {wingData.map((w,i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
                      <span className="font-mono text-xs text-olive-muted">{w.name}</span>
                      <span className="ml-auto font-display text-2xl text-olive-dark">{w.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-6 lg:col-span-2">
              <h3 className="font-heading font-bold text-olive-dark uppercase mb-5">Rank Distribution</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankData} margin={{ left: -30 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#6b7a69' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#6b7a69' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#c2b280" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatedPage>
  );
};
export default ReportsPage;
