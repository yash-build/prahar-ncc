/**
 * CadetCard — used in the cadet registry grid
 */
import { Link }      from 'react-router-dom';
import { Star }      from 'lucide-react';
import { RankBadge, WingBadge } from './RankBadge';
import { getInitials, getAttendanceColor } from '../utils/helpers';

const CadetCard = ({ cadet }) => {
  const { _id, name, regNo, rank, wing, year, photoUrl, isHonored } = cadet;
  const initials = getInitials(name);

  return (
    <Link
      to={`/cadets/${_id}`}
      className="card group block p-4 cursor-pointer animate-fade-up"
    >
      {/* Top section */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-14 h-14 rounded-lg object-cover border border-[#2d3748]
                         group-hover:border-[#4a5240] transition-colors"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-[#2d3748] flex items-center justify-center
                            border border-[#3d4a60] group-hover:border-[#4a5240] transition-colors">
              <span className="text-lg font-bold text-[#6b7560]">{initials}</span>
            </div>
          )}

          {/* Honor star overlay */}
          {isHonored && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#c8b87a] rounded-full
                            flex items-center justify-center shadow-lg">
              <Star size={10} fill="currentColor" className="text-[#2e3328]" />
            </div>
          )}
        </div>

        {/* Name & reg */}
        <div className="min-w-0 flex-1">
          <h3 className="text-[#e8e4dc] font-semibold text-sm leading-tight truncate
                         group-hover:text-white transition-colors">
            {name}
          </h3>
          <p className="text-[#6b7560] text-[11px] font-mono mt-0.5">{regNo}</p>
          <p className="text-[#6b7560] text-[11px] mt-0.5">Year {year}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <RankBadge rank={rank} />
        <WingBadge wing={wing} />
        {isHonored && (
          <span className="px-2 py-0.5 text-[10px] bg-[#3d3000] text-[#c8b87a]
                           border border-[#6b5a00] rounded font-bold tracking-wider uppercase">
            ★ Honored
          </span>
        )}
      </div>

      {/* Hover arrow */}
      <div className="mt-3 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[#4a5240] text-xs">View Profile →</span>
      </div>
    </Link>
  );
};

export default CadetCard;
