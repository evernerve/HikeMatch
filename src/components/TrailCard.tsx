import { useState, useRef, useEffect } from 'react';
import { Trail } from '../lib/firestoreHelpers';

interface TrailCardProps {
  trail: Trail;
}

export default function TrailCard({ trail }: TrailCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Smart scroll handler: only prevent swipe when actually scrolling
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let startY = 0;
    let isScrollableContent = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      // Check if content is scrollable (has overflow)
      isScrollableContent = scrollElement.scrollHeight > scrollElement.clientHeight;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrollableContent) return; // If not scrollable, allow swipe
      
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const isAtTop = scrollElement.scrollTop === 0;
      const isAtBottom = Math.abs(scrollElement.scrollHeight - scrollElement.clientHeight - scrollElement.scrollTop) < 1;
      
      // Only block swipe if we're in the middle of scrollable content
      // OR if trying to scroll down when not at top
      // OR if trying to scroll up when not at bottom
      const shouldBlockSwipe = 
        (!isAtTop && !isAtBottom) || // In middle of scroll
        (deltaY < 0 && !isAtBottom) || // Scrolling down, not at bottom
        (deltaY > 0 && !isAtTop); // Scrolling up, not at top
      
      if (shouldBlockSwipe) {
        e.stopPropagation(); // Block swipe
      }
    };

    scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('touchstart', handleTouchStart);
      scrollElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isFlipped]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    const deltaTime = Date.now() - touchStart.time;

    // Consider it a tap if movement is small and quick
    if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
      e.stopPropagation();
      setIsFlipped(true);
    }

    setTouchStart(null);
  };

  return (
    <div 
      className="relative w-full h-[500px] sm:h-[600px] rounded-2xl shadow-2xl"
      style={{ perspective: '1000px' }}
    >
      <div 
        className="relative w-full h-full transition-transform duration-500"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* FRONT OF CARD */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden cursor-pointer"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={() => setIsFlipped(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Trail Image */}
          <img
            src={trail.image}
            alt={trail.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Trail Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-3xl font-bold mb-3">{trail.name}</h2>
            
            <p className="text-sm mb-4 line-clamp-2 text-gray-200">
              {trail.description}
            </p>

            {/* Trail Stats - Icon Only Grid */}
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Distance */}
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                <span className="text-base">🚶‍♂️</span>
                <span className="text-xs font-medium text-gray-800">{trail.lengthKm} km</span>
              </div>
              
              {/* Duration */}
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                <span className="text-base">⏱️</span>
                <span className="text-xs font-medium text-gray-800">{trail.durationHours} hrs</span>
              </div>
              
              {/* Elevation */}
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                <span className="text-base">⛰️</span>
                <span className="text-xs font-medium text-gray-800">{trail.elevationGainM} m</span>
              </div>
              
              {/* Difficulty */}
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                <span className="text-base">{trail.difficulty === 'easy' ? '🟢' : trail.difficulty === 'moderate' ? '🟡' : '🔴'}</span>
                <span className="text-xs font-medium text-gray-800 capitalize">{trail.difficulty}</span>
              </div>
            </div>

            {/* Location & Transport - Icon Only */}
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Location */}
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                <span className="text-base">📍</span>
                <span className="text-xs font-medium text-gray-800">{trail.location}</span>
              </div>
              
              {/* Transport Time */}
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                <span className="text-base">🚂</span>
                <span className="text-xs font-medium text-gray-800">{trail.publicTransportTime} min</span>
              </div>
            </div>

            {/* Trail Type Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-green-500/60 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
                {trail.pathType}
              </span>
              <span className="px-2.5 py-1 bg-blue-500/60 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
                {trail.scenery}
              </span>
            </div>
          </div>

          {/* Click to flip hint */}
          <div className="absolute top-6 right-6 bg-white/90 rounded-full p-2 shadow-lg">
            <span className="text-xl">ℹ️</span>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Blurred Background Image */}
          <div className="absolute inset-0 bg-gray-900">
            <img
              src={trail.image}
              alt=""
              className="w-full h-full object-cover scale-110 blur-2xl opacity-50"
              style={{ filter: 'blur(40px) brightness(0.6)' }}
            />
          </div>

          {/* Cover Image with Gradient and Title - clickable to flip back */}
          <div 
            className="absolute top-0 left-0 right-0 h-48 z-10 cursor-pointer"
            onClick={() => setIsFlipped(false)}
          >
            <img
              src={trail.image}
              alt={trail.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient: from-transparent (top 40%) to-black/60 (bottom 60%) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-black/70" />
            
            {/* Title overlaid at bottom of image */}
            <div className="absolute bottom-4 left-6 right-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">{trail.name}</h2>
            </div>
          </div>

          {/* Back button - positioned over image */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
            className="absolute top-4 left-4 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 shadow-lg transition backdrop-blur-sm"
          >
            <span className="text-xl text-white">←</span>
          </button>

          {/* Scroll buttons for mobile */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
            <button
              onMouseDown={(e) => {
                e.stopPropagation();
                scrollIntervalRef.current = setInterval(() => {
                  scrollRef.current?.scrollBy({ top: -5, behavior: 'auto' });
                }, 16);
              }}
              onMouseUp={() => {
                if (scrollIntervalRef.current) {
                  clearInterval(scrollIntervalRef.current);
                  scrollIntervalRef.current = null;
                }
              }}
              onMouseLeave={() => {
                if (scrollIntervalRef.current) {
                  clearInterval(scrollIntervalRef.current);
                  scrollIntervalRef.current = null;
                }
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                scrollIntervalRef.current = setInterval(() => {
                  scrollRef.current?.scrollBy({ top: -5, behavior: 'auto' });
                }, 16);
              }}
              onTouchEnd={() => {
                if (scrollIntervalRef.current) {
                  clearInterval(scrollIntervalRef.current);
                  scrollIntervalRef.current = null;
                }
              }}
              className="bg-white/20 hover:bg-white/30 rounded-full p-3 shadow-lg transition backdrop-blur-sm active:bg-white/40"
            >
              <span className="text-xl text-white">↑</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.stopPropagation();
                scrollIntervalRef.current = setInterval(() => {
                  scrollRef.current?.scrollBy({ top: 5, behavior: 'auto' });
                }, 16);
              }}
              onMouseUp={() => {
                if (scrollIntervalRef.current) {
                  clearInterval(scrollIntervalRef.current);
                  scrollIntervalRef.current = null;
                }
              }}
              onMouseLeave={() => {
                if (scrollIntervalRef.current) {
                  clearInterval(scrollIntervalRef.current);
                  scrollIntervalRef.current = null;
                }
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                scrollIntervalRef.current = setInterval(() => {
                  scrollRef.current?.scrollBy({ top: 5, behavior: 'auto' });
                }, 16);
              }}
              onTouchEnd={() => {
                if (scrollIntervalRef.current) {
                  clearInterval(scrollIntervalRef.current);
                  scrollIntervalRef.current = null;
                }
              }}
              className="bg-white/20 hover:bg-white/30 rounded-full p-3 shadow-lg transition backdrop-blur-sm active:bg-white/40"
            >
              <span className="text-xl text-white">↓</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="absolute inset-0 top-48">
            <div 
              ref={scrollRef}
              className="w-full h-full px-6 py-6 text-white overflow-y-scroll scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
                touchAction: 'pan-y', // Only allow vertical scrolling
                WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                overscrollBehavior: 'contain' // Prevent scroll chaining
              }}
            >
              <div className="pb-4">
              
              {/* Special Feature */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-semibold">What Makes It Special</h3>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  {trail.specialFeature || "A unique hiking experience in the Munich area."}
                </p>
              </div>

              {/* Detailed Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📖</span>
                  <h3 className="text-lg font-semibold">About This Trail</h3>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  {trail.detailedDescription || trail.description}
                </p>
              </div>

              {/* Highlights */}
              {trail.highlights && trail.highlights.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-lg font-semibold">Trail Highlights</h3>
                  </div>
                  <ul className="space-y-2">
                    {trail.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-white/90">
                        <span className="text-primary-200 mt-0.5">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Stats Summary */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Distance from Munich</p>
                    <p className="text-sm font-semibold">{trail.distanceFromMunichKm} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">By Public Transport</p>
                    <p className="text-sm font-semibold">{trail.publicTransportTime} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Trail Type</p>
                    <p className="text-sm font-semibold">{trail.pathType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Scenery</p>
                    <p className="text-sm font-semibold">{trail.scenery}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
