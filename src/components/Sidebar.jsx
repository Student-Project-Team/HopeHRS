import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Employees', path: '/employees', icon: 'users' },
  { label: 'Jobs', path: '/jobs', icon: 'briefcase' },
  { label: 'Departments', path: '/departments', icon: 'building' },
  { label: 'Admin', path: '/admin', icon: 'settings', requiredType: ['ADMIN', 'SUPERADMIN'] },
  { label: 'Deleted Items', path: '/deleted-items', icon: 'trash', requiredType: ['ADMIN', 'SUPERADMIN'] },
];

const Icon = ({ name, className }) => {
  const icons = {
    users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    briefcase: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    building: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    trash: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  };
  return icons[name] || null;
};

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
    <aside 
      className={`
        bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}
      `}
    >
      <div className="h-full flex flex-col">
        <nav className="flex-1 py-4">
          <div className="space-y-0.5">
            {visibleNavItems.map(({ label, path, icon }) => (
              <button 
                key={label} 
                onClick={() => handleNavigation(label, path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150
                  ${activeNav === label 
                    ? 'bg-blue-50 text-blue-900 border-r-2 border-blue-900' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }
                `}
              >
                <Icon name={icon} className="w-4 h-4" />
                <span className="text-[13px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer section */}
        {isOpen && (
          <div className="p-4 border-t border-slate-200">
            <p className="text-[10px] text-slate-400 text-center">
              © 2024 HopeHRS
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}