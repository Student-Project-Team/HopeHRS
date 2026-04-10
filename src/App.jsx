import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Employees from './pages/Employees'
import AuthCallback from './pages/AuthCallback'
import ProtectedRoute from './components/ProtectedRoute' // adjust path as needed
// import other pages if needed: DeletedItems, Departments, Jobs, JobHistory

function Home() {
  const { currentUser, signOut, loading } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!currentUser) {
    return (
      <div className="bg-blue-500 text-white p-4 min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Please log in</h1>
        <p className="text-lg">Use the Login page to sign in.</p>
        <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded font-semibold">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-blue-500 text-white p-4 min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Welcome, {currentUser.email}!</h1>
      <button
        onClick={handleSignOut}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Sign Out
      </button>
      <div className="flex gap-4 mt-4">
        <Link to="/admin" className="bg-gray-700 px-3 py-1 rounded">Admin</Link>
        <Link to="/employees" className="bg-gray-700 px-3 py-1 rounded">Employees</Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
      {/* Add other protected routes similarly */}
      {/* <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} /> */}
      {/* <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} /> */}
      {/* <Route path="/job-history" element={<ProtectedRoute><JobHistory /></ProtectedRoute>} /> */}
      {/* <Route path="/deleted-items" element={<ProtectedRoute><DeletedItems /></ProtectedRoute>} /> */}
    </Routes>
  )
}

export default App