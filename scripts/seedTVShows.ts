import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { SwipeItem } from '../src/types/categories';
import { db } from './firebaseConfig';

const tvData: Omit<SwipeItem, 'id'>[] = [
  {
    category: 'tv',
    name: 'Breaking Bad',
    image: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    description: 'A high school chemistry teacher turned methamphetamine producer partners with a former student.',
    categoryData: {
      title: 'Breaking Bad',
      startYear: 2008,
      endYear: 2013,
      status: 'ended',
      seasons: 5,
      episodes: 62,
      genres: ['Drama', 'Crime', 'Thriller'],
      creator: 'Vince Gilligan',
      cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
      rating: 9.5,
      voteCount: 1800000,
      plot: 'A chemistry teacher diagnosed with cancer turns to cooking meth with a former student to secure his family\'s future.',
      network: 'AMC',
      streamingPlatforms: ['Netflix'],
      tmdbId: 1396,
      popularity: 94.8
    }
  },
  {
    category: 'tv',
    name: 'Game of Thrones',
    image: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    description: 'Nine noble families fight for control of the lands of Westeros, while an ancient enemy returns.',
    categoryData: {
      title: 'Game of Thrones',
      startYear: 2011,
      endYear: 2019,
      status: 'ended',
      seasons: 8,
      episodes: 73,
      genres: ['Fantasy', 'Drama', 'Adventure'],
      creator: 'David Benioff, D.B. Weiss',
      cast: ['Emilia Clarke', 'Kit Harington', 'Peter Dinklage', 'Lena Headey'],
      rating: 9.2,
      voteCount: 1900000,
      plot: 'Several noble families vie for control of the Iron Throne of the Seven Kingdoms of Westeros.',
      network: 'HBO',
      streamingPlatforms: ['Max'],
      tmdbId: 1399,
      popularity: 92.3
    }
  },
  {
    category: 'tv',
    name: 'Stranger Things',
    image: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
    categoryData: {
      title: 'Stranger Things',
      startYear: 2016,
      status: 'ongoing',
      seasons: 4,
      episodes: 42,
      genres: ['Science Fiction', 'Drama', 'Mystery'],
      creator: 'The Duffer Brothers',
      cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder', 'David Harbour'],
      rating: 8.7,
      voteCount: 950000,
      plot: 'In 1980s Indiana, a group of young friends witness supernatural forces and secret government exploits.',
      network: 'Netflix',
      streamingPlatforms: ['Netflix'],
      tmdbId: 66732,
      popularity: 89.5
    }
  },
  {
    category: 'tv',
    name: 'The Office',
    image: 'https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg',
    description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes and inappropriate behavior.',
    categoryData: {
      title: 'The Office',
      startYear: 2005,
      endYear: 2013,
      status: 'ended',
      seasons: 9,
      episodes: 201,
      genres: ['Comedy'],
      creator: 'Greg Daniels',
      cast: ['Steve Carell', 'John Krasinski', 'Jenna Fischer', 'Rainn Wilson'],
      rating: 9.0,
      voteCount: 550000,
      plot: 'The daily lives of office employees at the Scranton, Pennsylvania branch of Dunder Mifflin Paper Company.',
      network: 'NBC',
      streamingPlatforms: ['Peacock', 'Netflix'],
      tmdbId: 2316,
      popularity: 87.2
    }
  },
  {
    category: 'tv',
    name: 'The Crown',
    image: 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg',
    description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the 20th century.',
    categoryData: {
      title: 'The Crown',
      startYear: 2016,
      endYear: 2023,
      status: 'ended',
      seasons: 6,
      episodes: 60,
      genres: ['Drama', 'History'],
      creator: 'Peter Morgan',
      cast: ['Claire Foy', 'Olivia Colman', 'Imelda Staunton', 'Matt Smith'],
      rating: 8.6,
      voteCount: 200000,
      plot: 'Follows the life of Queen Elizabeth II from her wedding in 1947 through to the early 21st century.',
      network: 'Netflix',
      streamingPlatforms: ['Netflix'],
      tmdbId: 1399,
      popularity: 81.4
    }
  },
  {
    category: 'tv',
    name: 'The Last of Us',
    image: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    description: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl.',
    categoryData: {
      title: 'The Last of Us',
      startYear: 2023,
      status: 'ongoing',
      seasons: 1,
      episodes: 9,
      genres: ['Drama', 'Science Fiction', 'Action'],
      creator: 'Craig Mazin, Neil Druckmann',
      cast: ['Pedro Pascal', 'Bella Ramsey', 'Anna Torv'],
      rating: 8.8,
      voteCount: 280000,
      plot: 'Joel and Ellie must survive ruthless killers and monsters on a trek across post-pandemic America.',
      network: 'HBO',
      streamingPlatforms: ['Max'],
      tmdbId: 100088,
      popularity: 93.7
    }
  },
  {
    category: 'tv',
    name: 'Friends',
    image: 'https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
    description: 'Six friends navigate life and love in Manhattan.',
    categoryData: {
      title: 'Friends',
      startYear: 1994,
      endYear: 2004,
      status: 'ended',
      seasons: 10,
      episodes: 236,
      genres: ['Comedy', 'Romance'],
      creator: 'David Crane, Marta Kauffman',
      cast: ['Jennifer Aniston', 'Courteney Cox', 'Lisa Kudrow', 'Matt LeBlanc'],
      rating: 8.9,
      voteCount: 890000,
      plot: 'Follows the personal and professional lives of six 20-30 something friends living in Manhattan.',
      network: 'NBC',
      streamingPlatforms: ['Max', 'Netflix'],
      tmdbId: 1668,
      popularity: 90.1
    }
  },
  {
    category: 'tv',
    name: 'The Mandalorian',
    image: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    description: 'A lone bounty hunter in the outer reaches of the galaxy far from the authority of the New Republic.',
    categoryData: {
      title: 'The Mandalorian',
      startYear: 2019,
      status: 'ongoing',
      seasons: 3,
      episodes: 24,
      genres: ['Science Fiction', 'Action', 'Adventure'],
      creator: 'Jon Favreau',
      cast: ['Pedro Pascal', 'Katee Sackhoff', 'Carl Weathers'],
      rating: 8.7,
      voteCount: 460000,
      plot: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
      network: 'Disney+',
      streamingPlatforms: ['Disney+'],
      tmdbId: 82856,
      popularity: 88.9
    }
  },
  {
    category: 'tv',
    name: 'Sherlock',
    image: 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
    description: 'A modern update finds the famous detective and his doctor partner solving crime in 21st century London.',
    categoryData: {
      title: 'Sherlock',
      startYear: 2010,
      endYear: 2017,
      status: 'ended',
      seasons: 4,
      episodes: 13,
      genres: ['Crime', 'Drama', 'Mystery'],
      creator: 'Steven Moffat, Mark Gatiss',
      cast: ['Benedict Cumberbatch', 'Martin Freeman', 'Una Stubbs'],
      rating: 9.1,
      voteCount: 820000,
      plot: 'The quirky spin on Conan Doyle\'s iconic sleuth pitches him as a high-functioning sociopath in modern-day London.',
      network: 'BBC One',
      streamingPlatforms: ['Netflix', 'BBC iPlayer'],
      tmdbId: 19885,
      popularity: 85.6
    }
  },
  {
    category: 'tv',
    name: 'The Bear',
    image: 'https://image.tmdb.org/t/p/w500/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg',
    description: 'A young chef returns to Chicago to run his family\'s sandwich shop after a tragedy.',
    categoryData: {
      title: 'The Bear',
      startYear: 2022,
      status: 'ongoing',
      seasons: 2,
      episodes: 18,
      genres: ['Drama', 'Comedy'],
      creator: 'Christopher Storer',
      cast: ['Jeremy Allen White', 'Ebon Moss-Bachrach', 'Ayo Edebiri'],
      rating: 8.6,
      voteCount: 95000,
      plot: 'A young chef from the fine dining world returns to Chicago to run his family\'s sandwich shop.',
      network: 'FX',
      streamingPlatforms: ['Hulu', 'Disney+'],
      tmdbId: 136315,
      popularity: 84.3
    }
  }
];

async function seedTVShows() {
  console.log('📺 Starting to seed TV shows...');
  
  try {
    for (const show of tvData) {
      const showId = show.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const now = Timestamp.now();
      await setDoc(doc(db, 'tvShows', showId), {
        ...show,
        id: showId,
        createdAt: now,
        updatedAt: now
      });
      console.log(`✅ Added: ${show.name}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${tvData.length} TV shows!`);
  } catch (error) {
    console.error('❌ Error seeding TV shows:', error);
    throw error;
  }
}

seedTVShows();
