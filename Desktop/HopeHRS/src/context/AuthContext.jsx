import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const backupTimer = setTimeout(() => setLoading(false), 3500);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setLoading(false);
      } finally {
        clearTimeout(backupTimer);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // If no profile exists, still set the user
        setCurrentUser(authUser);
        setLoading(false);
        return;
      }

      if (profile && profile.record_status === 'ACTIVE') {
        setCurrentUser({ ...authUser, ...profile });
      } else {
        // If inactive, log them out
        await supabase.auth.signOut();
        setCurrentUser(null);
        alert("Access Denied: Account is INACTIVE. Please contact HR.");
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setCurrentUser(authUser); // Still set user even if profile fetch fails
    } finally {
      setLoading(false);
    }
  };

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