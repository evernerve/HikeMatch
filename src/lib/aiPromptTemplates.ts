/**
 * AI Prompt Templates for Quick Add Feature
 * 
 * These templates provide structured prompts that users can copy and paste
 * into any AI assistant (ChatGPT, Claude, Gemini, etc.) to get formatted data
 * that our parser can understand.
 */

import type { CategoryType } from '../types/categories';

export interface PromptTemplate {
  instructions: string;
  formatExample: string;
  fields: string[];
  requiredFields: string[];
}

/**
 * TV Show prompt template
 */
const tvShowTemplate: PromptTemplate = {
  instructions: `Please extract information about this TV show and format it EXACTLY as shown below. Use the exact field names and format. Fill in ALL fields - if you don't know a value, write "Unknown" or make a reasonable estimate.`,
  
  formatExample: `NAME: Breaking Bad
IMAGE_URL: https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg
PLOT: A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future. As he descends into the criminal underworld, he transforms from a mild-mannered educator into a ruthless drug kingpin known as Heisenberg.
START_YEAR: 2008
END_YEAR: 2013
STATUS: ended
SEASONS: 5
EPISODES: 62
GENRES: Crime, Drama, Thriller
CREATOR: Vince Gilligan
CAST: Bryan Cranston, Aaron Paul, Anna Gunn, Dean Norris, Betsy Brandt, RJ Mitte, Bob Odenkirk
NETWORK: AMC
RATING: 9.5

IMPORTANT INSTRUCTIONS:
- Include ALL fields above, in this exact order
- NAME: Full official title of the TV show (REQUIRED)
- IMAGE_URL: Direct link to poster image - use TMDB, IMDB, or official sources (REQUIRED)
- PLOT: Detailed 2-3 sentence description of the show's premise (REQUIRED)
- START_YEAR: 4-digit year the show first aired (REQUIRED)
- END_YEAR: 4-digit year it ended, or leave blank if ongoing (optional)
- STATUS: Must be EXACTLY one of: "ongoing", "ended", or "cancelled" (REQUIRED)
- SEASONS: Total number of seasons as a number (REQUIRED)
- EPISODES: Total number of episodes as a number (REQUIRED)
- GENRES: Comma-separated list of genres (REQUIRED, at least 2 genres)
- CREATOR: Name(s) of show creator(s) (REQUIRED)
- CAST: Comma-separated list of main cast members (REQUIRED, at least 5 actors)
- NETWORK: Original broadcast network or streaming service (REQUIRED)
- RATING: Average rating out of 10 (optional, if known)

Double-check your response includes ALL required fields!`,

  fields: [
    'name',
    'startYear',
    'endYear',
    'status',
    'seasons',
    'episodes',
    'genres',
    'creator',
    'cast',
    'plot',
    'network',
    'imageUrl'
  ],

  requiredFields: ['name'] // Only name is truly required, we'll use stock image if needed
};

/**
 * Restaurant prompt template
 */
const restaurantTemplate: PromptTemplate = {
  instructions: `Please extract information about this restaurant and format it EXACTLY as shown below. Use the exact field names and format. Fill in ALL fields - if you don't know a value, write "Unknown" or make a reasonable estimate.`,
  
  formatExample: `NAME: Hofbräuhaus München
IMAGE_URL: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop
DESCRIPTION: A historic 16th-century beer hall and restaurant serving traditional Bavarian cuisine in a lively, communal atmosphere with live music and the famous Hofbräu beer.
CUISINE: German, Bavarian, European
PRICE_RANGE: €€
LOCATION: Munich City Center
ADDRESS: Platzl 9, 80331 München, Germany
RATING: 4.5
REVIEW_COUNT: 15847
PHONE: +49 89 290136100
WEBSITE: https://www.hofbraeuhaus.de
HOURS: Daily 9:00 AM - 11:30 PM
SPECIALTIES: Schweinshaxe (roasted pork knuckle), Obatzda (Bavarian cheese dip), Weißwurst (white sausage), Brezn (pretzels), Leberkäse
DIETARY_OPTIONS: Vegetarian options available, Limited vegan options
AMBIANCE: Traditional, Lively, Tourist-friendly, Historic, Beer hall atmosphere

IMPORTANT INSTRUCTIONS:
- Include ALL fields above, in this exact order
- NAME: Full official name of the restaurant (REQUIRED)
- IMAGE_URL: Direct link to restaurant photo - use Unsplash food/restaurant images (REQUIRED)
- DESCRIPTION: Detailed 2-3 sentence description of the restaurant, its style, and what makes it special (REQUIRED)
- CUISINE: Comma-separated list of cuisine types (REQUIRED, at least 1 cuisine)
- PRICE_RANGE: Must be EXACTLY one of: "€", "€€", "€€€", or "€€€€" (REQUIRED)
- LOCATION: Neighborhood or area name (REQUIRED)
- ADDRESS: Full street address with city and postal code (REQUIRED)
- RATING: Average rating from 0 to 5 (REQUIRED, use decimals like 4.5)
- REVIEW_COUNT: Number of reviews as integer (REQUIRED)
- PHONE: Phone number with country code (optional)
- WEBSITE: Full website URL (optional)
- HOURS: Operating hours description (optional)
- SPECIALTIES: Comma-separated list of signature dishes (REQUIRED, at least 3 items)
- DIETARY_OPTIONS: Comma-separated dietary accommodations like "Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher" (REQUIRED)
- AMBIANCE: Comma-separated atmosphere descriptors like "Casual", "Romantic", "Family-friendly", "Fine dining", "Trendy" (REQUIRED, at least 2)

Double-check your response includes ALL required fields!`,

  fields: [
    'name',
    'cuisine',
    'priceRange',
    'location',
    'address',
    'rating',
    'reviewCount',
    'phone',
    'website',
    'hours',
    'specialties',
    'dietaryOptions',
    'ambiance',
    'imageUrl'
  ],

  requiredFields: ['name'] // Only name is truly required, we'll use stock image if needed
};

