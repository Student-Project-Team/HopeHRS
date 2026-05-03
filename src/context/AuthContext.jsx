/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('user_type, record_status')
            .eq('email', session.user.email)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching user data:', error);
          }
          
          setUser({
            ...session.user,
            user_type: userData?.user_type || 'USER',
            record_status: userData?.record_status || 'INACTIVE'
          });
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

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('user_type, record_status')
            .eq('email', session.user.email)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching user data on auth change:', error);
          }
          
          setUser({
            ...session.user,
            user_type: userData?.user_type || 'USER',
            record_status: userData?.record_status || 'INACTIVE'
          });
        } else {
          setUser(null);
        }
        setLoading(false);
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