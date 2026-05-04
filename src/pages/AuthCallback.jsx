import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
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

        const { data: userData, error: userError } = await supabase
          .from('users')
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