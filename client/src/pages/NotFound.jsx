// NotFound.jsx
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center text-center px-4">
    <div className="w-20 h-20 bg-[#1c2128] border border-[#2d3748] rounded-full flex items-center justify-center mb-6">
      <Shield size={32} className="text-[#2d3748]" />
    </div>
    <h1 className="text-6xl font-bold text-[#2d3748] font-serif mb-3">404</h1>
    <p className="text-[#6b7560] text-lg mb-2">Page not found</p>
    <p className="text-[#4a5240] text-sm mb-8">This route does not exist in SHASTRA.</p>
    <Link to="/" className="btn-primary">← Return to Home</Link>
  </div>
);

export default NotFound;
