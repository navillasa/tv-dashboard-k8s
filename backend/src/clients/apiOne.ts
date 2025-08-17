import { Show } from "../services/showAggregator";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const PLATFORM_PROVIDER_IDS: Record<string, number> = {
  netflix: 8,
  hulu: 15,
  amazon: 9,
  prime: 9,
  disney: 337,
  disneyplus: 337,
  apple: 350,
  appletv: 350,
  appletvplus: 350,
  max: 1899,
  hbomax: 1899,
  paramount: 531,
  paramountplus: 531,
};

const PLATFORM_KEY_ALIASES: Record<string, string> = {
  netflix: "netflix",
  hulu: "hulu",
  amazon: "prime",
  prime: "prime",
  disney: "disney",
  disneyplus: "disney",
  apple: "apple",
  appletv: "apple",
  appletvplus: "apple",
  max: "max",
  hbomax: "max",
  paramount: "paramount",
  paramountplus: "paramount",
};

export async function fetchFromApiOne(platforms: string[]): Promise<Show[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is missing from environment variables.");
  }

  const validPlatforms = platforms.length > 0
    ? platforms
        .map(p => p.toLowerCase())
        .filter(p => PLATFORM_PROVIDER_IDS[p])
    : Object.keys(PLATFORM_PROVIDER_IDS);
  if (!validPlatforms.length) return [];

  const results = await Promise.all(
    validPlatforms.map(async (platform) => {
      const providerId = PLATFORM_PROVIDER_IDS[platform];
      const canonicalPlatform = PLATFORM_KEY_ALIASES[platform] || platform;
      const url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&with_watch_providers=${providerId}&watch_region=US&page=1&language=en-US`;
      console.log(`[apiOne] Fetching for ${platform} (${canonicalPlatform}) with URL: ${url}`);

      try {
        const res = await fetch(url);
        const data = await res.json();

        // Debug all responses, including errors
        if (!data || !Array.isArray(data.results)) {
          console.error(`[apiOne] No results or error for ${platform}:`, data);
        } else if (data.results.length === 0) {
          console.warn(`[apiOne] Empty results array for ${platform}`);
        } else {
          console.log(`[apiOne] ${platform} fetched ${data.results.length} shows, first:`, data.results[0]);
        }

        return (data.results || [])
          // Comment out this line to see if poster_path is filtering everything
          // .filter((show: any) => !!show.poster_path)
          .slice(0, 15)
          .map((show: any) => ({
            id: show.id?.toString() ?? "",
            title: show.name ?? "",
            platform: canonicalPlatform,
            airDate: show.first_air_date ?? "",
            posterUrl: show.poster_path
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : "",
            trailerUrl: "",
            description: show.overview ?? "",
            popularity: show.popularity ?? 0,
          }));
      } catch (err) {
        console.error(`[apiOne] ERROR fetching for ${platform}:`, err);
        return [];
      }
    })
  );
  return results.flat();
}
