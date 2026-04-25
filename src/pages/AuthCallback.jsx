import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to get session');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        if (!session) {
          console.error('No session found');
          setError('No session found');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        console.log('Google login successful! Email:', session.user.email);

        // Check if user exists in your user table by email
        const { data: userData, error: userError } = await supabase
          .from('user')
          .select('user_type, record_status')
          .eq('email', session.user.email)
          .maybeSingle();

        console.log('User data from DB:', userData);

        if (userError) {
          console.error('Database error:', userError);
          setError('Database error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!userData) {
          console.error('User not found in user table for email:', session.user.email);
          setError('User not authorized. Please contact administrator.');
          await supabase.auth.signOut();
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (userData.record_status !== 'ACTIVE') {
          console.error('User account is inactive');
          setError('Your account is pending activation.');
          await supabase.auth.signOut();
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Success! Redirect to employees page
        console.log('SUPERADMIN login successful! Redirecting...');
        navigate('/employees');
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2 style={{ color: 'red' }}>Authentication Error</h2>
        <p>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #ccc',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Completing Google sign in...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
