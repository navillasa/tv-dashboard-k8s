import { Pool } from "pg";
import { Show } from "../services/showAggregator";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getCachedShows(platforms: string[], maxAgeMinutes: number): Promise<Show[]> {
  const since = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  const { rows } = await pool.query(
    `SELECT * FROM shows WHERE platform = ANY($1) AND fetched_at > $2`,
    [platforms, since]
  );
  return rows;
}

export async function saveShows(shows: Show[]): Promise<void> {
  for (const show of shows) {
    await pool.query(
      `INSERT INTO shows (id, title, platform, air_date, poster_url, trailer_url, description, fetched_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
       ON CONFLICT (id, platform) DO UPDATE SET
         title = EXCLUDED.title,
         air_date = EXCLUDED.air_date,
         poster_url = EXCLUDED.poster_url,
         trailer_url = EXCLUDED.trailer_url,
         description = EXCLUDED.description,
         fetched_at = NOW()`,
      [
        show.id, show.title, show.platform, show.airDate,
        show.posterUrl, show.trailerUrl, show.description
      ]
    );
  }
}
