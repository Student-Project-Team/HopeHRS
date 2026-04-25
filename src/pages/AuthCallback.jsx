import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/login?error=oauth_failed');
        return;
      }

      // ✅ Login guard: check record_status from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('record_status')
        .eq('id', session.user.id)
        .maybeSingle();

      // If no row found or record_status is not 'ACTIVE', reject login
      if (userError || !userData || userData.record_status !== 'ACTIVE') {
        await supabase.auth.signOut();
        navigate('/login?error=inactive');
        return;
      }

      // Active user – proceed to dashboard
      navigate('/app');
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
