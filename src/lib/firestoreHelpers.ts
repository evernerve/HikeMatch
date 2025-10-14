import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Types
export interface Trail {
  id: string;
  name: string;
  image: string;
  description: string;
  lengthKm: number;
  durationHours: number;
  scenery: string;
  pathType: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  createdAt: Timestamp;
}

export interface Swipe {
  userId: string;
  trailId: string;
  liked: boolean;
  swipedAt: Timestamp;
}

export interface Match {
  trailId: string;
  userIds: string[];
  matchedAt: Timestamp;
  trail?: Trail;
}

// Authentication Functions

/**
 * Check if username is already taken
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/**
 * Sign up a new user with username, email and password
 */
export const signUp = async (username: string, email: string, password: string, displayName: string): Promise<User> => {
  // Check if username is taken
  const usernameTaken = await isUsernameTaken(username);
  if (usernameTaken) {
    throw new Error('Username is already taken');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    displayName,
    username: username.toLowerCase(),
    email,
    createdAt: Timestamp.now(),
  });

  return user;
};

/**
 * Get email from username
 */
export const getEmailFromUsername = async (username: string): Promise<string | null> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  const userData = snapshot.docs[0].data();
  return userData.email;
};

/**
 * Sign in an existing user with username and password
 */
export const signIn = async (username: string, password: string): Promise<User> => {
  // Look up email from username
  const email = await getEmailFromUsername(username);
  
  if (!email) {
    throw new Error('Username not found');
  }
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Demo user login (bypasses authentication for testing)
 */
export const signInAsDemo = async (): Promise<User> => {
  // Create a demo account
  const timestamp = Date.now();
  const demoUsername = `demo${timestamp}`;
  const demoEmail = `demo_${timestamp}@hikematch.app`;
  const demoPassword = 'demo123456';
  const demoDisplayName = `Demo User ${Math.floor(Math.random() * 1000)}`;
  
  try {
    return await signUp(demoUsername, demoEmail, demoPassword, demoDisplayName);
  } catch (error) {
    console.error('Demo login error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

// Trail Functions

/**
 * Get all trails from Firestore
 */
export const getAllTrails = async (): Promise<Trail[]> => {
  const trailsRef = collection(db, 'trails');
  const querySnapshot = await getDocs(trailsRef);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Trail));
};

/**
 * Get a single trail by ID
 */
export const getTrailById = async (trailId: string): Promise<Trail | null> => {
  const docRef = doc(db, 'trails', trailId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Trail;
  }
  return null;
};

// Swipe Functions

/**
 * Record a user's swipe on a trail
 */
export const recordSwipe = async (userId: string, trailId: string, liked: boolean): Promise<void> => {
  const swipeRef = doc(db, 'userSwipes', userId, 'swipes', trailId);
  
  console.log('💾 Recording swipe:', { userId, trailId, liked });
  
  await setDoc(swipeRef, {
    userId,
    trailId,
    liked,
    swipedAt: Timestamp.now(),
  });

  console.log('✅ Swipe recorded successfully');

  // Check for matches if the user liked the trail
  if (liked) {
    console.log('❤️ User liked trail, checking for matches...');
    await checkForMatches(userId, trailId);
  }
};

/**
 * Get all swipes for a user
 */
export const getUserSwipes = async (userId: string): Promise<string[]> => {
  const swipesRef = collection(db, 'userSwipes', userId, 'swipes');
  const querySnapshot = await getDocs(swipesRef);
  
  return querySnapshot.docs.map(doc => doc.id);
};

/**
 * Get trails that the user hasn't swiped on yet
 */
export const getUnswipedTrails = async (userId: string): Promise<Trail[]> => {
  const allTrails = await getAllTrails();
  const swipedTrailIds = await getUserSwipes(userId);
  
  return allTrails.filter(trail => !swipedTrailIds.includes(trail.id));
};

// Match Functions

/**
 * Check if two users both liked the same trail and create a match
 */
const checkForMatches = async (userId: string, trailId: string): Promise<void> => {
  console.log('🔍 Checking for matches:', { userId, trailId });
  
  // Get all users from the users collection
  const usersRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersRef);
  
  console.log('📊 Total users in database:', usersSnapshot.docs.length);
  
  const usersWhoLiked: string[] = [];
  
  // Check each user to see if they liked this trail
  for (const userDoc of usersSnapshot.docs) {
    const swipeRef = doc(db, 'userSwipes', userDoc.id, 'swipes', trailId);
    const swipeSnap = await getDoc(swipeRef);
    
    if (swipeSnap.exists() && swipeSnap.data().liked) {
      usersWhoLiked.push(userDoc.id);
      console.log('✅ User liked this trail:', userDoc.id);
    }
  }

  console.log('💚 Users who liked trail:', usersWhoLiked.length);

  // Create matches for all pairs of users who liked this trail
  if (usersWhoLiked.length >= 2) {
    console.log('🎉 Creating matches!');
    for (let i = 0; i < usersWhoLiked.length; i++) {
      for (let j = i + 1; j < usersWhoLiked.length; j++) {
        const user1 = usersWhoLiked[i];
        const user2 = usersWhoLiked[j];
        
        // Create a consistent match ID
        const matchId = [user1, user2].sort().join('_') + '_' + trailId;
        
        // Check if match already exists
        const matchRef = doc(db, 'matches', matchId);
        const matchSnap = await getDoc(matchRef);
        
        if (!matchSnap.exists()) {
          await setDoc(matchRef, {
            trailId,
            userIds: [user1, user2],
            matchedAt: Timestamp.now(),
          });
          console.log('✨ Match created!', { matchId, user1, user2, trailId });
        } else {
          console.log('ℹ️ Match already exists:', matchId);
        }
      }
    }
  }
};

/**
 * Get all matches for a user
 */
export const getUserMatches = async (userId: string): Promise<Match[]> => {
  const matchesRef = collection(db, 'matches');
  const q = query(matchesRef, where('userIds', 'array-contains', userId));
  const querySnapshot = await getDocs(q);
  
  const matches: Match[] = [];
  
  for (const docSnap of querySnapshot.docs) {
    const matchData = docSnap.data();
    const trail = await getTrailById(matchData.trailId);
    
    matches.push({
      ...matchData,
      trail: trail || undefined,
    } as Match);
  }
  
  return matches;
};

/**
 * Listen to real-time updates for user matches
 */
export const subscribeToMatches = (
  userId: string,
  callback: (matches: Match[]) => void
): (() => void) => {
  const matchesRef = collection(db, 'matches');
  const q = query(matchesRef, where('userIds', 'array-contains', userId));
  
  return onSnapshot(q, async (snapshot) => {
    const matches: Match[] = [];
    
    for (const docSnap of snapshot.docs) {
      const matchData = docSnap.data();
      const trail = await getTrailById(matchData.trailId);
      
      matches.push({
        ...matchData,
        trail: trail || undefined,
      } as Match);
    }
    
    callback(matches);
  });
};

/**
 * Initialize trails collection with sample data (run once)
 */
export const initializeTrails = async (): Promise<void> => {
  const trails: Omit<Trail, 'id'>[] = [
    {
      name: "Eagle Peak Summit",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
      description: "A challenging climb with breathtaking panoramic views at the summit. Perfect for experienced hikers seeking an adrenaline rush.",
      lengthKm: 12.5,
      durationHours: 5,
      scenery: "Mountain peaks, alpine meadows",
      pathType: "mountain"
    },
    {
      name: "Whispering Pines Trail",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      description: "A peaceful forest walk through towering pine trees with occasional wildlife sightings.",
      lengthKm: 6.2,
      durationHours: 2.5,
      scenery: "Dense forest, creek crossings",
      pathType: "forest"
    },
    {
      name: "Riverside Ramble",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      description: "Easy, flat trail following a scenic river with multiple picnic spots and swimming areas.",
      lengthKm: 8.0,
      durationHours: 3,
      scenery: "River views, wildflowers",
      pathType: "riverside"
    },
    {
      name: "Sunset Ridge Loop",
      image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800",
      description: "Moderate loop trail famous for stunning sunset views. Best hiked in the late afternoon.",
      lengthKm: 9.3,
      durationHours: 3.5,
      scenery: "Ridge views, sunset vistas",
      pathType: "mountain"
    },
    {
      name: "Crystal Lake Trail",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      description: "Beautiful trail leading to a pristine alpine lake surrounded by peaks.",
      lengthKm: 11.0,
      durationHours: 4.5,
      scenery: "Alpine lake, mountain reflections",
      pathType: "mountain"
    },
    {
      name: "Wildflower Meadow Path",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
      description: "Spring and summer favorite with fields of colorful wildflowers. Family-friendly.",
      lengthKm: 4.5,
      durationHours: 2,
      scenery: "Meadows, wildflowers, butterflies",
      pathType: "meadow"
    },
    {
      name: "Ancient Oak Grove",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      description: "Wander through a forest of centuries-old oak trees with incredible natural architecture.",
      lengthKm: 5.8,
      durationHours: 2.5,
      scenery: "Old-growth forest, dappled sunlight",
      pathType: "forest"
    },
    {
      name: "Cliff Edge Traverse",
      image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800",
      description: "Thrilling trail along dramatic cliff edges with vertigo-inducing views. Not for the faint of heart.",
      lengthKm: 10.2,
      durationHours: 4,
      scenery: "Cliff faces, canyon views",
      pathType: "mountain"
    },
    {
      name: "Fern Canyon Trail",
      image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800",
      description: "Cool, shaded canyon filled with lush ferns and moss-covered walls.",
      lengthKm: 3.5,
      durationHours: 1.5,
      scenery: "Canyon walls, ferns, waterfalls",
      pathType: "canyon"
    },
    {
      name: "Desert Bloom Trail",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800",
      description: "Arid landscape that comes alive with cacti and desert flowers after rain.",
      lengthKm: 7.5,
      durationHours: 3,
      scenery: "Desert plants, rock formations",
      pathType: "desert"
    },
    {
      name: "Misty Mountain Path",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      description: "High-altitude trail often shrouded in mystical fog with unexpected views.",
      lengthKm: 13.5,
      durationHours: 6,
      scenery: "Cloud forests, mountain mist",
      pathType: "mountain"
    },
    {
      name: "Beaver Pond Circuit",
      image: "https://images.unsplash.com/photo-1472791108553-c9405341e398?w=800",
      description: "Easy loop around active beaver ponds with excellent wildlife viewing opportunities.",
      lengthKm: 5.0,
      durationHours: 2,
      scenery: "Ponds, beaver dams, wetlands",
      pathType: "wetland"
    },
    {
      name: "Thunder Valley Trail",
      image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800",
      description: "Named for the echoing sounds in this dramatic valley. Moderate difficulty.",
      lengthKm: 8.8,
      durationHours: 3.5,
      scenery: "Valley floor, acoustic phenomena",
      pathType: "valley"
    },
    {
      name: "Birch Forest Loop",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      description: "Stunning white birch forest, especially beautiful in autumn. Easy terrain.",
      lengthKm: 6.5,
      durationHours: 2.5,
      scenery: "Birch trees, autumn colors",
      pathType: "forest"
    },
    {
      name: "Cascade Falls Trail",
      image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800",
      description: "Popular trail leading to a spectacular multi-tier waterfall. Can get crowded.",
      lengthKm: 7.0,
      durationHours: 3,
      scenery: "Waterfalls, spray mist, rainbows",
      pathType: "riverside"
    },
    {
      name: "Rocky Outcrop Trail",
      image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800",
      description: "Challenging rocky terrain rewarded with 360-degree summit views.",
      lengthKm: 9.8,
      durationHours: 4.5,
      scenery: "Rock formations, panoramic views",
      pathType: "mountain"
    },
    {
      name: "Lavender Fields Walk",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
      description: "Gentle walk through fragrant lavender fields. Perfect for photography.",
      lengthKm: 3.0,
      durationHours: 1.5,
      scenery: "Lavender fields, fragrant air",
      pathType: "meadow"
    },
    {
      name: "Coastal Cliffs Path",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      description: "Breathtaking coastal trail with ocean views and seabird colonies.",
      lengthKm: 10.5,
      durationHours: 4,
      scenery: "Ocean views, cliffs, seabirds",
      pathType: "coastal"
    },
    {
      name: "Redwood Cathedral",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      description: "Walk among giant redwoods in this awe-inspiring forest sanctuary.",
      lengthKm: 4.8,
      durationHours: 2,
      scenery: "Giant redwoods, cathedral-like groves",
      pathType: "forest"
    },
    {
      name: "Alpine Flower Trail",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
      description: "High-altitude trail showcasing rare alpine wildflowers. Best in July-August.",
      lengthKm: 11.5,
      durationHours: 5,
      scenery: "Alpine meadows, rare flowers, peaks",
      pathType: "mountain"
    }
  ];

  // Check if trails already exist
  const existingTrails = await getAllTrails();
  if (existingTrails.length > 0) {
    console.log('Trails already initialized');
    return;
  }

  // Add each trail to Firestore
  for (const trail of trails) {
    const trailRef = doc(collection(db, 'trails'));
    await setDoc(trailRef, trail);
  }

  console.log('Successfully initialized 20 hiking trails');
};
