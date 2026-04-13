// src/pages/AuthCallback.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthCallback = () => {
  const navigate = useNavigate()
  const { currentUser, loading, statusError } = useAuth()
  const [timeoutError, setTimeoutError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!currentUser && !statusError && !loading) {
        setTimeoutError(true)
      }
    }, 10000)
    return () => clearTimeout(timer)
  }, [currentUser, statusError, loading])

  useEffect(() => {
    if (loading) return
    if (statusError) {
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } else if (currentUser) {
      navigate('/app', { replace: true })
    } else if (!loading && !currentUser && !statusError) {
      setTimeoutError(true)
    }
  }, [currentUser, loading, statusError, navigate])

  if (timeoutError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded max-w-md text-center">
          <h2 className="font-bold mb-2">Authentication Timeout</h2>
          <p>Sign in took too long. Please try again.</p>
          <button onClick={() => navigate('/login')} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  if (statusError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded max-w-md text-center">
          <h2 className="font-bold mb-2">Access Denied</h2>
          <p>{statusError}</p>
          <p className="text-sm mt-2">Redirecting to login...</p>
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