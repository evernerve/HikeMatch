# Unsplash Image Search Guide

## Quick Fix Applied ✅

The Unsplash image search has been updated to show **curated high-quality images** instead of the deprecated source.unsplash.com API.

## How It Works Now

When you search with Unsplash:
1. Click **"🔍 Search Images"** on any image field
2. Select **UNSPLASH** tab
3. Click **Search** (the query is pre-filled with your item name)
4. You'll see 8 curated nature/outdoor images
5. Click any image to select it

## Why Curated Images?

The old Unsplash Source API (`source.unsplash.com`) has been deprecated. Instead of broken image links, we now show:
- 8 beautiful, high-quality outdoor/nature photos
- Perfect for hiking trails, restaurants, and general use
- Direct Unsplash photo URLs that work reliably
- Images are pre-selected from Unsplash's best collection

## Example Images Shown

The search now displays curated images featuring:
- 🏔️ Mountain landscapes
- 🌲 Forest scenery  
- 🌅 Sunsets and peaks
- 🌿 Nature and outdoor views
- 🏞️ Scenic landscapes

All images are from Unsplash's permanent collection with stable URLs.

## For Specific Images

If you need a **specific image**:

### Option 1: Use Direct URL (Recommended)
1. Go to [unsplash.com](https://unsplash.com)
2. Search for your exact item (e.g., "Hofbräuhaus München", "Partnachklamm")
3. Click on an image you like
4. Right-click → Copy Image Address
5. In your app, click **"🔍 Search Images"** → **DIRECT URL** tab
6. Paste the URL
7. Click **Use URL**

**Example Unsplash URL format:**
```
https://images.unsplash.com/photo-XXXXXXX?w=800&q=80&fit=crop&auto=format
```

### Option 2: Wikipedia
1. Click **"🔍 Search Images"**
2. Select **WIKIPEDIA** tab
3. Enter the exact name (e.g., "Hofbräuhaus")
4. Search will find images from Wikipedia article

### Option 3: Get Unsplash API Key (Advanced)
To enable real Unsplash search:

1. Sign up at [unsplash.com/developers](https://unsplash.com/developers)
2. Create an app to get an Access Key
3. Add to `.env.local`:
   ```
   VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
   ```
4. Update `ImageSearchModal.tsx` line 86:
   ```typescript
   client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}
   ```

## Best Practices

### For Hiking Trails
✅ **Good searches:**
- Search Wikipedia for specific trail names
- Use direct Unsplash URLs for exact locations
- Curated images work great for generic mountain/forest trails

### For Restaurants  
✅ **Good sources:**
- Direct URLs from restaurant websites
- Google Maps/Reviews images (right-click → copy image address)
- Unsplash for general restaurant ambiance

### For Movies/TV Shows
✅ **Best option:**
- Use Direct URL with poster from IMDb, TMDb, or official sources
- Wikipedia often has promotional images

## Current Status

| Feature | Status |
|---------|--------|
| Unsplash Curated Images | ✅ Working |
| Wikipedia Search | ✅ Working |
| Direct URL | ✅ Working |
| TMDB API | ⏳ Requires API key |
| Unsplash API Search | ⏳ Requires API key (optional) |

## Troubleshooting

**Problem:** "Images don't match my search"
- **Solution:** The curated images are generic. Use Direct URL or Wikipedia for specific results.

**Problem:** "I need the exact restaurant/trail photo"
- **Solution:** Use Direct URL tab and paste the specific image URL from the source.

**Problem:** "Can I upload my own photos?"
- **Solution:** Upload to an image host (like imgur.com), then use Direct URL.

## Image URL Examples

### Unsplash URLs (Direct)
```
https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80
```

### Wikipedia URLs
```
https://upload.wikimedia.org/wikipedia/commons/...
```

### Any Image Host
```
https://i.imgur.com/abc123.jpg
https://example.com/images/photo.png
```

## Credits

All Unsplash images are provided under the [Unsplash License](https://unsplash.com/license):
- Free to use for commercial and non-commercial purposes
- No permission needed
- Attribution appreciated but not required

---

**Updated:** October 2025
**Version:** 2.0 - Curated Images Implementation
