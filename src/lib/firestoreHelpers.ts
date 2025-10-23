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
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { CategoryType, SwipeItem, HikeData, MovieData, TVData, RestaurantData } from '../types/categories';

// Types
export interface Trail {
  id: string;
  name: string;
  image: string;
  description: string;
  lengthKm: number;
  durationHours: number;
  difficulty: 'easy' | 'moderate' | 'difficult';
  elevationGainM: number;
  location: string;
  distanceFromMunichKm: number;
  publicTransportTime: number; // minutes from Munich Hbf
  scenery: string;
  pathType: string;
  specialFeature: string; // What makes this trail unique
  detailedDescription: string; // Extended description for card back
  highlights: string[]; // Key highlights/attractions
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
  itemId?: string;
  category?: string;
  userIds: string[];
  userProfiles: { uid: string; username: string; displayName: string }[];
  matchedAt: Timestamp;
  trail?: Trail;
  item?: SwipeItem;
}

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  toUserId: string;
  toUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

export interface Connection {
  userId: string;
  connectedUserId: string;
  connectedUsername: string;
  connectedDisplayName: string;
  connectedAt: Timestamp;
}

export interface ResetRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  toUserId: string;
  toUsername: string;
  toDisplayName: string;
  category: CategoryType;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
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
  try {
    // Normalize inputs
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDisplayName = displayName.trim();

    // Check if username is taken
    const usernameTaken = await isUsernameTaken(normalizedUsername);
    if (usernameTaken) {
      const error: any = new Error('Username is already taken');
      error.code = 'app/username-taken';
      throw error;
    }

    // Create Firebase auth account
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      displayName: normalizedDisplayName,
      username: normalizedUsername,
      email: normalizedEmail,
      createdAt: Timestamp.now(),
    });

    return user;
  } catch (error: any) {
    // Re-throw with additional context
    console.error('Sign up error:', error);
    throw error;
  }
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
  try {
    // Normalize username
    const normalizedUsername = username.trim().toLowerCase();

    // Look up email from username
    const email = await getEmailFromUsername(normalizedUsername);
    
    if (!email) {
      const error: any = new Error('Username not found');
      error.code = 'app/username-not-found';
      throw error;
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    // Re-throw with additional context
    console.error('Sign in error:', error);
    throw error;
  }
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
          // Get user profiles
          const user1Profile = await getUserProfile(user1);
          const user2Profile = await getUserProfile(user2);
          
          await setDoc(matchRef, {
            trailId,
            userIds: [user1, user2],
            userProfiles: [
              {
                uid: user1,
                username: user1Profile?.username || '',
                displayName: user1Profile?.displayName || ''
              },
              {
                uid: user2,
                username: user2Profile?.username || '',
                displayName: user2Profile?.displayName || ''
              }
            ],
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
      
      // Get the matched item based on category
      const category = (matchData.category || 'hikes') as CategoryType;
      const itemId = matchData.itemId || matchData.trailId;
      
      let matchedItem: SwipeItem | null = null;
      
      if (category === 'hikes') {
        const trail = await getTrailById(itemId);
        if (trail) {
          matchedItem = trailToSwipeItem(trail);
        }
      } else {
        const collectionName = getCategoryCollection(category);
        const itemRef = doc(db, collectionName, itemId);
        const itemSnap = await getDoc(itemRef);
        
        if (itemSnap.exists()) {
          matchedItem = {
            id: itemSnap.id,
            ...itemSnap.data(),
          } as SwipeItem;
        }
      }
      
      matches.push({
        ...matchData,
        trail: category === 'hikes' ? matchedItem : undefined, // Keep for backward compatibility
        item: matchedItem || undefined,
      } as any);
    }
    
    callback(matches);
  });
};

// Connection Functions

/**
 * Get user by username
 */
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0].data() as UserProfile;
};

/**
 * Send a connection request to another user
 * Returns 'sent' if new request created, 'connected' if auto-accepted existing request
 */
