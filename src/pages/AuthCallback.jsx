import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const mockUsers = JSON.parse(localStorage.getItem('hr_mock_users')) || []

    const googleUser = {
      email:     'you@company.com',
      firstName: 'Google',
      lastName:  'User',
      username:  'google_user',
    }

    // Upsert mock Google user
    if (!mockUsers.find(u => u.email === googleUser.email)) {
      mockUsers.push({ ...googleUser, password: 'google_oauth' })
      localStorage.setItem('hr_mock_users', JSON.stringify(mockUsers))
    }

    // Save session
    localStorage.setItem('hr_current_user', JSON.stringify({
      email:     googleUser.email,
      name:      `${googleUser.firstName} ${googleUser.lastName}`,
      firstName: googleUser.firstName,
      lastName:  googleUser.lastName,
    }))

    // Simulate OAuth delay then redirect
    const timer = setTimeout(() => navigate('/app'), 1500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <h2 className="text-lg font-semibold text-gray-800">Completing sign in...</h2>
      <p className="text-sm text-gray-500">Establishing secure session with Google</p>
    </div>
  )
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
