// Mock data for immediate loading while real data fetches
export const MOCK_SHOWS = [
  // Netflix
  {
    id: "mock-netflix-1",
    title: "Wednesday",
    platform: "netflix",
    airDate: "2022-11-23",
    posterUrl: "/images/posters/wednesday.jpg",
    description: "Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree while making new friends — and foes — at Nevermore Academy.",
    popularity: 95,
    starring: ["Jenna Ortega", "Emma Myers", "Hunter Doohan"],
    numberOfSeasons: 1,
    numberOfEpisodes: 8
  },
  {
    id: "mock-netflix-2", 
    title: "Breaking Bad",
    platform: "netflix",
    airDate: "2008-01-20",
    posterUrl: "/images/posters/breaking-bad.jpg",
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    popularity: 92,
    starring: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
    numberOfSeasons: 5,
    numberOfEpisodes: 62
  },
  {
    id: "mock-netflix-3",
    title: "Squid Game", 
    platform: "netflix",
    airDate: "2021-09-17",
    posterUrl: "/images/posters/squid-game.jpg",
    description: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a tempting prize, but the stakes are deadly.",
    popularity: 88,
    starring: ["Lee Jung-jae", "Park Hae-soo", "Wi Ha-jun"],
    numberOfSeasons: 1,
    numberOfEpisodes: 9
  },

  // Disney+
  {
    id: "mock-disney-1",
    title: "The Simpsons",
    platform: "disney",
    airDate: "1989-12-17", 
    posterUrl: "/images/posters/the-simpsons.jpg",
    description: "The satiric adventures of a working-class family in the misfit city of Springfield.",
    popularity: 94,
    starring: ["Dan Castellaneta", "Julie Kavner", "Nancy Cartwright"],
    numberOfSeasons: 35,
    numberOfEpisodes: 750
  },
  {
    id: "mock-disney-2",
    title: "Loki",
    platform: "disney",
    airDate: "2021-06-09",
    posterUrl: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Loki", 
    description: "The mercurial villain Loki resumes his role as the God of Mischief following the events of Avengers: Endgame.",
    popularity: 91,
    starring: ["Tom Hiddleston", "Sophia Di Martino", "Owen Wilson"],
    numberOfSeasons: 2,
    numberOfEpisodes: 12
  },

  // Prime Video
  {
    id: "mock-prime-1", 
    title: "The Summer I Turned Pretty",
    platform: "prime",
    airDate: "2022-06-17",
    posterUrl: "/images/posters/summer-turned-pretty.jpg",
    description: "A love triangle between one girl and two brothers. A story of first love, first heartbreak, and the magic of that perfect summer.",
    popularity: 93,
    starring: ["Lola Tung", "Christopher Briney", "Gavin Casalegno"],
    numberOfSeasons: 2,
    numberOfEpisodes: 15
  },
  {
    id: "mock-prime-2",
    title: "The Rings of Power", 
    platform: "prime",
    airDate: "2022-09-02",
    posterUrl: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Rings+of+Power",
    description: "Epic drama set thousands of years before the events of J.R.R. Tolkien's 'The Hobbit' and 'The Lord of the Rings'.",
    popularity: 89,
    starring: ["Morfydd Clark", "Robert Aramayo", "Owain Arthur"],
    numberOfSeasons: 1,
    numberOfEpisodes: 8
  },

  // Hulu
  {
    id: "mock-hulu-1",
    title: "The Rookie",
    platform: "hulu", 
    airDate: "2018-10-16",
    posterUrl: "/images/posters/the-rookie.jpg",
    description: "Starting over isn't easy, especially for small-town guy John Nolan who, after a life-altering incident, is pursuing his dream of being an LAPD officer.",
    popularity: 87,
    starring: ["Nathan Fillion", "Alyssa Diaz", "Richard T. Jones"],
    numberOfSeasons: 6,
    numberOfEpisodes: 108
  },
  {
    id: "mock-hulu-2",
    title: "Only Murders in the Building",
    platform: "hulu",
    airDate: "2021-08-31",
    posterUrl: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Only+Murders",
    description: "Three strangers who share an obsession with true crime podcasts suddenly find themselves wrapped up in one.",
    popularity: 90,
    starring: ["Steve Martin", "Martin Short", "Selena Gomez"],
    numberOfSeasons: 3,
    numberOfEpisodes: 30
  },

  // Apple TV+
  {
    id: "mock-apple-1",
    title: "Ted Lasso",
    platform: "apple",
    airDate: "2020-08-14",
    posterUrl: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Ted+Lasso",
    description: "American football coach Ted Lasso heads to London to manage AFC Richmond, a struggling English football team.",
    popularity: 88,
    starring: ["Jason Sudeikis", "Hannah Waddingham", "Brett Goldstein"],
    numberOfSeasons: 3,
    numberOfEpisodes: 34
  },

  // Max
  {
    id: "mock-max-1",
    title: "House of the Dragon",
    platform: "max",
    airDate: "2022-08-21", 
    posterUrl: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=House+of+Dragon",
    description: "An internal succession war within House Targaryen at the height of its power, 172 years before the birth of Daenerys Targaryen.",
    popularity: 92,
    starring: ["Paddy Considine", "Emma D'Arcy", "Matt Smith"],
    numberOfSeasons: 1,
    numberOfEpisodes: 10
  },

  // Paramount+
  {
    id: "mock-paramount-1", 
    title: "Star Trek: Strange New Worlds",
    platform: "paramount",
    airDate: "2022-05-05",
    posterUrl: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Star+Trek",
    description: "A prequel to the original Star Trek series featuring Captain Pike, Number One and Spock.",
    popularity: 85,
    starring: ["Anson Mount", "Rebecca Romijn", "Ethan Peck"],
    numberOfSeasons: 2,
    numberOfEpisodes: 20
  }
];

// Group mock shows by platform for easy access
export const MOCK_SHOWS_BY_PLATFORM = MOCK_SHOWS.reduce((acc, show) => {
  if (!acc[show.platform]) {
    acc[show.platform] = [];
  }
  acc[show.platform].push(show);
  return acc;
}, {} as Record<string, typeof MOCK_SHOWS>);
