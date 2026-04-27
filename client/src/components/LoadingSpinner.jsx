/**
 * LoadingSpinner.jsx
 */
export const LoadingSpinner = ({ size = 'md', label = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-2 border-[#4a5240] border-t-[#c8b87a] rounded-full animate-spin`} />
      {label && <p className="text-[#6b7560] text-sm">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
