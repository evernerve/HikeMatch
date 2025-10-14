import { useState, useEffect } from 'react';
import { Match, subscribeToMatches, getUserProfile } from '../lib/firestoreHelpers';
import { auth } from '../lib/firebase';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchUserNames, setMatchUserNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!auth.currentUser) return;

    // Subscribe to real-time match updates
    const unsubscribe = subscribeToMatches(auth.currentUser.uid, async (newMatches) => {
      setMatches(newMatches);
      
      // Fetch display names for matched users
      const names: { [key: string]: string } = {};
      for (const match of newMatches) {
        const otherUserId = match.userIds.find(id => id !== auth.currentUser?.uid);
        if (otherUserId && !names[otherUserId]) {
          const profile = await getUserProfile(otherUserId);
          if (profile) {
            names[otherUserId] = profile.displayName;
          }
        }
      }
      setMatchUserNames(prev => ({ ...prev, ...names }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No matches yet
          </h2>
          <p className="text-gray-600 mb-6">
            Keep swiping on trails! When you and your friends both like the same trail, it'll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎉 Your Matches
          </h1>
          <p className="text-gray-600">
            Trails you and your friends both loved
          </p>
        </div>

        {/* Match Count */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 text-center">
          <p className="text-lg">
            <span className="font-bold text-primary text-2xl">{matches.length}</span>
            <span className="text-gray-600 ml-2">
              {matches.length === 1 ? 'match' : 'matches'} found
            </span>
          </p>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match, index) => {
            const otherUserId = match.userIds.find(id => id !== auth.currentUser?.uid);
            const otherUserName = otherUserId ? matchUserNames[otherUserId] || 'Another hiker' : 'Friend';
            
            return (
              <div
                key={`${match.trailId}-${index}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Trail Image */}
                {match.trail && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={match.trail.image}
                      alt={match.trail.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Match Badge */}
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                      ✓ Match!
                    </div>
                  </div>
                )}

                {/* Match Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {match.trail?.name || 'Trail'}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">💚</span>
                    <p className="text-gray-600 text-sm">
                      You and <span className="font-semibold text-primary">{otherUserName}</span> both liked this trail!
                    </p>
                  </div>

                  {match.trail && (
                    <>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {match.trail.description}
                      </p>

                      {/* Trail Details */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          📏 {match.trail.lengthKm} km
                        </span>
                        <span className="flex items-center">
                          ⏱️ {match.trail.durationHours} hrs
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {match.trail.pathType}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {match.trail.scenery}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Matched Date */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
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
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Want more matches? Keep swiping on trails!
          </p>
          <a
            href="/"
            className="inline-block btn-primary"
          >
            ← Back to Trails
          </a>
        </div>
      </div>
    </div>
  );
}
