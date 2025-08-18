import { Show } from "../services/showAggregator";
import { externalApiRequests, externalApiDuration } from "../metrics";

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

// Helper function to fetch detailed show information
async function fetchShowDetails(showId: string) {
  const start = Date.now();
  try {
    // Fetch show details and cast in parallel
    const [showRes, castRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=${TMDB_API_KEY}`),
      fetch(`https://api.themoviedb.org/3/tv/${showId}/credits?api_key=${TMDB_API_KEY}`)
    ]);
    
    // Record API metrics
    externalApiRequests.labels('tmdb', showRes.ok ? 'success' : 'error').inc();
    externalApiRequests.labels('tmdb', castRes.ok ? 'success' : 'error').inc();
    
    const [showData, castData] = await Promise.all([
      showRes.json(),
      castRes.json()
    ]);
    
    const duration = (Date.now() - start) / 1000;
    externalApiDuration.labels('tmdb').observe(duration);
    
    // Extract starring cast (top 5 main cast members)
    const starring = (castData.cast || [])
      .slice(0, 5)
      .map((actor: any) => actor.name)
      .filter(Boolean);
    
    return {
      numberOfSeasons: showData.number_of_seasons || 0,
      numberOfEpisodes: showData.number_of_episodes || 0,
      starring,
      seasons: (showData.seasons || [])
        .filter((season: any) => season.season_number > 0) // Filter out specials
        .map((season: any) => ({
          seasonNumber: season.season_number,
          episodeCount: season.episode_count,
          airDate: season.air_date || "",
          year: season.air_date ? season.air_date.split('-')[0] : ""
        }))
    };
  } catch (err) {
    console.error(`[apiOne] Error fetching details for show ${showId}:`, err);
    return {
      numberOfSeasons: 0,
      numberOfEpisodes: 0,
      starring: [],
      seasons: []
    };
  }
}

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
        const start = Date.now();
        const res = await fetch(url);
        externalApiRequests.labels('tmdb', res.ok ? 'success' : 'error').inc();
        const data = await res.json();
        const duration = (Date.now() - start) / 1000;
        externalApiDuration.labels('tmdb').observe(duration);

        // Debug all responses, including errors
        if (!data || !Array.isArray(data.results)) {
          console.error(`[apiOne] No results or error for ${platform}:`, data);
        } else if (data.results.length === 0) {
          console.warn(`[apiOne] Empty results array for ${platform}`);
        } else {
          console.log(`[apiOne] ${platform} fetched ${data.results.length} shows, first:`, data.results[0]);
        }

        const basicShows = (data.results || [])
          .slice(0, 15)
          .map((show: any) => ({
            id: show.id?.toString() ?? "",
            title: show.name ?? "",
            platforms: [canonicalPlatform],  // Changed to array
            platform: canonicalPlatform,     // Keep for compatibility during transition
            airDate: show.first_air_date ?? "",
            posterUrl: show.poster_path
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : "",
            trailerUrl: "",
            description: show.overview ?? "",
            popularity: show.popularity ?? 0,
          }));

        // Fetch detailed info for top 10 shows only to avoid too many API calls
        const detailedShows = await Promise.all(
          basicShows.slice(0, 10).map(async (show: Show) => {
            const details = await fetchShowDetails(show.id);
            return {
              ...show,
              ...details
            };
          })
        );

        // Return top 10 with details plus remaining 5 without details
        return [...detailedShows, ...basicShows.slice(10)];
      } catch (err) {
        console.error(`[apiOne] ERROR fetching for ${platform}:`, err);
        return [];
      }
    })
  );
  return results.flat();
}
