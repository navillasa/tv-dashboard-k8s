import { Pool } from "pg";
import { saveShows, getCachedShows } from "./shows";
import { Show } from "../services/showAggregator";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const testShow: Show = {
  id: "test-1",
  title: "Test Show",
  platform: "netflix",
  airDate: "2025-08-01",
  posterUrl: "http://example.com/poster.jpg",
  trailerUrl: "http://example.com/trailer.mp4",
  description: "A test show for DB testing.",
};

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shows (
      id TEXT NOT NULL,
      title TEXT NOT NULL,
      platform TEXT NOT NULL,
      air_date DATE,
      poster_url TEXT,
      trailer_url TEXT,
      description TEXT,
      fetched_at TIMESTAMP NOT NULL,
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
      }),
    ])
  );
});
