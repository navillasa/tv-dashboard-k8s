const { Pool } = require("pg");
const { saveShows, getCachedShows } = require("./shows");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const testShow = {
  id: "test-1",
  title: "Test Show",
  platform: "netflix",
  airDate: "2025-08-01",
  posterUrl: "http://example.com/poster.jpg",
  trailerUrl: "http://example.com/trailer.mp4",
  description: "A test show for DB testing.",
  popularity: 85.5,
  numberOfSeasons: 2,
  numberOfEpisodes: 20,
  starring: ["Actor One", "Actor Two", "Actor Three"],
  seasons: [
    {
      seasonNumber: 1,
      episodeCount: 10,
      airDate: "2025-08-01",
      year: "2025"
    },
    {
      seasonNumber: 2,
      episodeCount: 10,
      airDate: "2026-08-01",
      year: "2026"
    }
  ]
};

beforeAll(async () => {
  await pool.query(`
    DROP TABLE IF EXISTS shows;
    CREATE TABLE shows (
      id TEXT NOT NULL,
      title VARCHAR(255) NOT NULL,
      platform VARCHAR(100) NOT NULL,
      air_date DATE,
      poster_url TEXT,
      trailer_url TEXT,
      description TEXT,
      popularity FLOAT,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id, platform)
    )
  `);
});

afterAll(async () => {
  await pool.query(`DELETE FROM shows WHERE id = $1 AND platform = $2`, [testShow.id, testShow.platform]);
  await pool.end();
});

test("saveShows and getCachedShows work as expected", async () => {
  await saveShows([testShow]);
  const result = await getCachedShows([testShow.platform], 60 * 24); // 24 hours
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: testShow.id,
        title: testShow.title,
        platform: testShow.platform,
        air_date: expect.anything(), // DB returns Date not string
        popularity: testShow.popularity
      }),
    ])
  );
});
