import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wrap fetchProfile in useCallback so it's stable
  const fetchProfile = useCallback(async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (profile && profile.record_status === 'ACTIVE') {
        setCurrentUser({ ...authUser, ...profile });
      } else {
        await supabase.auth.signOut();
        setCurrentUser(null);
        alert("Access Denied: Account is INACTIVE.");
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Backup timer to prevent infinite loading
    const backupTimer = setTimeout(() => setLoading(false), 3500);

    // Using onAuthStateChange handles the initial session check AND future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
      clearTimeout(backupTimer); // Clear once we have a definitive answer
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(backupTimer);
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading ? children : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
          <h2>Loading Hope HRS...</h2>
          <p>Connecting to secure database...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
