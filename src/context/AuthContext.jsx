import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const isCheckingRef = useRef(false)
  const isSigningOutRef = useRef(false)

  const clearAuthError = () => setAuthError(null)

  const checkUserStatusAndSignOut = async (user) => {
    if (!user || isCheckingRef.current || isSigningOutRef.current) return
    isCheckingRef.current = true
    try {
      const { data, error } = await supabase
        .from('users')
        .select('record_status')
        .eq('id', user.id)
        .single()

      // Only sign out if we definitely know the status is NOT 'ACTIVE'
      const isExplicitlyInactive = !error && data && data.record_status !== 'ACTIVE'

      if (isExplicitlyInactive) {
        console.log('Inactive account detected, signing out')
        isSigningOutRef.current = true
        await supabase.auth.signOut()
        setAuthError('Your account is inactive. Please contact support.')
        isSigningOutRef.current = false
      } else {
        // No row, error, or status is ACTIVE – allow access
        console.log('Account status OK or unknown, keeping signed in')
      }
    } catch (err) {
      console.error('Error checking user status:', err)
      // Do NOT sign out on error – assume active to avoid lockouts
    } finally {
      isCheckingRef.current = false
    }
  }

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return
      setSession(initialSession)
      setCurrentUser(initialSession?.user ?? null)
      setLoading(false)
    }).catch((err) => {
      console.error('Error getting session:', err)
      if (isMounted) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        setSession(session)
        setCurrentUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          await checkUserStatusAndSignOut(session.user)
        }

        if (event === 'SIGNED_OUT') {
          setAuthError(null)
        }

        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    currentUser,
    session,
    loading,
    authError,
    clearAuthError,
    signUp,
    signIn,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}