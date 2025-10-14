import { useState, FormEvent } from 'react';
import { signIn, signUp, signInAsDemo } from '../lib/firestoreHelpers';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(username, password);
      } else {
        if (!displayName.trim()) {
          setError('Display name is required');
          setLoading(false);
          return;
        }
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        await signUp(username, email, password, displayName);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await signInAsDemo();
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-forest-50 to-primary-200 px-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-nature-lg p-8 w-full max-w-md border border-primary-100">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-primary-500 to-forest-600 rounded-2xl mb-4 shadow-nature">
            <h1 className="text-5xl">🏔️</h1>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-forest-700 bg-clip-text text-transparent mb-2">HikeMatch</h1>
          <p className="text-gray-600 font-medium">Swipe your way to adventure</p>
        </div>

        {/* Toggle between Login/Signup */}
        <div className="flex mb-6 bg-primary-50 rounded-xl p-1.5 border border-primary-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              isLogin
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              !isLogin
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  placeholder="Your hiking name"
                  required={!isLogin}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="hikerlover123"
                  required={!isLogin}
                  pattern="[a-zA-Z0-9_]+"
                  title="Username can only contain letters, numbers, and underscores"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required={!isLogin}
                />
              </div>
            </>
          )}

          {isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="hikerlover123"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {/* Demo Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-secondary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Quick Demo Login
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to find awesome hiking trails with your friends
        </p>
      </div>
    </div>
  );
}
