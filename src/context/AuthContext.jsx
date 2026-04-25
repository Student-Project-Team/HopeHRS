import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('1. AuthProvider mounted');
    
    const getUser = async () => {
      console.log('2. getUser started');
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('3. Session result:', data?.session?.user?.email);
        
        if (error) {
          console.log('4. Session error:', error);
        }
        
        if (data?.session?.user) {
          console.log('5. User found, setting user');
          setUser(data.session.user);
        } else {
          console.log('5. No user found');
          setUser(null);
        }
      } catch (error) {
        console.log('6. Error:', error);
        setUser(null);
      } finally {
        console.log('7. Setting loading to false');
        setLoading(false);
      }
    };

    getUser();
  }, []);

  console.log('Rendering AuthProvider - loading:', loading, 'user:', user?.email);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
