import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logOut, getUserProfile } from '../lib/firestoreHelpers';
import { auth } from '../lib/firebase';

export default function Navbar() {
  const location = useLocation();
  const [displayName, setDisplayName] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', icon: '✨', label: 'Discover', title: 'Discover' },
    { to: '/my-swipes', icon: '📊', label: 'Swipes', title: 'My Swipes' },
    { to: '/connections', icon: '👥', label: 'Friends', title: 'Connections' },
    { to: '/matches', icon: '💚', label: 'Matches', title: 'Matches' },
    { to: '/contributions', icon: '📝', label: 'Mine', title: 'My Contributions' },
  ];

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-forest-600 shadow-nature sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
            <span className="text-2xl sm:text-3xl transform group-hover:scale-110 transition-transform duration-200">✨</span>
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">SwipeMatch</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                title={link.title}
              >
                <span className="mr-1">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            
            {/* User Display Name */}
            {displayName && (
              <div className="ml-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-sm text-white font-medium">👤 {displayName}</span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-lg font-medium text-white/80 hover:bg-red-500/80 hover:text-white transition-all duration-200"
              title="Logout"
            >
              <span className="mr-1">🚪</span>
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* User info on mobile */}
            {displayName && (
              <div className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-xs text-white font-medium truncate max-w-[100px] block">
                  {displayName}
                </span>
              </div>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slideDown">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl mr-3">{link.icon}</span>
                  <span>{link.title}</span>
                </Link>
              ))}
              
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="flex items-center px-4 py-3 rounded-lg font-medium text-white/80 hover:bg-red-500/80 hover:text-white transition-all duration-200 text-left"
              >
                <span className="text-xl mr-3">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
