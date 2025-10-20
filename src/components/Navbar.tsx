import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logOut, getUserProfile } from '../lib/firestoreHelpers';
import { auth } from '../lib/firebase';

export default function Navbar() {
  const location = useLocation();
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    const loadUserProfile = async () => {
      if (auth.currentUser) {
        const profile = await getUserProfile(auth.currentUser.uid);
        if (profile) {
          setDisplayName(profile.displayName);
        }
      }
    };

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-forest-600 shadow-nature sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2 group">
            <span className="text-2xl sm:text-3xl transform group-hover:scale-110 transition-transform duration-200">✨</span>
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">SwipeMatch</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              title="Discover"
            >
              <span className="text-xl sm:text-base">✨</span>
              <span className="hidden sm:inline ml-1">Discover</span>
            </Link>
            <Link
              to="/my-swipes"
              className={`px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/my-swipes'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              title="My Swipes"
            >
              <span className="text-xl sm:text-base">📊</span>
              <span className="hidden sm:inline ml-1">Swipes</span>
            </Link>
            <Link
              to="/connections"
              className={`px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/connections'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              title="Connections"
            >
              <span className="text-xl sm:text-base">👥</span>
              <span className="hidden sm:inline ml-1">Friends</span>
            </Link>
            <Link
              to="/matches"
              className={`px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/matches'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              title="Matches"
            >
              <span className="text-xl sm:text-base">💚</span>
              <span className="hidden sm:inline ml-1">Matches</span>
            </Link>
            <Link
              to="/contributions"
              className={`px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/contributions'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              title="My Contributions"
            >
              <span className="text-xl sm:text-base">📝</span>
              <span className="hidden sm:inline ml-1">Mine</span>
            </Link>
            
            {/* User Display Name - Hidden on mobile */}
            {displayName && (
              <div className="hidden md:flex ml-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-sm text-white font-medium">👤 {displayName}</span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="ml-1 sm:ml-2 px-2 sm:px-4 py-2 rounded-lg font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
              title="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden text-xl">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
