import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [processingGoogleUser, setProcessingGoogleUser] = useState(false)

  useEffect(() => {
    localStorage.removeItem('hr_mock_users')
    localStorage.removeItem('hr_current_user')
    if (!localStorage.getItem('hr_usernames')) {
      localStorage.setItem('hr_usernames', JSON.stringify([]))
    }
  }, [])

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const oauthError = hashParams.get('error')
    const errorDesc = hashParams.get('error_description')
    if (oauthError) {
      console.error('OAuth error:', oauthError, errorDesc)
      if (
        oauthError === 'email_exists' ||
        (errorDesc && errorDesc.toLowerCase().includes('already registered'))
      ) {
        setError('❌ An account with this email already exists. Please sign in with email/password instead.')
      } else {
        setError(`Google sign-in failed: ${errorDesc || oauthError}`)
      }
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !processingGoogleUser) {
        const user = session.user
        const isGoogle =
          user.app_metadata?.provider === 'google' ||
          user.identities?.some(i => i.provider === 'google')
        if (isGoogle) {
          await handleGoogleUserProfile(user)
        }
      }
    })
    return () => listener?.subscription.unsubscribe()
  }, [processingGoogleUser])

  async function handleGoogleUserProfile(user) {
    if (processingGoogleUser) return
    setProcessingGoogleUser(true)
    try {
      navigate('/app')
    } catch (err) {
      console.error('Error handling Google user:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setProcessingGoogleUser(false)
    }
  }

  function checkUsernameExists(username) {
    const existingUsernames = JSON.parse(localStorage.getItem('hr_usernames') || '[]')
    return existingUsernames.includes(username.toLowerCase())
  }

  function saveUsername(username) {
    const existingUsernames = JSON.parse(localStorage.getItem('hr_usernames') || '[]')
    if (!existingUsernames.includes(username.toLowerCase())) {
      existingUsernames.push(username.toLowerCase())
      localStorage.setItem('hr_usernames', JSON.stringify(existingUsernames))
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const { firstName, lastName, username, email, password, confirmPassword } = form

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      setError('All fields are required.')
      return
    }
    if (firstName.trim().length < 2) {
      setError('First name must be at least 2 characters.')
      return
    }
    if (lastName.trim().length < 2) {
      setError('Last name must be at least 2 characters.')
      return
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    if (checkUsernameExists(username.trim())) {
      setError('❌ This username is already taken. Please choose another one.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim(),
        },
      },
    })

    if (signUpError) {
      console.error('SignUp error:', signUpError)
      const msg = signUpError.message.toLowerCase()
      if (
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('duplicate key') ||
        msg.includes('user already')
      ) {
        setError('❌ An account with this email already exists. Please sign in instead.')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }

    if (data?.user && data.user.identities?.length === 0) {
      setError('❌ An account with this email already exists. Please sign in instead.')
      setLoading(false)
      return
    }

    saveUsername(username.trim())

    setMessage(
      `✅ Confirmation email sent to ${email}. Please check your inbox (and spam folder) and click the link to activate your account.`
    )
    setForm({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    setLoading(false)
  }

  async function handleGoogleRegister() {
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      setError('Google sign-in failed: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm">Join the HR platform</p>
        </div>

        <form onSubmit={handleRegister} noValidate>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="johndoe"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
          {message && <p className="text-green-600 text-xs mb-4">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              'Register →'
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1 border-gray-100" />
          <span className="text-xs text-gray-400">or continue with</span>
          <hr className="flex-1 border-gray-100" />
        </div>

        <button
          onClick={handleGoogleRegister}
          className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Register with Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}