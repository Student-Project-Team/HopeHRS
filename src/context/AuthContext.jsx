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
        console.log('1. Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        }
        
        console.log('2. Session email:', session?.user?.email);
        
        if (session?.user) {
          console.log('3. Fetching user data from user table...');
          const { data: userData, error: userError } = await supabase
            .from('user')
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('user_type, record_status')
            .eq('email', session.user.email)
            .maybeSingle();
          
          if (userError) {
            console.error('User table error:', userError);
          }
          
          console.log('4. User data from DB:', userData);
          
          setUser({
            ...session.user,
            user_type: userData?.user_type,
            record_status: userData?.record_status
          });
          console.log('5. User set in state');
        } else {
          console.log('No session found');
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      } finally {
        console.log('6. Setting loading to FALSE');
        setLoading(false);
        setLoading(false);
        setInitialized(true);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed - event:', event);
      console.log('Auth state changed - email:', session?.user?.email);
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('user')
      if (!initialized) return;
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
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
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [initialized]);

  console.log('AuthProvider - loading:', loading, 'user:', user?.email);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