export const sendConnectionRequest = async (toUsername: string): Promise<'sent' | 'connected'> => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  
  const fromUser = await getUserProfile(auth.currentUser.uid);
  if (!fromUser) throw new Error('User profile not found');
  
  const toUser = await getUserByUsername(toUsername);
  if (!toUser) throw new Error('User not found');
  
  if (fromUser.uid === toUser.uid) {
    throw new Error('Cannot send request to yourself');
  }
  
  // Check if already connected
  const isConnected = await checkConnection(toUser.uid);
  if (isConnected) {
    throw new Error('Already connected with this user');
  }
  
  // Check if there's already a pending request FROM them TO us
  const requestsRef = collection(db, 'connectionRequests');
  const reverseRequest = query(
    requestsRef,
    where('fromUserId', '==', toUser.uid),
    where('toUserId', '==', fromUser.uid),
    where('status', '==', 'pending')
  );
  const reverseSnapshot = await getDocs(reverseRequest);
  
  if (!reverseSnapshot.empty) {
    // They already sent us a request! Auto-accept it instead of creating a new one
    const existingRequestId = reverseSnapshot.docs[0].id;
    await acceptConnectionRequest(existingRequestId);
    return 'connected';
  }
  
  // Check if we already sent them a request
  const forwardRequest = query(
    requestsRef,
    where('fromUserId', '==', fromUser.uid),
    where('toUserId', '==', toUser.uid),
    where('status', '==', 'pending')
  );
  const forwardSnapshot = await getDocs(forwardRequest);
  
  if (!forwardSnapshot.empty) {
    throw new Error('Connection request already sent');
  }
  
  // Create the request
  const requestRef = doc(collection(db, 'connectionRequests'));
  await setDoc(requestRef, {
    id: requestRef.id,
    fromUserId: fromUser.uid,
    fromUsername: fromUser.username,
    fromDisplayName: fromUser.displayName,
    toUserId: toUser.uid,
    toUsername: toUser.username,
    status: 'pending',
    createdAt: Timestamp.now()
  });
  
  return 'sent';
};

/**
 * Get connection requests sent by current user
 */
export const getSentRequests = async (): Promise<ConnectionRequest[]> => {
  if (!auth.currentUser) return [];
  
  const requestsRef = collection(db, 'connectionRequests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', auth.currentUser.uid),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as ConnectionRequest);
};

/**
 * Get connection requests received by current user
 */
export const getReceivedRequests = async (): Promise<ConnectionRequest[]> => {
  if (!auth.currentUser) return [];
  
  const requestsRef = collection(db, 'connectionRequests');
  const q = query(
    requestsRef,
    where('toUserId', '==', auth.currentUser.uid),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as ConnectionRequest);
};

/**
 * Accept a connection request
 */
export const acceptConnectionRequest = async (requestId: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  
  const requestRef = doc(db, 'connectionRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Request not found');
  }
  
  const request = requestSnap.data() as ConnectionRequest;
  
  if (request.status !== 'pending') {
    throw new Error('Request has already been processed');
  }
  
  // Check if connection already exists (prevents duplicates)
  const existingConnection = await checkConnection(
    request.fromUserId === auth.currentUser.uid ? request.toUserId : request.fromUserId
  );
  
  if (existingConnection) {
    // Connection already exists, just update request status
    await updateDoc(requestRef, { status: 'accepted' });
    return;
  }
  
  // Update request status
  await updateDoc(requestRef, { status: 'accepted' });
  
  // Get display names
  const [fromUserProfile, toUserProfile] = await Promise.all([
    getUserProfile(request.fromUserId),
    getUserProfile(request.toUserId)
  ]);
  
  // Create bidirectional connections
  const connection1Ref = doc(collection(db, 'connections'));
  await setDoc(connection1Ref, {
    userId: request.fromUserId,
    connectedUserId: request.toUserId,
    connectedUsername: request.toUsername,
    connectedDisplayName: toUserProfile?.displayName || '',
    connectedAt: Timestamp.now()
  });
  
  const connection2Ref = doc(collection(db, 'connections'));
  await setDoc(connection2Ref, {
    userId: request.toUserId,
    connectedUserId: request.fromUserId,
    connectedUsername: request.fromUsername,
    connectedDisplayName: fromUserProfile?.displayName || request.fromDisplayName,
    connectedAt: Timestamp.now()
  });
  
  // Check for and handle reciprocal pending request
  const requestsRef = collection(db, 'connectionRequests');
  const reciprocalQuery = query(
    requestsRef,
    where('fromUserId', '==', request.toUserId),
    where('toUserId', '==', request.fromUserId),
    where('status', '==', 'pending')
  );
  
  const reciprocalSnapshot = await getDocs(reciprocalQuery);
  
  // If there's a reciprocal request, mark it as accepted too
  if (!reciprocalSnapshot.empty) {
    for (const doc of reciprocalSnapshot.docs) {
      await updateDoc(doc.ref, { status: 'accepted' });
    }
  }
};

