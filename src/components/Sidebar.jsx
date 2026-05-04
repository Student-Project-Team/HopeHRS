import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserRights } from '../context/UserRightsContext';

const NAV_ITEMS = [
  { label: 'Employees', path: '/employees' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Departments', path: '/departments' },
  { label: 'Admin', path: '/admin', requiresAdmUser: true },  // ← CHANGED: now uses rights check
  { label: 'Deleted Items', path: '/deleted-items', requiredType: ['ADMIN', 'SUPERADMIN'] }, // Kept as-is for now
];

export default function Sidebar({ isOpen, activeNav, onNavChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rights, loading: rightsLoading } = useUserRights();
  
  const userType = user?.user_type || 'USER';

  // Check if user has ADM_USER right
  const hasAdmUserRight = rights?.ADM_USER === true;

  // Filter nav items based on user permissions
  const visibleNavItems = NAV_ITEMS.filter(item => {
    // For Admin link - use ADM_USER right check
    if (item.requiresAdmUser) {
      return hasAdmUserRight;
    }
    // For other items that use requiredType (like Deleted Items)
    if (item.requiredType) {
      return item.requiredType.includes(userType);
    }
    return true;
  });

  const handleNavigation = (label, path) => {
    onNavChange(label);
    navigate(path);
  };

  // Don't render sidebar while rights are loading (prevents flash of wrong items)
  if (rightsLoading) {
    return (
      <aside className={`${isOpen ? 'w-52' : 'w-0 overflow-hidden'} transition-all duration-300 bg-white border-r border-slate-200 flex-shrink-0`}>
        <div className="p-3">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-100 rounded mb-2"></div>
            <div className="h-8 bg-slate-100 rounded mb-2"></div>
            <div className="h-8 bg-slate-100 rounded"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${isOpen ? 'w-52' : 'w-0 overflow-hidden'} transition-all duration-300 bg-white border-r border-slate-200 flex-shrink-0`}>
      <nav className="p-3 space-y-1">
        {visibleNavItems.map(({ label, path }) => (
          <button 
            key={label} 
            onClick={() => handleNavigation(label, path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left
              ${activeNav === label ? 'bg-slate-100 text-slate-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}