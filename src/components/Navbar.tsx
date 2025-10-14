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
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-3xl transform group-hover:scale-110 transition-transform duration-200">🏔️</span>
            <span className="text-xl font-bold text-white tracking-tight">HikeMatch</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              🏔️ Trails
            </Link>
            <Link
              to="/my-swipes"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/my-swipes'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              📊 Swipes
            </Link>
            <Link
              to="/connections"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/connections'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              👥 Friends
            </Link>
            <Link
              to="/matches"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/matches'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              💚 Matches
            </Link>
            
            {/* User Display Name */}
            {displayName && (
              <div className="ml-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-sm text-white font-medium">👤 {displayName}</span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-lg font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