/**
 * Reject a connection request
 */
export const rejectConnectionRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, 'connectionRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Request not found');
  }
  
  const request = requestSnap.data() as ConnectionRequest;
  await setDoc(requestRef, { ...request, status: 'rejected' });
};

/**
 * Get all connections for current user
 */
export const getConnections = async (): Promise<Connection[]> => {
  if (!auth.currentUser) return [];
  
  const connectionsRef = collection(db, 'connections');
  const q = query(connectionsRef, where('userId', '==', auth.currentUser.uid));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as Connection);
};

/**
 * Check if current user is connected to another user
 */
export const checkConnection = async (userId: string): Promise<boolean> => {
  if (!auth.currentUser) return false;
  
  const connectionsRef = collection(db, 'connections');
  const q = query(
    connectionsRef,
    where('userId', '==', auth.currentUser.uid),
    where('connectedUserId', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  return !snapshot.empty;
};

/**
 * Remove a connection (unfriend)
 * Deletes both sides of the bidirectional connection
 */
export const removeConnection = async (connectedUserId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in');
  }

  const currentUserId = auth.currentUser.uid;

  // Delete connection from current user's side
  const connectionsRef = collection(db, 'connections');
  const userConnectionQuery = query(
    connectionsRef,
    where('userId', '==', currentUserId),
    where('connectedUserId', '==', connectedUserId)
  );
  const userConnectionSnapshot = await getDocs(userConnectionQuery);

  // Delete connection from other user's side
  const otherConnectionQuery = query(
    connectionsRef,
    where('userId', '==', connectedUserId),
    where('connectedUserId', '==', currentUserId)
  );
  const otherConnectionSnapshot = await getDocs(otherConnectionQuery);

  // Delete all matching connection documents (should be 2: one for each user)
  const deletePromises: Promise<void>[] = [];
  
  userConnectionSnapshot.docs.forEach(doc => {
    deletePromises.push(deleteDoc(doc.ref));
  });
  
  otherConnectionSnapshot.docs.forEach(doc => {
    deletePromises.push(deleteDoc(doc.ref));
  });

  await Promise.all(deletePromises);

  console.log('✅ Connection removed:', { currentUserId, connectedUserId, docsDeleted: deletePromises.length });
};

// ============================================================================
// MULTI-CATEGORY FUNCTIONS (NEW - Backward Compatible)
// ============================================================================

/**
 * Helper to convert Trail to SwipeItem format for backward compatibility
 */
export const trailToSwipeItem = (trail: Trail): SwipeItem => {
  return {
    id: trail.id,
    category: 'hikes',
    name: trail.name,
    image: trail.image,
    description: trail.description,
    categoryData: {
      lengthKm: trail.lengthKm,
      durationHours: trail.durationHours,
      difficulty: trail.difficulty,
      elevationGainM: trail.elevationGainM,
      location: trail.location,
      distanceFromMunichKm: trail.distanceFromMunichKm,
      publicTransportTime: trail.publicTransportTime,
      scenery: trail.scenery,
      pathType: trail.pathType,
      specialFeature: trail.specialFeature,
      detailedDescription: trail.detailedDescription,
      highlights: trail.highlights,
    }
  };
};

/**
 * Get collection name for a category
 */
const getCategoryCollection = (category: CategoryType): string => {
  // Map categories to their Firestore collections
  const collectionMap: Record<CategoryType, string> = {
    'hikes': 'trails',  // Use existing trails collection
    'movies': 'movies',
    'tv': 'tvShows',
    'restaurants': 'restaurants'
  };
  return collectionMap[category];
};

/**
 * Get all items for a specific category
 */
export const getCategoryItems = async (category: CategoryType): Promise<SwipeItem[]> => {
  const collectionName = getCategoryCollection(category);
  const itemsRef = collection(db, collectionName);
  const querySnapshot = await getDocs(itemsRef);
  
  if (category === 'hikes') {
    // Convert trails to SwipeItem format
    return querySnapshot.docs.map(doc => {
      const trail = { id: doc.id, ...doc.data() } as Trail;
      return trailToSwipeItem(trail);
    });
  }
  
  // For other categories, data is already in SwipeItem format
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as SwipeItem));
};

