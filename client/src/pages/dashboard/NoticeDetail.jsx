import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    api.get(`/notices/${id}`).then(r => setNotice(r.data.notice)).catch(e => console.error(e));
  }, [id]);

  if (!notice) return <div className="p-10 text-center">Loading...</div>;

  return (
    <AnimatedPage className="page-shell">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 w-max">← Back</button>
      <div className="card p-8">
        <div className="flex gap-2 mb-4">
          <span className="badge badge-amber">{notice.priority}</span>
          <span className="badge badge-olive">{notice.targetAudience}</span>
        </div>
        <h1 className="section-title mb-4">{notice.title}</h1>
        {notice.imageUrl && <img src={notice.imageUrl} alt="Notice" className="w-full max-h-96 object-cover rounded-sm mb-6 border border-olive-dark/10" />}
        <div className="whitespace-pre-wrap text-olive-dark leading-relaxed mb-6">{notice.body}</div>
        
        {(notice.pdfUrl || notice.externalLink) && (
          <div className="flex gap-4 mb-6">
            {notice.pdfUrl && <a href={notice.pdfUrl} target="_blank" rel="noreferrer" className="btn-primary">View PDF Document</a>}
            {notice.externalLink && <a href={notice.externalLink} target="_blank" rel="noreferrer" className="btn-ghost">External Link</a>}
          </div>
        )}
        <div className="pt-4 border-t border-olive-dark/10 font-mono text-2xs text-olive-muted">
          Published: {new Date(notice.publishedAt || notice.createdAt).toLocaleString()}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default NoticeDetail;
