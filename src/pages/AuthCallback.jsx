import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error.message);
        navigate('/login');
        return;
      }
      
      if (session) {
        const user = session.user;
        const userData = {
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
        };
        localStorage.setItem('hr_current_user', JSON.stringify(userData));
        navigate('/app');
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p className="text-gray-600">Please wait while we complete your sign in.</p>
        <div className="mt-4 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}