/**
 * Get unswiped items for a specific category
 */
export const getUnswipedCategoryItems = async (
  userId: string,
  category: CategoryType
): Promise<SwipeItem[]> => {
  const allItems = await getCategoryItems(category);
  const swipedItemIds = await getUserCategorySwipes(userId, category);
  
  // Get user's connections
  const connections = await getConnections();
  const connectedUserIds = connections.map(conn => conn.connectedUserId);
  
  // Filter items based on:
  // 1. Not already swiped
  // 2. If item has createdBy (user contribution):
  //    - Show if created by current user OR
  //    - Show if created by a connected user
  // 3. If no createdBy (seed data), always show
  return allItems.filter(item => {
    // Skip if already swiped
    if (swipedItemIds.includes(item.id)) {
      return false;
    }
    
    // If no createdBy, it's seed data - always show
    if (!item.createdBy) {
      return true;
    }
    
    // Show user's own contributions
    if (item.createdBy === userId) {
      return true;
    }
    
    // Show contributions from connected users
    if (connectedUserIds.includes(item.createdBy)) {
      return true;
    }
    
    // Hide contributions from non-connected users
    return false;
  });
};

/**
 * Get user's swipes for a specific category
 */
export const getUserCategorySwipes = async (
  userId: string,
  category: CategoryType
): Promise<string[]> => {
  const swipesRef = collection(db, 'userSwipes', userId, 'swipes');
  const q = query(swipesRef, where('category', '==', category));
  const querySnapshot = await getDocs(q);
  
  // Also check old swipes without category field (for backward compatibility with trails)
  if (category === 'hikes') {
    const allSwipes = collection(db, 'userSwipes', userId, 'swipes');
    const allSnapshot = await getDocs(allSwipes);
    return allSnapshot.docs.map(doc => doc.id);
  }
  
  return querySnapshot.docs.map(doc => doc.id);
};

/**
 * Record a user's swipe on an item (category-aware)
 */
export const recordCategorySwipe = async (
  userId: string,
  itemId: string,
  category: CategoryType,
  liked: boolean
): Promise<void> => {
  const swipeRef = doc(db, 'userSwipes', userId, 'swipes', itemId);
  
  console.log('💾 Recording category swipe:', { userId, itemId, category, liked });
  
  await setDoc(swipeRef, {
    userId,
    itemId,
    trailId: itemId, // Keep for backward compatibility
    category,
    liked,
    swipedAt: Timestamp.now(),
  });

  console.log('✅ Category swipe recorded successfully');

  // Check for matches if the user liked the item
  if (liked) {
    console.log('❤️ User liked item, checking for matches...');
    await checkForCategoryMatches(userId, itemId, category);
  }
};

/**
 * Check for matches in a specific category
 */
const checkForCategoryMatches = async (
  userId: string,
  itemId: string,
  category: CategoryType
): Promise<void> => {
  console.log('🔍 Checking for category matches:', { userId, itemId, category });
  
  // Get all users from the users collection
  const usersRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersRef);
  
  console.log('📊 Total users in database:', usersSnapshot.docs.length);
  
  const usersWhoLiked: string[] = [];
  
  // Check each user to see if they liked this item
  for (const userDoc of usersSnapshot.docs) {
    const swipeRef = doc(db, 'userSwipes', userDoc.id, 'swipes', itemId);
    const swipeSnap = await getDoc(swipeRef);
    
    if (swipeSnap.exists() && swipeSnap.data().liked) {
      usersWhoLiked.push(userDoc.id);
      console.log('✅ User liked this item:', userDoc.id);
    }
  }

  console.log('💚 Users who liked item:', usersWhoLiked.length);

  // Create matches for all pairs of users who liked this item
  if (usersWhoLiked.length >= 2) {
    console.log('🎉 Creating matches!');
    for (let i = 0; i < usersWhoLiked.length; i++) {
      for (let j = i + 1; j < usersWhoLiked.length; j++) {
        const user1 = usersWhoLiked[i];
        const user2 = usersWhoLiked[j];
        
        // Create a consistent match ID
        const matchId = [user1, user2].sort().join('_') + '_' + itemId;
        
        // Check if match already exists
        const matchRef = doc(db, 'matches', matchId);
        const matchSnap = await getDoc(matchRef);
        
        if (!matchSnap.exists()) {
          // Get user profiles
          const user1Profile = await getUserProfile(user1);
          const user2Profile = await getUserProfile(user2);
          
          await setDoc(matchRef, {
            itemId,
            trailId: itemId, // Keep for backward compatibility
            category,
            userIds: [user1, user2],
            userProfiles: [
              {
                uid: user1,
                username: user1Profile?.username || '',
                displayName: user1Profile?.displayName || ''
              },
              {
                uid: user2,
                username: user2Profile?.username || '',
                displayName: user2Profile?.displayName || ''
              }
            ],
            matchedAt: Timestamp.now(),
          });
          console.log('✨ Match created!', { matchId, user1, user2, itemId, category });
        } else {
          console.log('ℹ️ Match already exists:', matchId);
        }
      }
    }
  }
};

