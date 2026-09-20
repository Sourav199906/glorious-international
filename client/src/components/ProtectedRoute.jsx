import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !['ADMIN', 'STAFF'].includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
