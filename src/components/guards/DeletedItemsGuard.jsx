import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function DeletedItemsGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2">Loading...</p>
        <p className="ml-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  const userType = user?.user_type;
  
  // Only ADMIN and SUPERADMIN can access deleted-items
  if (userType !== 'ADMIN' && userType !== 'SUPERADMIN') {
    return <Navigate to="/employees" replace />;
  }

  // Check if user is ADMIN or SUPERADMIN
  const userType = user?.user_type;
  
  if (userType !== 'ADMIN' && userType !== 'SUPERADMIN') {
    // USER cannot access deleted-items page
    return <Navigate to="/dashboard" replace />;
  }

  // ADMIN and SUPERADMIN can access
  return children;
}
