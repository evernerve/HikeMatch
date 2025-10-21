import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "",
  authDomain: "hikematch42.firebaseapp.com",
  projectId: "hikematch42",
  storageBucket: "hikematch42.firebasestorage.app",
  messagingSenderId: "785095913932",
  appId: "1:785095913932:web:32f1a3bf0dbec0cbed4c2a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// IDs of Munich trails to keep
const munichTrailIds = [
  'perlacher-mugl',
  'staffelsee-runde',
  'kofel-oberammergau',
  'jochberg',
  'wank-garmisch',
  'seekarkreuz',
  'prinzenweg',
  'taubenstein',
  'laubenstein',
  'grosser-ahornboden',
  'wendelstein'
];

async function cleanupOldTrails() {
  console.log('Fetching all trails from Firebase...\n');

  try {
    const trailsRef = collection(db, 'trails');
    const snapshot = await getDocs(trailsRef);
    
    console.log(`Found ${snapshot.size} total trails\n`);
    
    let deletedCount = 0;
    let keptCount = 0;

    for (const trailDoc of snapshot.docs) {
      const trailId = trailDoc.id;
      const trailData = trailDoc.data();
      
      if (!munichTrailIds.includes(trailId)) {
        // Delete this trail
        await deleteDoc(doc(db, 'trails', trailId));
        console.log(`🗑️  Deleted: ${trailData.name || trailId}`);
        deletedCount++;
      } else {
        console.log(`✅ Keeping: ${trailData.name || trailId}`);
        keptCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Kept: ${keptCount} Munich trails`);
    console.log(`   Deleted: ${deletedCount} old trails`);
    console.log('\n🎉 Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error cleaning up trails:', error);
  }

  process.exit(0);
}

cleanupOldTrails();
