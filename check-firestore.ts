import { db } from './src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function checkData() {
  console.log('\n📊 Checking Firestore collections...\n');
  
  const collections = ['trails', 'movies', 'tvShows', 'restaurants'];
  
  for (const collectionName of collections) {
    try {
      const snap = await getDocs(collection(db, collectionName));
      console.log(`${collectionName}: ${snap.size} items`);
      if (snap.size > 0) {
        const firstDoc = snap.docs[0].data();
        const name = firstDoc.name || firstDoc.title || firstDoc.restaurantName;
        console.log(`  Sample: ${name}`);
      }
    } catch (error) {
      console.log(`${collectionName}: Error - ${error}`);
    }
  }
  
  console.log('\n✅ Check complete\n');
  process.exit(0);
}

checkData().catch(console.error);
