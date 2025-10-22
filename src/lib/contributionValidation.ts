/**
 * Validation utilities for user-contributed items
 */

import { CategoryType, HikeData, MovieData, TVData, RestaurantData } from '../types/categories';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

/**
 * Validates image URL
 */
export const validateImageURL = (url: string): { valid: boolean; message?: string } => {
  if (!url || url.trim().length === 0) {
    return { valid: false, message: 'Image URL is required' };
  }

  // Check if it's a valid URL
  try {
    const urlObj = new URL(url);
    
    // Trusted image domains (expanded list)
    const trustedDomains = [
      // Movie/TV databases
      'image.tmdb.org',
      'themoviedb.org',
      'imdb.com',
      'm.media-amazon.com',
      
      // Image hosting services
      'imgur.com',
      'i.imgur.com',
      
      // Stock photo sites
      'unsplash.com',
      'images.unsplash.com',
      'pexels.com',
      'images.pexels.com',
      'pixabay.com',
      'cdn.pixabay.com',
      
      // Wikipedia/Wikimedia
      'wikimedia.org',
      'upload.wikimedia.org',
      
      // CDNs and cloud storage
      'cloudinary.com',
      'res.cloudinary.com',
      'googleusercontent.com',
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      
      // Restaurant/food sites
      'yelp.com',
      's3-media',
      'tripadvisor.com',
      'foursquare.com',
      
      // General CDNs
      'cloudfront.net',
      'akamaized.net',
      'fastly.net',
      'jsdelivr.net',
      'cdninstagram.com',
      
      // Social media (for public images)
      'fbcdn.net',
      'twimg.com'
    ];

    const isTrustedDomain = trustedDomains.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    );
    
    if (isTrustedDomain) {
      return { valid: true };
    }

    // Check for image extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => 
      urlObj.pathname.toLowerCase().endsWith(ext)
    );

    if (hasImageExtension) {
      return { valid: true };
    }

    return { 
      valid: false, 
      message: 'Please use a direct image URL (ending in .jpg, .png, etc.) or a URL from a trusted image host' 
    };
  } catch (e) {
    return { valid: false, message: 'Please enter a valid URL' };
  }
};

/**
 * Validates common fields across all categories
 */
export const validateCommonFields = (
  name: string,
  image: string,
  description: string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 200) {
    errors.name = 'Name must be less than 200 characters';
  }

  const imageValidation = validateImageURL(image);
  if (!imageValidation.valid) {
    errors.image = imageValidation.message || 'Invalid image URL';
  }

  if (!description || description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  return errors;
};

/**
 * Validates hike data
 */
export const validateHikeData = (data: Partial<HikeData>): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // All fields are now optional - just validate if provided
  if (data.lengthKm !== undefined && data.lengthKm <= 0) {
    errors.lengthKm = 'Length must be greater than 0';
  } else if (data.lengthKm && data.lengthKm > 100) {
    warnings.lengthKm = 'That\'s a very long hike! Please double-check.';
  }

  if (data.durationHours !== undefined && data.durationHours <= 0) {
    errors.durationHours = 'Duration must be greater than 0';
  } else if (data.durationHours && data.durationHours > 24) {
    warnings.durationHours = 'Duration seems very long. Is this a multi-day hike?';
  }

  if (data.elevationGainM !== undefined && data.elevationGainM < 0) {
    errors.elevationGainM = 'Elevation gain cannot be negative';
  } else if (data.elevationGainM && data.elevationGainM > 3000) {
    warnings.elevationGainM = 'That\'s a serious climb! Please verify.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
};

/**
 * Validates movie data
 */
export const validateMovieData = (data: Partial<MovieData>): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // All fields optional - just validate format if provided
  if (data.year !== undefined && (data.year < 1888 || data.year > new Date().getFullYear() + 2)) {
    errors.year = `Year must be between 1888 and ${new Date().getFullYear() + 2}`;
  }

  if (data.runtime !== undefined && data.runtime <= 0) {
    errors.runtime = 'Runtime must be greater than 0';
  } else if (data.runtime && data.runtime < 40) {
    warnings.runtime = 'That\'s quite short for a feature film';
  } else if (data.runtime && data.runtime > 300) {
    warnings.runtime = 'That\'s very long! Please double-check.';
  }

  if (data.genres && data.genres.length > 5) {
    warnings.genres = 'Consider limiting to the main 3-5 genres';
  }

  if (data.plot && data.plot.trim().length > 0 && data.plot.trim().length < 20) {
    errors.plot = 'Plot summary should be at least 20 characters if provided';
  }

  if (data.rating !== undefined && (data.rating < 0 || data.rating > 10)) {
    errors.rating = 'Rating must be between 0 and 10';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
};

