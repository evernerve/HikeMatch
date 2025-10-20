import { useState, FormEvent } from 'react';
import { signIn, signUp } from '../lib/firestoreHelpers';
import { 
  getAuthErrorMessage, 
  isValidEmail, 
  isValidUsername, 
  isValidPassword, 
  isValidDisplayName,
  sanitizeInput,
  logError 
} from '../lib/errorHandling';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear errors when switching between login/signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFieldErrors({});
  };

  // Validate individual fields on blur
  const validateField = (field: string, value: string) => {
    const newFieldErrors = { ...fieldErrors };

    switch (field) {
      case 'username':
        const usernameValidation = isValidUsername(value);
        if (!usernameValidation.valid && value.length > 0) {
          newFieldErrors.username = usernameValidation.message || '';
        } else {
          delete newFieldErrors.username;
        }
        break;

      case 'email':
        if (!isValidEmail(value) && value.length > 0) {
          newFieldErrors.email = 'Please enter a valid email address.';
        } else {
          delete newFieldErrors.email;
        }
        break;

      case 'password':
        const passwordValidation = isValidPassword(value);
        if (!passwordValidation.valid && value.length > 0) {
          newFieldErrors.password = passwordValidation.message || '';
        } else {
          delete newFieldErrors.password;
        }
        break;

      case 'displayName':
        const displayNameValidation = isValidDisplayName(value);
        if (!displayNameValidation.valid && value.length > 0) {
          newFieldErrors.displayName = displayNameValidation.message || '';
        } else {
          delete newFieldErrors.displayName;
        }
        break;
    }

    setFieldErrors(newFieldErrors);
  };

  // Validate all fields before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!isLogin) {
      // Sign up validations
      const displayNameValidation = isValidDisplayName(displayName);
      if (!displayNameValidation.valid) {
        errors.displayName = displayNameValidation.message || '';
      }

      const usernameValidation = isValidUsername(username);
      if (!usernameValidation.valid) {
        errors.username = usernameValidation.message || '';
      }

      if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address.';
      }
    } else {
      // Login validations
      if (!username.trim()) {
        errors.username = 'Username is required.';
      }
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message || '';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors above before continuing.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signIn(sanitizeInput(username), password);
      } else {
        await signUp(
          sanitizeInput(username),
          sanitizeInput(email),
          password,
          sanitizeInput(displayName)
        );
      }
      onAuthSuccess();
    } catch (err: any) {
      logError(isLogin ? 'Sign In' : 'Sign Up', err);
      const userMessage = getAuthErrorMessage(err);
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-500 px-3 sm:px-4 py-6 sm:py-8">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 w-full max-w-md border border-gray-100">
        {/* Logo/Header */}
        <div className="text-center mb-5 sm:mb-8">
          <div className="inline-block p-3 sm:p-4 bg-gradient-to-br from-primary-500 to-forest-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-nature">
            <h1 className="text-4xl sm:text-5xl">✨</h1>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 to-forest-700 bg-clip-text text-transparent mb-1 sm:mb-2">SwipeMatch</h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Swipe, Match, Experience Together</p>
        </div>

        {/* Toggle between Login/Signup */}
        <div className="flex mb-4 sm:mb-6 bg-primary-50 rounded-lg sm:rounded-xl p-1 sm:p-1.5 border border-primary-200">
          <button
            type="button"
            onClick={toggleMode}
            className={`flex-1 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
              isLogin
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={toggleMode}
            className={`flex-1 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
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
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-xs sm:text-sm flex items-start">
            <span className="mr-2 flex-shrink-0">⚠️</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={(e) => validateField('displayName', e.target.value)}
                  className={`input-field text-sm sm:text-base ${
                    fieldErrors.displayName ? 'border-red-400 focus:ring-red-500' : ''
                  }`}
                  placeholder="Your hiking name"
                  required={!isLogin}
                  disabled={loading}
                />
                {fieldErrors.displayName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.displayName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={(e) => validateField('username', e.target.value)}
                  className={`input-field text-sm sm:text-base ${
                    fieldErrors.username ? 'border-red-400 focus:ring-red-500' : ''
                  }`}
                  placeholder="hikerlover123"
                  required={!isLogin}
                  disabled={loading}
                  autoComplete="username"
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                )}
                {!fieldErrors.username && !isLogin && username.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    ✓ Username looks good
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => validateField('email', e.target.value)}
                  className={`input-field text-sm sm:text-base ${
                    fieldErrors.email ? 'border-red-400 focus:ring-red-500' : ''
                  }`}
                  placeholder="you@example.com"
                  required={!isLogin}
                  disabled={loading}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>
            </>
          )}

          {isLogin && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={(e) => validateField('username', e.target.value)}
                className={`input-field text-sm sm:text-base ${
                  fieldErrors.username ? 'border-red-400 focus:ring-red-500' : ''
                }`}
                placeholder="hikerlover123"
                required
                disabled={loading}
                autoComplete="username"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => validateField('password', e.target.value)}
              className={`input-field text-sm sm:text-base ${
                fieldErrors.password ? 'border-red-400 focus:ring-red-500' : ''
              }`}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
            {!isLogin && !fieldErrors.password && password.length > 0 && password.length >= 6 && (
              <p className="mt-1 text-xs text-gray-500">
                ✓ Password is strong enough
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || Object.keys(fieldErrors).length > 0}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-4 sm:mt-6">
          By continuing, you agree to find awesome hiking trails with your friends
        </p>
      </div>
    </div>
  );
}
