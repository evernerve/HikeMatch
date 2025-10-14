import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { SwipeItem } from '../src/types/categories';
import { db } from './firebaseConfig';

const restaurantData: Omit<SwipeItem, 'id'>[] = [
  {
    category: 'restaurants',
    name: 'Hofbräuhaus München',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500',
    description: 'The world\'s most famous beer hall, serving traditional Bavarian cuisine since 1589.',
    categoryData: {
      restaurantName: 'Hofbräuhaus München',
      cuisine: ['German', 'Bavarian', 'Beer Hall'],
      priceRange: '€€',
      location: 'Altstadt-Lehel',
      address: 'Platzl 9, 80331 München',
      rating: 4.3,
      reviewCount: 28500,
      phone: '+49 89 290136100',
      website: 'https://www.hofbraeuhaus.de',
      hours: '9:00 AM - 11:30 PM daily',
      specialties: ['Schweinshaxe', 'Weisswurst', 'Obatzda', 'Pretzels'],
      dietaryOptions: ['Vegetarian options available'],
      ambiance: ['Traditional', 'Lively', 'Tourist-friendly', 'Large groups']
    }
  },
  {
    category: 'restaurants',
    name: 'Tantris',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
    description: 'Two Michelin-starred restaurant offering innovative French cuisine in a distinctive 1970s setting.',
    categoryData: {
      restaurantName: 'Tantris',
      cuisine: ['French', 'Fine Dining', 'Contemporary'],
      priceRange: '€€€€',
      location: 'Schwabing-Freimann',
      address: 'Johann-Fichte-Straße 7, 80805 München',
      rating: 4.7,
      reviewCount: 850,
      phone: '+49 89 3619590',
      website: 'https://www.tantris.de',
      hours: 'Tue-Sat: 12:00 PM - 2:00 PM, 7:00 PM - 10:00 PM',
      specialties: ['Tasting menus', 'Wine pairings', 'Seasonal ingredients'],
      dietaryOptions: ['Vegetarian menu', 'Vegan options on request'],
      ambiance: ['Elegant', 'Romantic', 'Special occasion', 'Formal']
    }
  },
  {
    category: 'restaurants',
    name: 'Viktualienmarkt Food Stalls',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',
    description: 'Munich\'s famous outdoor market with diverse food stalls and a beer garden at its heart.',
    categoryData: {
      restaurantName: 'Viktualienmarkt Food Stalls',
      cuisine: ['International', 'Street Food', 'German', 'Asian'],
      priceRange: '€',
      location: 'Altstadt-Lehel',
      address: 'Viktualienmarkt 3, 80331 München',
      rating: 4.5,
      reviewCount: 15600,
      website: 'https://www.viktualienmarkt-muenchen.de',
      hours: 'Mon-Sat: 8:00 AM - 6:00 PM (varies by stall)',
      specialties: ['Fresh produce', 'Cheese', 'Sausages', 'International food'],
      dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-free options'],
      ambiance: ['Casual', 'Outdoor', 'Market atmosphere', 'Quick bites']
    }
  },
  {
    category: 'restaurants',
    name: 'Pageou',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
    description: 'Modern French-Mediterranean cuisine in an elegant setting near the Hofgarten.',
    categoryData: {
      restaurantName: 'Pageou',
      cuisine: ['French', 'Mediterranean', 'Contemporary'],
      priceRange: '€€€',
      location: 'Altstadt-Lehel',
      address: 'Kardinal-Döpfner-Straße 1, 80333 München',
      rating: 4.6,
      reviewCount: 420,
      phone: '+49 89 24218260',
      website: 'https://www.pageou.de',
      hours: 'Mon-Sat: 6:00 PM - 11:00 PM',
      specialties: ['Seasonal menus', 'Wine selection', 'French classics with a twist'],
      dietaryOptions: ['Vegetarian options', 'Allergies accommodated'],
      ambiance: ['Upscale', 'Romantic', 'Intimate', 'Modern']
    }
  },
  {
    category: 'restaurants',
    name: 'Gratitude',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
    description: 'Plant-based restaurant with creative vegan dishes in a stylish, Instagram-worthy space.',
    categoryData: {
      restaurantName: 'Gratitude',
      cuisine: ['Vegan', 'International', 'Healthy'],
      priceRange: '€€',
      location: 'Maxvorstadt',
      address: 'Türkenstraße 55, 80799 München',
      rating: 4.7,
      reviewCount: 1850,
      phone: '+49 89 20207596',
      website: 'https://www.gratitude-restaurant.de',
      hours: 'Mon-Sat: 11:30 AM - 10:00 PM, Sun: 12:00 PM - 9:00 PM',
      specialties: ['Buddha bowls', 'Vegan burgers', 'Raw desserts', 'Smoothies'],
      dietaryOptions: ['100% Vegan', 'Gluten-free options', 'Raw options'],
      ambiance: ['Casual', 'Trendy', 'Health-conscious', 'Instagram-worthy']
    }
  },
  {
    category: 'restaurants',
    name: 'Schneider Bräuhaus',
    image: 'https://images.unsplash.com/photo-1558985212-92c2ff0b56e7?w=500',
    description: 'Traditional Bavarian brewery restaurant famous for its wheat beer and hearty dishes.',
    categoryData: {
      restaurantName: 'Schneider Bräuhaus',
      cuisine: ['Bavarian', 'German', 'Brewery'],
      priceRange: '€€',
      location: 'Altstadt-Lehel',
      address: 'Tal 7, 80331 München',
      rating: 4.4,
      reviewCount: 3200,
      phone: '+49 89 290 1380',
      website: 'https://www.schneider-brauhaus.de',
      hours: '10:00 AM - 12:00 AM daily',
      specialties: ['Weisswurst', 'Schweinebraten', 'Original wheat beer', 'Bavarian dumplings'],
      dietaryOptions: ['Vegetarian options available'],
      ambiance: ['Traditional', 'Family-friendly', 'Brewery atmosphere', 'Tourist-friendly']
    }
  },
  {
    category: 'restaurants',
    name: 'Emiko',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
    description: 'Contemporary Japanese restaurant with sushi bar and robata grill in a chic setting.',
    categoryData: {
      restaurantName: 'Emiko',
      cuisine: ['Japanese', 'Sushi', 'Asian'],
      priceRange: '€€€',
      location: 'Altstadt-Lehel',
      address: 'Karl-Scharnagl-Ring 6, 80539 München',
      rating: 4.6,
      reviewCount: 680,
      phone: '+49 89 21028030',
      website: 'https://www.emiko-restaurant.de',
      hours: 'Mon-Sat: 6:00 PM - 11:00 PM',
      specialties: ['Omakase', 'Robata-grilled dishes', 'Premium sushi', 'Sake selection'],
      dietaryOptions: ['Vegetarian sushi', 'Gluten-free options on request'],
      ambiance: ['Upscale', 'Modern', 'Date night', 'Bar seating']
    }
  },
  {
    category: 'restaurants',
    name: 'Augustiner-Bräu',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=500',
    description: 'Munich\'s oldest independent brewery with a traditional beer hall and garden.',
    categoryData: {
      restaurantName: 'Augustiner-Bräu',
      cuisine: ['Bavarian', 'German', 'Beer Hall'],
      priceRange: '€€',
      location: 'Ludwigsvorstadt-Isarvorstadt',
      address: 'Landsberger Str. 19, 80339 München',
      rating: 4.5,
      reviewCount: 4100,
      phone: '+49 89 507047',
      website: 'https://www.augustinerbier.de',
      hours: 'Mon-Fri: 10:00 AM - 12:00 AM, Sat-Sun: 9:00 AM - 12:00 AM',
      specialties: ['Augustiner beer', 'Roast pork', 'Potato salad', 'Obatzda'],
      dietaryOptions: ['Limited vegetarian options'],
      ambiance: ['Traditional', 'Beer garden', 'Large groups', 'Family-friendly']
    }
  },
  {
    category: 'restaurants',
    name: 'Tian',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500',
    description: 'Michelin-starred vegetarian fine dining with creative, seasonal tasting menus.',
    categoryData: {
      restaurantName: 'Tian',
      cuisine: ['Vegetarian', 'Fine Dining', 'Contemporary'],
      priceRange: '€€€€',
      location: 'Lehel',
      address: 'Frauenstraße 4, 80469 München',
      rating: 4.8,
      reviewCount: 390,
      phone: '+49 89 88579771',
      website: 'https://www.tian-restaurant.com',
      hours: 'Tue-Sat: 6:30 PM - 10:00 PM',
      specialties: ['Vegetable tasting menus', 'Wine pairings', 'Artisanal techniques'],
      dietaryOptions: ['100% Vegetarian', 'Vegan menu available', 'Gluten-free options'],
      ambiance: ['Elegant', 'Intimate', 'Special occasion', 'Refined']
    }
  },
  {
    category: 'restaurants',
    name: 'Rusticana',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
    description: 'Cozy Italian trattoria serving authentic pasta, pizza, and regional Italian wines.',
    categoryData: {
      restaurantName: 'Rusticana',
      cuisine: ['Italian', 'Pizza', 'Pasta'],
      priceRange: '€€',
      location: 'Schwabing',
      address: 'Leopoldstraße 45, 80802 München',
      rating: 4.5,
      reviewCount: 920,
      phone: '+49 89 390604',
      website: 'https://www.rusticana-muenchen.de',
      hours: 'Mon-Sun: 11:30 AM - 11:30 PM',
      specialties: ['Fresh pasta', 'Wood-fired pizza', 'Italian wines', 'Tiramisu'],
      dietaryOptions: ['Vegetarian options', 'Vegan pasta available', 'Gluten-free pizza'],
      ambiance: ['Cozy', 'Romantic', 'Family-friendly', 'Authentic']
    }
  }
];

async function seedRestaurants() {
  console.log('🍽️ Starting to seed restaurants...');
  
  try {
    for (const restaurant of restaurantData) {
      const restaurantId = restaurant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const now = Timestamp.now();
      await setDoc(doc(db, 'restaurants', restaurantId), {
        ...restaurant,
        id: restaurantId,
        createdAt: now,
        updatedAt: now
      });
      console.log(`✅ Added: ${restaurant.name}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${restaurantData.length} restaurants!`);
  } catch (error) {
    console.error('❌ Error seeding restaurants:', error);
    throw error;
  }
}

seedRestaurants();
