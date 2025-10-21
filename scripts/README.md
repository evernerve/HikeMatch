# Seeding Scripts

These scripts populate Firestore with sample data for SwipeMatch categories.

## Prerequisites

Make sure your `.env` file has the correct Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Usage

### Seed All Categories at Once
```bash
npm run seed:all
```

This will seed:
- 10 movies
- 10 TV shows
- 10 restaurants

### Seed Individual Categories

**Movies:**
```bash
npm run seed:movies
```

**TV Shows:**
```bash
npm run seed:tv
```

**Restaurants:**
```bash
npm run seed:restaurants
```

## Data Structure

### Movies (`movies` collection)
- 10 popular movies with ratings, cast, directors
- Images from TMDb
- Genres, runtime, streaming platforms

### TV Shows (`tvShows` collection)
- 10 popular series (ongoing and ended)
- Seasons, episodes, creators, cast
- Network and streaming information

### Restaurants (`restaurants` collection)
- 10 Munich restaurants (mix of traditional and modern)
- Cuisine types, price ranges, locations
- Ratings, specialties, dietary options

## Notes

- **Trails/Hikes**: The existing `trails` collection is automatically used for the "hikes" category
- All seed data includes proper categorization for the multi-category system
- Images use placeholder URLs - replace with actual images in production
- Restaurant data is Munich-focused to match the hiking trails location
