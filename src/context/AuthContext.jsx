import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async (authUser) => {
      if (!authUser) return null;
      
      console.log('Looking up user by email:', authUser.email);
      
      // Query the 'user' table by email
      const { data: userData, error } = await supabase
        .from('user')
        .select('user_type, record_status')
        .eq('email', authUser.email)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user data:', error);
        return authUser;
      }
      
      console.log('User data from DB:', userData);
      
      return {
        ...authUser,
        user_type: userData?.user_type,
        record_status: userData?.record_status
      };
    };

    // Initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const userWithData = await getUserData(session?.user);
      setUser(userWithData);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const userWithData = await getUserData(session?.user);
      setUser(userWithData);
      setLoading(false);
    });

    return () => {
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
