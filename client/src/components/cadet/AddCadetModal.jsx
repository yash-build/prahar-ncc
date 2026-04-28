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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (photoFile) formData.append('photo', photoFile);

      const { data } = await api.post('/cadets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        toast.success('Cadet enrolled successfully');
        onSuccess(data.cadet);
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
              <div><label className="label">Phone</label><input required className="input" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} /></div>
              <div><label className="label">Email</label><input required type="email" className="input" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} /></div>
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
    </div>
  );
};

export default AddCadetModal;