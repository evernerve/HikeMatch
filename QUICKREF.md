# 🎯 HikeMatch - Quick Reference

Quick command reference and common tasks.

## 🚀 Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component & routing |
| `src/pages/Home.tsx` | Swipe interface |
| `src/pages/Matches.tsx` | Match display page |
| `src/components/AuthForm.tsx` | Login/signup form |
| `src/lib/firebase.ts` | Firebase configuration |
| `src/lib/firestoreHelpers.ts` | Database operations |
| `.env` | Environment variables |
| `vite.config.ts` | Build configuration |
| `tailwind.config.js` | Styling configuration |

## 🔑 Environment Variables

Create `.env` file with:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🎨 Styling Classes

Predefined Tailwind classes in `src/index.css`:

```css
.btn-primary      /* Green primary button */
.btn-secondary    /* Gray secondary button */
.input-field      /* Styled input field */
.card            /* Card container */
```

## 🔥 Firebase Collections

### users
```typescript
{
  uid: string
  displayName: string
  email: string
  createdAt: Timestamp
}
```

### trails
```typescript
{
  id: string
  name: string
  image: string
  description: string
  lengthKm: number
  durationHours: number
  scenery: string
  pathType: string
}
```

### userSwipes/{userId}/swipes/{trailId}
```typescript
{
  userId: string
  trailId: string
  liked: boolean
  swipedAt: Timestamp
}
```

### matches
```typescript
{
  trailId: string
  userIds: [string, string]
  matchedAt: Timestamp
}
```

## 🛠️ Helper Functions

### Authentication (`firestoreHelpers.ts`)

```typescript
signUp(email, password, displayName)
signIn(email, password)
signInAsDemo()
logOut()
getUserProfile(uid)
```

### Trails

```typescript
getAllTrails()
getTrailById(trailId)
getUnswipedTrails(userId)
initializeTrails()  // Auto-runs on first load
```

### Swipes & Matches

```typescript
recordSwipe(userId, trailId, liked)
getUserSwipes(userId)
getUserMatches(userId)
subscribeToMatches(userId, callback)  // Real-time
```

## 📱 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home` | Swipe interface |
| `/matches` | `Matches` | View matches |
| `*` | Redirect to `/` | 404 handler |

## 🐛 Debugging Tips

### Check Firebase Connection
```javascript
// In browser console
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)
```

### View Firestore Data
1. Firebase Console → Firestore Database
2. Browse collections
3. Check document counts

### Clear Local Data
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### Check Auth State
```javascript
// Add to any component
import { auth } from './lib/firebase';
console.log('Current user:', auth.currentUser);
```

## 🎯 Testing Scenarios

### Test Authentication
1. Click "Sign Up"
2. Enter email/password
3. Verify user created in Firebase Auth
4. Logout and login again

### Test Swiping
1. Login as User A
2. Swipe right on Trail X
3. Check Firestore: `userSwipes/userA/swipes/trailX`
4. Verify `liked: true`

### Test Matching
1. Login as User A, swipe right on Trail X
2. Login as User B (different browser)
3. Swipe right on Trail X
4. Check Firestore: `matches` collection
5. Both users should see match on Matches page

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Via CLI
npm i -g vercel
vercel login
vercel

# Or via GitHub
# Push to GitHub → Import in Vercel dashboard
```

### Environment Variables in Vercel
Project Settings → Environment Variables → Add:
- All `VITE_FIREBASE_*` variables
- Apply to: Production, Preview, Development

## 📊 Performance Tips

- Images are from Unsplash (external)
- Firestore queries are indexed automatically
- React components use memoization where needed
- PWA enables caching for faster loads

## 🔐 Security Notes

- Never commit `.env` file
- Use test mode Firestore for development
- Apply security rules before production
- Rate limit demo user creation if abused

## 📚 Documentation Files

| File | Contents |
|------|----------|
| `README.md` | Overview & features |
| `SETUP.md` | Detailed setup guide |
| `DEPLOYMENT.md` | Deployment checklist |
| `CONTRIBUTING.md` | Contribution guidelines |
| `QUICKREF.md` | This file! |

## 💡 Quick Fixes

### App won't start
```bash
rm -rf node_modules package-lock.json
npm install
```

### Firebase errors
- Check `.env` file exists
- Verify Firebase config values
- Ensure Firestore & Auth enabled

### Trails not loading
- Check browser console
- Verify Firestore rules allow read
- Check if trails collection exists

### Matches not appearing
- Both users must like same trail
- Check real-time listener connection
- Verify match logic in `firestoreHelpers.ts`

## 🎨 Customization

### Change primary color
`tailwind.config.js` → `theme.extend.colors.primary`

### Add trails
`src/lib/firestoreHelpers.ts` → `initializeTrails()`

### Modify swipe behavior
`src/pages/Home.tsx` → `swiped()` function

### Update match display
`src/pages/Matches.tsx` → Match card JSX

## 📱 Mobile Testing

```bash
# Get local IP
npm run dev
# Look for "Network: http://192.168.x.x:5173"

# Open on phone browser
# Test touch swipe
# Test install to home screen
```

## 🎉 Success Indicators

✅ Your setup is working when:
- Dev server runs without errors
- Login/signup works
- Trails display and swipe
- Matches appear after mutual likes
- Real-time updates work
- No console errors

---

**Need more help?** Check the other documentation files!

- Detailed setup: `SETUP.md`
- Deployment: `DEPLOYMENT.md`
- Contributing: `CONTRIBUTING.md`
- Main docs: `README.md`
