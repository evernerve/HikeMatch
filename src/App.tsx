import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { CategoryProvider } from './context/CategoryContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Matches from './pages/Matches';
import MySwipes from './pages/MySwipes';
import Connections from './pages/Connections';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium text-lg">Loading SwipeMatch...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <AuthForm onAuthSuccess={() => setUser(auth.currentUser)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <CategoryProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-swipes" element={<MySwipes />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </CategoryProvider>
    </ErrorBoundary>
  );
}

export default App;