/**
 * Create a new user-contributed item
 */
export const createUserContribution = async (
  category: CategoryType,
  name: string,
  image: string,
  description: string,
  categoryData: HikeData | MovieData | TVData | RestaurantData
): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to contribute');
  }

  const userId = auth.currentUser.uid;
  const userProfile = await getUserProfile(userId);

  // Validate and normalize categoryData based on category
  let validatedCategoryData: any = { ...categoryData };

  if (category === 'restaurants') {
    // Ensure required fields for restaurants
    validatedCategoryData = {
      restaurantName: validatedCategoryData.restaurantName || name,
      cuisine: validatedCategoryData.cuisine || ['International'],
      priceRange: validatedCategoryData.priceRange || '€€',
      location: validatedCategoryData.location || 'Munich',
      address: validatedCategoryData.address || 'Address not provided',
      rating: validatedCategoryData.rating || 4.0,
      reviewCount: validatedCategoryData.reviewCount || 0,
      phone: validatedCategoryData.phone || '',
      website: validatedCategoryData.website || '',
      hours: validatedCategoryData.hours || 'Hours not provided',
      specialties: validatedCategoryData.specialties || [],
      dietaryOptions: validatedCategoryData.dietaryOptions || [],
      ambiance: validatedCategoryData.ambiance || ['Casual'],
      ...validatedCategoryData // Preserve any additional fields
    };
  } else if (category === 'movies') {
    // Ensure required fields for movies
    validatedCategoryData = {
      title: validatedCategoryData.title || name,
      year: validatedCategoryData.year || new Date().getFullYear(),
      runtime: validatedCategoryData.runtime || 120,
      genres: validatedCategoryData.genres || ['Drama'],
      director: validatedCategoryData.director || 'Unknown',
      cast: validatedCategoryData.cast || [],
      rating: validatedCategoryData.rating || 7.0,
      voteCount: validatedCategoryData.voteCount || 0,
      plot: validatedCategoryData.plot || description,
      language: validatedCategoryData.language || 'English',
      country: validatedCategoryData.country || 'USA',
      tmdbId: validatedCategoryData.tmdbId || 0,
      ...validatedCategoryData
    };
  } else if (category === 'tv') {
    // Ensure required fields for TV shows
    validatedCategoryData = {
      title: validatedCategoryData.title || name,
      startYear: validatedCategoryData.startYear || new Date().getFullYear(),
      status: validatedCategoryData.status || 'ongoing',
      seasons: validatedCategoryData.seasons || 1,
      episodes: validatedCategoryData.episodes || 10,
      genres: validatedCategoryData.genres || ['Drama'],
      creator: validatedCategoryData.creator || 'Unknown',
      cast: validatedCategoryData.cast || [],
      rating: validatedCategoryData.rating || 7.0,
      voteCount: validatedCategoryData.voteCount || 0,
      plot: validatedCategoryData.plot || description,
      network: validatedCategoryData.network || 'Unknown',
      tmdbId: validatedCategoryData.tmdbId || 0,
      ...validatedCategoryData
    };
  } else if (category === 'hikes') {
    // Ensure required fields for hikes
    validatedCategoryData = {
      lengthKm: validatedCategoryData.lengthKm || 5,
      durationHours: validatedCategoryData.durationHours || 2,
      difficulty: validatedCategoryData.difficulty || 'moderate',
      elevationGainM: validatedCategoryData.elevationGainM || 100,
      location: validatedCategoryData.location || 'Munich Area',
      distanceFromMunichKm: validatedCategoryData.distanceFromMunichKm || 30,
      publicTransportTime: validatedCategoryData.publicTransportTime || 60,
      scenery: validatedCategoryData.scenery || 'Nature',
      pathType: validatedCategoryData.pathType || 'Trail',
      ...validatedCategoryData
    };
  }

  // Determine collection name based on category
  const collectionName = category === 'hikes' ? 'trails' : category === 'tv' ? 'tvShows' : category;
  
  // Create the item
  const itemRef = doc(collection(db, collectionName));
  const itemId = itemRef.id;

  const newItem: SwipeItem = {
    id: itemId,
    category,
    name: name.trim(),
    image: image.trim(),
    description: description.trim(),
    categoryData: validatedCategoryData,
    createdBy: userId,  // Track who created this item
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  console.log('✅ Creating item with validated data:', {
    category,
    name,
    hasRequiredFields: category === 'restaurants' 
      ? 'cuisine' in validatedCategoryData && 'priceRange' in validatedCategoryData 
      : true
  });

  await setDoc(itemRef, newItem);

  // Track contribution
  const contributionRef = doc(collection(db, 'userContributions'));
  await setDoc(contributionRef, {
    id: contributionRef.id,
    userId,
    username: userProfile?.username || 'anonymous',
    displayName: userProfile?.displayName || 'Anonymous User',
    category,
    itemId,
    itemName: name,
    status: 'active',
    contributedAt: Timestamp.now(),
    upvotes: 0,
    downvotes: 0,
  });

  console.log('✨ User contribution created!', { itemId, category, userId });
  return itemId;
};

