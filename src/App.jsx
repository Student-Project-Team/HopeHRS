import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return currentUser ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Dashboard route removed – you can add a new page here later */}
      </Routes>
    </BrowserRouter>
  )
}