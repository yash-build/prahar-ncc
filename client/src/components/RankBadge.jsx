import { getRankClass, getWingClass } from '../utils/helpers';

export const RankBadge = ({ rank, size = 'sm' }) => {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  return (
    <span className={`${getRankClass(rank)} ${pad} rounded font-bold tracking-wider uppercase`}>
      {rank}
    </span>
  );
};

export const WingBadge = ({ wing, size = 'sm' }) => {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  return (
    <span className={`${getWingClass(wing)} ${pad} rounded font-bold tracking-wider uppercase`}>
      {wing}
    </span>
  );
};

export default RankBadge;