/**
 * Get all contributions by a specific user with full item data
 */
export const getUserContributions = async (userId: string): Promise<SwipeItem[]> => {
  try {
    // Query userContributions collection for this user
    // Simple query with only where clause - no orderBy to avoid composite index
    const contributionsRef = collection(db, 'userContributions');
    const q = query(
      contributionsRef,
      where('userId', '==', userId)
    );
    
    const contributionsSnapshot = await getDocs(q);
    
    // Collect all contributions with their timestamps for sorting
    const contributionsWithTime: Array<{ item: SwipeItem; contributedAt: any }> = [];
    
    // Fetch each actual item (only active contributions)
    for (const contributionDoc of contributionsSnapshot.docs) {
      const contribution = contributionDoc.data();
      
      // Filter by status in memory
      if (contribution.status !== 'active') {
        continue;
      }
      
      const { category, itemId, contributedAt } = contribution;
      
      // Determine collection name
      const collectionName = category === 'hikes' ? 'trails' : category === 'tv' ? 'tvShows' : category;
      
      console.log(`Fetching contribution: category=${category}, collection=${collectionName}, itemId=${itemId}`);
      
      // Fetch the actual item
      const itemRef = doc(db, collectionName, itemId);
      const itemDoc = await getDoc(itemRef);
      
      if (itemDoc.exists()) {
        const itemData = itemDoc.data() as SwipeItem;
        // Ensure the item has required fields
        if (itemData && itemData.id && itemData.name && itemData.category) {
          contributionsWithTime.push({
            item: {
              ...itemData,
              id: itemDoc.id, // Ensure ID is set
            },
            contributedAt
          });
        } else {
          console.warn(`Item ${itemId} in ${collectionName} has missing required fields:`, itemData);
        }
      } else {
        console.warn(`Item ${itemId} not found in collection ${collectionName}`);
      }
    }
    
    // Sort by contributedAt in memory (newest first)
    contributionsWithTime.sort((a, b) => {
      const timeA = a.contributedAt?.toMillis?.() || 0;
      const timeB = b.contributedAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
    
    // Extract just the items
    return contributionsWithTime.map(c => c.item);
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    throw error;
  }
};

/**
 * Update a user contribution
 */
export const updateUserContribution = async (
  itemId: string,
  category: CategoryType,
  updates: Partial<SwipeItem>
): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to update items');
  }

  const userId = auth.currentUser.uid;
  
  // Verify ownership by checking userContributions collection
  const contributionsRef = collection(db, 'userContributions');
  const q = query(
    contributionsRef,
    where('userId', '==', userId),
    where('itemId', '==', itemId)
  );
  
  const contributionsSnapshot = await getDocs(q);
  
  if (contributionsSnapshot.empty) {
    throw new Error('You can only edit your own contributions');
  }
  
  // Determine collection name
  const collectionName = category === 'hikes' ? 'trails' : category === 'tv' ? 'tvShows' : category;
  const itemRef = doc(db, collectionName, itemId);
  
  // Check if item exists
  const itemDoc = await getDoc(itemRef);
  if (!itemDoc.exists()) {
    throw new Error('Item not found');
  }
  
  // For items with createdBy field, verify it matches (extra security for new items)
  const itemData = itemDoc.data() as SwipeItem;
  if (itemData.createdBy && itemData.createdBy !== userId) {
    throw new Error('You can only edit your own contributions');
  }
  
  // Update the item
  await updateDoc(itemRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
  
  console.log('✅ Contribution updated!', { itemId, category });
};

/**
 * Delete a user contribution (soft delete)
 */
export const deleteUserContribution = async (
  itemId: string,
  category: CategoryType
): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to delete items');
  }

  const userId = auth.currentUser.uid;
  
  // Verify ownership by checking userContributions collection
  const contributionsRef = collection(db, 'userContributions');
  const q = query(
    contributionsRef,
    where('userId', '==', userId),
    where('itemId', '==', itemId)
  );
  
  const contributionsSnapshot = await getDocs(q);
  
  if (contributionsSnapshot.empty) {
    throw new Error('You can only delete your own contributions');
  }
  
  // Determine collection name
  const collectionName = category === 'hikes' ? 'trails' : category === 'tv' ? 'tvShows' : category;
  const itemRef = doc(db, collectionName, itemId);
  
  // Check if item exists
  const itemDoc = await getDoc(itemRef);
  if (!itemDoc.exists()) {
    throw new Error('Item not found');
  }
  
  // For items with createdBy field, verify it matches (extra security for new items)
  const itemData = itemDoc.data() as SwipeItem;
  if (itemData.createdBy && itemData.createdBy !== userId) {
    throw new Error('You can only delete your own contributions');
  }
  
  // Delete the item from the collection
  await deleteDoc(itemRef);
  
  // Update userContributions status to deleted
  for (const contributionDoc of contributionsSnapshot.docs) {
    await updateDoc(doc(db, 'userContributions', contributionDoc.id), {
      status: 'deleted',
      deletedAt: Timestamp.now(),
    });
  }
  
  console.log('🗑️ Contribution deleted!', { itemId, category });
};

