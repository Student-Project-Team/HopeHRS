import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';

const NAV_ITEMS = [
  { label: 'Employees', path: '/employees', requiredType: ['USER', 'ADMIN', 'SUPERADMIN'] },
  { label: 'Jobs', path: '/jobs', requiredType: ['USER', 'ADMIN', 'SUPERADMIN'] },
  { label: 'Departments', path: '/departments', requiredType: ['USER', 'ADMIN', 'SUPERADMIN'] },
  // Reports section (for ADMIN and SUPERADMIN only)
  { 
    label: 'Reports', 
    path: null, 
    isSection: true,
    requiredType: ['ADMIN', 'SUPERADMIN'],
    children: [
      { label: 'Headcount by Dept', path: '/reports/headcount' },
      { label: 'Salary Summary', path: '/reports/salary' },
      { label: 'Employee History', path: '/reports/employee-history' },
    ]
  },
  // Admin link - ONLY SUPERADMIN can see this (per Development Guide)
  { label: 'Admin', path: '/admin', requiredType: ['SUPERADMIN'] },
  // Deleted Items - ADMIN and SUPERADMIN can see
  { label: 'Deleted Items', path: '/deleted-items', requiredType: ['ADMIN', 'SUPERADMIN'] },
];

export default function Sidebar({ isOpen, activeNav, onNavChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({ Reports: true });

  const toggleSection = (label) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Filter nav items based on user permissions
  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (item.requiredType) {
      return item.requiredType.includes(user?.user_type || 'USER');
    }
    return true;
  });

  const handleNavigation = (label, path) => {
    onNavChange(label);
    navigate(path);
  };

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}
      `}
    >
      <div className="h-full flex flex-col">
        <nav className="flex-1 py-4">
          <div className="space-y-0.5">
            {visibleNavItems.map((item) => {
              if (item.isSection) {
                return (
                  <div key={item.label} className="mt-4 first:mt-0">
                    <button
                      onClick={() => toggleSection(item.label)}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${expandedSections[item.label] ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections[item.label] && (
                      <div className="mt-1 space-y-0.5">
                        {item.children.map((child) => (
                          <button
                            key={child.label}
                            onClick={() => handleNavigation(child.label, child.path)}
                            className={`
                              w-full flex items-center gap-3 px-4 py-2 transition-all duration-150 pl-10
                              ${activeNav === child.label 
                                ? 'bg-blue-50 text-blue-900 border-r-2 border-blue-900' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                              }
                            `}
                          >
                            <span className="text-[13px] font-medium">{child.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <button 
                  key={item.label} 
                  onClick={() => handleNavigation(item.label, item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150
                    ${activeNav === item.label 
                      ? 'bg-blue-50 text-blue-900 border-r-2 border-blue-900' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }
                  `}
                >
                  <span className="text-[13px] font-medium">{item.label}</span>
                </button>
              );
            })}
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
