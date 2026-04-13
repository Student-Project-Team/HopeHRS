import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: '👥', label: 'Employees',     path: 'employees' },
  { icon: '📋', label: 'Job History',   path: 'job-history' },
  { icon: '💼', label: 'Jobs',          path: 'jobs' },
  { icon: '🏢', label: 'Departments',   path: 'departments' },
  { icon: '🛡️', label: 'Admin',         path: 'admin' },
  { icon: '🗑️', label: 'Deleted Items', path: 'deleted' },
];

export default function Sidebar({ isOpen, activeNav, onNavChange }) {
  const navigate = useNavigate();

  const handleNavClick = (label, path) => {
    onNavChange(label);
    navigate(`/app/${path}`);
  };

  return (
    <aside className={`${isOpen ? 'w-52' : 'w-0 overflow-hidden'} transition-all duration-300 bg-white border-r border-gray-100 flex-shrink-0`}>
      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map(({ icon, label, path }) => (
          <button 
            key={label} 
            onClick={() => handleNavClick(label, path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left
              ${activeNav === label ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}