// ============================================================================
// RESET MATCHES FUNCTIONS
// ============================================================================

/**
 * Send a reset request to a connected friend for a specific category
 */
export const sendResetRequest = async (
  toUserId: string,
  category: CategoryType
): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in');
  }

  const fromUserId = auth.currentUser.uid;

  // Check if users are connected
  const isConnected = await checkConnection(toUserId);
  if (!isConnected) {
    throw new Error('You must be connected with this user first');
  }

  // Get both user profiles
  const [fromProfile, toProfile] = await Promise.all([
    getUserProfile(fromUserId),
    getUserProfile(toUserId)
  ]);

  if (!fromProfile || !toProfile) {
    throw new Error('User profile not found');
  }

  // Check if there's already a pending request between these users for this category
  const resetRequestsRef = collection(db, 'resetRequests');
  const existingQuery = query(
    resetRequestsRef,
    where('fromUserId', 'in', [fromUserId, toUserId]),
    where('toUserId', 'in', [fromUserId, toUserId]),
    where('category', '==', category),
    where('status', '==', 'pending')
  );
  
  const existingSnapshot = await getDocs(existingQuery);
  
  if (!existingSnapshot.empty) {
    throw new Error('There is already a pending reset request for this category');
  }

  // Create the reset request
  const resetRequestRef = doc(collection(db, 'resetRequests'));
  await setDoc(resetRequestRef, {
    fromUserId,
    fromUsername: fromProfile.username,
    fromDisplayName: fromProfile.displayName,
    toUserId,
    toUsername: toProfile.username,
    toDisplayName: toProfile.displayName,
    category,
    status: 'pending',
    createdAt: Timestamp.now(),
  });

  console.log('✅ Reset request sent!', { fromUserId, toUserId, category });
};

/**
 * Get reset requests sent by current user
 */