/**
 * Hiking Trail prompt template
 */
const hikeTemplate: PromptTemplate = {
  instructions: `Please extract information about this hiking trail and format it EXACTLY as shown below. Use the exact field names and format. Fill in ALL fields - if you don't know a value, make a reasonable estimate based on the trail type.`,
  
  formatExample: `NAME: Partnachklamm Gorge Trail
IMAGE_URL: https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop
DESCRIPTION: A stunning gorge trail featuring dramatic rock formations, thundering waterfalls, and a walkway carved into the cliff face. The path winds through the narrow Partnach Gorge with spectacular views of the rushing river below.
LENGTH_KM: 6.8
DURATION_HOURS: 3.5
DIFFICULTY: moderate
ELEVATION_GAIN_M: 450
LOCATION: Garmisch-Partenkirchen
DISTANCE_FROM_MUNICH_KM: 90
PUBLIC_TRANSPORT_TIME: 120
SCENERY: Gorge, Waterfalls, Mountain views, Forest
PATH_TYPE: Well-maintained trail, Some steep sections, Metal walkways
SPECIAL_FEATURE: Walk through a dramatic limestone gorge with secured pathways
DETAILED_DESCRIPTION: The Partnachklamm is one of the most impressive gorges in the Bavarian Alps. The trail takes you through a narrow canyon with walls rising up to 80 meters high. Metal walkways and tunnels allow safe passage while water rushes dramatically below. Best visited in summer when the gorge is fully open.
HIGHLIGHTS: Dramatic gorge scenery, Thundering waterfalls, Alpine panorama from the top, Historic Olympic bobsled track nearby

IMPORTANT INSTRUCTIONS:
- Include ALL fields above, in this exact order
- NAME: Full name of the hiking trail or destination (REQUIRED)
- IMAGE_URL: Direct link to trail/scenery photo - use Unsplash hiking/mountain images (REQUIRED)
- DESCRIPTION: Detailed 2-3 sentence overview of what makes this trail special (REQUIRED)
- LENGTH_KM: Total trail length in kilometers as decimal number (REQUIRED)
- DURATION_HOURS: Estimated hiking time in hours as decimal (e.g., 3.5 for 3h 30min) (REQUIRED)
- DIFFICULTY: Must be EXACTLY one of: "easy", "moderate", or "difficult" (REQUIRED)
- ELEVATION_GAIN_M: Total elevation gain in meters as integer (REQUIRED)
- LOCATION: Name of the town/area/region where trail is located (REQUIRED)
- DISTANCE_FROM_MUNICH_KM: Distance from Munich in kilometers as integer (REQUIRED)
- PUBLIC_TRANSPORT_TIME: Travel time from Munich by public transport in minutes as integer (REQUIRED)
- SCENERY: Comma-separated landscape features (REQUIRED, e.g., "Mountain views, Lakes, Forest, Alpine meadows")
- PATH_TYPE: Comma-separated trail characteristics (REQUIRED, e.g., "Well-marked, Rocky, Steep sections")
- SPECIAL_FEATURE: One unique highlight or notable feature of the trail (optional)
- DETAILED_DESCRIPTION: Extended 2-3 sentence description with more details (optional)
- HIGHLIGHTS: Comma-separated list of key attractions along the trail (optional, at least 3 items)

Double-check your response includes ALL required fields!`,

  fields: [
    'name',
    'lengthKm',
    'durationHours',
    'difficulty',
    'elevationGainM',
    'location',
    'distanceFromMunichKm',
    'publicTransportTime',
    'scenery',
    'pathType',
    'specialFeature',
    'detailedDescription',
    'highlights',
    'imageUrl'
  ],

  requiredFields: ['name'] // Only name is truly required, we'll use stock image if needed
};

