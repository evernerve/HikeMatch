import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

async function checkRestaurants() {
  console.log('🔍 Checking restaurants in Firestore...\n');
  
  try {
    const restaurantsRef = collection(db, 'restaurants');
    const snapshot = await getDocs(restaurantsRef);
    
    console.log(`📊 Found ${snapshot.docs.length} restaurants\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. ${doc.id}`);
      console.log('   Fields:', Object.keys(data));
      console.log('   Has categoryData:', 'categoryData' in data);
      console.log('   Has category:', 'category' in data);
      console.log('   Has name:', 'name' in data);
      
      if ('categoryData' in data) {
        console.log('   categoryData fields:', Object.keys(data.categoryData));
      } else {
        console.log('   ⚠️  MISSING categoryData!');
      }
      
      // Show first restaurant in full detail
      if (index === 0) {
        console.log('\n   Full data structure:');
        console.log(JSON.stringify(data, null, 2));
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking restaurants:', error);
  }
}

checkRestaurants();
