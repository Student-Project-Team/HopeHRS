// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState(null); // 'ACTIVE', 'INACTIVE', or null

  // Helper: fetch user profile and check record_status
  async function checkUserStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles') // Adjust table name if yours is different (e.g. 'users')
        .select('record_status')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist or query fails, treat as INACTIVE
        return false;
      }

      return data?.record_status === 'ACTIVE';
    } catch (err) {
      console.error('Unexpected error in checkUserStatus:', err);
      return false;
    }
  }

  // Sign out and redirect to login with error
  async function handleInactiveUser() {
    await supabase.auth.signOut();
    localStorage.removeItem('hr_current_user');
    // Redirect to login with error parameter
    window.location.replace('/login?error=account_inactive');
  }

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem('hr_current_user');
    return { error };
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      const user = initialSession?.user ?? null;
      setSession(initialSession);
      setCurrentUser(user);

      if (user) {
        const isActive = await checkUserStatus(user.id);
        setProfileStatus(isActive ? 'ACTIVE' : 'INACTIVE');
        if (!isActive) {
          await handleInactiveUser();
          return;
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      const newUser = newSession?.user ?? null;
      setSession(newSession);
      setCurrentUser(newUser);

      if (event === 'SIGNED_IN' && newUser) {
        const isActive = await checkUserStatus(newUser.id);
        setProfileStatus(isActive ? 'ACTIVE' : 'INACTIVE');

        if (!isActive) {
          await handleInactiveUser();
          return;
        }
      } else if (event === 'SIGNED_OUT') {
        setProfileStatus(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser,
    session,
    loading,
    profileStatus, // 'ACTIVE', 'INACTIVE', or null
    signUp,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};