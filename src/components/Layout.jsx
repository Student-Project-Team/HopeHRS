import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return false;
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved !== 'true';
  });
  
  const getActiveNavFromPath = (pathname) => {
    if (pathname === '/employees') return 'Employees';
    if (pathname === '/jobhistory') return 'Job History';
    if (pathname === '/jobs') return 'Jobs';
    if (pathname === '/departments') return 'Departments';
    if (pathname === '/admin') return 'Admin';
    if (pathname === '/deleted-items') return 'Deleted Items';
    return 'Employees';
  };
  
  const [activeNav, setActiveNav] = useState(getActiveNavFromPath(location.pathname));

  useEffect(() => {
    setActiveNav(getActiveNavFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setSidebarOpen(() => {
        if (isMobile) return false;
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved !== 'true';
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const next = !prev;
      if (window.innerWidth > 768) {
        localStorage.setItem('sidebarCollapsed', String(!next));
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-900 rounded-full animate-spin" />
          <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Navbar - minimal with shadow */}
      <Navbar user={user} onToggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar container with transition */}
        <Sidebar isOpen={sidebarOpen} activeNav={activeNav} onNavChange={setActiveNav} />
        
        {/* Main content area with clean background */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}