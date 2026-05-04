/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext();

// Extracted helper — fetches user_type and record_status from your user table
async function fetchUserRecord(sessionUser) {
  const { data: userData } = await supabase
    .from('users')
    .select('user_type, record_status')
    .eq('email', sessionUser.email)
    .maybeSingle();

  return {
    ...sessionUser,
    user_type: userData?.user_type || 'USER',
    record_status: userData?.record_status || 'ACTIVE',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check existing session on mount
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const fullUser = await fetchUserRecord(session.user);
          setUser(fullUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // 2. Listen for future auth changes
    // ⚠️ IMPORTANT: Never await DB calls directly inside onAuthStateChange.
    // Supabase JS v2 holds an internal lock during this callback — making a
    // DB query here causes a deadlock and loading never resolves.
    // Fix: use setTimeout(0) to escape the lock before querying.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setTimeout(async () => {
            try {
              const fullUser = await fetchUserRecord(session.user);
              setUser(fullUser);
            } catch (error) {
              console.error('Auth state change error:', error);
              setUser(null);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}