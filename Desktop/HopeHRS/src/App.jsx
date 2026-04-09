import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './supabaseClient';
import EmailSignup from './components/EmailSignup';

function App() {
  const { currentUser, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error("Login error:", error.message);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error.message);
  };

  if (loading) return <div>Loading Hope HRS...</div>;

  if (currentUser) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Welcome, {currentUser.email}!</h1>
        <p>Status: {currentUser.record_status || 'Active'}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (showSignup) {
    return <EmailSignup onSwitchToLogin={() => setShowSignup(false)} />;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Please log in</h1>
      
      <div style={{ marginBottom: '15px' }}>
        <button onClick={handleGoogleLogin} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Login with Google
        </button>
      </div>
      
      <div>
        <button onClick={() => setShowSignup(true)} style={{ padding: '10px 20px' }}>
          Sign up with Email
        </button>
      </div>
    </div>
  );
}

export default App;