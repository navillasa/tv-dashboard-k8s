import { Show } from "../services/showAggregator";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Map frontend keys to TMDB provider IDs
const PLATFORM_PROVIDER_IDS: Record<string, number> = {
  netflix: 8,
  hulu: 15,
  amazon: 9,
  prime: 9,
  disney: 337,
  disneyplus: 337,
  apple: 255,
  appletv: 255,
  appletvplus: 255,
  max: 384,
  hbomax: 384,
  paramount: 531,
  paramountplus: 531
};

export async function fetchFromApiOne(platforms: string[]): Promise<Show[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is missing from environment variables.");
  }

  const validPlatforms = platforms
    .map(p => p.toLowerCase())
    .filter(p => PLATFORM_PROVIDER_IDS[p]);
  if (!validPlatforms.length) return [];

  const results = await Promise.all(
    validPlatforms.map(async (platform) => {
      const providerId = PLATFORM_PROVIDER_IDS[platform];
      const url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&with_watch_providers=${providerId}&watch_region=US&page=1&language=en-US`;
      const res = await fetch(url);
      const data = await res.json();

      return (data.results || []).slice(0, 15).map((show: any) => ({
        id: show.id.toString(),
        title: show.name,
        platform,
        airDate: show.first_air_date,
        posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "",
        trailerUrl: "",
        description: show.overview,
      }));
    })
  );
  return results.flat();
}
