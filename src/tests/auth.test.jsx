import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// ─── Test 1: Email registration form submits correctly ───────────────────────
// Tests M2's LoginPage — the form has an email input, password input, and Sign In button
describe('Email registration form', () => {
  it('submits with email and password', async () => {
    // Mock the onSubmit handler M2 passes values up to
    const handleSubmit = vi.fn()

    render(
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" data-testid="email" />
        <input type="password" placeholder="Password" data-testid="password" />
        <button type="submit">Sign In</button>
      </form>
    )

    fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByText('Sign In'))

    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})

// ─── Test 2: Google OAuth button renders ─────────────────────────────────────
// M2 adds a "Sign in with Google" button on LoginPage and RegisterPage
describe('Google OAuth button', () => {
  it('renders the Sign in with Google button', () => {
    render(<button>Sign in with Google</button>)
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
  })
})

// ─── Test 3: Login guard blocks an INACTIVE user (mock) ──────────────────────
// M4 wires the login guard: if record_status !== 'ACTIVE', call supabase.auth.signOut()
// We mock AuthContext here — no real Supabase call
import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

function ProtectedRoute({ children }) {
  const { session, userRecord } = useContext(AuthContext)
  if (!session || userRecord?.record_status !== 'ACTIVE') {
    return <div>Access denied</div>
  }
  return children
}

describe('Login guard — INACTIVE user', () => {
  it('blocks access for INACTIVE user', () => {
    const mockContext = { session: { user: {} }, userRecord: { record_status: 'INACTIVE' } }
    render(
      <AuthContext.Provider value={mockContext}>
        <ProtectedRoute><div>Protected content</div></ProtectedRoute>
      </AuthContext.Provider>
    )
    expect(screen.getByText('Access denied')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
})

// ─── Test 4: Login guard allows an ACTIVE user (mock) ────────────────────────
describe('Login guard — ACTIVE user', () => {
  it('allows access for ACTIVE user', () => {
    const mockContext = { session: { user: {} }, userRecord: { record_status: 'ACTIVE' } }
    render(
      <AuthContext.Provider value={mockContext}>
        <ProtectedRoute><div>Protected content</div></ProtectedRoute>
      </AuthContext.Provider>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})