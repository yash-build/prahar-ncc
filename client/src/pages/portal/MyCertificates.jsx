import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const MyCertificates = () => {
  const [certs, setCerts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/certificates/my')
      .then(r => { if (r.data?.success) setCerts(r.data.certificates || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div>
        <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">PORTAL</div>
        <h1 className="section-title">My Certificates</h1>
        <p className="font-mono text-xs text-olive-muted mt-1">Official NCC certificates issued to your profile.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 flex gap-4 items-center">
              <div className="skeleton w-12 h-12 rounded-sm shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-3 w-1/2" />
              </div>
              <div className="skeleton h-8 w-24 rounded-sm" />
            </div>
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4 opacity-40">📜</div>
          <div className="font-heading font-bold text-olive-dark text-xl mb-2">No Certificates Yet</div>
          <div className="font-mono text-sm text-olive-muted max-w-sm mx-auto">
            A/B/C certificates will appear here once your ANO uploads and approves them to your profile.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert, i) => (
            <motion.div key={cert._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card p-5 flex items-center gap-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-khaki/10 border border-khaki/30 rounded-sm flex items-center justify-center shrink-0">
                <span className="text-2xl">📜</span>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-olive-dark">{cert.name || cert.type || 'Certificate'}</div>
                <div className="font-mono text-2xs text-olive-muted mt-0.5">
                  {cert.issuedAt ? `Issued: ${new Date(cert.issuedAt).toLocaleDateString('en-IN')}` : 'Date not specified'}
                  {cert.type && <> · <span className="text-khaki-dark font-semibold">{cert.type}</span></>}
                </div>
              </div>
              {/* Download */}
              {cert.pdfUrl ? (
                <a href={cert.pdfUrl} target="_blank" rel="noreferrer"
                  className="btn-primary text-xs px-4 py-2 shrink-0">
                  ↓ Download PDF
                </a>
              ) : (
                <span className="font-mono text-2xs text-olive-muted/60 italic shrink-0">No file attached</span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="card p-4 bg-olive/3 border-olive/15">
        <p className="font-mono text-xs text-olive-muted">
          <span className="text-olive-dark font-semibold">Note:</span> Only your ANO can issue certificates.
          If you believe you are eligible for a certificate that is not listed here, contact your ANO.
        </p>
      </div>
    </div>
  );
};

export default MyCertificates;
