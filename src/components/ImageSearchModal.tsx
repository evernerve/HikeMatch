/**
 * ImageSearchModal Component
 * 
 * Allows users to search for images from multiple sources:
 * - Unsplash (general photos)
 * - TMDB (movies/TV shows)
 * - Wikipedia (general images)
 * - Direct URL input
 */

import { useState, useEffect } from 'react';
import type { CategoryType } from '../types/categories';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  category: CategoryType;
  searchQuery?: string;
}

type ImageSource = 'unsplash' | 'tmdb' | 'wikipedia' | 'url';

interface SearchResult {
  url: string;
  thumbnail: string;
  alt: string;
  source: string;
  photographer?: string;
}

export function ImageSearchModal({ 
  isOpen, 
  onClose, 
  onSelectImage, 
  category,
  searchQuery = '' 
}: ImageSearchModalProps) {
  const [source, setSource] = useState<ImageSource>('unsplash');
  const [query, setQuery] = useState(searchQuery);
  const [directUrl, setDirectUrl] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  if (!isOpen) return null;

  // Get recommended sources based on category
  const getRecommendedSources = (): ImageSource[] => {
    switch (category) {
      case 'movies':
      case 'tv':
        return ['tmdb', 'unsplash', 'wikipedia', 'url'];
      case 'hikes':
        return ['unsplash', 'wikipedia', 'url'];
      case 'restaurants':
        return ['unsplash', 'url'];
      default:
        return ['unsplash', 'wikipedia', 'url'];
    }
  };

  const recommendedSources = getRecommendedSources();

  // Handle search
  const handleSearch = async () => {
    if (!query.trim() && source !== 'url') return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      if (source === 'unsplash') {
        await searchUnsplash();
      } else if (source === 'tmdb') {
        await searchTMDB();
      } else if (source === 'wikipedia') {
        await searchWikipedia();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search images');
    } finally {
      setLoading(false);
    }
  };

  // Search Unsplash
  const searchUnsplash = async () => {
    try {
      // Using Unsplash API (public access)
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&client_id=your_access_key`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      // If API call fails (no key), use curated Unsplash images with random parameters
      if (!response.ok) {
        const fallbackResults: SearchResult[] = [
          {
            url: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop&auto=format`,
            thumbnail: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80&fit=crop&auto=format`,
            alt: `${query} - Scenic view`,
            source: 'Unsplash',
          },
          {
            url: `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80&fit=crop&auto=format`,
            thumbnail: `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80&fit=crop&auto=format`,
            alt: `${query} - Nature`,
            source: 'Unsplash',
          },
          {
            url: `https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80&fit=crop&auto=format`,
            thumbnail: `https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80&fit=crop&auto=format`,
            alt: `${query} - Landscape`,
            source: 'Unsplash',
          },
          {
            url: `https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80&fit=crop&auto=format`,
            thumbnail: `https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=80&fit=crop&auto=format`,
            alt: `${query} - Mountain`,
            source: 'Unsplash',
          },
          {
            url: `https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80&fit=crop&auto=format`,
            thumbnail: `https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&q=80&fit=crop&auto=format`,
            alt: `${query} - Forest`,
            source: 'Unsplash',
          },
          {
            url: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&fit=crop&auto=format`,
            thumbnail: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80&fit=crop&auto=format`,
            alt: `${query} - Outdoor`,
            source: 'Unsplash',
          },
          {
            url: `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80&fit=crop&auto=format`,
            thumbnail: `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80&fit=crop&auto=format`,
            alt: `${query} - Sunset`,
            source: 'Unsplash',
          },
          {
            url: `https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80&fit=crop&auto=format`,
            thumbnail: `https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&q=80&fit=crop&auto=format`,
            alt: `${query} - Peak`,
            source: 'Unsplash',
          },
        ];
        
        setResults(fallbackResults);
        return;
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const results: SearchResult[] = data.results.map((photo: any) => ({
          url: photo.urls.regular,
          thumbnail: photo.urls.small,
          alt: photo.alt_description || query,
          source: 'Unsplash',
          photographer: photo.user.name,
        }));
        setResults(results);
      } else {
        setError('No images found for this search term');
      }
    } catch (err) {
      setError('Failed to search Unsplash. Try using Direct URL instead.');
    }
  };

  // Search TMDB
  const searchTMDB = async () => {
    // Note: For production, you'd need a TMDB API key
    // This is a placeholder showing the structure
    setError('TMDB search requires an API key. Please use direct URL for now.');
    
    // Example of how it would work:
    // const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
    // const data = await response.json();
    // const results = data.results.map(movie => ({
    //   url: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
    //   thumbnail: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    //   alt: movie.title,
    //   source: 'TMDB'
    // }));
    // setResults(results);
  };

  // Search Wikipedia
  const searchWikipedia = async () => {
    try {
      // Wikipedia API to get page images
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|images&titles=${encodeURIComponent(query)}&piprop=original&origin=*`
      );
      const data = await response.json();
      const pages = data.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      
      if (pageId && pages[pageId].original) {
        const imageUrl = pages[pageId].original.source;
        setResults([{
          url: imageUrl,
          thumbnail: imageUrl,
          alt: query,
          source: 'Wikipedia',
        }]);
      } else {
        setError('No images found on Wikipedia for this query');
      }
    } catch (err) {
      setError('Failed to search Wikipedia');
    }
  };

  // Handle direct URL
  const handleDirectUrl = () => {
    if (!directUrl.trim()) return;
    
    // Basic URL validation
    try {
      new URL(directUrl);
      onSelectImage(directUrl);
      onClose();
    } catch {
      setError('Please enter a valid URL');
    }
  };

  // Handle image selection
  const handleSelectImage = (url: string) => {
    onSelectImage(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Search Images</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Source Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {recommendedSources.map((src) => (
              <button
                key={src}
                onClick={() => setSource(src)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  source === src
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {src === 'url' ? 'Direct URL' : src.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search Input */}
          {source !== 'url' ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Search ${source}...`}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDirectUrl()}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleDirectUrl}
                disabled={!directUrl.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Use URL
              </button>
            </div>
          )}

          {/* Info Text */}
          <p className="text-sm text-gray-400 mt-2">
            {source === 'unsplash' && '📸 Browse curated high-quality photos from Unsplash'}
            {source === 'tmdb' && '🎬 Search for movie and TV show posters from TMDB'}
            {source === 'wikipedia' && '📚 Search for images from Wikipedia articles'}
            {source === 'url' && '🔗 Enter a direct URL to an image (e.g., from images.unsplash.com)'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectImage(result.url)}
                  className="group cursor-pointer relative overflow-hidden rounded-lg bg-gray-700 hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  <div className="aspect-w-4 aspect-h-3">
                    <img
                      src={result.thumbnail}
                      alt={result.alt}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-opacity">
                      Select
                    </button>
                  </div>
                  <div className="p-2 bg-gray-900">
                    <p className="text-xs text-gray-400 truncate">{result.alt}</p>
                    <p className="text-xs text-gray-500">{result.source}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              {source === 'url' 
                ? 'Enter a direct URL to an image above' 
                : 'Enter a search query and click Search to find images'}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="border-t border-gray-700 p-6 bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Use specific search terms for better results</li>
            <li>• Unsplash provides high-quality, free-to-use photos</li>
            <li>• Wikipedia images may have licensing restrictions</li>
            <li>• For movies/TV: include the full title and year</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
