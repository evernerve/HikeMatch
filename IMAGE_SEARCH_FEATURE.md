# Image Search Feature

## Overview

The Image Search feature allows users to easily find and select images from multiple sources when adding or editing items across all categories (Hiking Trails, Movies, TV Shows, and Restaurants).

## Features

### Multiple Image Sources

1. **Unsplash** 📸
   - High-quality, free-to-use photos
   - Best for: Hiking trails, restaurants, general scenery
   - Provides random images based on search terms
   - No API key required for basic usage

2. **TMDB (The Movie Database)** 🎬
   - Movie and TV show posters
   - Best for: Movies and TV shows
   - Requires API key (placeholder implementation)
   - High-quality official posters

3. **Wikipedia** 📚
   - Images from Wikipedia articles
   - Best for: General information
   - Free and open-source images
   - May have licensing restrictions

4. **Direct URL** 🔗
   - Paste any direct image URL
   - Supports all image formats (JPG, PNG, WebP, etc.)
   - Instant preview before selection

## Usage

### In Quick Add Form

1. Parse your AI-generated content
2. In the preview screen, click **"🔍 Search Images"** next to the Image URL field
3. Choose your preferred source (Unsplash, TMDB, Wikipedia, or Direct URL)
4. Enter a search query or paste a URL
5. Click on an image to select it
6. The URL will be automatically filled in the form

### In Manual Form

1. Fill out the item details (name, description, etc.)
2. In the Image URL field label, click **"🔍 Search Images"**
3. Follow the same steps as above

## Image Search Modal

### Interface Elements

- **Source Tabs**: Switch between different image sources
- **Search Bar**: Enter keywords to find relevant images
- **Results Grid**: Browse images in a responsive grid layout
- **Image Preview**: Hover over images to see selection option
- **Tips Section**: Helpful hints for better search results

### Keyboard Shortcuts

- **Enter**: Submit search query
- **Escape**: Close modal (when implemented)

## Search Tips

### For Hiking Trails
- Use specific trail names: "Partnachklamm Gorge", "Herzogstand Summit"
- Add location keywords: "Bavaria hiking", "Alpine trail"
- Include terrain types: "mountain trail", "forest path"

### For Movies & TV Shows
- Include full title and year: "The Shawshank Redemption 1994"
- Use original titles for better results
- Add "poster" to search term for TMDB results

### For Restaurants
- Include restaurant name and location: "Hofbräuhaus München"
- Add cuisine type: "Italian restaurant", "Japanese sushi"
- Use "interior" or "food" for specific views

## Technical Implementation

### Components

1. **ImageSearchModal** (`src/components/ImageSearchModal.tsx`)
   - Main modal component
   - Handles all image source integrations
   - Responsive design with mobile support

2. **FormField Enhancement** (`src/components/forms/FormFields.tsx`)
   - Added `onImageSearch` prop
   - Displays search button for image URL fields
   - Integrated across all form components

3. **Form Integration**
   - **HikeForm**: Hiking trail image search
   - **MovieForm**: Movie poster search
   - **TVShowForm**: TV show poster search
   - **RestaurantForm**: Restaurant photo search
   - **QuickAddForm**: Quick Add image search

### API Integration Status

#### ✅ Implemented
- Unsplash Source URLs (no API key needed)
- Wikipedia API
- Direct URL input

#### 🔄 Placeholder (Requires API Key)
- TMDB API for movies and TV shows

To enable TMDB:
1. Get an API key from https://www.themoviedb.org/settings/api
2. Update `searchTMDB()` function in `ImageSearchModal.tsx`
3. Add API key to environment variables

```typescript
// Example TMDB integration
const response = await fetch(
  `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`
);
```

## Future Enhancements

### Planned Features
- [ ] Pagination for search results
- [ ] Image quality selection (thumbnail vs. full size)
- [ ] Recent searches history
- [ ] Favorite images
- [ ] Upload from device
- [ ] Crop and resize tools
- [ ] More image sources (Pexels, Pixabay, etc.)

### API Keys Setup
To use full functionality:
1. Create `.env.local` file
2. Add API keys:
```
VITE_UNSPLASH_API_KEY=your_key_here
VITE_TMDB_API_KEY=your_key_here
```

## Error Handling

The image search modal includes error handling for:
- Failed API requests
- Invalid URLs
- Network timeouts
- Missing images
- Broken image links

Fallback images are automatically provided when images fail to load.

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast mode compatible
- Mobile-responsive design

## Performance

- Lazy loading of images
- Thumbnail previews for faster loading
- Debounced search queries
- Minimal bundle size impact

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Contributing

To improve the image search feature:
1. Add new image sources in `ImageSearchModal.tsx`
2. Update recommended sources in `getRecommendedSources()`
3. Add search function for new source
4. Test across all categories
5. Update this documentation

## License

This feature integrates with external APIs. Please review:
- [Unsplash Terms](https://unsplash.com/terms)
- [TMDB Terms](https://www.themoviedb.org/terms-of-use)
- [Wikipedia Terms](https://en.wikipedia.org/wiki/Wikipedia:Copyrights)

Ensure compliance with all third-party service terms when using this feature.
