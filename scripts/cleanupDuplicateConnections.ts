import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase config - use your actual config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Connection {
  userId: string;
  connectedUserId: string;
  connectedUsername: string;
  connectedDisplayName: string;
  connectedAt: any;
}

async function cleanupDuplicateConnections() {
  console.log('🔍 Scanning for duplicate connections...\n');

  const connectionsRef = collection(db, 'connections');
  const snapshot = await getDocs(connectionsRef);

  console.log(`📊 Total connections found: ${snapshot.docs.length}`);

  // Build a map of connections grouped by user
  const connectionsByUser = new Map<string, Map<string, string[]>>();

  snapshot.docs.forEach(docSnap => {
    const connection = docSnap.data() as Connection;
    const userId = connection.userId;
    const connectedUserId = connection.connectedUserId;

    if (!connectionsByUser.has(userId)) {
      connectionsByUser.set(userId, new Map());
    }

    const userConnections = connectionsByUser.get(userId)!;
    if (!userConnections.has(connectedUserId)) {
      userConnections.set(connectedUserId, []);
    }

    userConnections.get(connectedUserId)!.push(docSnap.id);
  });

  // Find and remove duplicates
  let duplicatesFound = 0;
  let duplicatesRemoved = 0;

  for (const [userId, connections] of connectionsByUser.entries()) {
    for (const [connectedUserId, docIds] of connections.entries()) {
      if (docIds.length > 1) {
        duplicatesFound++;
        console.log(`\n⚠️  Found ${docIds.length} duplicate connections:`);
        console.log(`   User: ${userId}`);
        console.log(`   Connected to: ${connectedUserId}`);
        console.log(`   Document IDs: ${docIds.join(', ')}`);

        // Keep the first one (usually oldest), delete the rest
        const toDelete = docIds.slice(1);
        console.log(`   🗑️  Deleting ${toDelete.length} duplicate(s)...`);

        for (const docId of toDelete) {
          await deleteDoc(doc(db, 'connections', docId));
          duplicatesRemoved++;
          console.log(`   ✅ Deleted: ${docId}`);
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total connections scanned: ${snapshot.docs.length}`);
  console.log(`Duplicate sets found: ${duplicatesFound}`);
  console.log(`Duplicate documents removed: ${duplicatesRemoved}`);
  console.log(`Connections remaining: ${snapshot.docs.length - duplicatesRemoved}`);
  console.log('='.repeat(60));

  if (duplicatesRemoved > 0) {
    console.log('\n✅ Cleanup complete! Your connections are now deduplicated.');
  } else {
    console.log('\n✅ No duplicates found! Your connections are clean.');
  }
}

cleanupDuplicateConnections()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  });
