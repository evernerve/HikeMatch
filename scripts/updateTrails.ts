import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Firebase config - you'll need to update this with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBdABsUO9CvnuaLyYvMTLpGkiKLKwB9dGQ",
  authDomain: "hikematch42.firebaseapp.com",
  projectId: "hikematch42",
  storageBucket: "hikematch42.firebasestorage.app",
  messagingSenderId: "785095913932",
  appId: "1:785095913932:web:32f1a3bf0dbec0cbed4c2a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Munich autumn hiking trails
const munichTrails = [
  {
    id: 'perlacher-mugl',
    name: 'Perlacher Mugl',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    description: 'A 587-meter hill in Perlacher Forest offering breathtaking Alpine panorama from Wendelstein to Zugspitze. Perfect for when you crave mountain views without the long journey.',
    lengthKm: 8,
    durationHours: 2,
    difficulty: 'easy' as const,
    elevationGainM: 150,
    location: 'Perlacher Forst',
    distanceFromMunichKm: 12,
    publicTransportTime: 30,
    scenery: 'Forest panorama',
    pathType: 'Forest paths'
  },
  {
    id: 'staffelsee-runde',
    name: 'Staffelsee Loop',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'A flat 22 km loop around beautiful Staffelsee lake with the Obersee nature reserve and the Gasthof Alpenblick. Option to take a boat back from Alpenblick to save 8 km.',
    lengthKm: 22,
    durationHours: 5,
    difficulty: 'easy' as const,
    elevationGainM: 50,
    location: 'Murnau am Staffelsee',
    distanceFromMunichKm: 70,
    publicTransportTime: 60,
    scenery: 'Lake & nature',
    pathType: 'Flat lake path'
  },
  {
    id: 'kofel-oberammergau',
    name: 'Kofel - Oberammergau Matterhorn',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    description: 'The 1,342m Kofel, nicknamed the "Oberammergau Matterhorn," features steep serpentines through forest, ending at Kolbensattelhütte. Cable-secured summit trail with Alpine Coaster descent option.',
    lengthKm: 11,
    durationHours: 3.5,
    difficulty: 'moderate' as const,
    elevationGainM: 600,
    location: 'Oberammergau',
    distanceFromMunichKm: 90,
    publicTransportTime: 105,
    scenery: 'Mountain peak',
    pathType: 'Mountain trail'
  },
  {
    id: 'jochberg',
    name: 'Jochberg',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Classic Munich area peak with stunning 360° panorama. See Kochelsee and turquoise Walchensee below, with Karwendel and Wetterstein ranges including Zugspitze. Round trip via Jocheralm available.',
    lengthKm: 9,
    durationHours: 3.5,
    difficulty: 'moderate' as const,
    elevationGainM: 720,
    location: 'Kochel am See',
    distanceFromMunichKm: 70,
    publicTransportTime: 75,
    scenery: 'Mountain lakes',
    pathType: 'Mountain trail'
  },
  {
    id: 'wank-garmisch',
    name: 'Wank via Gondola',
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
    description: 'Take the historic Wank gondola up to 1,780m, then hike down through steep trails to Gschwandtnerbauer restaurant. Spectacular views of Karwendel, Wetterstein, Zugspitze, and Tyrolean peaks.',
    lengthKm: 12,
    durationHours: 4,
    difficulty: 'moderate' as const,
    elevationGainM: 100,
    location: 'Garmisch-Partenkirchen',
    distanceFromMunichKm: 90,
    publicTransportTime: 60,
    scenery: 'Mountain panorama',
    pathType: 'Descent trail'
  },
  {
    id: 'seekarkreuz',
    name: 'Seekarkreuz',
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80',
    description: 'Typical Bavarian pre-alpine peak at 1,601m with forest below and grass summit. Excellent views of Tegernsee mountains. Stop at Lenggrieser Hütte before summit, descend via Seekaralm and Hirschbachtal.',
    lengthKm: 14,
    durationHours: 5.5,
    difficulty: 'moderate' as const,
    elevationGainM: 900,
    location: 'Lenggries',
    distanceFromMunichKm: 60,
    publicTransportTime: 60,
    scenery: 'Alpine meadows',
    pathType: 'Mountain trail'
  },
  {
    id: 'prinzenweg',
    name: 'Prinzenweg: Schliersee to Tegernsee',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Connects two beloved Munich destinations. Walk along Schliersee, up the Prinzenweg to Kreuzbergalm, continue via Gindelalm to Berggasthof Neureuth. End at Tegernsee Bräustüberl for beer and pork roast.',
    lengthKm: 15,
    durationHours: 3.5,
    difficulty: 'easy' as const,
    elevationGainM: 660,
    location: 'Schliersee',
    distanceFromMunichKm: 55,
    publicTransportTime: 60,
    scenery: 'Two lakes',
    pathType: 'Connecting trail'
  },
  {
    id: 'taubenstein',
    name: 'Taubenstein Summit & Hütte',
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
    description: 'From Spitzingsattel, hike through forest and alpine meadows to Taubensteinsattel. Optional summit detour to 1,693m Taubensteingipfel. Must-visit Schönfeldhütte for alpine cuisine.',
    lengthKm: 10,
    durationHours: 4,
    difficulty: 'moderate' as const,
    elevationGainM: 650,
    location: 'Spitzingsee',
    distanceFromMunichKm: 65,
    publicTransportTime: 75,
    scenery: 'Alpine terrain',
    pathType: 'Mountain trail'
  },
  {
    id: 'laubenstein',
    name: 'Laubenstein with Chiemsee View',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Bavarian pre-alpine peak with views of Chiemsee and Kampenwand. Start at Schloss Hohenaschau, climb through forest via Hofalm to Laubensteingatterl, reaching summit at Laubensteinalm. Stop at Frasdorfer Hütte on descent.',
    lengthKm: 14,
    durationHours: 4.5,
    difficulty: 'easy' as const,
    elevationGainM: 750,
    location: 'Aschau im Chiemgau',
    distanceFromMunichKm: 80,
    publicTransportTime: 75,
    scenery: 'Lake & peaks',
    pathType: 'Mountain trail'
  },
  {
    id: 'grosser-ahornboden',
    name: 'Großer Ahornboden Nature Monument',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
    description: "Tirol's most beautiful place! 2,000 golden maple trees (some 600 years old) against dramatic Karwendel backdrop. Short hike to Binsalm via Panoramaweg. Options for Hahnkampl (2,080m) or Lamsenspitze (2,508m).",
    lengthKm: 3,
    durationHours: 0.75,
    difficulty: 'easy' as const,
    elevationGainM: 250,
    location: 'Eng, Tirol',
    distanceFromMunichKm: 100,
    publicTransportTime: 120,
    scenery: 'Autumn colors',
    pathType: 'Easy trail'
  },
  {
    id: 'wendelstein',
    name: 'Wendelstein Panorama Peak',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Iconic 1,838m peak visible from Munich with church, cave, and hut. Bombastic 360° views: Inn valley, Simssee, Chiemsee below; Berchtesgaden Alps, Chiemgau, Kaiser range, Großglockner, Karwendel, and Zugspitze surrounding you.',
    lengthKm: 12,
    durationHours: 4.75,
    difficulty: 'moderate' as const,
    elevationGainM: 1200,
    location: 'Bayrischzell',
    distanceFromMunichKm: 70,
    publicTransportTime: 75,
    scenery: 'Ultimate panorama',
    pathType: 'Mountain trail'
  }
];

async function updateTrails() {
  console.log('Starting to update trails in Firebase...\n');

  try {
    for (const trail of munichTrails) {
      const trailRef = doc(db, 'trails', trail.id);
      await setDoc(trailRef, trail);
      console.log(`✅ Added/Updated: ${trail.name}`);
    }

    console.log('\n🎉 Successfully updated all trails!');
    console.log(`Total trails: ${munichTrails.length}`);
    
  } catch (error) {
    console.error('❌ Error updating trails:', error);
  }

  process.exit(0);
}

updateTrails();