/**
 * Validates TV show data
 */
export const validateTVData = (data: Partial<TVData>): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // All fields optional - just validate format if provided
  if (data.startYear !== undefined && (data.startYear < 1928 || data.startYear > new Date().getFullYear() + 1)) {
    errors.startYear = `Start year must be between 1928 and ${new Date().getFullYear() + 1}`;
  }

  if (data.endYear && data.startYear && data.endYear < data.startYear) {
    errors.endYear = 'End year cannot be before start year';
  }

  if (data.seasons !== undefined && data.seasons <= 0) {
    errors.seasons = 'Number of seasons must be greater than 0';
  } else if (data.seasons && data.seasons > 50) {
    warnings.seasons = 'That\'s a lot of seasons! Please verify.';
  }

  if (data.episodes !== undefined && data.episodes <= 0) {
    errors.episodes = 'Number of episodes must be greater than 0';
  } else if (data.episodes && data.episodes > 1000) {
    warnings.episodes = 'That\'s a lot of episodes! Please verify.';
  }

  if (data.plot && data.plot.trim().length > 0 && data.plot.trim().length < 20) {
    errors.plot = 'Plot summary should be at least 20 characters if provided';
  }

  if (data.rating !== undefined && (data.rating < 0 || data.rating > 10)) {
    errors.rating = 'Rating must be between 0 and 10';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
};

/**
 * Validates restaurant data
 */
export const validateRestaurantData = (data: Partial<RestaurantData>): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // All fields optional - just validate format if provided
  if (data.cuisine && data.cuisine.length > 5) {
    warnings.cuisine = 'Consider limiting to the main cuisine types';
  }

  if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
    errors.rating = 'Rating must be between 0 and 5';
  }

  // Validate phone number format if provided
  if (data.phone && data.phone.trim().length > 0) {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
  }

  // Validate website URL if provided
  if (data.website && data.website.trim().length > 0) {
    try {
      new URL(data.website);
    } catch (e) {
      errors.website = 'Please enter a valid website URL';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
};

/**
 * Main validation function that routes to category-specific validators
 */
export const validateContribution = (
  category: CategoryType,
  name: string,
  image: string,
  description: string,
  categoryData: any
): ValidationResult => {
  // Validate common fields
  const commonErrors = validateCommonFields(name, image, description);
  
  // Validate category-specific data
  let categoryValidation: ValidationResult;
  
  switch (category) {
    case 'hikes':
      categoryValidation = validateHikeData(categoryData);
      break;
    case 'movies':
      categoryValidation = validateMovieData(categoryData);
      break;
    case 'tv':
      categoryValidation = validateTVData(categoryData);
      break;
    case 'restaurants':
      categoryValidation = validateRestaurantData(categoryData);
      break;
    default:
      categoryValidation = { valid: false, errors: { category: 'Invalid category' } };
  }

  return {
    valid: Object.keys(commonErrors).length === 0 && categoryValidation.valid,
    errors: { ...commonErrors, ...categoryValidation.errors },
    warnings: categoryValidation.warnings
  };
};

/**
 * Rate limiting check - prevents spam
 */
export const checkRateLimit = (category: CategoryType): { allowed: boolean; waitTime?: number } => {
  const key = `lastContribution_${category}`;
  const lastContribution = localStorage.getItem(key);
  
  if (!lastContribution) {
    return { allowed: true };
  }

  const lastTime = parseInt(lastContribution, 10);
  const now = Date.now();
  const cooldownMs = 5 * 60 * 1000; // 5 minutes
  const timeSinceLastContribution = now - lastTime;

  if (timeSinceLastContribution < cooldownMs) {
    const waitTime = Math.ceil((cooldownMs - timeSinceLastContribution) / 1000 / 60);
    return { allowed: false, waitTime };
  }

  return { allowed: true };
};

/**
 * Update rate limit timestamp
 */
export const updateRateLimit = (category: CategoryType): void => {
  const key = `lastContribution_${category}`;
  localStorage.setItem(key, Date.now().toString());
};
