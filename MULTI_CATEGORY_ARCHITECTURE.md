# Multi-Category Architecture Plan

## Overview
Transform HikeMatch into SwipeMatch - a multi-category matching platform supporting Hikes, Movies, TV Shows, and Restaurants.

## Data Architecture

### Generic Base Interface
```typescript
interface SwipeItem {
  id: string;
  category: CategoryType;
  name: string;  // Universal field
  image: string;  // Universal field
  description: string;  // Universal field
  categoryData: HikeData | MovieData | TVData | RestaurantData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type CategoryType = 'hikes' | 'movies' | 'tv' | 'restaurants';
```

### Category-Specific Data

#### HikeData
```typescript
interface HikeData {
  lengthKm: number;
  durationHours: number;
  difficulty: 'easy' | 'moderate' | 'hard';
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
```

#### MovieData
```typescript
interface MovieData {
  title: string;
  year: number;
  runtime: number;  // minutes
  genres: string[];
  director: string;
  cast: string[];
  rating: number;  // IMDb rating
  plot: string;
  language: string;
  country: string;
  awards?: string;
  streamingPlatforms?: string[];
  tmdbId?: number;
}
```

#### TVData
```typescript
interface TVData {
  title: string;
  startYear: number;
  endYear?: number;
  status: 'ongoing' | 'ended' | 'cancelled';
  seasons: number;
  episodes: number;
  genres: string[];
  creator: string;
  cast: string[];
  rating: number;
  plot: string;
  network: string;
  streamingPlatforms?: string[];
  tmdbId?: number;
}
```

#### RestaurantData
```typescript
interface RestaurantData {
  restaurantName: string;
  cuisine: string[];
  priceRange: '€' | '€€' | '€€€' | '€€€€';
  location: string;
  address: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  website?: string;
  hours?: string;
  specialties: string[];
  dietaryOptions: string[];  // vegetarian, vegan, gluten-free, etc.
  ambiance: string[];  // casual, romantic, family-friendly, etc.
}
```

### Category Configuration
```typescript
interface CategoryConfig {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
  description: string;
  enabled: boolean;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'hikes',
    name: 'Hiking Trails',
    icon: '🏔️',
    color: 'green',
    description: 'Discover amazing hiking trails',
    enabled: true
  },
  {
    id: 'movies',
    name: 'Movies',
    icon: '🎬',
    color: 'red',
    description: 'Find movies you\'ll love',
    enabled: true
  },
  {
    id: 'tv',
    name: 'TV Shows',
    icon: '📺',
    color: 'purple',
    description: 'Explore TV shows to binge',
    enabled: true
  },
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: '🍽️',
    color: 'orange',
    description: 'Discover great places to eat',
    enabled: true
  }
];
```

## Firebase Collections Structure

```
users/
  {userId}/
    - username
    - email
    - displayName
    - friends[]
    - createdAt

swipes/
  {userId}/
    {category}/
      {itemId}/
        - liked: boolean
        - timestamp

matches/
  {matchId}/  // composite of two userIds + category + itemId
    - user1Id
    - user2Id
    - category
    - itemId
    - timestamp

hikes/
  {hikeId}/
    - name, image, description
    - categoryData: HikeData

movies/
  {movieId}/
    - name, image, description
    - categoryData: MovieData

tv/
  {tvId}/
    - name, image, description
    - categoryData: TVData

restaurants/
  {restaurantId}/
    - name, image, description
    - categoryData: RestaurantData
```

## User Flow

1. **Login** → User authenticates
2. **Category Selection** → User selects a category (Hikes, Movies, TV, Restaurants)
3. **Swipe** → User swipes through items in that category
4. **Matches** → View matches filtered by category
5. **Connections** → View all friends across all categories

## Implementation Phases

### Phase 1: Architecture & Refactoring
- Create generic interfaces
- Refactor firestoreHelpers for multi-category
- Update TypeScript types

### Phase 2: UI Updates
- Add category selector
- Refactor TrailCard → CategoryCard
- Update navigation

### Phase 3: Data Integration
- Integrate TMDb API for movies/TV
- Create restaurant data sources
- Populate initial data

### Phase 4: Testing & Polish
- Test category switching
- Ensure matches work correctly
- Mobile optimization

## API Integrations

### TMDb (The Movie Database)
- **Movies**: `/movie/popular`, `/movie/{id}`
- **TV Shows**: `/tv/popular`, `/tv/{id}`
- **Free tier**: 1000 requests/day
- **Data**: Title, poster, plot, cast, ratings, genres

### Restaurants
- **Option 1**: Manual curation (start with Munich restaurants)
- **Option 2**: Google Places API (paid)
- **Option 3**: Yelp Fusion API (free tier: 500 calls/day)

## Branding Changes

- **Name**: HikeMatch → **SwipeMatch**
- **Tagline**: "Swipe your way to adventure" → "Match your interests, discover together"
- **Logo**: Mountain emoji → Multi-category icon grid
- **Colors**: Keep green-blue gradient but add category-specific colors

## Migration Strategy

1. Keep existing hikes data intact
2. Add new collections (movies, tv, restaurants)
3. Update code to be category-aware
4. Gradual rollout: Start with hikes + movies, then add others

## Next Steps

1. Create TypeScript interfaces in `types.ts`
2. Refactor `firestoreHelpers.ts` for generic categories
3. Create `CategorySelector` component
4. Build `CategoryCard` component with category-specific rendering
5. Integrate TMDb API
6. Update matching logic for categories
