/**
 * ProtectedRoute
 * Wraps routes that require authentication.
 * If requireANO=true, also checks for ANO role.
 */

import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import toast        from 'react-hot-toast';

const ProtectedRoute = ({ children, requireANO = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireANO && user.role !== 'ANO') {
    toast.error('Access denied — ANO only');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
