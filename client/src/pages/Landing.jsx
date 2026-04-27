/**
 * Landing.jsx — Public homepage
 * Shows unit overview, recent achievements, honor highlights
 */

import { useEffect, useState } from 'react';
import { Link }                from 'react-router-dom';
import { Shield, Star, Users, Bell, ChevronRight, Award } from 'lucide-react';
import { achievementService } from '../services/services';
import { cadetService }       from '../services/services';
import { formatDate, getRankClass, getWingClass } from '../utils/helpers';
import LoadingSpinner          from '../components/LoadingSpinner';

const Landing = () => {
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [honoredCadets,      setHonoredCadets]      = useState([]);
  const [stats,              setStats]              = useState(null);
  const [loading,            setLoading]            = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [achRes, honorRes, allRes] = await Promise.all([
          achievementService.getRecent(),
          cadetService.getAll({ isHonored: true }),
          cadetService.getAll({}),
        ]);

        setRecentAchievements(achRes.data.achievements);
        setHonoredCadets(honorRes.data.cadets.slice(0, 4));
        setStats({
          total:  allRes.data.count,
          sd:     allRes.data.cadets.filter(c => c.wing === 'SD').length,
          sw:     allRes.data.cadets.filter(c => c.wing === 'SW').length,
          honored: honorRes.data.count,
        });
      } catch {
        // Silently fail — public page should still render
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117]">

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #4a5240 0, #4a5240 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-3xl">
            {/* Unit label */}
            <div className="inline-flex items-center gap-2 bg-[#1c2128] border border-[#4a5240] rounded px-3 py-1.5 mb-6">
              <Shield size={13} className="text-[#c8b87a]" />
              <span className="text-[#c8b87a] text-xs font-bold tracking-widest uppercase">
                NCC Unit · India
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-[#e8e4dc] leading-tight mb-4 font-serif">
              Unity.<br />
              <span className="text-[#c8b87a]">Discipline.</span><br />
              Excellence.
            </h1>

            <p className="text-[#8a9080] text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
              The National Cadet Corps — building tomorrow's leaders today.
              Track performance, celebrate achievement, and maintain the highest
              standards of military discipline.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/cadets"      className="btn-primary flex items-center gap-2">
                <Users size={15} /> View Cadets <ChevronRight size={14} />
              </Link>
              <Link to="/honor-board" className="btn-ghost flex items-center gap-2">
                <Star size={15} /> Honor Board
              </Link>
              <Link to="/notices"     className="btn-ghost flex items-center gap-2">
                <Bell size={15} /> Notices
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────────── */}
      {stats && (
        <section className="border-y border-[#2d3748] bg-[#1c2128]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: 'Total Cadets',    value: stats.total,   color: 'text-[#e8e4dc]' },
                { label: 'SD Wing (Boys)',  value: stats.sd,      color: 'text-blue-400' },
                { label: 'SW Wing (Girls)', value: stats.sw,      color: 'text-pink-400' },
                { label: 'Honored Cadets',  value: stats.honored, color: 'text-[#c8b87a]' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`${color} text-3xl font-bold font-serif`}>{value}</p>
                  <p className="text-[#6b7560] text-xs mt-1 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Honored Cadets ───────────────────────────────────────────── */}
      {honoredCadets.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#e8e4dc] font-serif flex items-center gap-2">
                <Star size={20} className="text-[#c8b87a]" fill="currentColor" />
                Honor Board
              </h2>
              <p className="text-[#6b7560] text-sm mt-1">Cadets distinguished for exceptional service</p>
            </div>
            <Link to="/honor-board" className="btn-ghost text-xs">View All →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {honoredCadets.map((cadet, i) => (
              <Link
                key={cadet._id}
                to={`/cadets/${cadet._id}`}
                className="card p-4 text-center group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Avatar */}
                <div className="relative mx-auto w-16 h-16 mb-3">
                  {cadet.photoUrl ? (
                    <img src={cadet.photoUrl} alt={cadet.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#c8b87a]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#2d3748] flex items-center justify-center
                                    border-2 border-[#c8b87a] text-[#c8b87a] font-bold text-lg">
                      {cadet.name[0]}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#c8b87a] rounded-full
                                  flex items-center justify-center">
                    <Star size={11} fill="currentColor" className="text-[#2e3328]" />
                  </div>
                </div>
                <p className="text-[#e8e4dc] font-semibold text-sm leading-tight group-hover:text-white">
                  {cadet.name}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span className={`${getRankClass(cadet.rank)} px-2 py-0.5 text-[10px] rounded font-bold`}>
                    {cadet.rank}
                  </span>
                  <span className={`${getWingClass(cadet.wing)} px-2 py-0.5 text-[10px] rounded font-bold`}>
                    {cadet.wing}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent Achievements ──────────────────────────────────────── */}
      {recentAchievements.length > 0 && (
        <section className="border-t border-[#2d3748] bg-[#0a0d12]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl font-bold text-[#e8e4dc] font-serif flex items-center gap-2 mb-8">
              <Award size={20} className="text-[#c8b87a]" />
              Recent Achievements
            </h2>

            <div className="space-y-3">
              {recentAchievements.slice(0, 6).map((a, i) => (
                <Link
                  key={a._id}
                  to={`/cadets/${a.cadet?._id}`}
                  className="card p-4 flex items-center gap-4 group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Cadet mini avatar */}
                  <div className="flex-shrink-0">
                    {a.cadet?.photoUrl ? (
                      <img src={a.cadet.photoUrl} alt={a.cadet.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#2d3748]" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#2d3748] flex items-center justify-center text-sm font-bold text-[#6b7560]">
                        {a.cadet?.name?.[0] || '?'}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[#e8e4dc] text-sm font-semibold leading-tight truncate
                                  group-hover:text-white transition-colors">
                      {a.title}
                    </p>
                    <p className="text-[#6b7560] text-xs mt-0.5">
                      {a.cadet?.name} ·{' '}
                      <span className={`${getRankClass(a.cadet?.rank)} px-1.5 py-0.5 rounded text-[9px] font-bold`}>
                        {a.cadet?.rank}
                      </span>
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    {a.level && (
                      <span className="text-[#c8b87a] text-[10px] font-bold uppercase tracking-wider">
                        {a.level}
                      </span>
                    )}
                    <p className="text-[#6b7560] text-[10px] mt-0.5">{formatDate(a.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Footer ─────────────────────────────────────────────── */}
      <section className="border-t border-[#2d3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-[#6b7560] text-sm">
            SHASTRA — Smart Hub for Administration, Strength & Training Records for Armies
          </p>
          <p className="text-[#4a5240] text-xs mt-1">
            Built for NCC Units · India
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
