import { useState, useEffect } from 'react';
import { Match, subscribeToMatches, getConnections } from '../lib/firestoreHelpers';
import { auth } from '../lib/firebase';
import { useCategory } from '../context/CategoryContext';
import CategorySelector from '../components/CategorySelector';

export default function Matches() {
  const { activeCategory } = useCategory();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedUserIds, setConnectedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!auth.currentUser) return;

    loadConnectionsAndMatches();

    // Subscribe to real-time match updates
    const unsubscribe = subscribeToMatches(auth.currentUser.uid, async (newMatches) => {
      // Filter matches to only show those with connected users
      const filteredMatches = newMatches.filter(match => {
        // Check if any other user in the match is connected
        return match.userIds.some(uid => 
          uid !== auth.currentUser?.uid && connectedUserIds.has(uid)
        );
      });
      
      setMatches(filteredMatches);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [connectedUserIds]);

  const loadConnectionsAndMatches = async () => {
    if (!auth.currentUser) return;

    try {
      // Load connections
      const connections = await getConnections();
      const connectedIds = new Set(connections.map(c => c.connectedUserId));
      setConnectedUserIds(connectedIds);
    } catch (error) {
      console.error('Error loading connections:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-5xl sm:text-6xl mb-3 sm:mb-4 block">🔍</span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            No matches yet
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            {connectedUserIds.size === 0 
              ? "Connect with friends first, then start swiping on trails together!"
              : "Keep swiping on trails! When you and your friends both like the same trail, it'll appear here."
            }
          </p>
          {connectedUserIds.size === 0 && (
            <a href="/connections" className="btn-primary inline-block mb-4 text-sm sm:text-base">
              👥 Go to Connections
            </a>
          )}
        </div>
      </div>
    );
  }

  // Filter matches by active category
  const filteredMatches = matches.filter(match => {
    // If match has category field, filter by it. Otherwise, assume it's a hike (backward compatibility)
    const matchCategory = (match as any).category || 'hikes';
    return matchCategory === activeCategory;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-blue-50">
      {/* Category Selector */}
      <CategorySelector />
      
      <div className="py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
              🎉 Your Matches
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Items you and your friends both loved
            </p>
          </div>

          {/* Match Count */}
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6 text-center">
            <p className="text-base sm:text-lg">
              <span className="font-bold text-green-600 text-xl sm:text-2xl">{filteredMatches.length}</span>
              <span className="text-gray-600 ml-2 text-sm sm:text-base">
                {filteredMatches.length === 1 ? 'match' : 'matches'} found
              </span>
            </p>
          </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredMatches.map((match, index) => {
            // Get all usernames who liked this trail (excluding current user)
            const otherUsers = match.userProfiles?.filter(p => p.uid !== auth.currentUser?.uid) || [];
            const usernames = otherUsers.map(u => `@${u.username}`).join(', ');
            
            return (
              <div
                key={`${match.trailId}-${index}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Trail Image */}
                {match.trail && (
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={match.trail.image}
                      alt={match.trail.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Match Badge */}
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg animate-pulse">
                      ✓ Match!
                    </div>
                  </div>
                )}

                {/* Match Info */}
                <div className="p-3 sm:p-5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    {match.trail?.name || 'Trail'}
                  </h3>
                  
                  {/* Who Liked */}
                  <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-green-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-700 mb-1">
                      <span className="font-semibold">💚 Liked by:</span>
                    </p>
                    <p className="text-xs sm:text-sm text-primary font-medium break-words">
                      {usernames || 'Friends'}
                    </p>
                  </div>

                  {match.trail && (
                    <>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                        {match.trail.description}
                      </p>

                      {/* Trail Details */}
                      <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                        <span className="flex items-center">
                          📏 {match.trail.lengthKm} km
                        </span>
                        <span className="flex items-center">
                          ⏱️ {match.trail.durationHours} hrs
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {match.trail.pathType}
                        </span>
                        <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {match.trail.scenery}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Matched Date */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Matched {new Date(match.matchedAt.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Want more matches? Keep swiping!
          </p>
          <a
            href="/"
            className="inline-block btn-primary text-sm sm:text-base"
          >
            ← Back to Discover
          </a>
        </div>
        </div>
      </div>
    </div>
  );
}
