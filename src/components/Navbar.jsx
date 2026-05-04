import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar({ user, onToggleSidebar }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            HR
          </div>
          <span className="font-semibold text-slate-800 text-sm">HopeHRS</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 hidden sm:block">{displayName}</span>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}