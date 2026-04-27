/**
 * HonorBoard.jsx — Public honor showcase
 */

import { useEffect, useState } from 'react';
import { Link }                from 'react-router-dom';
import { cadetService }        from '../services/services';
import { Star, Shield }        from 'lucide-react';
import { getRankClass, getWingClass, getInitials } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const HonorBoard = () => {
  const [cadets,  setCadets]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cadetService.getAll({ isHonored: true })
      .then(res => setCadets(res.data.cadets))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0f1117]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#2d3748] py-16">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#c8b87a 0,#c8b87a 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-[#3d3000] border border-[#c8b87a] rounded-full flex items-center justify-center">
              <Star size={24} fill="currentColor" className="text-[#c8b87a]" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#e8e4dc] font-serif mb-3">
            Honor Board
          </h1>
          <p className="text-[#8a9080] text-lg max-w-xl mx-auto leading-relaxed">
            Recognizing cadets who have demonstrated exceptional dedication,
            discipline, and achievement in the National Cadet Corps.
          </p>
          <div className="mt-4">
            <span className="text-[#c8b87a] font-bold text-2xl font-serif">{cadets.length}</span>
            <span className="text-[#6b7560] text-sm ml-2">Honored Cadets</span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" label="Loading honor board..." /></div>
        ) : cadets.length === 0 ? (
          <div className="text-center py-16">
            <Star size={40} className="text-[#2d3748] mx-auto mb-3" />
            <p className="text-[#6b7560]">No honored cadets yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cadets.map((cadet, i) => (
              <Link
                key={cadet._id}
                to={`/cadets/${cadet._id}`}
                className="card p-6 group text-center animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                {/* Gold ring avatar */}
                <div className="relative mx-auto w-20 h-20 mb-4">
                  {cadet.photoUrl ? (
                    <img src={cadet.photoUrl} alt={cadet.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#c8b87a]
                                 group-hover:border-[#e8d48a] transition-colors" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#2d3748] flex items-center justify-center
                                    border-2 border-[#c8b87a] group-hover:border-[#e8d48a] transition-colors">
                      <span className="text-2xl font-bold text-[#6b7560] group-hover:text-[#c8b87a] transition-colors">
                        {getInitials(cadet.name)}
                      </span>
                    </div>
                  )}
                  {/* Star badge */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2
                                  bg-[#c8b87a] rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    <Star size={11} fill="currentColor" className="text-[#2e3328]" />
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-[#e8e4dc] font-bold text-base font-serif leading-tight
                               group-hover:text-white transition-colors">
                  {cadet.name}
                </h3>

                {/* Badges */}
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  <span className={`${getRankClass(cadet.rank)} px-2.5 py-0.5 text-[10px] rounded font-bold`}>
                    {cadet.rank}
                  </span>
                  <span className={`${getWingClass(cadet.wing)} px-2.5 py-0.5 text-[10px] rounded font-bold`}>
                    {cadet.wing}
                  </span>
                </div>

                {/* Honor note */}
                {cadet.honorNote && (
                  <p className="text-[#8a9080] text-xs mt-3 italic leading-relaxed line-clamp-2">
                    "{cadet.honorNote}"
                  </p>
                )}

                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[#c8b87a] text-xs">View Profile →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HonorBoard;
