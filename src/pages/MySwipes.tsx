import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Trail, getTrailById } from '../lib/firestoreHelpers';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

interface SwipeWithTrail {
  trailId: string;
  liked: boolean;
  swipedAt: Date;
  trail?: Trail;
}

export default function MySwipes() {
  const [swipes, setSwipes] = useState<SwipeWithTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deleteTrailId, setDeleteTrailId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadSwipes();
  }, []);

  const loadSwipes = async () => {
    if (!auth.currentUser) return;

    try {
      const swipesRef = collection(db, 'userSwipes', auth.currentUser.uid, 'swipes');
      const swipesSnapshot = await getDocs(swipesRef);

      const swipesData: SwipeWithTrail[] = [];
      
      for (const swipeDoc of swipesSnapshot.docs) {
        const swipeData = swipeDoc.data();
        const trail = await getTrailById(swipeDoc.id);
        
        swipesData.push({
          trailId: swipeDoc.id,
          liked: swipeData.liked,
          swipedAt: swipeData.swipedAt?.toDate() || new Date(),
          trail: trail || undefined,
        });
      }

      // Sort by date (most recent first)
      swipesData.sort((a, b) => b.swipedAt.getTime() - a.swipedAt.getTime());
      
      setSwipes(swipesData);
    } catch (error) {
      console.error('Error loading swipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmResetAllSwipes = async () => {
    if (!auth.currentUser) return;

    setShowResetModal(false);
    setResetting(true);

    try {
      const userId = auth.currentUser.uid;

      // Delete all swipes
      const swipesRef = collection(db, 'userSwipes', userId, 'swipes');
      const swipesSnapshot = await getDocs(swipesRef);
      
      for (const swipeDoc of swipesSnapshot.docs) {
        await deleteDoc(doc(db, 'userSwipes', userId, 'swipes', swipeDoc.id));
      }

      // Delete all matches where this user is involved
      const matchesRef = collection(db, 'matches');
      const matchesSnapshot = await getDocs(matchesRef);
      
      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        if (matchData.userIds && matchData.userIds.includes(userId)) {
          await deleteDoc(doc(db, 'matches', matchDoc.id));
        }
      }

      setSwipes([]);
      setToast({ message: 'All swipes and matches reset! You can start fresh.', type: 'success' });
    } catch (error) {
      console.error('Error resetting swipes:', error);
      setToast({ message: 'Failed to reset swipes. Please try again.', type: 'error' });
    } finally {
      setResetting(false);
    }
  };

  const confirmDeleteSwipe = async () => {
    if (!auth.currentUser || !deleteTrailId) return;

    setDeleteTrailId(null);

    try {
      const userId = auth.currentUser.uid;

      // Delete the swipe
      await deleteDoc(doc(db, 'userSwipes', userId, 'swipes', deleteTrailId));

      // Delete any matches involving this user and trail
      const matchesRef = collection(db, 'matches');
      const matchesSnapshot = await getDocs(matchesRef);
      
      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        if (matchData.trailId === deleteTrailId && matchData.userIds?.includes(userId)) {
          await deleteDoc(doc(db, 'matches', matchDoc.id));
        }
      }

      // Update UI
      setSwipes(swipes.filter(s => s.trailId !== deleteTrailId));
      setToast({ message: 'Swipe deleted!', type: 'success' });
    } catch (error) {
      console.error('Error deleting swipe:', error);
      setToast({ message: 'Failed to delete swipe. Please try again.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your swipes...</p>
        </div>
      </div>
    );
  }

  const likedSwipes = swipes.filter(s => s.liked);
  const passedSwipes = swipes.filter(s => !s.liked);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-blue-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            📊 My Swipes
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            View all trails you've swiped on
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="bg-white rounded-lg shadow px-3 sm:px-6 py-2 sm:py-3">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{likedSwipes.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Liked 💚</div>
            </div>
            <div className="bg-white rounded-lg shadow px-3 sm:px-6 py-2 sm:py-3">
              <div className="text-xl sm:text-2xl font-bold text-gray-600">{passedSwipes.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Passed ⏭️</div>
            </div>
            <div className="bg-white rounded-lg shadow px-3 sm:px-6 py-2 sm:py-3">
              <div className="text-xl sm:text-2xl font-bold text-primary">{swipes.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total</div>
            </div>
          </div>

          {/* Reset Button */}
          {swipes.length > 0 && (
            <button
              onClick={() => setShowResetModal(true)}
              disabled={resetting}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {resetting ? 'Resetting...' : '🔄 Reset All Swipes'}
            </button>
          )}
        </div>

        {swipes.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <span className="text-5xl sm:text-6xl mb-3 sm:mb-4 block">👋</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              No swipes yet
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Start swiping on trails to see them here!
            </p>
            <a href="/" className="btn-primary inline-block text-sm sm:text-base">
              ← Start Swiping
            </a>
          </div>
        ) : (
          <>
            {/* Liked Trails */}
            {likedSwipes.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">💚 Trails You Liked</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {likedSwipes.map((swipe) => (
                    <div key={swipe.trailId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition relative">
                      {swipe.trail && (
                        <>
                          <img
                            src={swipe.trail.image}
                            alt={swipe.trail.name}
                            className="w-full h-28 sm:h-32 object-cover"
                            loading="lazy"
                          />
                          <div className="p-3 sm:p-4">
                            <h3 className="font-bold text-base sm:text-lg mb-1">{swipe.trail.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                              {swipe.trail.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                <span>📏 {swipe.trail.lengthKm} km</span>
                                <span>⏱️ {swipe.trail.durationHours} hrs</span>
                              </div>
                              <button
                                onClick={() => setDeleteTrailId(swipe.trailId)}
                                className="text-red-500 hover:text-red-700 active:text-red-800 hover:bg-red-50 p-1.5 sm:p-2 rounded transition text-base sm:text-lg"
                                title="Delete this swipe"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passed Trails */}
            {passedSwipes.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">⏭️ Trails You Passed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {passedSwipes.map((swipe) => (
                    <div key={swipe.trailId} className="bg-white rounded-lg shadow-md overflow-hidden opacity-75 hover:opacity-100 transition relative">
                      {swipe.trail && (
                        <>
                          <img
                            src={swipe.trail.image}
                            alt={swipe.trail.name}
                            className="w-full h-28 sm:h-32 object-cover grayscale"
                            loading="lazy"
                          />
                          <div className="p-3 sm:p-4">
                            <h3 className="font-bold text-base sm:text-lg mb-1">{swipe.trail.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                              {swipe.trail.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                <span>📏 {swipe.trail.lengthKm} km</span>
                                <span>⏱️ {swipe.trail.durationHours} hrs</span>
                              </div>
                              <button
                                onClick={() => setDeleteTrailId(swipe.trailId)}
                                className="text-red-500 hover:text-red-700 active:text-red-800 hover:bg-red-50 p-1.5 sm:p-2 rounded transition text-base sm:text-lg"
                                title="Delete this swipe"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Reset All Swipes?"
        message="This will delete all your swipes and matches. This action cannot be undone!"
        confirmText="Reset All"
        cancelText="Cancel"
        onConfirm={confirmResetAllSwipes}
        onCancel={() => setShowResetModal(false)}
        type="warning"
      />

      <ConfirmModal
        isOpen={deleteTrailId !== null}
        title="Delete This Swipe?"
        message="You can swipe on this trail again after deleting."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteSwipe}
        onCancel={() => setDeleteTrailId(null)}
        type="info"
      />

      {/* Toast */}
      {toast && (
        <Toast
          isOpen={true}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
