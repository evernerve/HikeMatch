import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { SwipeItem } from '../src/types/categories';

// Firebase config (same as main app)
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

const movieData: Omit<SwipeItem, 'id'>[] = [
  {
    category: 'movies',
    name: 'The Shawshank Redemption',
    image: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    description: 'Two imprisoned men bond over years, finding solace and eventual redemption through acts of common decency.',
    categoryData: {
      title: 'The Shawshank Redemption',
      year: 1994,
      runtime: 142,
      genres: ['Drama', 'Crime'],
      director: 'Frank Darabont',
      cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
      rating: 9.3,
      voteCount: 2500000,
      plot: 'Chronicles the experiences of a formerly successful banker as a prisoner in the gloomy jailhouse of Shawshank after being found guilty of a crime he did not commit.',
      language: 'English',
      country: 'United States',
      awards: '7 Oscar nominations',
      streamingPlatforms: ['Netflix', 'Amazon Prime'],
      tmdbId: 278,
      popularity: 95.5
    }
  },
  {
    category: 'movies',
    name: 'The Dark Knight',
    image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    description: 'When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests.',
    categoryData: {
      title: 'The Dark Knight',
      year: 2008,
      runtime: 152,
      genres: ['Action', 'Crime', 'Drama', 'Thriller'],
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
      rating: 9.0,
      voteCount: 2300000,
      plot: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent, but the Joker throws Gotham into anarchy.',
      language: 'English',
      country: 'United States, United Kingdom',
      awards: '2 Oscars (Best Supporting Actor, Best Sound Editing)',
      streamingPlatforms: ['Max', 'Amazon Prime'],
      tmdbId: 155,
      popularity: 92.3
    }
  },
  {
    category: 'movies',
    name: 'Inception',
    image: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    categoryData: {
      title: 'Inception',
      year: 2010,
      runtime: 148,
      genres: ['Action', 'Science Fiction', 'Adventure'],
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy', 'Ellen Page'],
      rating: 8.8,
      voteCount: 2100000,
      plot: 'A skilled thief is offered a chance to have his criminal history erased in exchange for implanting an idea in a CEO\'s mind.',
      language: 'English',
      country: 'United States, United Kingdom',
      awards: '4 Oscars (Cinematography, Sound Editing, Sound Mixing, Visual Effects)',
      streamingPlatforms: ['Netflix', 'Amazon Prime'],
      tmdbId: 27205,
      popularity: 88.7
    }
  },
  {
    category: 'movies',
    name: 'Pulp Fiction',
    image: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    categoryData: {
      title: 'Pulp Fiction',
      year: 1994,
      runtime: 154,
      genres: ['Thriller', 'Crime'],
      director: 'Quentin Tarantino',
      cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson', 'Bruce Willis'],
      rating: 8.9,
      voteCount: 1900000,
      plot: 'Various interconnected people struggle to survive when crime and action start to affect them.',
      language: 'English',
      country: 'United States',
      awards: '1 Oscar (Best Original Screenplay), Palme d\'Or',
      streamingPlatforms: ['Netflix', 'Hulu'],
      tmdbId: 680,
      popularity: 85.2
    }
  },
  {
    category: 'movies',
    name: 'Forrest Gump',
    image: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    description: 'The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man with an IQ of 75.',
    categoryData: {
      title: 'Forrest Gump',
      year: 1994,
      runtime: 142,
      genres: ['Comedy', 'Drama', 'Romance'],
      director: 'Robert Zemeckis',
      cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
      rating: 8.8,
      voteCount: 1800000,
      plot: 'Forrest Gump, while not intelligent, has accidentally been present at many historic moments, but his true love, Jenny, eludes him.',
      language: 'English',
      country: 'United States',
      awards: '6 Oscars (Best Picture, Best Actor, Best Director)',
      streamingPlatforms: ['Paramount+', 'Amazon Prime'],
      tmdbId: 13,
      popularity: 83.9
    }
  },
  {
    category: 'movies',
    name: 'The Matrix',
    image: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    description: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
    categoryData: {
      title: 'The Matrix',
      year: 1999,
      runtime: 136,
      genres: ['Action', 'Science Fiction'],
      director: 'Lana Wachowski, Lilly Wachowski',
      cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
      rating: 8.7,
      voteCount: 1700000,
      plot: 'A computer hacker discovers that reality is a simulation created by machines and joins a rebellion.',
      language: 'English',
      country: 'United States',
      awards: '4 Oscars (Visual Effects, Sound, Sound Effects, Film Editing)',
      streamingPlatforms: ['Max', 'Amazon Prime'],
      tmdbId: 603,
      popularity: 82.4
    }
  },
  {
    category: 'movies',
    name: 'Interstellar',
    image: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    categoryData: {
      title: 'Interstellar',
      year: 2014,
      runtime: 169,
      genres: ['Adventure', 'Drama', 'Science Fiction'],
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
      rating: 8.6,
      voteCount: 1600000,
      plot: 'A group of astronauts travel through a wormhole near Saturn in search of a new home for humanity.',
      language: 'English',
      country: 'United States, United Kingdom',
      awards: '1 Oscar (Best Visual Effects)',
      streamingPlatforms: ['Paramount+', 'Amazon Prime'],
      tmdbId: 157336,
      popularity: 86.1
    }
  },
  {
    category: 'movies',
    name: 'The Godfather',
    image: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    description: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
    categoryData: {
      title: 'The Godfather',
      year: 1972,
      runtime: 175,
      genres: ['Drama', 'Crime'],
      director: 'Francis Ford Coppola',
      cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
      rating: 9.2,
      voteCount: 1700000,
      plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      language: 'English',
      country: 'United States',
      awards: '3 Oscars (Best Picture, Best Actor, Best Adapted Screenplay)',
      streamingPlatforms: ['Paramount+', 'Amazon Prime'],
      tmdbId: 238,
      popularity: 91.8
    }
  },
  {
    category: 'movies',
    name: 'Parasite',
    image: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between two families.',
    categoryData: {
      title: 'Parasite',
      year: 2019,
      runtime: 132,
      genres: ['Comedy', 'Thriller', 'Drama'],
      director: 'Bong Joon-ho',
      cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
      rating: 8.6,
      voteCount: 700000,
      plot: 'A poor family schemes to become employed by a wealthy family and infiltrate their household.',
      language: 'Korean',
      country: 'South Korea',
      awards: '4 Oscars (Best Picture, Best Director, Best Original Screenplay, Best International Film)',
      streamingPlatforms: ['Hulu', 'Amazon Prime'],
      tmdbId: 496243,
      popularity: 79.3
    }
  },
  {
    category: 'movies',
    name: 'Gladiator',
    image: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    description: 'A betrayed Roman general seeks revenge against the corrupt emperor who murdered his family.',
    categoryData: {
      title: 'Gladiator',
      year: 2000,
      runtime: 155,
      genres: ['Action', 'Drama', 'Adventure'],
      director: 'Ridley Scott',
      cast: ['Russell Crowe', 'Joaquin Phoenix', 'Connie Nielsen'],
      rating: 8.5,
      voteCount: 1400000,
      plot: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
      language: 'English',
      country: 'United States, United Kingdom',
      awards: '5 Oscars (Best Picture, Best Actor)',
      streamingPlatforms: ['Paramount+', 'Amazon Prime'],
      tmdbId: 98,
      popularity: 81.7
    }
  }
];

async function seedMovies() {
  console.log('🎬 Starting to seed movies...');
  
  try {
    for (const movie of movieData) {
      const movieId = movie.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      await setDoc(doc(db, 'movies', movieId), {
        ...movie,
        id: movieId
      });
      console.log(`✅ Added: ${movie.name}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${movieData.length} movies!`);
  } catch (error) {
    console.error('❌ Error seeding movies:', error);
  }
}

seedMovies();
