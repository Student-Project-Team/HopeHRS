// src/pages/AuthCallback.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthCallback = () => {
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { currentUser, loading } = useAuth()

  useEffect(() => {
    // Wait for auth state to be resolved
    if (loading) return

    if (currentUser) {
      // User is authenticated → redirect to dashboard
      navigate('/app', { replace: true })
    } else {
      // No user after OAuth callback → something went wrong
      setError('Authentication failed. Please try again.')
    }
  }, [currentUser, loading, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Authenticating...</h1>
        <p className="text-gray-600">Please wait while we complete your sign in.</p>
      </div>
    </div>
  )
}

export default AuthCallback