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
  userIds: string[];
  userProfiles: { uid: string; username: string; displayName: string }[];
  matchedAt: Timestamp;
  trail?: Trail;
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
      const trail = await getTrailById(matchData.trailId);
      
      matches.push({
        ...matchData,
        trail: trail || undefined,
      } as Match);
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
 */
export const sendConnectionRequest = async (toUsername: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  
  const fromUser = await getUserProfile(auth.currentUser.uid);
  if (!fromUser) throw new Error('User profile not found');
  
  const toUser = await getUserByUsername(toUsername);
  if (!toUser) throw new Error('User not found');
  
  if (fromUser.uid === toUser.uid) {
    throw new Error('Cannot send request to yourself');
  }
  
  // Check if request already exists
  const requestsRef = collection(db, 'connectionRequests');
  const existingRequest = query(
    requestsRef,
    where('fromUserId', '==', fromUser.uid),
    where('toUserId', '==', toUser.uid),
    where('status', '==', 'pending')
  );
  const existingSnapshot = await getDocs(existingRequest);
  
  if (!existingSnapshot.empty) {
    throw new Error('Connection request already sent');
  }
  
  // Check if already connected
  const isConnected = await checkConnection(toUser.uid);
  if (isConnected) {
    throw new Error('Already connected with this user');
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
  
  // Update request status
  await setDoc(requestRef, { ...request, status: 'accepted' });
  
  // Create connection for both users
  const connection1Ref = doc(collection(db, 'connections'));
  await setDoc(connection1Ref, {
    userId: request.fromUserId,
    connectedUserId: request.toUserId,
    connectedUsername: request.toUsername,
    connectedDisplayName: (await getUserProfile(request.toUserId))?.displayName || '',
    connectedAt: Timestamp.now()
  });
  
  const connection2Ref = doc(collection(db, 'connections'));
  await setDoc(connection2Ref, {
    userId: request.toUserId,
    connectedUserId: request.fromUserId,
    connectedUsername: request.fromUsername,
    connectedDisplayName: request.fromDisplayName,
    connectedAt: Timestamp.now()
  });
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
