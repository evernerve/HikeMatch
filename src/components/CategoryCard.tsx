import { useState, useRef } from 'react';
import { SwipeItem, isHikeData, isMovieData, isTVData, isRestaurantData } from '../types/categories';

interface CategoryCardProps {
  item: SwipeItem;
}

export default function CategoryCard({ item }: CategoryCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Safety check: if categoryData is missing or empty
  if (!item.categoryData || Object.keys(item.categoryData).length === 0) {
    console.warn('⚠️ Empty or missing categoryData for item:', item);
    
    // Show a fallback card with basic info
    return (
      <div className="w-full h-[500px] sm:h-[600px] rounded-2xl shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50 flex flex-col justify-end overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative p-6 text-white">
          <div className="bg-yellow-500/80 backdrop-blur-sm rounded-full px-3 py-1 inline-block mb-3">
            <span className="text-xs font-semibold">⚠️ Incomplete Data</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">{item.name}</h2>
          <p className="text-sm text-gray-200 mb-4">{item.description}</p>
          <p className="text-xs text-gray-300 italic">
            This item is missing detailed information. It may have been added by a user and is pending review.
          </p>
        </div>
      </div>
    );
  }

  // Type-safe access to category-specific data
  const hikeData = item.categoryData && isHikeData(item.categoryData) ? item.categoryData : null;
  const movieData = item.categoryData && isMovieData(item.categoryData) ? item.categoryData : null;
  const tvData = item.categoryData && isTVData(item.categoryData) ? item.categoryData : null;
  const restaurantData = item.categoryData && isRestaurantData(item.categoryData) ? item.categoryData : null;

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
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Trail Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-3xl font-bold mb-3">{item.name}</h2>
            
            <p className="text-sm mb-4 line-clamp-2 text-gray-200">
              {item.description}
            </p>

            {/* Category-Specific Stats */}
            {hikeData && (
              <>
                {/* Hike Stats */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">🚶‍♂️</span>
                    <span className="text-xs font-medium text-gray-800">{hikeData.lengthKm} km</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">⏱️</span>
                    <span className="text-xs font-medium text-gray-800">{hikeData.durationHours} hrs</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">⛰️</span>
                    <span className="text-xs font-medium text-gray-800">{hikeData.elevationGainM} m</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">{hikeData.difficulty === 'easy' ? '🟢' : hikeData.difficulty === 'moderate' ? '🟡' : '🔴'}</span>
                    <span className="text-xs font-medium text-gray-800 capitalize">{hikeData.difficulty}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">📍</span>
                    <span className="text-xs font-medium text-gray-800">{hikeData.location}</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">🚂</span>
                    <span className="text-xs font-medium text-gray-800">{hikeData.publicTransportTime} min</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-green-500/60 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
                    {hikeData.pathType}
                  </span>
                  <span className="px-2.5 py-1 bg-blue-500/60 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
                    {hikeData.scenery}
                  </span>
                </div>
              </>
            )}

            {movieData && (
              <>
                {/* Movie Stats */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">📅</span>
                    <span className="text-xs font-medium text-gray-800">{movieData.year || 2024}</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">⏱️</span>
                    <span className="text-xs font-medium text-gray-800">{movieData.runtime || 120} min</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">⭐</span>
                    <span className="text-xs font-medium text-gray-800">{(movieData.rating || 7.0).toFixed(1)}/10</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">🎬</span>
                    <span className="text-xs font-medium text-gray-800">{movieData.director || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(movieData.genres || ['Drama']).slice(0, 3).map((genre) => (
                    <span key={genre} className="px-2.5 py-1 bg-red-500/60 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </>
            )}

            {tvData && (
              <>
                {/* TV Show Stats */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">📅</span>
                    <span className="text-xs font-medium text-gray-800">{tvData.startYear}{tvData.endYear ? `-${tvData.endYear}` : '+'}</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">📺</span>
                    <span className="text-xs font-medium text-gray-800">{tvData.seasons || 1} seasons</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">⭐</span>
                    <span className="text-xs font-medium text-gray-800">{(tvData.rating || 7.0).toFixed(1)}/10</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">🎭</span>
                    <span className="text-xs font-medium text-gray-800">{tvData.network || 'Network'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(tvData.genres || ['Drama']).slice(0, 3).map((genre) => (
                    <span key={genre} className="px-2.5 py-1 bg-purple-500/60 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </>
            )}

            {restaurantData && (
              <>
                {/* Restaurant Stats */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">💰</span>
                    <span className="text-xs font-medium text-gray-800">{restaurantData.priceRange || '€€'}</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">⭐</span>
                    <span className="text-xs font-medium text-gray-800">{(restaurantData.rating || 4.0).toFixed(1)}/5</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                    <span className="text-base">📍</span>
                    <span className="text-xs font-medium text-gray-800">{restaurantData.location || 'Munich'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(restaurantData.cuisine || ['International']).slice(0, 3).map((cuisine) => (
                    <span key={cuisine} className="px-2.5 py-1 bg-orange-500/60 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </>
            )}
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
              src={item.image}
              alt=""
              className="w-full h-full object-cover scale-110 blur-2xl opacity-50"
              style={{ filter: 'blur(40px) brightness(0.6)' }}
            />
          </div>

          {/* Cover Image with Gradient and Title - clickable to flip back */}
          <div 
            className="absolute top-0 left-0 right-0 h-48 z-10 cursor-pointer"
            onClick={() => setIsFlipped(false)}
            onTouchEnd={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient: from-transparent (top 40%) to-black/60 (bottom 60%) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-black/70" />
            
            {/* Title overlaid at bottom of image */}
            <div className="absolute bottom-4 left-6 right-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">{item.name}</h2>
            </div>
          </div>

          {/* Back button - positioned over image */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
            onTouchEnd={(e) => {
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
          <div 
            className="absolute inset-0 top-48"
            onTouchEnd={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
          >
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
              
              {/* Hike-specific back content */}
              {hikeData && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">✨</span>
                      <h3 className="text-lg font-semibold">What Makes It Special</h3>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {hikeData.specialFeature || "A unique hiking experience in the Munich area."}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📖</span>
                      <h3 className="text-lg font-semibold">About This Trail</h3>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {hikeData.detailedDescription || item.description}
                    </p>
                  </div>

                  {hikeData.highlights && hikeData.highlights.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎯</span>
                        <h3 className="text-lg font-semibold">Trail Highlights</h3>
                      </div>
                      <ul className="space-y-2">
                        {hikeData.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-white/90">
                            <span className="text-primary-200 mt-0.5">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-white/60 mb-1">Distance from Munich</p>
                        <p className="text-sm font-semibold">{hikeData.distanceFromMunichKm} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">By Public Transport</p>
                        <p className="text-sm font-semibold">{hikeData.publicTransportTime} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Trail Type</p>
                        <p className="text-sm font-semibold">{hikeData.pathType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Scenery</p>
                        <p className="text-sm font-semibold">{hikeData.scenery}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Movie-specific back content */}
              {movieData && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎬</span>
                      <h3 className="text-lg font-semibold">Plot</h3>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {movieData.plot}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎭</span>
                      <h3 className="text-lg font-semibold">Cast</h3>
                    </div>
                    <p className="text-sm text-white/90">
                      {movieData.cast.slice(0, 5).join(', ')}
                    </p>
                  </div>

                  {movieData.streamingPlatforms && movieData.streamingPlatforms.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📺</span>
                        <h3 className="text-lg font-semibold">Available On</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {movieData.streamingPlatforms.map((platform) => (
                          <span key={platform} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-white/60 mb-1">Director</p>
                        <p className="text-sm font-semibold">{movieData.director}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Year</p>
                        <p className="text-sm font-semibold">{movieData.year}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Runtime</p>
                        <p className="text-sm font-semibold">{movieData.runtime} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Rating</p>
                        <p className="text-sm font-semibold">⭐ {movieData.rating}/10</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TV Show-specific back content */}
              {tvData && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📺</span>
                      <h3 className="text-lg font-semibold">Plot</h3>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {tvData.plot}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎭</span>
                      <h3 className="text-lg font-semibold">Cast</h3>
                    </div>
                    <p className="text-sm text-white/90">
                      {tvData.cast.slice(0, 5).join(', ')}
                    </p>
                  </div>

                  {tvData.streamingPlatforms && tvData.streamingPlatforms.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📺</span>
                        <h3 className="text-lg font-semibold">Available On</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tvData.streamingPlatforms.map((platform) => (
                          <span key={platform} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-white/60 mb-1">Creator</p>
                        <p className="text-sm font-semibold">{tvData.creator}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Network</p>
                        <p className="text-sm font-semibold">{tvData.network}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Seasons</p>
                        <p className="text-sm font-semibold">{tvData.seasons} ({tvData.episodes} episodes)</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Rating</p>
                        <p className="text-sm font-semibold">⭐ {tvData.rating}/10</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Restaurant-specific back content */}
              {restaurantData && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🍽️</span>
                      <h3 className="text-lg font-semibold">Specialties</h3>
                    </div>
                    <ul className="space-y-2">
                      {(restaurantData.specialties || []).map((specialty, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-white/90">
                          <span className="text-primary-200 mt-0.5">•</span>
                          <span>{specialty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🥗</span>
                      <h3 className="text-lg font-semibold">Dietary Options</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(restaurantData.dietaryOptions || []).map((option) => (
                        <span key={option} className="px-3 py-1 bg-green-500/30 rounded-full text-xs font-medium">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">✨</span>
                      <h3 className="text-lg font-semibold">Ambiance</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(restaurantData.ambiance || []).map((vibe) => (
                        <span key={vibe} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                          {vibe}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-white/60 mb-1">Location</p>
                        <p className="text-sm font-semibold">{restaurantData.location || 'Munich'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Price Range</p>
                        <p className="text-sm font-semibold">{restaurantData.priceRange || '€€'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Rating</p>
                        <p className="text-sm font-semibold">⭐ {(restaurantData.rating || 4.0).toFixed(1)}/5</p>
                      </div>
                      {restaurantData.phone && (
                        <div>
                          <p className="text-xs text-white/60 mb-1">Phone</p>
                          <p className="text-sm font-semibold">{restaurantData.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
