import { Pool } from "pg";
import { Show } from "../services/showAggregator";
import { databaseConnections, showsInDatabase } from "../metrics";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Track database connection metrics
pool.on('connect', () => {
  databaseConnections.inc();
});

pool.on('remove', () => {
  databaseConnections.dec();
});

// Update shows count periodically
async function updateShowsCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM shows');
    const count = parseInt(result.rows[0].count);
    showsInDatabase.set(count);
  } catch (error) {
    console.error('Error updating shows count metric:', error);
  }
}

// Update shows count every 30 seconds
setInterval(updateShowsCount, 30000);
// Initial count update
updateShowsCount();

export async function getCachedShows(platforms: string[], maxAgeMinutes: number): Promise<Show[]> {
  const since = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  // If platforms is empty, fetch all platforms; otherwise, use the filter
  let query = `SELECT * FROM shows WHERE fetched_at > $1`;
  let params: any[] = [since];
  if (platforms.length > 0) {
    query += ` AND platform = ANY($2)`;
    params.push(platforms);
  }
  const { rows } = await pool.query(query, params);
  return rows;
}

// Efficient batch insert/upsert for all shows in one query
export async function saveShows(shows: Show[]): Promise<void> {
  if (shows.length === 0) return;

  const columns = [
    "id",
    "title",
    "platform",
    "air_date",
    "poster_url",
    "trailer_url",
    "description",
    "popularity",
    "fetched_at"
  ];

  // Build value placeholders for each show
  const valuePlaceholders = shows.map((_, i) => {
    const base = i * columns.length;
    return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},$${base +9})`;
  }).join(',');

  // Flatten values for query parameters
  const values = shows.flatMap(show => [
    show.id,
    show.title,
    show.platform,
    show.airDate,
    show.posterUrl,
    show.trailerUrl,
    show.description,
    show.popularity ?? null,
    new Date()
  ]);

  await pool.query(
    `INSERT INTO shows (${columns.join(',')})
     VALUES ${valuePlaceholders}
     ON CONFLICT (id, platform) DO UPDATE SET
       title = EXCLUDED.title,
       air_date = EXCLUDED.air_date,
       poster_url = EXCLUDED.poster_url,
       trailer_url = EXCLUDED.trailer_url,
       description = EXCLUDED.description,
       popularity = EXCLUDED.popularity,
       fetched_at = EXCLUDED.fetched_at`
    , values
  );
  
  // Update shows count after saving
  updateShowsCount();
}