/**
 * Movie prompt template
 */
const movieTemplate: PromptTemplate = {
  instructions: `Please extract information about this movie and format it EXACTLY as shown below. Use the exact field names and format. Fill in ALL fields - if you don't know a value, write "Unknown" or make a reasonable estimate.`,
  
  formatExample: `NAME: The Shawshank Redemption
IMAGE_URL: https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg
PLOT: Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency. Andy Dufresne, a banker wrongly convicted of murder, befriends Red and uses his financial expertise to help the prison warden, while secretly planning his escape over two decades.
YEAR: 1994
RUNTIME: 142
GENRES: Drama, Crime
DIRECTOR: Frank Darabont
CAST: Tim Robbins, Morgan Freeman, Bob Gunton, William Sadler, Clancy Brown, Gil Bellows, James Whitmore
RATING: 9.3
VOTE_COUNT: 2847000
LANGUAGE: English
COUNTRY: United States
AWARDS: Nominated for 7 Oscars including Best Picture
STREAMING_PLATFORMS: Netflix, Amazon Prime Video, HBO Max
TMDB_ID: 278

IMPORTANT INSTRUCTIONS:
- Include ALL fields above, in this exact order
- NAME: Full official title of the movie (REQUIRED)
- IMAGE_URL: Direct link to movie poster - use TMDB, IMDB, or official sources (REQUIRED)
- PLOT: Detailed 2-3 sentence synopsis of the movie's story (REQUIRED)
- YEAR: Release year as 4-digit number (REQUIRED)
- RUNTIME: Duration in minutes as integer (REQUIRED)
- GENRES: Comma-separated list of genres (REQUIRED, at least 2 genres)
- DIRECTOR: Name of the director (REQUIRED)
- CAST: Comma-separated list of main actors (REQUIRED, at least 5 actors)
- RATING: Average rating from 0 to 10 (REQUIRED, use decimals like 8.5)
- VOTE_COUNT: Number of user ratings as integer (REQUIRED)
- LANGUAGE: Original language of the film (REQUIRED)
- COUNTRY: Country of origin (REQUIRED)
- AWARDS: Major awards won or nominated (optional, e.g., "Won 3 Oscars")
- STREAMING_PLATFORMS: Comma-separated streaming services (optional)
- TMDB_ID: The Movie Database ID as integer (optional, if you know it)

Double-check your response includes ALL required fields!`,

  fields: [
    'title',
    'year',
    'runtime',
    'genres',
    'director',
    'cast',
    'rating',
    'voteCount',
    'plot',
    'language',
    'country',
    'awards',
    'streamingPlatforms',
    'tmdbId',
    'imageUrl'
  ],

  requiredFields: ['title'] // Only title is truly required
};

/**
 * Generate a complete prompt for a specific TV show query
 */
export function generateTVShowPrompt(showName?: string): string {
  const template = tvShowTemplate;
  
  const prompt = `${template.instructions}

${showName ? `Extract information about: "${showName}"` : 'Extract information about the TV show you want to add'}

Format your response EXACTLY like this:

${template.formatExample}`;

  return prompt;
}

/**
 * Generate a complete prompt for a specific restaurant query
 */
export function generateRestaurantPrompt(restaurantName?: string): string {
  const template = restaurantTemplate;
  
  const prompt = `${template.instructions}

${restaurantName ? `Extract information about: "${restaurantName}"` : 'Extract information about the restaurant you want to add'}

Format your response EXACTLY like this:

${template.formatExample}`;

  return prompt;
}

/**
 * Generate a complete prompt for a specific hiking trail query
 */
export function generateHikePrompt(trailName?: string): string {
  const template = hikeTemplate;
  
  const prompt = `${template.instructions}

${trailName ? `Extract information about: "${trailName}"` : 'Extract information about the hiking trail you want to add'}

Format your response EXACTLY like this:

${template.formatExample}`;

  return prompt;
}

/**
 * Generate a complete prompt for a specific movie query
 */
export function generateMoviePrompt(movieName?: string): string {
  const template = movieTemplate;
  
  const prompt = `${template.instructions}

${movieName ? `Extract information about: "${movieName}"` : 'Extract information about the movie you want to add'}

Format your response EXACTLY like this:

${template.formatExample}`;

  return prompt;
}

/**
 * Get the template for a specific category
 */
export function getTemplate(category: CategoryType): PromptTemplate {
  switch (category) {
    case 'tv':
      return tvShowTemplate;
    case 'restaurants':
      return restaurantTemplate;
    case 'hikes':
      return hikeTemplate;
    case 'movies':
      return movieTemplate;
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

/**
 * Check if quick add is available for a category
 */
export function isQuickAddAvailable(category: CategoryType): boolean {
  return category === 'tv' || category === 'restaurants' || category === 'hikes' || category === 'movies';
}
