import { useNavigate } from 'react-router-dom'

export default function Navbar({ user, onLogout, onToggleSidebar }) {
  const navigate = useNavigate()
  
  function logout() {
    localStorage.removeItem('hr_current_user')
    navigate('/login')
    if (onLogout) onLogout()
  }

  const displayName = user?.name || user?.email || ''

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            HR
          </div>
          <span className="font-semibold text-gray-900 text-sm">HopeHr</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:block">{displayName}</span>
        <button 
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  )
}