/**
 * CadetRegistry.jsx — Grid of all cadets with filtering
 */

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams }   from 'react-router-dom';
import { cadetService }      from '../services/services';
import CadetCard             from '../components/CadetCard';
import LoadingSpinner        from '../components/LoadingSpinner';
import { debounce }          from '../utils/helpers';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const RANKS = ['', 'SUO', 'JUO', 'Sgt', 'Cpl', 'L/Cpl', 'Cadet'];
const WINGS = ['', 'SD', 'SW'];
const YEARS = ['', '1', '2', '3'];

const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] text-[#6b7560] uppercase tracking-wider font-semibold">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input text-sm py-2"
      style={{ backgroundImage: 'none' }}
    >
      {options.map(o => (
        <option key={o} value={o}>{o || `All ${label}s`}</option>
      ))}
    </select>
  </div>
);

const CadetRegistry = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [cadets,   setCadets]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filters,  setFilters]  = useState({
    wing: searchParams.get('wing') || '',
    rank: searchParams.get('rank') || '',
    year: searchParams.get('year') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchCadets = useCallback(async (params) => {
    setLoading(true);
    try {
      const query = {};
      if (params.wing)   query.wing   = params.wing;
      if (params.rank)   query.rank   = params.rank;
      if (params.year)   query.year   = params.year;
      if (params.search) query.search = params.search;

      const res = await cadetService.getAll(query);
      setCadets(res.data.cadets);
    } catch {
      setCadets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const debouncedFetch = useCallback(
    debounce((params) => fetchCadets(params), 350),
    [fetchCadets]
  );

  useEffect(() => {
    debouncedFetch({ ...filters, search });
  }, [filters, search]);

  const clearFilters = () => {
    setFilters({ wing: '', rank: '', year: '' });
    setSearch('');
  };

  const hasActiveFilters = filters.wing || filters.rank || filters.year || search;

  // Wing breakdown counts
  const sdCount = cadets.filter(c => c.wing === 'SD').length;
  const swCount = cadets.filter(c => c.wing === 'SW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e8e4dc] font-serif">Cadet Registry</h1>
          <p className="text-[#6b7560] text-sm mt-1">
            {loading ? 'Loading...' : `${cadets.length} cadets · SD: ${sdCount} · SW: ${swCount}`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(s => !s)}
          className={`btn-ghost flex items-center gap-2 text-sm ${showFilters ? 'border-[#4a5240]' : ''}`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-[#c8b87a] rounded-full" />
          )}
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5240]" />
        <input
          type="text"
          placeholder="Search by name or registration number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-10 pr-10 py-3 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7560] hover:text-[#e8e4dc]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 mb-4 animate-fade-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FilterSelect
              label="Wing"
              value={filters.wing}
              onChange={v => setFilters(f => ({ ...f, wing: v }))}
              options={WINGS}
            />
            <FilterSelect
              label="Rank"
              value={filters.rank}
              onChange={v => setFilters(f => ({ ...f, rank: v }))}
              options={RANKS}
            />
            <FilterSelect
              label="Year"
              value={filters.year}
              onChange={v => setFilters(f => ({ ...f, year: v }))}
              options={YEARS}
            />
            <div className="flex items-end">
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-ghost text-xs w-full flex items-center justify-center gap-1.5">
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" label="Loading cadets..." />
        </div>
      ) : cadets.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-[#6b7560] text-lg">No cadets found</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-[#4a5240] text-sm mt-2 hover:text-[#6b7560]">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {cadets.map((cadet, i) => (
            <div key={cadet._id} style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}>
              <CadetCard cadet={cadet} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CadetRegistry;
