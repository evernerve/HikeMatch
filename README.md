# HikeMatch 🥾

A fun swiping Progressive Web App (PWA) where friends can swipe on hiking trails and find mutual matches!

## 🎯 Features

- **Swipe Interface**: Swipe right to like trails, left to pass using Tinder-style cards
- **Real-time Matching**: Instant notifications when you and friends both like the same trail
- **Authentication**: Simple email/password login with demo user option
- **Progressive Web App**: Installable on mobile devices
- **20 Curated Trails**: Pre-loaded hiking trails with images, descriptions, and details
- **Responsive Design**: Beautiful UI that works on desktop and mobile

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Swipe Cards**: react-tinder-card
- **Backend**: Firebase (Firestore + Authentication)
- **Hosting**: Vercel-ready
- **PWA**: vite-plugin-pwa

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher) and npm installed
- A Firebase project ([Create one here](https://console.firebase.google.com/))
- Git (optional)

## 🚀 Quick Start

### 1. Clone or Download

```bash
cd hikeapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### a. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and follow the setup wizard
3. Once created, click on the Web icon (</>) to add a web app
4. Register your app and copy the configuration

#### b. Enable Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click "Create Database"
3. Start in **Test Mode** (you can secure it later)
4. Choose a location and click "Enable"

#### c. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method

#### d. Configure Your App

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace with your Firebase config values:
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

3. Update `src/lib/firebase.ts` to use environment variables:
   ```typescript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID
   };
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. First Run Setup

On first run, the app will automatically:
- Initialize 20 hiking trails in Firestore
- Show you the login screen

**Quick Demo**: Click "Quick Demo Login" to bypass creating an account.

## 📱 How to Use

1. **Sign Up/Login**: Create an account or use demo login
2. **Swipe on Trails**: 
   - Swipe right (or click 💚) to like a trail
   - Swipe left (or click ❌) to pass
3. **Check Matches**: Click "Matches" to see trails you and friends both liked
4. **Invite Friends**: Share the app URL with friends and start matching!

## 🏗️ Project Structure

```
hikeapp/
├── src/
│   ├── components/
│   │   ├── AuthForm.tsx       # Login/Signup component
│   │   ├── Navbar.tsx         # Navigation bar
│   │   └── TrailCard.tsx      # Swipeable trail card
│   ├── pages/
│   │   ├── Home.tsx           # Main swipe interface
│   │   └── Matches.tsx        # Matched trails display
│   ├── lib/
│   │   ├── firebase.ts        # Firebase config
│   │   └── firestoreHelpers.ts # Database functions
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles
├── public/                    # PWA assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎨 Customization

### Adding More Trails

Edit `src/lib/firestoreHelpers.ts` and add trails to the `initializeTrails()` function:

```typescript
{
  name: "Your Trail Name",
  image: "https://images.unsplash.com/...",
  description: "Trail description",
  lengthKm: 10,
  durationHours: 4,
  scenery: "Mountains, lakes",
  pathType: "mountain"
}
```

### Changing Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#10b981',  // Change to your color
      secondary: '#3b82f6',
    },
  },
}
```

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Build your app**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   
   **Option A - Using Vercel CLI**:
   ```bash
   vercel
   ```
   
   **Option B - Using Vercel Dashboard**:
   - Push your code to GitHub
   - Go to [Vercel](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Add environment variables from `.env`
   - Deploy!

4. **Add Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add all `VITE_FIREBASE_*` variables from your `.env` file

### Firebase Security Rules

Before going to production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Trails collection
    match /trails/{trailId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can modify
    }
    
    // User swipes
    match /userSwipes/{userId}/swipes/{swipeId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Matches
    match /matches/{matchId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.userIds;
      allow write: if request.auth != null;
    }
  }
}
```

## 📱 PWA Installation

The app is configured as a PWA and can be installed:

- **Mobile**: Tap the browser menu → "Add to Home Screen"
- **Desktop**: Look for the install icon in the address bar

## 🐛 Troubleshooting

### Trails not appearing?
- Check Firebase Console → Firestore Database
- Ensure trails collection exists
- Check browser console for errors

### Authentication not working?
- Verify Firebase Auth is enabled
- Check your Firebase config in `.env`
- Ensure Email/Password provider is enabled

### Matches not showing?
- Both users must swipe right on the same trail
- Check Firestore for matches collection
- Ensure real-time listeners are connected

## 🤝 Contributing

This is a template project. Feel free to:
- Fork and modify
- Add new features
- Improve the UI
- Add more trail data sources

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🎯 Future Enhancements

- [ ] Filter trails by difficulty, length, or location
- [ ] Upload custom trail images
- [ ] Group matching for friend groups
- [ ] Trail reviews and ratings
- [ ] Map integration
- [ ] Weather integration
- [ ] Share matches on social media
- [ ] AI-powered trail recommendations

## 💬 Support

For issues or questions:
1. Check this README thoroughly
2. Review Firebase Console for configuration
3. Check browser console for errors
4. Verify all dependencies are installed

---

**Built with ❤️ for outdoor enthusiasts**

Happy hiking! 🥾⛰️
