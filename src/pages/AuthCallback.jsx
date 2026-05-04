import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('--- AuthCallback Debug ---');
      console.log('Current URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      console.log('Search params:', window.location.search);
      
      try {
        // Check if there's an error in the URL
        const params = new URLSearchParams(window.location.search);
        const urlError = params.get('error');
        const errorDescription = params.get('error_description');
        
        if (urlError) {
          console.error('URL Error:', urlError, errorDescription);
          setError(`Authentication error: ${errorDescription || urlError}`);
          setTimeout(() => navigate('/login'), 4000);
          return;
        }

        // First, try to get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session result:', session ? 'Session found' : 'No session');
        console.log('Session error:', sessionError);

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to get session. Please try again.');
          setTimeout(() => navigate('/login'), 4000);
          return;
        }

        if (!session) {
          // Try to exchange code for session
          const code = params.get('code');
          console.log('Authorization code present:', !!code);
          
          if (code) {
            console.log('Exchanging code for session...');
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('Code exchange error:', exchangeError);
              setError('Failed to exchange code for session. Please try again.');
              setTimeout(() => navigate('/login'), 4000);
              return;
            }
            
            console.log('Code exchange successful:', data?.session?.user?.email);
          } else {
            console.error('No session and no code found');
            setError('No session found. Please try logging in again.');
            setTimeout(() => navigate('/login'), 4000);
            return;
          }
        }

        // Get session again after exchange
        const { data: { session: finalSession }, error: finalError } = await supabase.auth.getSession();
        
        if (finalError || !finalSession) {
          console.error('Final session error:', finalError);
          setError('Failed to establish session. Please try again.');
          setTimeout(() => navigate('/login'), 4000);
          return;
        }

        console.log('Login successful! Email:', finalSession.user.email);

        // Check user record
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_type, record_status')
          .eq('email', finalSession.user.email)
          .maybeSingle();

        console.log('User data from DB:', userData);

        if (userError) {
          console.error('Database error:', userError);
          setError('Database error occurred.');
          setTimeout(() => navigate('/login'), 4000);
          return;
        }

        if (!userData) {
          console.error('User not found in user table');
          setError('User not authorized. Please contact administrator.');
          await supabase.auth.signOut();
          setTimeout(() => navigate('/login'), 4000);
          return;
        }

        if (userData.record_status !== 'ACTIVE') {
          console.error('User account is inactive');
          setError('Your account is pending activation by an HR administrator.');
          await supabase.auth.signOut();
          setTimeout(() => navigate('/login'), 4000);
          return;
        }

        console.log('Redirecting to employees page...');
        navigate('/employees');
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => navigate('/login'), 4000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="bg-white rounded-xl border border-slate-200 p-8 w-full max-w-sm text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Authentication Error
          </p>
          <p className="text-sm font-medium text-slate-700 mb-1">{error}</p>
          <p className="text-xs text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white rounded-xl border border-slate-200 p-8 w-full max-w-xs text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-900 rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Authenticating
        </p>
        <p className="text-xs text-slate-500">Completing Google sign in...</p>
      </div>
    </div>
  );
}
