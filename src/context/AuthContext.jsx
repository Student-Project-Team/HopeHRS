/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userData } = await supabase
            .from('user')
            .select('user_type, record_status')
            .eq('email', session.user.email)
            .maybeSingle();
          
          setUser({
            ...session.user,
            user_type: userData?.user_type,
            record_status: userData?.record_status
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!initialized) return;
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('user')
          .select('user_type, record_status')
          .eq('email', session.user.email)
          .maybeSingle();
        
        setUser({
          ...session.user,
          user_type: userData?.user_type,
          record_status: userData?.record_status
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [initialized]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}