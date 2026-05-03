import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function DeletedItemsGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  const userType = user?.user_type;
  
  if (userType !== 'ADMIN' && userType !== 'SUPERADMIN') {
    return <Navigate to="/employees" replace />;
  }

  return children;
}