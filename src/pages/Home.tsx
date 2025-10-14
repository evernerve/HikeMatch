import React, { useState, useEffect, useMemo } from 'react';
import TinderCard from 'react-tinder-card';
import { getUnswipedCategoryItems, recordCategorySwipe } from '../lib/firestoreHelpers';
import { SwipeItem } from '../types/categories';
import { auth } from '../lib/firebase';
import { useCategory } from '../context/CategoryContext';
import CategoryCard from '../components/CategoryCard';
import CategorySelector from '../components/CategorySelector';

export default function Home() {
  const { activeCategory } = useCategory();
  const [items, setItems] = useState<SwipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<string>('');

  useEffect(() => {
    loadItems();
  }, [activeCategory]); // Reload when category changes

  const loadItems = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) return;
      const unswipedItems = await getUnswipedCategoryItems(auth.currentUser.uid, activeCategory);
      setItems(unswipedItems);
      setCurrentIndex(unswipedItems.length - 1);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const swiped = async (direction: string, item: SwipeItem) => {
    setLastDirection(direction);
    
    if (!auth.currentUser) return;

    const liked = direction === 'right';
    
    try {
      await recordCategorySwipe(auth.currentUser.uid, item.id, activeCategory, liked);
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  const outOfFrame = (idx: number) => {
    setCurrentIndex(idx - 1);
  };

  const canSwipe = currentIndex >= 0;

  // Memoize card refs to prevent unnecessary re-renders
  const childRefs = useMemo(
    () =>
      Array(items.length)
        .fill(0)
        .map(() => React.createRef()),
    [items.length]
  );

  const swipe = async (dir: string) => {
    if (canSwipe && currentIndex < items.length) {
      // @ts-ignore
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)]">
        <CategorySelector />
        <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canSwipe && items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)]">
        <CategorySelector />
        <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <span className="text-6xl mb-4 block">🎉</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              You've seen everything in this category!
            </h2>
            <p className="text-gray-600 mb-6">
              Check your matches or switch to another category!
            </p>
            <button
              onClick={loadItems}
              className="btn-primary"
            >
              🔄 Reload Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Category Selector - Always visible */}
      <CategorySelector />
      
      <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-green-50 to-blue-50 py-4 sm:py-6 px-2 sm:px-4">
        <div className="max-w-md mx-auto">
        {/* Cards Container */}
        <div className="relative h-[500px] sm:h-[600px] mb-4">
          {items.map((item, index) => {
            // Only render cards that are close to being shown (current card and next 2)
            const shouldRender = index >= currentIndex - 2 && index <= currentIndex;
            
            if (!shouldRender) return null;
            
            return (
              <TinderCard
                // @ts-ignore
                ref={childRefs[index]}
                key={item.id}
                onSwipe={(dir) => swiped(dir, item)}
                onCardLeftScreen={() => outOfFrame(index)}
                preventSwipe={['up', 'down']}
                className="absolute w-full"
              >
                <CategoryCard item={item} />
              </TinderCard>
            );
          })}

          {/* Empty state when all cards swiped */}
          {!canSwipe && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl mb-4 block">👍</span>
                <p className="text-gray-600 font-medium">No more trails!</p>
              </div>
            </div>
          )}
        </div>

        {/* Swipe Buttons */}
        <div className="flex justify-center items-center space-x-6 sm:space-x-8 mb-4">
          <button
            onClick={() => swipe('left')}
            disabled={!canSwipe}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl sm:text-3xl hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Pass"
          >
            ❌
          </button>
          <button
            onClick={() => swipe('right')}
            disabled={!canSwipe}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl sm:text-3xl hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Like"
          >
            💚
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center mb-3">
          <p className="text-sm text-gray-600">
            Swipe right to like • Swipe left to pass
          </p>
        </div>

        {/* Trail Counter with Last Action */}
        <div className="text-center">
          {lastDirection && (
            <p className="text-sm text-gray-600 font-medium mb-1">
              You {lastDirection === 'right' ? 'liked ❤️' : 'passed ➡️'} this item
            </p>
          )}
          <p className="text-gray-500 text-sm">
            {canSwipe ? currentIndex + 1 : 0} / {items.length} items remaining
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
