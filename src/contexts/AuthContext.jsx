import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Backup timer to prevent infinite loading
      const backupTimer = setTimeout(() => {
        console.warn("Auth timeout - forcing loading to stop");
        setLoading(false);
      }, 5000);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
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
      console.log("Auth state changed:", event);
      
      if (session) {
        await fetchProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      // Query the profiles table (matches your SQL exactly)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // If no profile exists yet, the trigger should create it
        // But just in case, we'll still show the user
        console.warn("Profile not found yet:", error.message);
        setCurrentUser({
          ...authUser,
          user_type: 'USER',
          record_status: 'INACTIVE',
          can_view_emp: true,
          can_view_job: true,
          can_view_dept: true,
          can_view_jh: true,
          can_view_reports: false
        });
        setLoading(false);
        return;
      }

      // Profile exists - check if ACTIVE or INACTIVE
      if (profile.record_status === 'ACTIVE') {
        // User is active - allow access with all permissions
        setCurrentUser({ ...authUser, ...profile });
      } else {
        // User is INACTIVE - sign them out
        await supabase.auth.signOut();
        setCurrentUser(null);
        alert("Access Denied: Your account is INACTIVE. Please contact HR to activate your account.");
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setCurrentUser(authUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading ? children : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2>Loading Hope HRS...</h2>
          <p>Connecting to secure database...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
