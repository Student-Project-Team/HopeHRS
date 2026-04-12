import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function EmailSignupTest() {
  const { signUp, signIn, signOut, currentUser, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [isLogin, setIsLogin] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setMessage('Creating account...')
    setMessageType('')
    
    const { data, error } = await signUp(email, password, {
      full_name: email.split('@')[0],
    })
    
    if (error) {
      setMessage(`❌ Sign up failed: ${error.message}`)
      setMessageType('error')
    } else {
      setMessage(`✅ Sign up successful! Please check ${email} for confirmation email.`)
      setMessageType('success')
      setEmail('')
      setPassword('')
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setMessage('Signing in...')
    setMessageType('')
    
    const { data, error } = await signIn(email, password)
    
    if (error) {
      setMessage(`❌ Login failed: ${error.message}`)
      setMessageType('error')
    } else {
      setMessage(`✅ Welcome ${data.user.email}!`)
      setMessageType('success')
      setEmail('')
      setPassword('')
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      setMessage(`❌ Sign out failed: ${error.message}`)
      setMessageType('error')
    } else {
      setMessage('✅ Signed out successfully')
      setMessageType('success')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading authentication...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Email/Password Auth Test
      </h1>
      
      {currentUser ? (
        <div>
          <div style={{ 
            backgroundColor: '#d4edda', 
            padding: '1rem', 
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <p><strong>Logged in as:</strong> {currentUser.email}</p>
            <p><strong>User ID:</strong> {currentUser.id}</p>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                marginRight: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: !isLogin ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isLogin ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={isLogin ? handleSignIn : handleSignUp}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px'
                }}
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      )}
      
      {message && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: messageType === 'error' ? '#f8d7da' : '#d4edda',
          color: messageType === 'error' ? '#721c24' : '#155724',
          borderRadius: '4px',
          border: `1px solid ${messageType === 'error' ? '#f5c6cb' : '#c3e6cb'}`
        }}>
          {message}
        </div>
      )}
    </div>
  )
}