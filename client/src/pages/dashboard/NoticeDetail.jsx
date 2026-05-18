import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/notices/${id}`)
      .then(r => { if (r.data?.notice) setNotice(r.data.notice); else setError(true); })
      .catch(() => setError(true));
  }, [id]);

  if (error) return (
    <AnimatedPage className="page-shell">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 w-max">← Back</button>
      <div className="card p-10 text-center">
        <div className="empty-state-icon">📢</div>
        <div className="empty-state-title">Notice not found</div>
        <div className="empty-state-sub">This notice may have expired or been removed.</div>
      </div>
    </AnimatedPage>
  );

  if (!notice) return (
    <AnimatedPage className="page-shell">
      <div className="skeleton h-6 w-24 mb-6" />
      <div className="card p-8">
        <div className="skeleton h-4 w-32 mb-4" />
        <div className="skeleton h-8 w-3/4 mb-6" />
        <div className="skeleton h-48 w-full" />
      </div>
    </AnimatedPage>
  );

  const isPdf = notice.attachment?.resourceType === 'raw';

  return (
    <AnimatedPage className="page-shell">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 w-max">← Back</button>
      <div className="card p-8">
        <div className="flex gap-2 mb-4">
          <span className="badge badge-amber">{notice.priority}</span>
          <span className="badge badge-olive">{notice.targetAudience}</span>
        </div>
        <h1 className="section-title mb-4">{notice.title}</h1>
        
        {notice.attachment?.url && !isPdf && (
          <img src={notice.attachment.url} alt="Notice Attachment" className="w-full max-h-96 object-contain bg-stone-100 rounded-sm mb-6 border border-olive-dark/10" />
        )}
        
        <div className="whitespace-pre-wrap text-olive-dark leading-relaxed mb-6">{notice.body}</div>
        
        {notice.attachment?.url && isPdf && (
          <div className="mb-6 h-[600px] w-full border border-stone-200">
            <iframe src={notice.attachment.url} className="w-full h-full" title="Notice PDF Attachment" />
          </div>
        )}
        
        <div className="pt-4 border-t border-olive-dark/10 flex flex-wrap justify-between items-center text-xs">
          <div className="font-mono text-olive-muted">
            Published: {new Date(notice.publishedAt || notice.createdAt).toLocaleString()}
          </div>
          <div className="font-mono text-khaki-dark font-semibold">
            Status: {notice.status}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default NoticeDetail;
