# 🚀 HikeMatch - Complete Setup Guide

This guide will walk you through setting up HikeMatch from scratch.

## ⚡ Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages:
- React + TypeScript
- Firebase SDK
- Tailwind CSS
- react-tinder-card
- react-router-dom
- vite-plugin-pwa

### Step 2: Firebase Project Setup

#### A. Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add Project"** or **"Create a Project"**
3. Enter project name: `hikematch` (or your choice)
4. You can disable Google Analytics for now
5. Click **"Create Project"**

#### B. Register Web App

1. On the Firebase project homepage, click the **Web icon** (`</>`)
2. Register app nickname: `HikeMatch Web`
3. ✅ Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. **IMPORTANT**: Copy the `firebaseConfig` object that appears

   It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc..."
   };
   ```

#### C. Enable Firestore Database

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it later)
4. Choose your database location (closest to your users)
5. Click **"Enable"**

#### D. Enable Authentication

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Click on **"Email/Password"** under Sign-in providers
4. Toggle **"Enable"** to ON
5. Click **"Save"**

### Step 3: Configure Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Open `.env` and paste your Firebase config**:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc...
   ```

### Step 4: Run the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser!

### Step 5: Test the App

1. Click **"Quick Demo Login"** button (creates a demo account automatically)
2. Start swiping on trails!
3. Open another browser/incognito window and create another demo user
4. Swipe right on the same trails
5. Check the **"Matches"** page to see your mutual matches! 🎉

---

## 🔥 Firebase Firestore Structure

After running the app, your Firestore will have these collections:

### `users` Collection
```javascript
{
  uid: "user123",
  displayName: "John Doe",
  email: "john@example.com",
  createdAt: Timestamp
}
```

### `trails` Collection (Auto-initialized with 20 trails)
```javascript
{
  id: "trail123",
  name: "Eagle Peak Summit",
  image: "https://...",
  description: "A challenging climb...",
  lengthKm: 12.5,
  durationHours: 5,
  scenery: "Mountain peaks, alpine meadows",
  pathType: "mountain"
}
```

### `userSwipes/{userId}/swipes` Subcollection
```javascript
{
  userId: "user123",
  trailId: "trail456",
  liked: true,
  swipedAt: Timestamp
}
```

### `matches` Collection
```javascript
{
  trailId: "trail456",
  userIds: ["user123", "user789"],
  matchedAt: Timestamp
}
```

---

## 🔐 Production Security Rules

Before deploying to production, update your Firestore rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function - user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function - user is owner
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users can read their own profile
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(userId);
      allow delete: if false;
    }
    
    // Anyone authenticated can read trails
    // Only admins can write (set to false for normal users)
    match /trails/{trailId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }
    
    // Users can only manage their own swipes
    match /userSwipes/{userId}/swipes/{swipeId} {
      allow read, write: if isOwner(userId);
    }
    
    // Users can read matches they're part of
    // Anyone can create matches (handled by client logic)
    match /matches/{matchId} {
      allow read: if isAuthenticated() && 
                     request.auth.uid in resource.data.userIds;
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

---

## 📱 Testing with Multiple Users

### Method 1: Multiple Browsers
1. Open Chrome (User A)
2. Open Firefox or Safari (User B)
3. Create different accounts in each
4. Swipe and match!

### Method 2: Incognito/Private Windows
1. Normal window: User A
2. Incognito window: User B
3. Both can swipe independently

### Method 3: Multiple Devices
1. Get the local network IP:
   ```bash
   # The dev server will show you the network URL
   # e.g., http://192.168.1.100:5173
   ```
2. Open on your phone browser
3. Test matching between desktop and mobile!

---

## 🚀 Deployment to Vercel

### Option 1: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Add Environment Variables**:
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_STORAGE_BUCKET
   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
   vercel env add VITE_FIREBASE_APP_ID
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Vercel Dashboard (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com
   - Click **"New Project"**
   - **Import** your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Add Environment Variables**:
   - In project settings, go to **Environment Variables**
   - Add all 6 `VITE_FIREBASE_*` variables
   - Copy values from your `.env` file

4. **Deploy**:
   - Click **"Deploy"**
   - Wait 1-2 minutes
   - Your app is live! 🎉

---

## 🐛 Common Issues & Solutions

### Issue: "Firebase not configured"
**Solution**: Check your `.env` file exists and has valid values

### Issue: Trails not loading
**Solution**: 
1. Check Firebase Console → Firestore
2. Verify `trails` collection exists
3. If empty, the app auto-initializes on first run

### Issue: Matches not appearing
**Solution**:
- Both users must swipe RIGHT on the SAME trail
- Check `matches` collection in Firestore
- Ensure both users are authenticated

### Issue: Build fails
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: PWA not installing
**Solution**:
- PWA only works on HTTPS (production)
- localhost works for testing
- Requires manifest and service worker (already configured)

---

## 🎨 Customization Tips

### Change App Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#10b981',    // Your primary color
      secondary: '#3b82f6',  // Your secondary color
    },
  },
}
```

### Add More Trails

Edit `src/lib/firestoreHelpers.ts` → `initializeTrails()`:
```typescript
{
  name: "Your Custom Trail",
  image: "https://images.unsplash.com/photo-...",
  description: "Amazing trail description",
  lengthKm: 8,
  durationHours: 3,
  scenery: "Forest, waterfalls",
  pathType: "forest"
}
```

### Change App Name

1. `package.json`: Change `"name"`
2. `index.html`: Change `<title>`
3. `public/manifest.json`: Change `name` and `short_name`
4. `vite.config.ts`: Update PWA manifest name

---

## 📊 Monitoring & Analytics (Optional)

### Add Google Analytics

1. Enable Analytics in Firebase Console
2. Add to `src/lib/firebase.ts`:
```typescript
import { getAnalytics } from 'firebase/analytics';
export const analytics = getAnalytics(app);
```

### View Firebase Usage

- **Firebase Console** → **Usage and billing**
- Free tier: 50K reads/day, 20K writes/day
- More than enough for friend groups!

---

## 🎯 Next Steps

Now that your app is running:

1. ✅ **Test with friends**: Share the URL
2. ✅ **Customize trails**: Add trails from your area
3. ✅ **Deploy to production**: Make it public
4. ✅ **Add features**: Check README.md for ideas
5. ✅ **Share your version**: Make it your own!

---

## 💬 Need Help?

- Check the main **README.md** file
- Review Firebase Console for errors
- Check browser console (F12) for debugging
- Verify all environment variables are set

**Happy Hiking!** 🥾⛰️
