import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserRights } from '../context/UserRightsContext';

export default function Navbar({ user, onToggleSidebar }) {
  const navigate = useNavigate();
  const { userType } = useUserRights();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getUserTypeLabel = () => {
    if (userType === 'SUPERADMIN') return 'Super Admin';
    if (userType === 'ADMIN') return 'Admin';
    return 'User';
  };

  const getInitials = () => {
    const email = user?.email || '';
    const name = user?.user_metadata?.full_name || '';
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 shadow-sm">
      {/* Left section - Logo and menu button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">HR</span>
          </div>
          <span className="font-semibold text-sm text-slate-800">HopeHRS</span>
        </div>
      </div>

      {/* Right section - User info */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-slate-700">
            {displayName}
          </p>
          <p className="text-[10px] text-slate-400">
            {getUserTypeLabel()}
          </p>
        </div>
        
        <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {getInitials()}
          </span>
        </div>
        
        <button
          onClick={handleLogout}
          className="text-[11px] font-medium text-slate-500 hover:text-red-500 transition-colors hidden sm:block"
        >
          Logout
        </button>
        
        {/* Mobile logout button - icon only */}
        <button
          onClick={handleLogout}
          className="sm:hidden text-slate-500 hover:text-red-500 transition-colors"
          aria-label="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}