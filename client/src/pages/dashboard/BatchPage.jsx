import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const BatchPage = () => {
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handlePromote = async () => {
    if (!window.confirm("WARNING: This will promote ALL active 1st Year cadets to 2nd Year, and ALL 2nd Year to 3rd Year. 3rd Years will be marked as PASSED OUT. This action is irreversible. Proceed?")) return;
    
    setLoading(true);
    try {
      const { data } = await api.post('/yt/promote-all');
      if (data.success) {
        toast.success(data.message || 'Batch promotion successful!');
      }
    } catch (err) {
      toast.error('Failed to execute batch promotion.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Map excel columns to Cadet schema
        const mappedCadets = data.map(row => ({
          serviceNumber: row['Service No'] || row['Service Number'] || row['serviceNumber'],
          name: row['Name'] || row['name'],
          email: row['Email'] || row['email'],
          rank: row['Rank'] || row['rank'] || 'CADET',
          wing: row['Wing'] || row['wing'] || 'SD',
          yearOfStudy: row['Year'] || row['yearOfStudy'] || 1,
          batchYear: row['Batch'] || row['batchYear'] || new Date().getFullYear(),
          phone: row['Phone'] || row['phone'],
          bloodGroup: row['Blood Group'] || row['bloodGroup'],
          status: row['Status'] || row['status'] || 'ACTIVE'
        }));

        const validCadets = mappedCadets.filter(c => c.serviceNumber && c.name && c.email);
        
        if (validCadets.length === 0) {
          toast.error("No valid cadet data found. Ensure columns are named correctly.");
          return;
        }

        const res = await api.post('/cadets/batch', { cadets: validCadets });
        if (res.data.success) {
          toast.success(`Successfully enrolled ${res.data.count} cadets.`);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to process and upload excel file.');
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <AnimatedPage className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-olive-deep uppercase tracking-wider">Batch Promotion Engine</h1>
        <p className="text-olive-light mt-1">Execute end-of-year automated rank and year advancements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulk Import */}
        <div className="bg-white rounded shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 bg-stone-50 border-b border-stone-200">
            <h2 className="text-xl font-bold text-olive-deep mb-2">Bulk Import Cadets</h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Upload an Excel (.xlsx) file to instantly enroll multiple cadets. Ensure columns match: Service No, Name, Email.
            </p>
          </div>
          <div className="p-6 flex flex-col items-center justify-center bg-stone-100 min-h-[200px]">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className={`px-8 py-4 text-xl font-display uppercase tracking-widest text-white shadow-xl rounded transition-all duration-300 ${loading ? 'bg-stone-400 cursor-not-allowed' : 'bg-[#2e3b2c] hover:bg-[#1f2a1d] hover:scale-105 active:scale-95'}`}
            >
              {loading ? 'Processing...' : 'UPLOAD EXCEL FILE'}
            </button>
            <p className="mt-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">
              Requires valid headers
            </p>
          </div>
        </div>

        {/* Batch Promotion */}
        <div className="bg-white rounded shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 bg-stone-50 border-b border-stone-200">
            <h2 className="text-xl font-bold text-olive-deep mb-2">Annual Promotion Cycle</h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Executing this cycle will perform the following actions system-wide:
            </p>
            <ul className="list-disc ml-5 mt-4 space-y-2 text-sm text-stone-700 font-mono">
              <li>All <span className="font-bold text-olive">1st Year</span> cadets to <span className="font-bold text-olive">2nd Year</span>.</li>
              <li>All <span className="font-bold text-olive">2nd Year</span> cadets to <span className="font-bold text-olive">3rd Year</span>.</li>
              <li>All <span className="font-bold text-olive">3rd Year</span> cadets to <span className="font-bold text-red-600">PASSED OUT</span>.</li>
            </ul>
          </div>
          <div className="p-6 flex flex-col items-center justify-center bg-stone-100 min-h-[200px]">
            <button 
              onClick={handlePromote}
              disabled={loading}
              className={`px-8 py-4 text-xl font-display uppercase tracking-widest text-white shadow-xl rounded transition-all duration-300 ${loading ? 'bg-stone-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800 hover:scale-105 active:scale-95'}`}
            >
              {loading ? 'Executing...' : 'EXECUTE PROMOTION'}
            </button>
            <p className="mt-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">
              ⚠ Requires ANO Authorization
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default BatchPage;
