import { Timestamp } from 'firebase/firestore';

// Category Types
export type CategoryType = 'hikes' | 'movies' | 'tv' | 'restaurants';

// Category Configuration
export interface CategoryConfig {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
  description: string;
  enabled: boolean;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'hikes',
    name: 'Hiking Trails',
    icon: '🏔️',
    color: 'bg-green-500',
    description: 'Discover amazing hiking trails',
    enabled: true
  },
  {
    id: 'movies',
    name: 'Movies',
    icon: '🎬',
    color: 'bg-red-500',
    description: 'Find movies you\'ll love',
    enabled: true
  },
  {
    id: 'tv',
    name: 'TV Shows',
    icon: '📺',
    color: 'bg-purple-500',
    description: 'Explore TV shows to binge',
    enabled: true
  },
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: '🍽️',
    color: 'bg-orange-500',
    description: 'Discover great places to eat',
    enabled: true
  }
];

// Category-Specific Data Interfaces

export interface HikeData {
  lengthKm: number;
  durationHours: number;
  difficulty: 'easy' | 'moderate' | 'difficult';
  elevationGainM: number;
  location: string;
  distanceFromMunichKm: number;
  publicTransportTime: number;
  scenery: string;
  pathType: string;
  specialFeature?: string;
  detailedDescription?: string;
  highlights?: string[];
}

export interface MovieData {
  title: string;
  year: number;
  runtime: number;  // minutes
  genres: string[];
  director: string;
  cast: string[];
  rating: number;  // 0-10 (IMDb/TMDb rating)
  voteCount: number;
  plot: string;
  language: string;
  country: string;
  awards?: string;
  streamingPlatforms?: string[];
  tmdbId: number;
  popularity?: number;
}

export interface TVData {
  title: string;
  startYear: number;
  endYear?: number;
  status: 'ongoing' | 'ended' | 'cancelled';
  seasons: number;
  episodes: number;
  genres: string[];
  creator: string;
  cast: string[];
  rating: number;  // 0-10
  voteCount: number;
  plot: string;
  network: string;
  streamingPlatforms?: string[];
  tmdbId: number;
  popularity?: number;
}

export interface RestaurantData {
  restaurantName: string;
  cuisine: string[];
  priceRange: '€' | '€€' | '€€€' | '€€€€';
  location: string;
  address: string;
  rating: number;  // 0-5
  reviewCount: number;
  phone?: string;
  website?: string;
  hours?: string;
  specialties: string[];
  dietaryOptions: string[];  // vegetarian, vegan, gluten-free, etc.
  ambiance: string[];  // casual, romantic, family-friendly, etc.
  yelpId?: string;
}

// Generic Swipe Item Interface
export interface SwipeItem {
  id: string;
  category: CategoryType;
  name: string;  // Universal field
  image: string;  // Universal field (poster for movies, photo for restaurants)
  description: string;  // Universal short description
  categoryData: HikeData | MovieData | TVData | RestaurantData;
  createdBy?: string;  // userId of creator (for user contributions)
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Type Guards for categoryData
export function isHikeData(data: any): data is HikeData {
  return 'lengthKm' in data && 'difficulty' in data;
}

export function isMovieData(data: any): data is MovieData {
  return 'runtime' in data && 'director' in data && 'tmdbId' in data;
}

export function isTVData(data: any): data is TVData {
  return 'seasons' in data && 'episodes' in data && 'tmdbId' in data;
}

export function isRestaurantData(data: any): data is RestaurantData {
  return 'cuisine' in data && 'priceRange' in data && 'address' in data;
}

// Helper to get category from item
export function getCategoryFromItem(item: SwipeItem): CategoryType {
  return item.category;
}

// Helper to get color for category
export function getCategoryColor(category: CategoryType): string {
  const config = CATEGORIES.find(c => c.id === category);
  return config?.color || 'gray';
}

// Helper to get icon for category
export function getCategoryIcon(category: CategoryType): string {
  const config = CATEGORIES.find(c => c.id === category);
  return config?.icon || '❓';
}
