/**
 * Card component for displaying user contributions in grid view
 */

import { SwipeItem, getCategoryIcon, isHikeData, isMovieData, isTVData, isRestaurantData } from '../types/categories';

interface ContributionCardProps {
  item: SwipeItem;
  onEdit: (item: SwipeItem) => void;
  onDelete: (item: SwipeItem) => void;
}

export default function ContributionCard({ item, onEdit, onDelete }: ContributionCardProps) {
  // Check if item has valid data
  if (!item || !item.name || !item.category) {
    console.warn('Invalid item data:', item);
    return null;
  }

  // Type-safe access to category-specific data with fallback
  const hikeData = item.categoryData && isHikeData(item.categoryData) ? item.categoryData : null;
  const movieData = item.categoryData && isMovieData(item.categoryData) ? item.categoryData : null;
  const tvData = item.categoryData && isTVData(item.categoryData) ? item.categoryData : null;
  const restaurantData = item.categoryData && isRestaurantData(item.categoryData) ? item.categoryData : null;

  // Get key stat for display
  const getMainStat = () => {
    try {
      if (hikeData && typeof hikeData.lengthKm === 'number' && typeof hikeData.durationHours === 'number') {
        return `${hikeData.lengthKm} km • ${hikeData.durationHours} hrs`;
      }
      if (movieData && typeof movieData.year === 'number' && typeof movieData.runtime === 'number') {
        return `${movieData.year} • ${movieData.runtime} min`;
      }
      if (tvData && typeof tvData.startYear === 'number' && typeof tvData.seasons === 'number') {
        return `${tvData.startYear}${tvData.endYear ? `-${tvData.endYear}` : '+'} • ${tvData.seasons} seasons`;
      }
      if (restaurantData && restaurantData.priceRange && restaurantData.location) {
        return `${restaurantData.priceRange} • ${restaurantData.location}`;
      }
      return 'Details incomplete';
    } catch (error) {
      console.error('Error getting main stat:', error, { hikeData, movieData, tvData, restaurantData });
      return 'Details incomplete';
    }
  };

  // Get rating for display
  const getRating = () => {
    try {
      if (movieData && movieData.rating !== null && movieData.rating !== undefined && typeof movieData.rating === 'number' && !isNaN(movieData.rating)) {
        return `⭐ ${movieData.rating.toFixed(1)}/10`;
      }
      if (tvData && tvData.rating !== null && tvData.rating !== undefined && typeof tvData.rating === 'number' && !isNaN(tvData.rating)) {
        return `⭐ ${tvData.rating.toFixed(1)}/10`;
      }
      if (restaurantData && restaurantData.rating !== null && restaurantData.rating !== undefined && typeof restaurantData.rating === 'number' && !isNaN(restaurantData.rating)) {
        return `⭐ ${restaurantData.rating.toFixed(1)}/5`;
      }
      if (hikeData && hikeData.difficulty) {
        return `${hikeData.difficulty === 'easy' ? '🟢' : hikeData.difficulty === 'moderate' ? '🟡' : '🔴'} ${hikeData.difficulty}`;
      }
      return '';
    } catch (error) {
      console.error('Error getting rating:', error, { movieData, tvData, restaurantData, hikeData });
      return '';
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-200">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-6xl opacity-50">{getCategoryIcon(item.category)}</span>
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
          <span className="text-lg">{getCategoryIcon(item.category)}</span>
          <span className="text-xs font-medium text-gray-700 capitalize">{item.category}</span>
        </div>
        {/* Incomplete Data Warning */}
        {!item.categoryData && (
          <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
            <span className="text-xs font-medium text-white">⚠️ Incomplete</span>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
          {item.name || 'Untitled'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {item.description || 'No description provided'}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="line-clamp-1">{getMainStat()}</span>
          <span className="font-medium">{getRating()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
            className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Updated timestamp */}
      {item.updatedAt && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400">
            Updated {new Date(item.updatedAt.toDate()).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
