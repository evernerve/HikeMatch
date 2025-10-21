/**
 * Text Parser for AI-Generated Structured Data
 * 
 * Parses key-value formatted text from AI responses into structured data
 * that matches our category interfaces.
 */

import type { CategoryType, TVData, RestaurantData, HikeData, MovieData } from '../types/categories';

export interface ParseResult<T> {
  success: boolean;
  data: Partial<T>;
  missing: string[];
  errors: string[];
  warnings: string[];
}

/**
 * Extract a single field value from text using regex
 */
function extractField(text: string, fieldName: string): string | null {
  // Create flexible regex that handles variations:
  // "FIELD_NAME: value", "Field Name: value", "field_name:value", etc.
  const pattern = new RegExp(`^${fieldName}\\s*:\\s*(.+)$`, 'im');
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

/**
 * Parse comma-separated values into array
 */
function parseArray(value: string | null): string[] {
  if (!value || value.toLowerCase() === 'unknown') return [];
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Parse integer value
 */
function parseInt(value: string | null): number | undefined {
  if (!value || value.toLowerCase() === 'unknown') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : Math.floor(num);
}

/**
 * Parse year with validation
 */
function parseYear(value: string | null): number | undefined {
  const year = parseInt(value);
  if (!year) return undefined;
  
  const currentYear = new Date().getFullYear();
  if (year < 1928 || year > currentYear + 5) {
    return undefined; // Invalid year
  }
  
  return year;
}

/**
 * Generate a stock image URL for TV shows
 */
function getStockTVImage(): string {
  // Use a generic TV show placeholder from a reliable source
  // Picsum for random images, or use a specific placeholder service
  const stockImages = [
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&auto=format&fit=crop', // TV screen
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop', // Netflix
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop', // Cinema
  ];
  
  // Return a random stock image
  return stockImages[Math.floor(Math.random() * stockImages.length)];
}

/**
 * Parse TV show data from key-value formatted text
 */
export function parseTVShow(text: string): ParseResult<TVData> {
  const result: ParseResult<TVData> = {
    success: false,
    data: {},
    missing: [],
    errors: [],
    warnings: []
  };

  // Extract all fields
  const name = extractField(text, 'NAME');
  const startYearStr = extractField(text, 'START_YEAR');
  const endYearStr = extractField(text, 'END_YEAR');
  const statusStr = extractField(text, 'STATUS');
  const seasonsStr = extractField(text, 'SEASONS');
  const episodesStr = extractField(text, 'EPISODES');
  const genresStr = extractField(text, 'GENRES');
  const creator = extractField(text, 'CREATOR');
  const castStr = extractField(text, 'CAST');
  const plot = extractField(text, 'PLOT');
  const network = extractField(text, 'NETWORK');
  const imageUrl = extractField(text, 'IMAGE_URL');

  // Parse and validate name (required)
  if (!name || name.toLowerCase() === 'unknown') {
    result.errors.push('Name is required');
  } else {
    result.data.title = name;
  }

  // Parse start year
  const startYear = parseYear(startYearStr);
  if (startYear) {
    result.data.startYear = startYear;
  } else {
    // Default to current year if not provided
    result.data.startYear = new Date().getFullYear();
    result.warnings.push('Start year not provided, using current year');
  }

  // Parse end year (optional)
  const endYear = parseYear(endYearStr);
  if (endYear) {
    result.data.endYear = endYear;
    
    // Validate end year is after start year
    if (startYear && endYear < startYear) {
      result.warnings.push('End year is before start year');
    }
  }

  // Parse status
  if (statusStr) {
    const status = statusStr.toLowerCase();
    if (status === 'ongoing' || status === 'ended' || status === 'cancelled') {
      result.data.status = status as 'ongoing' | 'ended' | 'cancelled';
    } else {
      result.warnings.push(`Invalid status: ${statusStr}. Using "ongoing" as default.`);
      result.data.status = 'ongoing';
    }
  } else {
    // Default status
    result.data.status = 'ongoing';
  }

  // Parse seasons
  const seasons = parseInt(seasonsStr);
  if (seasons !== undefined && seasons > 0) {
    result.data.seasons = seasons;
  } else {
    // Default to 1 season
    result.data.seasons = 1;
    if (seasonsStr && seasonsStr.toLowerCase() !== 'unknown') {
      result.warnings.push('Invalid seasons format, using default value');
    }
  }

  // Parse episodes
  const episodes = parseInt(episodesStr);
  if (episodes !== undefined && episodes > 0) {
    result.data.episodes = episodes;
  } else {
    // Default to 10 episodes
    result.data.episodes = 10;
    if (episodesStr && episodesStr.toLowerCase() !== 'unknown') {
      result.warnings.push('Invalid episodes format, using default value');
    }
  }

  // Parse genres
  const genres = parseArray(genresStr);
  if (genres.length > 0) {
    result.data.genres = genres;
  } else {
    // Default genre
    result.data.genres = ['Drama'];
    result.warnings.push('No genres provided, using default');
  }

  // Parse creator
  if (creator && creator.toLowerCase() !== 'unknown') {
    result.data.creator = creator;
  } else {
    result.data.creator = 'Unknown Creator';
  }

  // Parse cast
  const cast = parseArray(castStr);
  if (cast.length > 0) {
    result.data.cast = cast;
  } else {
    result.data.cast = [];
  }

  // Parse plot
  if (plot && plot.toLowerCase() !== 'unknown') {
    result.data.plot = plot;
  } else {
    result.data.plot = 'No plot summary available';
  }

  // Parse network
  if (network && network.toLowerCase() !== 'unknown') {
    result.data.network = network;
  } else {
    result.data.network = 'Unknown Network';
  }

  // Handle image URL - use stock image if not provided
  // Note: imageUrl will be used for the SwipeItem.image field, not stored in TVData
  let parsedImageUrl = '';
  if (imageUrl && imageUrl.toLowerCase() !== 'unknown' && imageUrl.trim() !== '') {
    // Validate URL format
    try {
      new URL(imageUrl);
      parsedImageUrl = imageUrl;
    } catch {
      result.warnings.push('Invalid image URL format. Using stock image.');
      parsedImageUrl = getStockTVImage();
    }
  } else {
    parsedImageUrl = getStockTVImage();
    result.warnings.push('No image URL provided. Using stock image.');
  }
  
  // Store imageUrl in data for later use (we'll handle it in the component)
  (result.data as any).imageUrl = parsedImageUrl;

  // Add required fields with sensible defaults
  // These fields are required by TVData interface but not extracted from AI
  if (result.data.title) {
    result.data.rating = 0; // Default rating (can be updated later)
    result.data.voteCount = 0; // Default vote count
    result.data.tmdbId = 0; // Placeholder (ideally would be fetched from TMDB API)
  }

  // Check for missing optional fields (for user awareness)
  const optionalFields = [
    { key: 'startYear', label: 'Start Year' },
    { key: 'status', label: 'Status' },
    { key: 'seasons', label: 'Seasons' },
    { key: 'episodes', label: 'Episodes' },
    { key: 'genres', label: 'Genres' },
    { key: 'creator', label: 'Creator' },
    { key: 'cast', label: 'Cast' },
    { key: 'plot', label: 'Plot' },
    { key: 'network', label: 'Network' }
  ];

  for (const field of optionalFields) {
    if (!result.data[field.key as keyof TVData]) {
      result.missing.push(field.label);
    }
  }

  // Set success flag
  result.success = result.errors.length === 0 && result.data.title !== undefined;

  return result;
}

/**
 * Parse float value
 */
function parseFloat(value: string | null): number | undefined {
  if (!value || value.toLowerCase() === 'unknown') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Parse price range
 */
function parsePriceRange(value: string | null): '€' | '€€' | '€€€' | '€€€€' {
  if (!value) return '€€'; // Default to moderate
  
  const cleaned = value.trim();
  if (cleaned === '€' || cleaned === '€€' || cleaned === '€€€' || cleaned === '€€€€') {
    return cleaned as '€' | '€€' | '€€€' | '€€€€';
  }
  
  // Default to moderate if invalid
  return '€€';
}

/**
 * Generate a stock image URL for restaurants
 */
function getStockRestaurantImage(): string {
  const stockImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop', // Restaurant interior
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop', // Restaurant tables
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop', // Fine dining
  ];
  
  return stockImages[Math.floor(Math.random() * stockImages.length)];
}

/**
 * Parse restaurant data from key-value formatted text
 */
export function parseRestaurant(text: string): ParseResult<RestaurantData> {
  const result: ParseResult<RestaurantData> = {
    success: false,
    data: {},
    missing: [],
    errors: [],
    warnings: []
  };

  // Extract all fields
  const name = extractField(text, 'NAME');
  const cuisineStr = extractField(text, 'CUISINE');
  const priceRangeStr = extractField(text, 'PRICE_RANGE');
  const location = extractField(text, 'LOCATION');
  const address = extractField(text, 'ADDRESS');
  const ratingStr = extractField(text, 'RATING');
  const reviewCountStr = extractField(text, 'REVIEW_COUNT');
  const phone = extractField(text, 'PHONE');
  const website = extractField(text, 'WEBSITE');
  const hours = extractField(text, 'HOURS');
  const specialtiesStr = extractField(text, 'SPECIALTIES');
  const dietaryOptionsStr = extractField(text, 'DIETARY_OPTIONS');
  const ambianceStr = extractField(text, 'AMBIANCE');
  const description = extractField(text, 'DESCRIPTION');
  const imageUrl = extractField(text, 'IMAGE_URL');

  // Parse and validate name (required)
  if (!name || name.toLowerCase() === 'unknown') {
    result.errors.push('Name is required');
  } else {
    result.data.restaurantName = name;
  }

  // Parse cuisine (required, array)
  const cuisine = parseArray(cuisineStr);
  if (cuisine.length > 0) {
    result.data.cuisine = cuisine;
  } else {
    result.data.cuisine = ['International'];
    result.warnings.push('No cuisine provided, using default');
  }

  // Parse price range
  result.data.priceRange = parsePriceRange(priceRangeStr);
  if (!priceRangeStr) {
    result.warnings.push('No price range provided, using default (€€)');
  }

  // Parse location
  if (location && location.toLowerCase() !== 'unknown') {
    result.data.location = location;
  } else {
    result.data.location = 'Unknown Location';
    result.warnings.push('Location not provided');
  }

  // Parse address
  if (address && address.toLowerCase() !== 'unknown') {
    result.data.address = address;
  } else {
    result.data.address = 'Address not available';
    result.warnings.push('Address not provided');
  }

  // Parse rating (0-5)
  const rating = parseFloat(ratingStr);
  if (rating !== undefined && rating >= 0 && rating <= 5) {
    result.data.rating = rating;
  } else {
    result.data.rating = 4.0; // Default to 4.0
    if (ratingStr && ratingStr.toLowerCase() !== 'unknown') {
      result.warnings.push('Invalid rating format (must be 0-5), using default');
    }
  }

  // Parse review count
  const reviewCount = parseInt(reviewCountStr);
  if (reviewCount !== undefined && reviewCount >= 0) {
    result.data.reviewCount = reviewCount;
  } else {
    result.data.reviewCount = 0;
  }

  // Parse phone (optional)
  if (phone && phone.toLowerCase() !== 'unknown') {
    result.data.phone = phone;
  }

  // Parse website (optional)
  if (website && website.toLowerCase() !== 'unknown') {
    // Validate URL format
    try {
      new URL(website);
      result.data.website = website;
    } catch {
      result.warnings.push('Invalid website URL format');
    }
  }

  // Parse hours (optional)
  if (hours && hours.toLowerCase() !== 'unknown') {
    result.data.hours = hours;
  }

  // Parse specialties (required, array)
  const specialties = parseArray(specialtiesStr);
  if (specialties.length > 0) {
    result.data.specialties = specialties;
  } else {
    result.data.specialties = [];
    result.warnings.push('No specialties provided');
  }

  // Parse dietary options (array)
  const dietaryOptions = parseArray(dietaryOptionsStr);
  if (dietaryOptions.length > 0) {
    result.data.dietaryOptions = dietaryOptions;
  } else {
    result.data.dietaryOptions = [];
  }

  // Parse ambiance (array)
  const ambiance = parseArray(ambianceStr);
  if (ambiance.length > 0) {
    result.data.ambiance = ambiance;
  } else {
    result.data.ambiance = ['Casual'];
    result.warnings.push('No ambiance provided, using default');
  }

  // Handle image URL - use stock image if not provided
  let parsedImageUrl = '';
  if (imageUrl && imageUrl.toLowerCase() !== 'unknown' && imageUrl.trim() !== '') {
    try {
      new URL(imageUrl);
      parsedImageUrl = imageUrl;
    } catch {
      result.warnings.push('Invalid image URL format. Using stock image.');
      parsedImageUrl = getStockRestaurantImage();
    }
  } else {
    parsedImageUrl = getStockRestaurantImage();
    result.warnings.push('No image URL provided. Using stock image.');
  }
  
  // Store imageUrl and description for later use
  (result.data as any).imageUrl = parsedImageUrl;
  (result.data as any).description = description || 'No description available';

  // Check for missing optional fields
  const optionalFields = [
    { key: 'phone', label: 'Phone' },
    { key: 'website', label: 'Website' },
    { key: 'hours', label: 'Hours' }
  ];

  for (const field of optionalFields) {
    if (!result.data[field.key as keyof RestaurantData]) {
      result.missing.push(field.label);
    }
  }

  // Set success flag
  result.success = result.errors.length === 0 && result.data.restaurantName !== undefined;

  return result;
}

/**
 * Parse difficulty level
 */
function parseDifficulty(value: string | null): 'easy' | 'moderate' | 'difficult' {
  if (!value) return 'moderate'; // Default
  
  const cleaned = value.toLowerCase().trim();
  if (cleaned === 'easy' || cleaned === 'moderate' || cleaned === 'difficult') {
    return cleaned as 'easy' | 'moderate' | 'difficult';
  }
  
  // Try to match partial strings
  if (cleaned.includes('easy')) return 'easy';
  if (cleaned.includes('difficult') || cleaned.includes('hard') || cleaned.includes('challenging')) return 'difficult';
  
  return 'moderate'; // Default
}

/**
 * Generate a stock image URL for hiking trails
 */
function getStockHikeImage(): string {
  const stockImages = [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop', // Mountain trail
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop', // Alpine peak
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop', // Mountain landscape
  ];
  
  return stockImages[Math.floor(Math.random() * stockImages.length)];
}

/**
 * Parse hiking trail data from key-value formatted text
 */
export function parseHike(text: string): ParseResult<HikeData> {
  const result: ParseResult<HikeData> = {
    success: false,
    data: {},
    missing: [],
    errors: [],
    warnings: []
  };

  // Extract all fields
  const name = extractField(text, 'NAME');
  const lengthKmStr = extractField(text, 'LENGTH_KM');
  const durationHoursStr = extractField(text, 'DURATION_HOURS');
  const difficultyStr = extractField(text, 'DIFFICULTY');
  const elevationGainMStr = extractField(text, 'ELEVATION_GAIN_M');
  const location = extractField(text, 'LOCATION');
  const distanceFromMunichKmStr = extractField(text, 'DISTANCE_FROM_MUNICH_KM');
  const publicTransportTimeStr = extractField(text, 'PUBLIC_TRANSPORT_TIME');
  const scenery = extractField(text, 'SCENERY');
  const pathType = extractField(text, 'PATH_TYPE');
  const specialFeature = extractField(text, 'SPECIAL_FEATURE');
  const detailedDescription = extractField(text, 'DETAILED_DESCRIPTION');
  const highlightsStr = extractField(text, 'HIGHLIGHTS');
  const description = extractField(text, 'DESCRIPTION');
  const imageUrl = extractField(text, 'IMAGE_URL');

  // Note: 'name' is used for SwipeItem.name, not stored in HikeData
  if (!name || name.toLowerCase() === 'unknown') {
    result.errors.push('Name is required');
  }

  // Parse length in km
  const lengthKm = parseFloat(lengthKmStr);
  if (lengthKm !== undefined && lengthKm > 0) {
    result.data.lengthKm = lengthKm;
  } else {
    result.data.lengthKm = 5.0; // Default
    result.warnings.push('Length not provided, using default (5 km)');
  }

  // Parse duration in hours
  const durationHours = parseFloat(durationHoursStr);
  if (durationHours !== undefined && durationHours > 0) {
    result.data.durationHours = durationHours;
  } else {
    result.data.durationHours = 2.0; // Default
    result.warnings.push('Duration not provided, using default (2 hours)');
  }

  // Parse difficulty
  result.data.difficulty = parseDifficulty(difficultyStr);
  if (!difficultyStr) {
    result.warnings.push('Difficulty not provided, using default (moderate)');
  }

  // Parse elevation gain
  const elevationGainM = parseInt(elevationGainMStr);
  if (elevationGainM !== undefined && elevationGainM >= 0) {
    result.data.elevationGainM = elevationGainM;
  } else {
    result.data.elevationGainM = 300; // Default
    result.warnings.push('Elevation gain not provided, using default (300m)');
  }

  // Parse location
  if (location && location.toLowerCase() !== 'unknown') {
    result.data.location = location;
  } else {
    result.data.location = 'Bavaria, Germany';
    result.warnings.push('Location not provided, using default');
  }

  // Parse distance from Munich
  const distanceFromMunichKm = parseInt(distanceFromMunichKmStr);
  if (distanceFromMunichKm !== undefined && distanceFromMunichKm >= 0) {
    result.data.distanceFromMunichKm = distanceFromMunichKm;
  } else {
    result.data.distanceFromMunichKm = 50; // Default
    result.warnings.push('Distance from Munich not provided, using default (50 km)');
  }

  // Parse public transport time
  const publicTransportTime = parseInt(publicTransportTimeStr);
  if (publicTransportTime !== undefined && publicTransportTime >= 0) {
    result.data.publicTransportTime = publicTransportTime;
  } else {
    result.data.publicTransportTime = 90; // Default
    result.warnings.push('Public transport time not provided, using default (90 min)');
  }

  // Parse scenery
  if (scenery && scenery.toLowerCase() !== 'unknown') {
    result.data.scenery = scenery;
  } else {
    result.data.scenery = 'Mountain views, Forest';
    result.warnings.push('Scenery not provided, using default');
  }

  // Parse path type
  if (pathType && pathType.toLowerCase() !== 'unknown') {
    result.data.pathType = pathType;
  } else {
    result.data.pathType = 'Well-maintained trail';
    result.warnings.push('Path type not provided, using default');
  }

  // Parse special feature (optional)
  if (specialFeature && specialFeature.toLowerCase() !== 'unknown') {
    result.data.specialFeature = specialFeature;
  }

  // Parse detailed description (optional)
  if (detailedDescription && detailedDescription.toLowerCase() !== 'unknown') {
    result.data.detailedDescription = detailedDescription;
  }

  // Parse highlights (optional array)
  const highlights = parseArray(highlightsStr);
  if (highlights.length > 0) {
    result.data.highlights = highlights;
  }

  // Handle image URL - use stock image if not provided
  let parsedImageUrl = '';
  if (imageUrl && imageUrl.toLowerCase() !== 'unknown' && imageUrl.trim() !== '') {
    try {
      new URL(imageUrl);
      parsedImageUrl = imageUrl;
    } catch {
      result.warnings.push('Invalid image URL format. Using stock image.');
      parsedImageUrl = getStockHikeImage();
    }
  } else {
    parsedImageUrl = getStockHikeImage();
    result.warnings.push('No image URL provided. Using stock image.');
  }
  
  // Store imageUrl, name, and description for later use
  (result.data as any).imageUrl = parsedImageUrl;
  (result.data as any).name = name || 'Unknown Trail';
  (result.data as any).description = description || 'No description available';

  // Check for missing optional fields
  const optionalFields = [
    { key: 'specialFeature', label: 'Special Feature' },
    { key: 'detailedDescription', label: 'Detailed Description' },
    { key: 'highlights', label: 'Highlights' }
  ];

  for (const field of optionalFields) {
    if (!result.data[field.key as keyof HikeData]) {
      result.missing.push(field.label);
    }
  }

  // Set success flag
  result.success = result.errors.length === 0 && name !== undefined;

  return result;
}

/**
 * Generate a stock image URL for movies
 */
function getStockMovieImage(): string {
  const stockImages = [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop', // Cinema
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop', // Movie theater
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop', // Film
  ];
  
  return stockImages[Math.floor(Math.random() * stockImages.length)];
}

/**
 * Parse movie data from key-value formatted text
 */
export function parseMovie(text: string): ParseResult<MovieData> {
  const result: ParseResult<MovieData> = {
    success: false,
    data: {},
    missing: [],
    errors: [],
    warnings: []
  };

  // Extract all fields
  const name = extractField(text, 'NAME');
  const yearStr = extractField(text, 'YEAR');
  const runtimeStr = extractField(text, 'RUNTIME');
  const genresStr = extractField(text, 'GENRES');
  const director = extractField(text, 'DIRECTOR');
  const castStr = extractField(text, 'CAST');
  const ratingStr = extractField(text, 'RATING');
  const voteCountStr = extractField(text, 'VOTE_COUNT');
  const plot = extractField(text, 'PLOT');
  const language = extractField(text, 'LANGUAGE');
  const country = extractField(text, 'COUNTRY');
  const awards = extractField(text, 'AWARDS');
  const streamingPlatformsStr = extractField(text, 'STREAMING_PLATFORMS');
  const tmdbIdStr = extractField(text, 'TMDB_ID');
  const imageUrl = extractField(text, 'IMAGE_URL');

  // Parse and validate title (required)
  if (!name || name.toLowerCase() === 'unknown') {
    result.errors.push('Title is required');
  } else {
    result.data.title = name;
  }

  // Parse year
  const year = parseYear(yearStr);
  if (year) {
    result.data.year = year;
  } else {
    // Default to current year if not provided
    result.data.year = new Date().getFullYear();
    result.warnings.push('Year not provided, using current year');
  }

  // Parse runtime in minutes
  const runtime = parseInt(runtimeStr);
  if (runtime !== undefined && runtime > 0) {
    result.data.runtime = runtime;
  } else {
    result.data.runtime = 120; // Default 2 hours
    result.warnings.push('Runtime not provided, using default (120 min)');
  }

  // Parse genres
  const genres = parseArray(genresStr);
  if (genres.length > 0) {
    result.data.genres = genres;
  } else {
    result.data.genres = ['Drama'];
    result.warnings.push('No genres provided, using default');
  }

  // Parse director
  if (director && director.toLowerCase() !== 'unknown') {
    result.data.director = director;
  } else {
    result.data.director = 'Unknown Director';
    result.warnings.push('Director not provided');
  }

  // Parse cast
  const cast = parseArray(castStr);
  if (cast.length > 0) {
    result.data.cast = cast;
  } else {
    result.data.cast = [];
    result.warnings.push('No cast provided');
  }

  // Parse rating (0-10)
  const rating = parseFloat(ratingStr);
  if (rating !== undefined && rating >= 0 && rating <= 10) {
    result.data.rating = rating;
  } else {
    result.data.rating = 7.0; // Default rating
    if (ratingStr && ratingStr.toLowerCase() !== 'unknown') {
      result.warnings.push('Invalid rating format (must be 0-10), using default');
    }
  }

  // Parse vote count
  const voteCount = parseInt(voteCountStr);
  if (voteCount !== undefined && voteCount >= 0) {
    result.data.voteCount = voteCount;
  } else {
    result.data.voteCount = 0;
  }

  // Parse plot
  if (plot && plot.toLowerCase() !== 'unknown') {
    result.data.plot = plot;
  } else {
    result.data.plot = 'No plot summary available';
    result.warnings.push('Plot not provided');
  }

  // Parse language
  if (language && language.toLowerCase() !== 'unknown') {
    result.data.language = language;
  } else {
    result.data.language = 'English';
    result.warnings.push('Language not provided, using default (English)');
  }

  // Parse country
  if (country && country.toLowerCase() !== 'unknown') {
    result.data.country = country;
  } else {
    result.data.country = 'United States';
    result.warnings.push('Country not provided, using default (United States)');
  }

  // Parse awards (optional)
  if (awards && awards.toLowerCase() !== 'unknown') {
    result.data.awards = awards;
  }

  // Parse streaming platforms (optional array)
  const streamingPlatforms = parseArray(streamingPlatformsStr);
  if (streamingPlatforms.length > 0) {
    result.data.streamingPlatforms = streamingPlatforms;
  }

  // Parse TMDB ID
  const tmdbId = parseInt(tmdbIdStr);
  if (tmdbId !== undefined && tmdbId > 0) {
    result.data.tmdbId = tmdbId;
  } else {
    result.data.tmdbId = 0; // Placeholder
  }

  // Handle image URL - use stock image if not provided
  let parsedImageUrl = '';
  if (imageUrl && imageUrl.toLowerCase() !== 'unknown' && imageUrl.trim() !== '') {
    try {
      new URL(imageUrl);
      parsedImageUrl = imageUrl;
    } catch {
      result.warnings.push('Invalid image URL format. Using stock image.');
      parsedImageUrl = getStockMovieImage();
    }
  } else {
    parsedImageUrl = getStockMovieImage();
    result.warnings.push('No image URL provided. Using stock image.');
  }
  
  // Store imageUrl for later use (we'll handle it in the component)
  (result.data as any).imageUrl = parsedImageUrl;

  // Check for missing optional fields
  const optionalFields = [
    { key: 'awards', label: 'Awards' },
    { key: 'streamingPlatforms', label: 'Streaming Platforms' }
  ];

  for (const field of optionalFields) {
    if (!result.data[field.key as keyof MovieData]) {
      result.missing.push(field.label);
    }
  }

  // Set success flag
  result.success = result.errors.length === 0 && result.data.title !== undefined;

  return result;
}

/**
 * Main parser function that routes to category-specific parsers
 */
export function parseText(text: string, category: CategoryType): ParseResult<any> {
  switch (category) {
    case 'tv':
      return parseTVShow(text);
    case 'restaurants':
      return parseRestaurant(text);
    case 'hikes':
      return parseHike(text);
    case 'movies':
      return parseMovie(text);
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

/**
 * Get stock image for a category
 */
export function getStockImage(category: CategoryType): string {
  switch (category) {
    case 'tv':
      return getStockTVImage();
    case 'movies':
      return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop';
    case 'hikes':
      return 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop';
    case 'restaurants':
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&auto=format&fit=crop';
  }
}
