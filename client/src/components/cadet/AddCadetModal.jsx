import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AddCadetModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    serviceNumber: '', name: '', wing: 'SD', gender: 'M',
    yearOfStudy: 1, batchYear: '2024-25', phone: '', email: '', rank: 'CADET'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [showCredentials, setShowCredentials] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== undefined && form[key] !== null && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });
      if (photoFile) formData.append('photo', photoFile);

      const { data } = await api.post('/cadets', formData);
      if (data.success) {
        toast.success(`${form.name} enrolled successfully!`);
        if (data.credentials) {
          setShowCredentials(data.credentials);
        } else {
          onSuccess(data.cadet);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll cadet');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-smoke rounded-sm w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-olive-dark p-4 flex justify-between items-center">
          <h2 className="text-khaki font-heading font-bold uppercase tracking-widest text-lg">Enroll New Cadet</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <form id="add-cadet-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Service No.</label><input required className="input" value={form.serviceNumber} onChange={e=>setForm({...form, serviceNumber: e.target.value})} /></div>
              <div><label className="label">Name</label><input required className="input" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} /></div>
              <div><label className="label">Wing</label>
                <select className="input" value={form.wing} onChange={e=>setForm({...form, wing: e.target.value})}>
                  <option>SD</option><option>SW</option>
                </select>
              </div>
              <div><label className="label">Gender</label>
                <select className="input" value={form.gender} onChange={e=>setForm({...form, gender: e.target.value})}>
                  <option>M</option><option>F</option>
                </select>
              </div>
              <div><label className="label">Year of Study</label><input required type="number" min="1" max="3" className="input" value={form.yearOfStudy} onChange={e=>setForm({...form, yearOfStudy: parseInt(e.target.value)})} /></div>
              <div><label className="label">Batch Year</label><input required className="input" value={form.batchYear} onChange={e=>setForm({...form, batchYear: e.target.value})} /></div>
              <div><label className="label">Phone (Optional)</label><input className="input" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} /></div>
              <div><label className="label">Email (Optional)</label><input type="email" className="input" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} /></div>
              <div><label className="label">Rank</label>
                <select className="input" value={form.rank} onChange={e=>setForm({...form, rank: e.target.value})}>
                  <option>CADET</option><option>LCPL</option><option>CPL</option><option>SGT</option><option>JUO</option><option>SUO</option>
                </select>
              </div>
              <div className="col-span-2"><label className="label">Cadet Photo</label>
                <input type="file" accept="image/*" onChange={(e)=>setPhotoFile(e.target.files[0])} className="input p-2" />
              </div>
            </div>
          </form>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button form="add-cadet-form" type="submit" className="btn-primary">Save Cadet</button>
        </div>
      </motion.div>

      {/* Credentials display modal (shown to ANO only after cadet created) */}
      {showCredentials && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-[#2c3128] border border-[#c8b98a] rounded-sm p-6 max-w-sm w-full">
            <h3 className="font-mono text-sm text-[#c8b98a] tracking-widest mb-4">
              CADET CREDENTIALS GENERATED
            </h3>
            <div className="bg-[#1a1d16] p-4 rounded-sm space-y-2 font-mono text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-[#7a8a6e]">Login Email:</span>
                <span className="text-[#c8b98a]">{showCredentials.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8a6e]">Password:</span>
                <span className="text-[#c8b98a]">{showCredentials.password}</span>
              </div>
              <div className="text-[#4a5240] text-[10px] mt-2 border-t border-[#4a5240] pt-2">
                ⚠ Approve this account first, then share credentials with the cadet.
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Login: ${showCredentials.email}\nPassword: ${showCredentials.password}`
                  );
                  toast.success('Credentials copied!');
                }}
                className="flex-1 font-mono text-xs bg-[#4a5240] text-[#dde3d8] py-2 rounded-sm"
              >
                COPY CREDENTIALS
              </button>
              <button
                onClick={() => {
                  setShowCredentials(null);
                  onSuccess();
                }}
                className="font-mono text-xs border border-[#4a5240] text-[#7a8a6e] px-4 py-2 rounded-sm"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCadetModal;