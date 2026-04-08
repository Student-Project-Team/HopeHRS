import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const mockUsers = JSON.parse(localStorage.getItem('hr_mock_users')) || []

    const googleUser = {
      email:     'you@company.com',
      firstName: 'Google',
      lastName:  'User',
      username:  'google_user',
    }

    // Upsert mock Google user
    if (!mockUsers.find(u => u.email === googleUser.email)) {
      mockUsers.push({ ...googleUser, password: 'google_oauth' })
      localStorage.setItem('hr_mock_users', JSON.stringify(mockUsers))
    }

    // Save session
    localStorage.setItem('hr_current_user', JSON.stringify({
      email:     googleUser.email,
      name:      `${googleUser.firstName} ${googleUser.lastName}`,
      firstName: googleUser.firstName,
      lastName:  googleUser.lastName,
    }))

    // Simulate OAuth delay then redirect
    const timer = setTimeout(() => navigate('/app'), 1500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <h2 className="text-lg font-semibold text-gray-800">Completing sign in...</h2>
      <p className="text-sm text-gray-500">Establishing secure session with Google</p>
    </div>
  )
}
