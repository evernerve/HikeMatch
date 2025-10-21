import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { useCategory } from '../context/CategoryContext';
import { SwipeItem, CategoryType } from '../types/categories';
import CategorySelector from '../components/CategorySelector';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

interface SwipeWithItem {
  itemId: string;
  liked: boolean;
  swipedAt: Date;
  item?: SwipeItem;
  category: CategoryType;
}

export default function MySwipes() {
  const { activeCategory } = useCategory();
  const [swipes, setSwipes] = useState<SwipeWithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadSwipes();
  }, []);

  const getCategoryCollection = (category: CategoryType): string => {
    switch (category) {
      case 'hikes': return 'trails';
      case 'movies': return 'movies';
      case 'tv': return 'tvShows';
      case 'restaurants': return 'restaurants';
      default: return 'trails';
    }
  };

  const loadSwipes = async () => {
    if (!auth.currentUser) return;

    try {
      const swipesRef = collection(db, 'userSwipes', auth.currentUser.uid, 'swipes');
      const swipesSnapshot = await getDocs(swipesRef);

      const swipesData: SwipeWithItem[] = [];
      
      for (const swipeDoc of swipesSnapshot.docs) {
        const swipeData = swipeDoc.data();
        const category = (swipeData.category || 'hikes') as CategoryType;
        const collectionName = getCategoryCollection(category);
        
        // Fetch the actual item from the appropriate collection
        let item: SwipeItem | undefined;
        try {
          const itemDoc = await getDoc(doc(db, collectionName, swipeDoc.id));
          if (itemDoc.exists()) {
            item = { id: itemDoc.id, ...itemDoc.data() } as SwipeItem;
          }
        } catch (error) {
          console.error(`Error fetching item ${swipeDoc.id}:`, error);
        }
        
        swipesData.push({
          itemId: swipeDoc.id,
          liked: swipeData.liked,
          swipedAt: swipeData.swipedAt?.toDate() || new Date(),
          item,
          category,
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
    if (!auth.currentUser || !deleteItemId) return;

    setDeleteItemId(null);

    try {
      const userId = auth.currentUser.uid;

      // Delete the swipe
      await deleteDoc(doc(db, 'userSwipes', userId, 'swipes', deleteItemId));

      // Delete any matches involving this user and item
      const matchesRef = collection(db, 'matches');
      const matchesSnapshot = await getDocs(matchesRef);
      
      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        if (matchData.trailId === deleteItemId && matchData.userIds?.includes(userId)) {
          await deleteDoc(doc(db, 'matches', matchDoc.id));
        }
      }

      // Update UI
      setSwipes(swipes.filter(s => s.itemId !== deleteItemId));
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

  // Filter swipes by active category
  const filteredSwipes = swipes.filter(s => s.category === activeCategory);
  const likedSwipes = filteredSwipes.filter(s => s.liked);
  const passedSwipes = filteredSwipes.filter(s => !s.liked);

  // Render category-specific metadata
  const renderItemMetadata = (item: SwipeItem) => {
    const hikeData = item.categoryData && 'lengthKm' in item.categoryData ? item.categoryData : null;
    const movieData = item.categoryData && 'runtime' in item.categoryData && 'director' in item.categoryData ? item.categoryData : null;
    const tvData = item.categoryData && 'seasons' in item.categoryData && 'episodes' in item.categoryData ? item.categoryData : null;
    const restaurantData = item.categoryData && 'cuisine' in item.categoryData && 'priceRange' in item.categoryData ? item.categoryData : null;

    if (hikeData) {
      return (
        <>
          <span>📏 {hikeData.lengthKm} km</span>
          <span>⏱️ {hikeData.durationHours} hrs</span>
        </>
      );
    }

    if (movieData) {
      return (
        <>
          <span>📅 {movieData.year}</span>
          <span>⏱️ {movieData.runtime} min</span>
          <span>⭐ {movieData.rating}/10</span>
        </>
      );
    }

    if (tvData) {
      return (
        <>
          <span>📺 {tvData.seasons} seasons</span>
          <span>⭐ {tvData.rating}/10</span>
        </>
      );
    }

    if (restaurantData) {
      return (
        <>
          <span>💰 {restaurantData.priceRange}</span>
          <span>⭐ {restaurantData.rating}/5</span>
          <span>📍 {restaurantData.location}</span>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-blue-50">
      {/* Category Selector */}
      <CategorySelector />
      
      <div className="py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            📊 My Swipes
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            View all items you've swiped on
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
              <div className="text-xl sm:text-2xl font-bold text-green-600">{filteredSwipes.length}</div>
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

        {filteredSwipes.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <span className="text-5xl sm:text-6xl mb-3 sm:mb-4 block">👋</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              No swipes in this category yet
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Start swiping to see items here!
            </p>
            <a href="/" className="btn-primary inline-block text-sm sm:text-base">
              ← Start Swiping
            </a>
          </div>
        ) : (
          <>
            {/* Liked Items */}
            {likedSwipes.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">💚 Items You Liked</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {likedSwipes.map((swipe) => (
                    <div key={swipe.itemId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition relative">
                      {swipe.item && (
                        <>
                          <img
                            src={swipe.item.image}
                            alt={swipe.item.name}
                            className="w-full h-28 sm:h-32 object-cover"
                            loading="lazy"
                          />
                          <div className="p-3 sm:p-4">
                            <h3 className="font-bold text-base sm:text-lg mb-1">{swipe.item.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                              {swipe.item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                {renderItemMetadata(swipe.item)}
                              </div>
                              <button
                                onClick={() => setDeleteItemId(swipe.itemId)}
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

            {/* Passed Items */}
            {passedSwipes.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">⏭️ Items You Passed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {passedSwipes.map((swipe) => (
                    <div key={swipe.itemId} className="bg-white rounded-lg shadow-md overflow-hidden opacity-75 hover:opacity-100 transition relative">
                      {swipe.item && (
                        <>
                          <img
                            src={swipe.item.image}
                            alt={swipe.item.name}
                            className="w-full h-28 sm:h-32 object-cover grayscale"
                            loading="lazy"
                          />
                          <div className="p-3 sm:p-4">
                            <h3 className="font-bold text-base sm:text-lg mb-1">{swipe.item.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                              {swipe.item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                {renderItemMetadata(swipe.item)}
                              </div>
                              <button
                                onClick={() => setDeleteItemId(swipe.itemId)}
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
        isOpen={deleteItemId !== null}
        title="Delete This Swipe?"
        message="You can swipe on this item again after deleting."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteSwipe}
        onCancel={() => setDeleteItemId(null)}
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
    </div>
  );
}
