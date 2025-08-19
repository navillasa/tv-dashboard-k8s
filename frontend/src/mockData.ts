// Mock data for immediate loading while real data fetches
export const MOCK_SHOWS = [
  // Netflix
  {
    id: "mock-netflix-1",
    title: "Wednesday",
    platform: "netflix",
    airDate: "2022-11-23",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMDY0OTcwM2QtZDI2OC00ZGNhLTgxYmYtMjk4NGE5NDRjMjI2XkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_FMjpg_UX1000_.jpg",
    description: "Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree while making new friends — and foes — at Nevermore Academy.",
    popularity: 95,
    starring: ["Jenna Ortega", "Emma Myers", "Hunter Doohan"],
    numberOfSeasons: 1,
    numberOfEpisodes: 8
  },
  {
    id: "mock-netflix-2", 
    title: "Stranger Things",
    platform: "netflix",
    airDate: "2016-07-15",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BN2ZmYjg1YmItNWQ4OC00YWM0LWE0ZDktYThjOTZiZjhhN2Q2XkEyXkFqcGdeQXVyNjgxNTQ3Mjk@._V1_FMjpg_UX1000_.jpg",
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    popularity: 92,
    starring: ["Millie Bobby Brown", "Finn Wolfhard", "David Harbour"],
    numberOfSeasons: 4,
    numberOfEpisodes: 42
  },
  {
    id: "mock-netflix-3",
    title: "The Crown", 
    platform: "netflix",
    airDate: "2016-11-04",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZmY0MzBlNzMtMGZmYy00YWJkLWJiODgtYzlhMWJjOWY4YjVkXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg",
    description: "This drama follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century.",
    popularity: 88,
    starring: ["Claire Foy", "Olivia Colman", "Imelda Staunton"],
    numberOfSeasons: 6,
    numberOfEpisodes: 60
  },

  // Disney+
  {
    id: "mock-disney-1",
    title: "The Mandalorian",
    platform: "disney",
    airDate: "2019-11-12", 
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZDhlYjc3ZjItZjg1ZC00ZTMwLTk3MTAtOTM5NjVlMGNkOTVhXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX1000_.jpg",
    description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    popularity: 94,
    starring: ["Pedro Pascal", "Gina Carano", "Carl Weathers"],
    numberOfSeasons: 3,
    numberOfEpisodes: 24
  },
  {
    id: "mock-disney-2",
    title: "Loki",
    platform: "disney",
    airDate: "2021-06-09",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMzA2NDUyOTY2NV5BMl5BanBnXkFtZTgwODEzNjczMzI@._V1_FMjpg_UX1000_.jpg", 
    description: "The mercurial villain Loki resumes his role as the God of Mischief following the events of Avengers: Endgame.",
    popularity: 91,
    starring: ["Tom Hiddleston", "Sophia Di Martino", "Owen Wilson"],
    numberOfSeasons: 2,
    numberOfEpisodes: 12
  },

  // Prime Video
  {
    id: "mock-prime-1", 
    title: "The Boys",
    platform: "prime",
    airDate: "2019-07-26",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNzMwOTU3NmYtNjVkNS00YjMzLWI5ZjUtZDFiY2ZlOTFhOGEzXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX1000_.jpg",
    description: "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.",
    popularity: 93,
    starring: ["Karl Urban", "Jack Quaid", "Antony Starr"],
    numberOfSeasons: 3,
    numberOfEpisodes: 24
  },
  {
    id: "mock-prime-2",
    title: "The Rings of Power", 
    platform: "prime",
    airDate: "2022-09-02",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZGJlYzZhN2ItZjVlMS00MGVhLWI3YjYtZDlkMGQ2MWE2MTlhXkEyXkFqcGdeQXVyMTAyMjQ3NzQ1._V1_FMjpg_UX1000_.jpg",
    description: "Epic drama set thousands of years before the events of J.R.R. Tolkien's 'The Hobbit' and 'The Lord of the Rings'.",
    popularity: 89,
    starring: ["Morfydd Clark", "Robert Aramayo", "Owain Arthur"],
    numberOfSeasons: 1,
    numberOfEpisodes: 8
  },

  // Hulu
  {
    id: "mock-hulu-1",
    title: "The Handmaid's Tale",
    platform: "hulu", 
    airDate: "2017-04-26",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYjNkMzg0MTItMzYxZC00NWNhLWFhZWUtNDI1NzBkYjMyNzJiXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX1000_.jpg",
    description: "A woman forced into sexual servitude struggles to survive in a terrifying, totalitarian society.",
    popularity: 87,
    starring: ["Elisabeth Moss", "Yvonne Strahovski", "Joseph Fiennes"],
    numberOfSeasons: 5,
    numberOfEpisodes: 56
  },
  {
    id: "mock-hulu-2",
    title: "Only Murders in the Building",
    platform: "hulu",
    airDate: "2021-08-31",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNDhlNzIyYzYtYWNmYi00MjdiLWI1YWUtNGU1MTdmOGU1MzZlXkEyXkFqcGdeQXVyMTAyMjQ3NzQ1._V1_FMjpg_UX1000_.jpg",
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
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMDQxMzQ4MDEwNF5BMl5BanBnXkFtZTgwNzE0NjQxMzI@._V1_FMjpg_UX1000_.jpg",
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
    posterUrl: "https://m.media-amazon.com/images/M/MV5BM2IzYzljNzQtZTNkOS00Yzg5LWFmZWMtMzY0YWQ2NWY3MjhlXkEyXkFqcGdeQXVyMTAyMjQ3NzQ1._V1_FMjpg_UX1000_.jpg",
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
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZjk4YWUwNGMtZGQ5ZS00OWQ2LWI0ODYtODA3NWE5MTc3ZmE5XkEyXkFqcGdeQXVyMTAyMjQ3NzQ1._V1_FMjpg_UX1000_.jpg",
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
