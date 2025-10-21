import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

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

// Munich autumn hiking trails with detailed information
const munichTrails = [
  {
    id: 'perlacher-mugl',
    name: 'Perlacher Mugl',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    description: 'A 587-meter hill in Perlacher Forest offering breathtaking Alpine panorama.',
    lengthKm: 8,
    durationHours: 2,
    difficulty: 'easy' as const,
    elevationGainM: 150,
    location: 'Perlacher Forst',
    distanceFromMunichKm: 12,
    publicTransportTime: 30,
    scenery: 'Forest panorama',
    pathType: 'Forest paths',
    specialFeature: 'Despite being only 26 meters higher than the surrounding forest, this hill rewards you with an incredible Alpine panorama stretching from Wendelstein to Zugspitze - perfect for those days when you crave mountain views without the long journey!',
    detailedDescription: 'The Perlacher Mugl is the perfect solution for when your conscience tells you to get outside, but motivation is low. At 587 meters, this hill is barely higher than the Perlacher Forest around it, yet surprises hikers with breathtaking Alpine views. All paths lead to the Mugl, so you can decide based on time and energy whether it\'s a short walk or a 3-hour forest hike.',
    highlights: [
      'Stunning Alpine panorama from Wendelstein to Zugspitze',
      'Multiple route options from 1-3 hours',
      'Very accessible via U1 or Tram 25',
      'Cozy cafés nearby: Amandines et Chocolate and Taverna Limani'
    ]
  },
  {
    id: 'staffelsee-runde',
    name: 'Staffelsee Loop',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'A flat 22 km loop around beautiful Staffelsee lake with nature reserve and scenic views.',
    lengthKm: 22,
    durationHours: 5,
    difficulty: 'easy' as const,
    elevationGainM: 50,
    location: 'Murnau am Staffelsee',
    distanceFromMunichKm: 70,
    publicTransportTime: 60,
    scenery: 'Lake & nature',
    pathType: 'Flat lake path',
    specialFeature: 'A perfect mountain alternative! Enjoy stunning lake views without the climb, and if you get tired, hop on a boat from Gasthof Alpenblick to skip the last 8 km - the ultimate flexible hiking experience.',
    detailedDescription: 'Don\'t feel like climbing but still want beautiful views? The 22 km Staffelsee loop runs on flat paths but requires some endurance. After about 6 km, you\'ll reach the Obersee nature reserve with rare plants and animals. At km 13, you can rest at Gasthof Alpenblick, and if you\'re too full to continue, take the boat back to Murnau, saving 8 km and 2 hours!',
    highlights: [
      'Obersee nature reserve with rare species',
      'Gasthof Alpenblick restaurant at halfway point',
      'Option to return by boat from Alpenblick',
      'Completely flat terrain suitable for all fitness levels'
    ]
  },
  {
    id: 'kofel-oberammergau',
    name: 'Kofel - Oberammergau Matterhorn',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    description: 'The 1,342m Kofel, nicknamed the "Oberammergau Matterhorn," with cable-secured summit trail.',
    lengthKm: 11,
    durationHours: 3.5,
    difficulty: 'moderate' as const,
    elevationGainM: 600,
    location: 'Oberammergau',
    distanceFromMunichKm: 90,
    publicTransportTime: 105,
    scenery: 'Mountain peak',
    pathType: 'Mountain trail',
    specialFeature: 'Called the "Oberammergau Matterhorn" by locals, this distinctive peak offers a cable-secured summit via ferrata and the option to descend by Alpine Coaster - perfect for thrill-seekers!',
    detailedDescription: 'The Kofel (1,342 m) is affectionately known as the Oberammergauer Matterhorn. From Oberammergau station, head south through the tennis court and cemetery to Döttenbichl. The path winds through numerous serpentines steeply up through forest, over a scree field to Kofelsattel. From here, a 20-minute cable-secured trail leads to the summit. Non-climbers can skip the peak and take the panoramic Königssteig directly to Kolbensattelhütte. Adventurous? Take the Alpine Coaster down!',
    highlights: [
      'Cable-secured summit via ferrata (Klettersteig)',
      'Kolbensattelhütte with excellent food',
      'Alpine Coaster descent option',
      'Panoramic Königssteig trail alternative'
    ]
  },
  {
    id: 'jochberg',
    name: 'Jochberg',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Classic Munich area peak with stunning 360° panorama of lakes and mountains.',
    lengthKm: 9,
    durationHours: 3.5,
    difficulty: 'moderate' as const,
    elevationGainM: 720,
    location: 'Kesselberg',
    distanceFromMunichKm: 75,
    publicTransportTime: 75,
    scenery: 'Mountain lakes',
    pathType: 'Mountain trail',
    specialFeature: 'One of Munich\'s most beloved peaks! The 360° panorama is insane: Kochelsee below, turquoise Walchensee (Bavaria\'s Caribbean), Karwendel, Wetterstein, and Zugspitze surrounding you in a mountain amphitheater.',
    detailedDescription: 'The Jochberg is a classic in the Munich area. Though rarely empty, the 360° panorama from the 1,565m summit is worth it! On one side, Kochelsee lies deep below; on the other, the turquoise Walchensee. The mighty Karwendel peaks join hands with the Wetterstein range, including Zugspitze. Take the train to Kochel, then bus to Kesselberg. The trail follows signs to Jochberg. Want a round trip? Descend to Jocheralm (1,382 m), then follow forest paths to Walchensee shore and Urfeld, where buses return to Kochel.',
    highlights: [
      '360° summit panorama',
      'View of both Kochelsee and Walchensee',
      'Karwendel and Wetterstein mountain ranges',
      'Optional round trip via Jocheralm and Urfeld'
    ]
  },
  {
    id: 'wank-garmisch',
    name: 'Wank via Gondola',
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
    description: 'Take the historic gondola up to 1,780m, then hike down with spectacular views.',
    lengthKm: 12,
    durationHours: 4,
    difficulty: 'moderate' as const,
    elevationGainM: 100,
    location: 'Garmisch-Partenkirchen',
    distanceFromMunichKm: 90,
    publicTransportTime: 60,
    scenery: 'Mountain panorama',
    pathType: 'Descent trail',
    specialFeature: 'A paradise for downhill hikers! Ride the vintage Wank gondola up for amazing views of Karwendel, Wetterstein, Zugspitze, and Tyrolean peaks, then enjoy a scenic 4-hour descent with a stop at the sunny Gschwandtnerbauer terrace.',
    detailedDescription: 'From the Wank ridge (1,780 m), enjoy a magnificent mountain panorama from Karwendel through the Wetterstein with Zugspitze, Alpspitz, and Waxensteine into the Tyrolean mountains. This tour is perfect for downhill hiking fans! Take the old Wank gondola up, then descend over 4 hours on a small, sometimes steep trail (W2) to Gschwandtnerbauer. The restaurant\'s sunny terrace lies exactly halfway down. Continue via the burned Gamshütte and Josefsbichl back to Partenkirchen.',
    highlights: [
      'Historic Wank gondola ride up',
      'Gschwandtnerbauer restaurant at midpoint',
      '900m descent through varied terrain',
      'Views of Zugspitze, Alpspitz, and Tyrolean Alps'
    ]
  },
  {
    id: 'seekarkreuz',
    name: 'Seekarkreuz',
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80',
    description: 'Typical Bavarian peak with Lenggrieser Hütte and views of Tegernsee mountains.',
    lengthKm: 14,
    durationHours: 5.5,
    difficulty: 'moderate' as const,
    elevationGainM: 900,
    location: 'Lenggries',
    distanceFromMunichKm: 60,
    publicTransportTime: 60,
    scenery: 'Alpine meadows',
    pathType: 'Mountain trail',
    specialFeature: 'Classic Bavarian pre-alpine hiking at its finest: forested lower slopes, grassy summit with cross, and two hearty meals at the cozy Lenggrieser Hütte - what more could you want?',
    detailedDescription: 'The Seekarkreuz embodies typical Bavarian pre-alpine peaks: forested below, grass-covered on top, with a summit cross and great views of the Tegernsee mountains. From Lenggries station, walk 2 km to the Hohenburg parking area. Follow signs for Grasleitensteig through town, branching left at a farm onto a gravel path. After about 2 hours, reach Lenggrieser Hütte (1,334 m) for your first Brotzeit. The summit (1,601 m) is 45 minutes more - steep forest then open grass ridge. Return to the hut for meal #2, then descend via Seekaralm and Hirschbachtal.',
    highlights: [
      'Lenggrieser Hütte - perfect for double Brotzeit',
      'Views of Tegernsee mountain range',
      'Varied terrain from forest to alpine meadows',
      'Circular route via Seekaralm and Hirschbachtal'
    ]
  },
  {
    id: 'prinzenweg',
    name: 'Prinzenweg: Schliersee to Tegernsee',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Connects two beloved Munich destinations with mountain huts and lake views.',
    lengthKm: 15,
    durationHours: 3.5,
    difficulty: 'easy' as const,
    elevationGainM: 660,
    location: 'Schliersee',
    distanceFromMunichKm: 60,
    publicTransportTime: 60,
    scenery: 'Two lakes',
    pathType: 'Connecting trail',
    specialFeature: 'The ultimate two-lake experience! Connect Schliersee and Tegernsee on the scenic Prinzenweg, with stops at Kreuzbergalm, Gindelalm, and Neureuth. End at the legendary Tegernseer Bräustüberl for well-earned Radler and Schweinebraten!',
    detailedDescription: 'This tour connects two of Munich\'s favorite destinations: Tegernsee and Schliersee. Start at Schliersee station, walk along the lake, then up Breitenbachstraße to Henner parking. The Prinzenweg leads to Kreuzbergalm in about an hour. After a rest with views of Schliersee, continue via Gindelalm and Gindelalmschneid to Berggasthof Neureuth\'s large sun terrace - perfect for electrolyte replacement! Descend via the old summer route or Bayernweg to Tegernsee, where Tegernseer Bräustüberl awaits with Radler and roast pork!',
    highlights: [
      'Three mountain huts: Kreuzbergalm, Gindelalm, Neureuth',
      'Views of both Schliersee and Tegernsee',
      'Famous Tegernseer Bräustüberl brewery at finish',
      'Relatively easy with beautiful lake scenery'
    ]
  },
  {
    id: 'taubenstein',
    name: 'Taubenstein Summit & Hütte',
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
    description: 'Steep hut hike from Spitzingsattel with optional summit at 1,693m.',
    lengthKm: 10,
    durationHours: 4,
    difficulty: 'moderate' as const,
    elevationGainM: 650,
    location: 'Spitzingsee',
    distanceFromMunichKm: 75,
    publicTransportTime: 75,
    scenery: 'Alpine terrain',
    pathType: 'Mountain trail',
    specialFeature: 'Choose your own adventure! Easy route to Taubensteinhaus or add the summit for dramatic views. Don\'t miss Schönfeldhütte - their kitchen is legendary among hikers for hearty Bavarian cuisine!',
    detailedDescription: 'Starting from Spitzingsattel, follow scenic trails through forest and alpine meadows. After 1.5 hours, reach Taubensteinsattel with two options: go directly to Taubensteinhaus (1,567 m) or detour to Taubensteingipfel (1,693 m) first. For the culinary highlight, stop at Schönfeldhütte - highly recommended! The satisfied descent takes about 2 hours back to Spitzingsattel, where buses return to the station.',
    highlights: [
      'Taubensteinhaus at 1,567m',
      'Optional summit at 1,693m',
      'Schönfeldhütte with exceptional food',
      'Varied alpine and forest terrain'
    ]
  },
  {
    id: 'laubenstein',
    name: 'Laubenstein with Chiemsee View',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Bavarian pre-alpine peak with views of Chiemsee and Kampenwand.',
    lengthKm: 14,
    durationHours: 4.5,
    difficulty: 'easy' as const,
    elevationGainM: 750,
    location: 'Aschau im Chiemgau',
    distanceFromMunichKm: 85,
    publicTransportTime: 75,
    scenery: 'Lake & peaks',
    pathType: 'Mountain trail',
    specialFeature: 'Breathtaking Chiemsee views! This Bavarian gem offers panoramic vistas of Bavaria\'s largest lake with the dramatic Kampenwand as backdrop. The Frasdorfer Hütte provides the perfect excuse for a "Bergsteigermahlzeit" (mountaineer\'s meal).',
    detailedDescription: 'Starting at Schloss Hohenaschau, head up Schloßbergstraße to Zellerhornstraße, then left into the forest (Wegmarkierung 26). From Hofalm (970m), follow gravel and meadow paths toward Riesenhütte/Hochries. At about 1,130m, look for the Laubenstein/Alm sign. Wind uphill on meadow paths, cross a forest road, then steep serpentines to Laubensteingatterl. Continue through light forest to the hilly meadows of Laubensteinalm - the summit is just a hop away! Descend the same route, with an optional 15-minute detour to Frasdorfer Hütte for deserved refreshment.',
    highlights: [
      'Stunning Chiemsee panorama',
      'View of iconic Kampenwand',
      'Frasdorfer Hütte for authentic mountain food',
      'Laubensteinalm alpine meadows'
    ]
  },
  {
    id: 'grosser-ahornboden',
    name: 'Großer Ahornboden Nature Monument',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
    description: "Tirol's most beautiful place: 2,000 ancient maple trees against Karwendel peaks.",
    lengthKm: 3,
    durationHours: 0.75,
    difficulty: 'easy' as const,
    elevationGainM: 250,
    location: 'Eng, Tirol',
    distanceFromMunichKm: 95,
    publicTransportTime: 120,
    scenery: 'Autumn colors',
    pathType: 'Easy trail',
    specialFeature: 'Voted Tirol\'s most beautiful place! Approximately 2,000 maple trees, some 600 years old, turn golden-red against the dramatic Karwendel backdrop - autumn kitsch at its absolute finest!',
    detailedDescription: 'The Großer Ahornboden in the Karwendel is THE place to be in autumn. Yes, it gets touristy, but the roughly 2,000 golden-yellow to red maples (some 600 years old) against the impressive Karwendel backdrop are unmissable. Though the 2+ hour public transport journey is longer, this nature monument (protected since 1972) voted Tirol\'s most beautiful place is worth every minute! The short hike to Binsalm via the Panoramaweg promises full autumn splendor. With 2 more hours, climb Hahnkampl (2,080m) or brave the via ferrata to Lamsenspitze (2,508m) - budget 6 hours total.',
    highlights: [
      'UNESCO-protected nature monument since 1972',
      'Approximately 2,000 ancient maple trees',
      'Spectacular autumn colors (golden to red)',
      'Binsalm, Hahnkampl, and Lamsenspitze options',
      'Dramatic Karwendel mountain backdrop'
    ]
  },
  {
    id: 'wendelstein',
    name: 'Wendelstein Panorama Peak',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Iconic 1,838m peak visible from Munich with church, cave, and ultimate 360° views.',
    lengthKm: 12,
    durationHours: 4.75,
    difficulty: 'moderate' as const,
    elevationGainM: 860,
    location: 'Bayrischzell',
    distanceFromMunichKm: 70,
    publicTransportTime: 75,
    scenery: 'Ultimate panorama',
    pathType: 'Mountain trail',
    specialFeature: 'The ultimate Munich-area panorama! Visible from the city itself, this iconic peak offers 360° views of Inn valley, Simssee, Chiemsee below, plus a parade of peaks from Berchtesgaden to Zugspitze. Church, cave, and mountain hut included!',
    detailedDescription: 'The Wendelstein\'s distinctive shape, exposed location, and antenna towers make it recognizable from Munich. Sure, you won\'t have the summit to yourself (accessible by rack railway, cable car, and foot), but everyone should stand here once for the genius location and bombastic panorama. Inn valley, Simssee, and Chiemsee greet from below while mountain peaks parade around: Berchtesgaden Alps east, Chiemgau with Kampenwand, Kaiser range, Großglockner, Großvenediger, Karwendel, Benediktenwand, to Zugspitze. Start from Osterhofen station, pass Hochkreuth (optional stop at Bergcafe Siglhof), continue to Wendelsteiner Almen (1,420m) and Wendelstein Haus. Final 100m to summit (1,838m) takes 2h45min. Downhill-averse? Ride the Wendelsteinbahn down!',
    highlights: [
      'Visible from Munich city',
      'Wendelstein church and cave on summit',
      'Inn valley, Simssee, Chiemsee views below',
      'Mountain panorama: Berchtesgaden to Zugspitze',
      'Bergcafe Siglhof and Wendelstein Haus',
      'Option to descend via Wendelsteinbahn'
    ]
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

    console.log('\n🎉 Successfully updated all trails with detailed information!');
    console.log(`Total trails: ${munichTrails.length}`);
    
  } catch (error) {
    console.error('❌ Error updating trails:', error);
  }

  process.exit(0);
}

updateTrails();
