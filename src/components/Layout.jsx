import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const MODULE_CARDS = [
  { icon: '👥', title: 'Employee Directory', desc: 'Manage staff records' },
  { icon: '💼', title: 'Job History',        desc: 'Track employment history' },
  { icon: '📋', title: 'Jobs',               desc: 'Active job postings' },
  { icon: '🏢', title: 'Departments',        desc: 'Organize teams' },
  { icon: '🛡️', title: 'Admin',              desc: 'System settings' },
  { icon: '🗑️', title: 'Deleted Items',      desc: 'Restore archived records' },
]

export default function Layout() {
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

  const displayName = user?.name || user?.email || ''

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar user={user} onToggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} activeNav={activeNav} onNavChange={setActiveNav} />
        
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

          <Outlet />
        </main>
      </div>
    </div>
  )
}