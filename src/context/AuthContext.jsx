// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusError, setStatusError] = useState(null)

  // Helper: fetch record_status from user_profiles
  const fetchUserStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('record_status')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Missing profile – create it on the fly
          await supabase
            .from('user_profiles')
            .insert({ id: userId, record_status: 'INACTIVE' })
          return 'INACTIVE'
        }
        throw error
      }
      return data?.record_status || 'INACTIVE'
    } catch (err) {
      console.error('fetchUserStatus error:', err)
      return 'INACTIVE'
    }
  }

  // Sign in with email/password + status check
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }

    try {
      const status = await fetchUserStatus(data.user.id)
      if (status !== 'ACTIVE') {
        await supabase.auth.signOut()
        return { error: { message: 'Your account is inactive. Please contact an administrator.' } }
      }
    } catch (err) {
      await supabase.auth.signOut()
      return { error: { message: 'Unable to verify account status. Please try again.' } }
    }
    return { data, error: null }
  }

  const signInWithOAuth = async (provider = 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    return { error }
  }

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
    return { data, error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setSession(null)
    setStatusError(null)
  }

  // Check user status and optionally sign out
  const checkAndHandleStatus = async (user) => {
    if (!user) return false
    const status = await fetchUserStatus(user.id)
    if (status !== 'ACTIVE') {
      await logout()
      setStatusError('Your account is inactive. Please contact an administrator.')
      return false
    }
    return true
  }

  // Subscribe to real-time changes on user_profiles for current user
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel(`user_status_${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${currentUser.id}`
        },
        async (payload) => {
          const newStatus = payload.new.record_status
          if (newStatus !== 'ACTIVE') {
            await logout()
            setStatusError('Your account has been deactivated. You are now logged out.')
            window.location.href = '/login'
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  // Initial session and auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const isActive = await checkAndHandleStatus(session.user)
        if (isActive) setCurrentUser(session.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          const isActive = await checkAndHandleStatus(session.user)
          if (isActive) setCurrentUser(session.user)
          else setCurrentUser(null)
        } else {
          setCurrentUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    currentUser,
    session,
    loading,
    statusError,
    signUp,
    signIn,
    signInWithOAuth,
    logout
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