# Quick Add Feature - Testing Guide

## Overview
The Quick Add feature allows users to leverage AI assistants (ChatGPT, Claude, Gemini, etc.) to quickly add TV shows without manually filling out forms.

## How It Works

### User Flow:
1. Click the "Add Item" button (floating action button)
2. Select "TV Shows" category
3. Choose "AI Helper" method (new toggle)
4. Copy the pre-written prompt
5. Paste into any AI assistant (ChatGPT, Claude, etc.)
6. Copy the AI's formatted response
7. Paste back into the app
8. Review and edit the extracted data
9. Submit the card

## Testing the Feature

### Test Case 1: Successful Extraction

**Step 1:** Select TV Shows → AI Helper

**Step 2:** Copy the prompt and paste into ChatGPT with:
```
Extract information about: "Breaking Bad"
```

**Expected AI Response Format:**
```
NAME: Breaking Bad
START_YEAR: 2008
END_YEAR: 2013
STATUS: ended
SEASONS: 5
EPISODES: 62
GENRES: Crime, Drama, Thriller
CREATOR: Vince Gilligan
CAST: Bryan Cranston, Aaron Paul, Anna Gunn, Dean Norris, Betsy Brandt
PLOT: A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.
NETWORK: AMC
IMAGE_URL: https://example.com/breaking-bad.jpg
```

**Step 3:** Paste the response into the app

**Step 4:** Verify preview shows all extracted fields

**Step 5:** Edit any field by clicking on it

**Step 6:** Submit and verify card is created

### Test Case 2: Missing Image URL

**Same as Test Case 1, but leave IMAGE_URL blank or set to "Unknown"**

**Expected Result:** App should use a stock TV show image automatically

### Test Case 3: Minimal Data

**AI Response:**
```
NAME: The Office
START_YEAR: 2005
STATUS: ended
```

**Expected Result:**
- Successfully extracts name, year, and status
- Shows warnings for missing optional fields
- Uses stock image
- Allows submission with minimal data

### Test Case 4: Invalid Data

**AI Response:**
```
NAME: Test Show
START_YEAR: 3000
END_YEAR: 2999
SEASONS: -5
```

**Expected Result:**
- Shows warnings for invalid years
- Shows warnings for negative seasons
- Allows user to edit and fix

### Test Case 5: Inline Editing

**After parsing:**
1. Click any field to edit
2. Change the value
3. Click "Done" or press Enter
4. Verify value is updated in preview
5. Submit and verify correct data is saved

### Test Case 6: Edit Raw Text & Re-parse

**After preview:**
1. Click "Show raw text"
2. Edit the pasted text
3. Click "← Edit Text & Re-parse"
4. Make changes to the raw text
5. Click "Parse & Preview" again
6. Verify updated data is extracted

## Manual Testing Checklist

- [ ] Toggle between "Manual Form" and "AI Helper" works
- [ ] "Copy Prompt" button copies to clipboard
- [ ] Parsing handles various formats (extra spaces, different cases)
- [ ] Stock images are used when IMAGE_URL is missing
- [ ] All fields are editable inline
- [ ] Array fields (genres, cast) can be edited as comma-separated
- [ ] Plot textarea expands for long text
- [ ] Rate limiting still works (5 min per category)
- [ ] Error messages display correctly
- [ ] Success message appears after submission
- [ ] Card appears in swipe deck after creation
- [ ] "Cancel" button works at any step
- [ ] Loading states display correctly

## Known Limitations

1. **Currently TV Shows Only:** Quick Add is only available for TV shows as a proof of concept
2. **No Validation During Parsing:** Format validation happens on submit, not during preview
3. **Stock Images are Random:** Each time an image is missing, a random stock image is selected
4. **AI-Generated Data:** Quality depends on AI assistant used

## Future Enhancements

1. Add Quick Add for movies, restaurants, and hikes
2. Add format validation during preview
3. Allow custom stock image selection
4. Add "Try Again" button if parsing fails
5. Save recent prompts for quick access
6. Add more robust parsing (JSON fallback)
7. Add tooltips and help text

## Files Created/Modified

### New Files:
- `src/lib/aiPromptTemplates.ts` - Prompt templates for each category
- `src/lib/textParser.ts` - Parser for key-value formatted text
- `src/components/QuickAddForm.tsx` - Quick Add UI component

### Modified Files:
- `src/components/AddItemModal.tsx` - Added method selector and Quick Add integration

## Stock Images Used

TV Shows:
- https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37 (TV screen)
- https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85 (Netflix)
- https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7 (Cinema)

## Rate Limiting

Quick Add respects the same rate limiting as manual form (5 minutes per category).