export const getSentResetRequests = async (): Promise<ResetRequest[]> => {
  if (!auth.currentUser) return [];

  const resetRequestsRef = collection(db, 'resetRequests');
  const q = query(
    resetRequestsRef,
    where('fromUserId', '==', auth.currentUser.uid),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as ResetRequest));
};

/**
 * Get reset requests received by current user
 */
export const getReceivedResetRequests = async (): Promise<ResetRequest[]> => {
  if (!auth.currentUser) return [];

  const resetRequestsRef = collection(db, 'resetRequests');
  const q = query(
    resetRequestsRef,
    where('toUserId', '==', auth.currentUser.uid),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as ResetRequest));
};

/**
 * Accept a reset request and clear mutual matches for that category
 */
export const acceptResetRequest = async (requestId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in');
  }

  const requestRef = doc(db, 'resetRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Reset request not found');
  }

  const request = requestSnap.data() as Omit<ResetRequest, 'id'>;
  
  if (request.toUserId !== auth.currentUser.uid) {
    throw new Error('You can only accept requests sent to you');
  }

  if (request.status !== 'pending') {
    throw new Error('This request has already been processed');
  }

  // Update request status
  await updateDoc(requestRef, {
    status: 'accepted',
    acceptedAt: Timestamp.now(),
  });

  // Delete all mutual matches between these two users for this category
  const matchesRef = collection(db, 'matches');
  const matchesSnapshot = await getDocs(matchesRef);
  
  let deletedCount = 0;
  
  for (const matchDoc of matchesSnapshot.docs) {
    const matchData = matchDoc.data();
    const matchCategory = matchData.category || 'hikes';
    
    // Check if this match involves both users and is in the specified category
    if (
      matchCategory === request.category &&
      matchData.userIds &&
      matchData.userIds.includes(request.fromUserId) &&
      matchData.userIds.includes(request.toUserId)
    ) {
      await deleteDoc(doc(db, 'matches', matchDoc.id));
      deletedCount++;
    }
  }

  // Also delete swipes for the matched items between these two users
  // This allows them to swipe again on the same items
  const user1SwipesRef = collection(db, 'userSwipes', request.fromUserId, 'swipes');
  const user2SwipesRef = collection(db, 'userSwipes', request.toUserId, 'swipes');
  
  const [user1Swipes, user2Swipes] = await Promise.all([
    getDocs(query(user1SwipesRef, where('category', '==', request.category), where('liked', '==', true))),
    getDocs(query(user2SwipesRef, where('category', '==', request.category), where('liked', '==', true)))
  ]);

  // Find common liked items
  const user1LikedIds = new Set(user1Swipes.docs.map(doc => doc.id));
  const user2LikedIds = new Set(user2Swipes.docs.map(doc => doc.id));
  
  const mutuallyLikedIds = [...user1LikedIds].filter(id => user2LikedIds.has(id));

  // Delete swipes for mutually liked items
  for (const itemId of mutuallyLikedIds) {
    await Promise.all([
      deleteDoc(doc(db, 'userSwipes', request.fromUserId, 'swipes', itemId)),
      deleteDoc(doc(db, 'userSwipes', request.toUserId, 'swipes', itemId))
    ]);
  }

  console.log('✅ Reset request accepted!', { 
    requestId, 
    category: request.category, 
    matchesDeleted: deletedCount,
    swipesDeleted: mutuallyLikedIds.length * 2
  });
};

/**
 * Reject a reset request
 */
export const rejectResetRequest = async (requestId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in');
  }

  const requestRef = doc(db, 'resetRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Reset request not found');
  }

  const request = requestSnap.data() as Omit<ResetRequest, 'id'>;
  
  if (request.toUserId !== auth.currentUser.uid) {
    throw new Error('You can only reject requests sent to you');
  }

  // Update request status
  await updateDoc(requestRef, {
    status: 'rejected',
    rejectedAt: Timestamp.now(),
  });

  console.log('❌ Reset request rejected', { requestId });
};

/**
 * Cancel a sent reset request
 */
export const cancelResetRequest = async (requestId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in');
  }

  const requestRef = doc(db, 'resetRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Reset request not found');
  }

  const request = requestSnap.data() as Omit<ResetRequest, 'id'>;
  
  if (request.fromUserId !== auth.currentUser.uid) {
    throw new Error('You can only cancel your own requests');
  }

  // Delete the request
  await deleteDoc(requestRef);

  console.log('🚫 Reset request cancelled', { requestId });
};

