import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      console.log('Signed in user:', data.user.email);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('record_status, user_type')
        .eq('email', data.user.email)
        .maybeSingle();

      console.log('User data from DB:', userData);

      if (userError) {
        console.error('User fetch error:', userError);
        setError('Database error. Please contact administrator.');
        setLoading(false);
        return;
      }

      if (!userData) {
        console.error('User not found in user table');
        setError('User not authorized. Please contact administrator.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (userData.record_status !== 'ACTIVE') {
        console.error('User account is inactive');
        setError('Your account is pending activation by an HR administrator.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      console.log('Login successful! Redirecting to /employees...');
      navigate('/employees');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/callback` }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-md p-8">

        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-900 rounded-lg text-white text-sm font-bold tracking-widest mb-4">
            HR
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sign in</h1>
          <p className="mt-0.5 text-xs text-slate-400">Access your HR dashboard</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email address</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 disabled:opacity-60 text-white font-semibold text-xs tracking-wide py-2.5 rounded-lg transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in →'
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1 border-slate-100" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or</span>
          <hr className="flex-1 border-slate-100" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs tracking-wide py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-900 hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}