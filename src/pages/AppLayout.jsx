import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { icon: '👥', label: 'Employees',     path: 'employees' },
  { icon: '📋', label: 'Job History',   path: 'job-history' },
  { icon: '💼', label: 'Jobs',          path: 'jobs' },
  { icon: '🏢', label: 'Departments',   path: 'departments' },
  { icon: '🛡️', label: 'Admin',         path: 'admin' },
  { icon: '🗑️', label: 'Deleted Items', path: 'deleted' },
]

const MODULE_CARDS = [
  { icon: '👥', title: 'Employee Directory', desc: 'Manage staff records' },
  { icon: '💼', title: 'Job History',        desc: 'Track employment history' },
  { icon: '📋', title: 'Jobs',               desc: 'Active job postings' },
  { icon: '🏢', title: 'Departments',        desc: 'Organize teams' },
  { icon: '🛡️', title: 'Admin',              desc: 'System settings' },
  { icon: '🗑️', title: 'Deleted Items',      desc: 'Restore archived records' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeNav, setActiveNav] = useState('Employees')

  useEffect(() => {
    const raw = localStorage.getItem('hr_current_user')
    if (!raw) { navigate('/login'); return }
    setUser(JSON.parse(raw))

    const isMobile = window.innerWidth <= 768
    if (isMobile) setSidebarOpen(false)
    else {
      const saved = localStorage.getItem('sidebarCollapsed')
      if (saved === 'true') setSidebarOpen(false)
    }

    const handleResize = () => {
      if (window.innerWidth <= 768) setSidebarOpen(false)
      else {
        const saved = localStorage.getItem('sidebarCollapsed')
        setSidebarOpen(saved !== 'true')
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [navigate])

  function toggleSidebar() {
    setSidebarOpen(prev => {
      const next = !prev
      if (window.innerWidth > 768) localStorage.setItem('sidebarCollapsed', String(!next))
      return next
    })
  }

  function logout() {
    localStorage.removeItem('hr_current_user')
    navigate('/login')
  }

  const displayName = user?.name || user?.email || ''

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">HR</div>
            <span className="font-semibold text-gray-900 text-sm">HopeHr</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{displayName}</span>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-52' : 'w-0 overflow-hidden'} transition-all duration-300 bg-white border-r border-gray-100 flex-shrink-0`}>
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map(({ icon, label }) => (
              <button key={label} onClick={() => setActiveNav(label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left
                  ${activeNav === label ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-1">
              Welcome back, {displayName} 👋
            </h2>
            <p className="text-blue-700 text-sm">Access your HR tools, manage workforce, and gain insights.</p>
          </div>

          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">HR Modules</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULE_CARDS.map(({ icon, title, desc }) => (
              <div key={title}
                className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-blue-100 transition cursor-pointer">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>

          {/* Child routes render here */}
          <Outlet />
        </main>

      </div>
    </div>
  )
}