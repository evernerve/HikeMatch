import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

async function cleanupIncompleteRestaurants() {
  console.log('🧹 Cleaning up incomplete restaurants...\n');
  
  try {
    const restaurantsRef = collection(db, 'restaurants');
    const snapshot = await getDocs(restaurantsRef);
    
    let deletedCount = 0;
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Check if categoryData is empty or missing required fields
      const categoryData = data.categoryData || {};
      const hasRequiredFields = 'cuisine' in categoryData && 
                               'priceRange' in categoryData && 
                               'address' in categoryData;
      
      if (!hasRequiredFields) {
        console.log(`❌ Deleting incomplete restaurant: ${docSnap.id} (${data.name})`);
        console.log(`   Missing fields in categoryData:`, Object.keys(categoryData));
        
        await deleteDoc(doc(db, 'restaurants', docSnap.id));
        deletedCount++;
      }
    }
    
    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} incomplete restaurant(s).`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupIncompleteRestaurants();
