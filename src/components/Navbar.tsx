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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🥾</span>
            <span className="text-xl font-bold text-gray-800">HikeMatch</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                location.pathname === '/'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🏔️ Trails
            </Link>
            <Link
              to="/my-swipes"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                location.pathname === '/my-swipes'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 My Swipes
            </Link>
            <Link
              to="/connections"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                location.pathname === '/connections'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👥 Connections
            </Link>
            <Link
              to="/matches"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                location.pathname === '/matches'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💚 Matches
            </Link>
            
            {/* User Display Name */}
            {displayName && (
              <div className="ml-2 px-3 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm text-gray-700">👤 {displayName}</span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
