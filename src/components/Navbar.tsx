import { Link, useLocation } from 'react-router-dom';
import { logOut } from '../lib/firestoreHelpers';

export default function Navbar() {
  const location = useLocation();

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
              to="/matches"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                location.pathname === '/matches'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💚 Matches
            </Link>
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
