import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const PRIORITY_BADGE = {
  URGENT:   'badge-red',
  IMPORTANT: 'badge-amber',
  INFORMATION:    'badge-olive',
};

const PRIORITY_BORDER = {
  URGENT:   'border-l-red-500',
  IMPORTANT: 'border-l-amber-500',
  INFORMATION:    'border-l-olive/40',
};

const AUDIENCE_BADGE = {
  ALL: 'All Cadets',
  SD: 'SD Wing',
  SW: 'SW Wing'
};

const PublicNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/notices/public')
      .then(res => {
        if (res.data.success) setNotices(res.data.notices);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 lg:px-8 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
        <div className="font-mono text-2xs text-yellow-200 tracking-military mb-3">OFFICIAL COMMUNICATIONS</div>
        <h1 className="font-display text-6xl text-yellow-400 uppercase tracking-wide mb-3">Notice Board</h1>
        <div className="gold-divider mb-4" />
        <p className="text-yellow-200 max-w-xl font-sans">Official announcements, exam schedules, and important updates for all cadets.</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-dark p-5 h-32 animate-pulse bg-stone-50" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="card-dark p-12 text-center text-yellow-200 border-dashed border-2">
          <div className="text-4xl mb-4">📢</div>
          <h2 className="font-heading font-bold text-xl text-yellow-400">No Active Notices</h2>
          <p className="font-mono text-sm mt-2">There are no published notices at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice, i) => {
            const isExpanded = expandedId === notice._id;
            const isPdf = notice.attachment?.resourceType === 'raw';
            
            return (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setExpandedId(isExpanded ? null : notice._id)}
                className={`card border-l-4 ${PRIORITY_BORDER[notice.priority] || PRIORITY_BORDER.INFORMATION} p-0 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all`}
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={PRIORITY_BADGE[notice.priority] || PRIORITY_BADGE.INFORMATION}>
                      {notice.priority}
                    </span>
                    <span className="badge-olive border-white/10 text-yellow-400">
                      {AUDIENCE_BADGE[notice.targetAudience] || notice.targetAudience}
                    </span>
                    {notice.attachment?.url && (
                      <span className="badge-olive bg-stone-200 text-yellow-400 flex items-center gap-1">
                        📎 {isPdf ? 'PDF' : 'IMAGE'}
                      </span>
                    )}
                    <span className="ml-auto font-mono text-2xs text-yellow-200">
                      {new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className={`font-heading font-bold text-lg mb-2 transition-colors ${isExpanded ? 'text-yellow-400' : 'text-yellow-400 group-hover:text-khaki-dark'}`}>
                    {notice.title}
                  </h3>
                  
                  <p className={`text-yellow-200 text-sm whitespace-pre-wrap ${!isExpanded ? 'line-clamp-2' : ''}`}>
                    {notice.body}
                  </p>
                  
                  {isExpanded && notice.attachment?.url && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 pt-4 border-t border-stone-100">
                      {!isPdf ? (
                        <div className="mb-4">
                          <img src={notice.attachment.url} alt="Notice Attachment" className="max-w-full rounded border border-stone-200" onClick={e => e.stopPropagation()} />
                        </div>
                      ) : (
                        <a 
                          href={notice.attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-2 btn-primary py-2 px-4 text-xs font-mono"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download PDF Attachment
                        </a>
                      )}
                    </motion.div>
                  )}

                  <div className="mt-3 font-mono text-2xs text-khaki-dark font-semibold uppercase tracking-wider">
                    {isExpanded ? 'Close Notice ↑' : 'Read Full Notice ↓'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicNotices;
