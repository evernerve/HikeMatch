import { useState, useEffect, useMemo } from 'react';
import TinderCard from 'react-tinder-card';
import { Trail, getUnswipedTrails, recordSwipe } from '../lib/firestoreHelpers';
import { auth } from '../lib/firebase';
import TrailCard from '../components/TrailCard';

export default function Home() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<string>('');

  useEffect(() => {
    loadTrails();
  }, []);

  const loadTrails = async () => {
    try {
      if (!auth.currentUser) return;
      const unswipedTrails = await getUnswipedTrails(auth.currentUser.uid);
      setTrails(unswipedTrails);
      setCurrentIndex(unswipedTrails.length - 1);
    } catch (error) {
      console.error('Error loading trails:', error);
    } finally {
      setLoading(false);
    }
  };

  const swiped = async (direction: string, trail: Trail) => {
    setLastDirection(direction);
    
    if (!auth.currentUser) return;

    const liked = direction === 'right';
    
    try {
      await recordSwipe(auth.currentUser.uid, trail.id, liked);
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
      Array(trails.length)
        .fill(0)
        .map(() => React.createRef()),
    [trails.length]
  );

  const swipe = async (dir: string) => {
    if (canSwipe && currentIndex < trails.length) {
      // @ts-ignore
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading trails...</p>
        </div>
      </div>
    );
  }

  if (!canSwipe && trails.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-4 block">🎉</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            You've seen all the trails!
          </h2>
          <p className="text-gray-600 mb-6">
            Check your matches to see which trails your friends loved too!
          </p>
          <button
            onClick={loadTrails}
            className="btn-primary"
          >
            🔄 Reload Trails
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Discover Trails
          </h1>
          <p className="text-gray-600">
            Swipe right to like • Swipe left to pass
          </p>
        </div>

        {/* Cards Container */}
        <div className="relative h-[600px] mb-6">
          {trails.map((trail, index) => (
            <TinderCard
              // @ts-ignore
              ref={childRefs[index]}
              key={trail.id}
              onSwipe={(dir) => swiped(dir, trail)}
              onCardLeftScreen={() => outOfFrame(index)}
              preventSwipe={['up', 'down']}
              className="absolute w-full"
            >
              <TrailCard trail={trail} />
            </TinderCard>
          ))}

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
        <div className="flex justify-center items-center space-x-8">
          <button
            onClick={() => swipe('left')}
            disabled={!canSwipe}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Pass"
          >
            ❌
          </button>
          <button
            onClick={() => swipe('right')}
            disabled={!canSwipe}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Like"
          >
            💚
          </button>
        </div>

        {/* Last Action Indicator */}
        {lastDirection && (
          <div className="text-center mt-6">
            <p className="text-gray-600 font-medium">
              You {lastDirection === 'right' ? 'liked ❤️' : 'passed ➡️'} this trail
            </p>
          </div>
        )}

        {/* Trail Counter */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            {canSwipe ? currentIndex + 1 : 0} / {trails.length} trails remaining
          </p>
        </div>
      </div>
    </div>
  );
}

// Add React import for createRef
import React from 'react';
