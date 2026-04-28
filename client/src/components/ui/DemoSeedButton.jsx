/**
 * DemoSeedButton
 * Visible only to ANO. One click → seeds full demo data via /api/demo/seed.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const DemoSeedButton = () => {
  const { user } = useAuthStore();
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState(null); // { success, summary }
  const [confirm, setConfirm]   = useState(false);

  // Only ANO sees this
  if (user?.role !== 'ANO') return null;

  const handleSeed = async () => {
    if (!confirm) { setConfirm(true); return; }
    setConfirm(false);

    try {
      setLoading(true);
      setResult(null);
      const { data } = await api.post('/demo/seed');
      setResult({ success: true, summary: data.summary });
      toast.success(`✅ Demo data seeded! ${data.summary.cadets} cadets, ${data.summary.notices} notices.`, { duration: 5000 });
    } catch (err) {
      const msg = err.response?.data?.message || 'Seeding failed.';
      setResult({ success: false, msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        onClick={handleSeed}
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer',
          background: confirm ? 'linear-gradient(90deg, #d4af37, #c2b280)' : '#1f2a1d',
          color: confirm ? '#1f2a1d' : '#c2b280',
          border: `1px solid ${confirm ? '#b8962c' : 'rgba(194,178,128,0.3)'}`,
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <Database size={13} />
        )}
        {loading ? 'Seeding...' : confirm ? 'Confirm — This Clears Existing Data' : 'Generate Demo Data'}
      </motion.button>

      {/* Cancel confirm */}
      <AnimatePresence>
        {confirm && !loading && (
          <motion.button
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirm(false)}
            style={{
              marginLeft: 8, fontFamily: 'monospace', fontSize: 10,
              color: '#6b7a69', background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Cancel
          </motion.button>
        )}
      </AnimatePresence>

      {/* Result feedback */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 50,
              background: result.success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: 2, padding: '10px 14px', minWidth: 260,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              {result.success
                ? <CheckCircle size={14} style={{ color: '#16a34a', marginTop: 1, flexShrink: 0 }} />
                : <AlertCircle size={14} style={{ color: '#dc2626', marginTop: 1, flexShrink: 0 }} />
              }
              <div>
                {result.success ? (
                  <>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Demo Data Seeded Successfully
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#166534', marginTop: 4 }}>
                      {result.summary.cadets} cadets · {result.summary.notices} notices · {result.summary.achievements} achievements
                    </div>
                  </>
                ) : (
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#b91c1c' }}>{result.msg}</div>
                )}
              </div>
              <button
                onClick={() => setResult(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, fontSize: 14 }}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DemoSeedButton;
