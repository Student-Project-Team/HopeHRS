import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        navigate('/login?error=oauth_failed');
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email;
      const fullName = session.user.user_metadata?.full_name || '';

      // Insert into your custom users table – only columns that exist
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: userEmail,
          full_name: fullName,
          user_type: 'USER',
          record_status: 'ACTIVE'
        }, { onConflict: 'id' });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        navigate(`/login?error=${encodeURIComponent(upsertError.message)}`);
        return;
      }

      // Verify record_status
      const { data: userCheck } = await supabase
        .from('users')
        .select('record_status')
        .eq('id', userId)
        .single();

      if (!userCheck || userCheck.record_status !== 'ACTIVE') {
        await supabase
          .from('users')
          .update({ record_status: 'ACTIVE' })
          .eq('id', userId);
      }

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