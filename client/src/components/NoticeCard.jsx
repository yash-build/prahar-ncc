import { getPriorityConfig, formatDate, timeAgo } from '../utils/helpers';
import { Pin, Clock } from 'lucide-react';

const NoticeCard = ({ notice, onDelete, canDelete }) => {
  const { title, content, priority, targetWing, expiresAt, isPinned, createdBy, createdAt } = notice;
  const { label, className } = getPriorityConfig(priority);
  const isExpiringSoon = new Date(expiresAt) - Date.now() < 3 * 24 * 60 * 60 * 1000; // < 3 days

  return (
    <div className={`card p-4 ${priority === 'urgent' ? 'border-red-900/40' : ''}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${className} px-2 py-0.5 text-[10px] rounded font-bold tracking-wider uppercase`}>
            {label}
          </span>
          {isPinned && (
            <span className="flex items-center gap-1 text-[10px] text-[#c8b87a] bg-[#3d3000] px-2 py-0.5 rounded border border-[#6b5a00]">
              <Pin size={9} /> Pinned
            </span>
          )}
          {targetWing !== 'ALL' && (
            <span className="text-[10px] text-[#6b7560] bg-[#1c2128] px-2 py-0.5 rounded border border-[#2d3748]">
              {targetWing} only
            </span>
          )}
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(notice._id)}
            className="text-[#5a2a2a] hover:text-red-400 text-xs transition-colors flex-shrink-0"
          >
            Remove
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[#e8e4dc] font-semibold text-sm mb-1.5 leading-snug">{title}</h3>

      {/* Content */}
      <p className="text-[#8a9080] text-xs leading-relaxed line-clamp-3">{content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#2d3748]">
        <div className="text-[10px] text-[#6b7560]">
          by {createdBy?.name || 'Unknown'} · {timeAgo(createdAt)}
        </div>
        <div className={`flex items-center gap-1 text-[10px] ${isExpiringSoon ? 'text-orange-400' : 'text-[#6b7560]'}`}>
          <Clock size={9} />
          Expires {formatDate(expiresAt)}
        </div>
      </div>
    </div>
  );
};

export default NoticeCard;
