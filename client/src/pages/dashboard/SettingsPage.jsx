import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import AnimatedPage from '../../components/layout/AnimatedPage';

const SettingsPage = () => {
  const { user } = useAuthStore();

  const fields = [
    { label: 'Unit Name',    value: '17 CG BN NCC' },
    { label: 'College',      value: 'LCIT College, Bilaspur' },
    { label: 'NCC Group',    value: 'CG Group HQ, Raipur' },
    { label: 'Current ANO',  value: user?.name },
    { label: 'Training Year',value: '2024-25' },
    { label: 'Batch',        value: '2024-25' },
  ];

  return (
    <AnimatedPage className="page-shell max-w-2xl">
      <div><div className="font-mono text-2xs text-olive-muted tracking-military mb-1">CONFIGURATION</div><h1 className="section-title">System Settings</h1></div>

      <div className="card p-6 space-y-5">
        <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide border-b border-stone-100 pb-4">Unit Configuration</h3>
        {fields.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
            <span className="font-mono text-xs text-olive-muted uppercase tracking-wider">{f.label}</span>
            <span className="font-heading font-semibold text-olive-dark">{f.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide border-b border-stone-100 pb-4 mb-5">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-red-50 border border-red-200 rounded-sm p-4">
            <h4 className="font-heading font-bold text-red-800 mb-1">Reset System</h4>
            <p className="text-red-600 text-xs font-mono mb-3">Deletes all cadets, notices, and attendance records. Cannot be undone.</p>
            <button className="btn-danger text-xs px-4 py-2">Reset All Data</button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};
export default SettingsPage;
