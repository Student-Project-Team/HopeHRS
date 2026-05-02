import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Employees', path: '/employees' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Departments', path: '/departments' },
  { label: 'Admin', path: '/admin' },
  { label: 'Deleted Items', path: '/deleted-items' },
  { label: 'Admin', path: '/admin', requiredType: ['ADMIN', 'SUPERADMIN'] },
  { label: 'Deleted Items', path: '/deleted-items', requiredType: ['ADMIN', 'SUPERADMIN'] },
];

export default function Sidebar({ isOpen, activeNav, onNavChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userType = user?.user_type || 'USER';

  // Filter nav items based on user permissions
  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (!item.requiredType) return true;
    return item.requiredType.includes(userType);
  });

  const handleNavigation = (label, path) => {
    onNavChange(label);
    navigate(path);
  };

  return (
    <aside className={`${isOpen ? 'w-52' : 'w-0 overflow-hidden'} transition-all duration-300 bg-white border-r border-slate-200 flex-shrink-0`}>
      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map(({ label, path }) => (
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