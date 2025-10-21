// Import shared Firebase config to initialize once
import './firebaseConfig';

async function seedAll() {
  console.log('🌱 Starting to seed all categories...\n');
  
  try {
    // Seed movies
    console.log('📦 Seeding movies...');
    await import('./seedMovies');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Seed TV shows
    console.log('\n📦 Seeding TV shows...');
    await import('./seedTVShows');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Seed restaurants
    console.log('\n📦 Seeding restaurants...');
    await import('./seedRestaurants');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n✅ All data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Movies: 10 items');
    console.log('  - TV Shows: 10 items');
    console.log('  - Restaurants: 10 items');
    console.log('  - Trails: Already seeded (hikes category)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedAll();
