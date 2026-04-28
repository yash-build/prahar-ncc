import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import * as XLSX from 'xlsx';
import AnimatedPage from '../../components/layout/AnimatedPage';
import AddCadetModal from '../../components/cadet/AddCadetModal';
import EditCadetForm from '../../components/cadet/EditCadetForm';

const WINGS = ['ALL', 'SD', 'SW'];

const STATUS_BADGE = {
  ACTIVE:     'badge-green',
  INACTIVE:   'badge-red',
  PASSED_OUT: 'badge-olive',
};

const CadetRegistry = () => {
  const [cadets, setCadets]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterWing, setFilter]   = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCadet, setEditingCadet] = useState(null);
  const { user }                  = useAuthStore();
  const isANO                     = user?.role === 'ANO';
  const navigate                  = useNavigate();

  const fetchCadets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cadets', {
        params: { search: search || undefined, wing: filterWing !== 'ALL' ? filterWing : undefined }
      });
      if (data.success) setCadets(data.cadets);
    } catch { toast.error('Failed to load cadet records'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchCadets, 450);
    return () => clearTimeout(t);
  }, [search, filterWing]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete cadet "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/cadets/${id}`);
      toast.success(`${name} removed from registry.`);
      setCadets(c => c.filter(x => x._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const exportExcel = () => {
    if (cadets.length === 0) {
      toast.error('No cadets to export');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(cadets.map(c => ({
      'Service No': c.serviceNumber,
      'Name': c.name,
      'Email': c.email,
      'Rank': c.rank,
      'Wing': c.wing,
      'Year': c.yearOfStudy,
      'Status': c.status,
      'Blood Group': c.bloodGroup || 'N/A'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cadets");
    XLSX.writeFile(wb, `Prahar_Cadets_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <AnimatedPage className="page-shell">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">DATABASE</div>
          <h1 className="section-title">Cadet Registry</h1>
          <p className="font-mono text-xs text-olive-muted mt-1">{cadets.length} records loaded</p>
        </div>
        {isANO && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            + Enroll New Cadet
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or service number..."
          className="input flex-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {WINGS.map(w => (
            <button
              key={w}
              onClick={() => setFilter(w)}
              className={`btn text-xs px-4 py-2 ${filterWing === w ? 'btn-primary' : 'btn-ghost'}`}
            >
              {w === 'ALL' ? 'All Wings' : `${w} Wing`}
            </button>
          ))}
        </div>
        {isANO && (
          <button onClick={exportExcel} className="btn-ghost text-xs flex items-center gap-2">
            ↓ Export XLSX
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service No.</th>
                <th>Cadet Name</th>
                <th>Rank</th>
                <th>Wing / Year</th>
                <th>Status</th>
                {isANO && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton h-4 w-24" /></td>
                    <td><div className="skeleton h-4 w-36" /></td>
                    <td><div className="skeleton h-4 w-16" /></td>
                    <td><div className="skeleton h-4 w-20" /></td>
                    <td><div className="skeleton h-4 w-16" /></td>
                    {isANO && <td><div className="skeleton h-4 w-16 ml-auto" /></td>}
                  </tr>
                ))
              ) : cadets.length === 0 ? (
                <tr>
                  <td colSpan={isANO ? 6 : 5}>
                    <div className="empty-state">
                      <div className="empty-state-icon">👤</div>
                      <div className="empty-state-title">No cadets found</div>
                      <div className="empty-state-sub">Try adjusting your search or wing filter.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                cadets.map((cadet, i) => (
                  <motion.tr
                    key={cadet._id}
                    onClick={() => navigate(`/dashboard/cadets/${cadet._id}`)}
                    className="cursor-pointer hover:bg-olive-dark/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td className="font-mono text-xs text-olive-muted">{cadet.serviceNumber}</td>
                    <td className="font-heading font-semibold text-olive-dark">{cadet.name}</td>
                    <td>
                      <div className="rank-pip">{cadet.rank}</div>
                    </td>
                    <td className="font-mono text-xs text-olive-muted">
                      {cadet.wing} · Yr {cadet.yearOfStudy}
                    </td>
                    <td>
                      <span className={STATUS_BADGE[cadet.status] || 'badge-olive'}>
                        {cadet.status}
                      </span>
                    </td>
                    {isANO && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingCadet(cadet); }}
                            className="font-mono text-2xs text-khaki-dark hover:text-olive-dark transition-colors uppercase tracking-wider"
                          >Edit</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(cadet._id, cadet.name); }}
                            className="font-mono text-2xs text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                          >Delete</button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showAddModal && (
        <AddCadetModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={(newCadet) => {
            setCadets([...cadets, newCadet]);
            setShowAddModal(false);
          }} 
        />
      )}
      {editingCadet && (
        <EditCadetForm
          cadet={editingCadet}
          onClose={() => setEditingCadet(null)}
          onSuccess={(updatedCadet) => {
            setCadets(cadets.map(c => c._id === updatedCadet._id ? updatedCadet : c));
            setEditingCadet(null);
          }}
        />
      )}
    </AnimatedPage>
  );
};

export default CadetRegistry;
