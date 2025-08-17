import { fetchFromApiOne } from "../clients/apiOne";
import { fetchFromApiTwo } from "../clients/apiTwo";
// import { getCachedShows, saveShows } from "../db/shows"; // Cache temporarily disabled

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

export interface Show {
  id: string;
  title: string;
  platform: string;
  airDate: string;
  posterUrl?: string;
  trailerUrl?: string;
  description?: string;
  popularity?: number;
}

const CACHE_MAX_AGE_MINUTES = 30;

export async function getUpcomingShows(platforms: string[] = []): Promise<Show[]> {
  // Normalize platform keys to canonical
  const platformsNormalized = platforms.map(
    p => PLATFORM_KEY_ALIASES[p.toLowerCase()] || p.toLowerCase()
  );
  console.log('[showAggregator] Requested platforms:', platforms, 'Normalized:', platformsNormalized);

  // === DISABLED CACHE FOR DEBUG ===

  console.log('[showAggregator] Fetching from APIs...');
  const [apiOneShows, apiTwoShows] = await Promise.all([
    fetchFromApiOne(platformsNormalized),
    fetchFromApiTwo(platformsNormalized)
  ]);
  console.log('[showAggregator] apiOneShows:', apiOneShows);
  console.log('[showAggregator] apiTwoShows:', apiTwoShows);

  const allShows = [...apiOneShows, ...apiTwoShows];

  // Deduplicate by title (case-insensitive) + platform
  const uniqueShows = allShows.filter(
    (show, idx, arr) =>
      arr.findIndex(
        s => s.title.toLowerCase() === show.title.toLowerCase() && s.platform === show.platform
      ) === idx
  );

  // Group shows by canonical platform, sort by popularity, take top 10 per platform
  const showsByPlatform: Record<string, Show[]> = {};
  uniqueShows.forEach(show => {
    const plat = PLATFORM_KEY_ALIASES[show.platform] || show.platform;
    if (!showsByPlatform[plat]) showsByPlatform[plat] = [];
    showsByPlatform[plat].push({ ...show, platform: plat });
  });

  Object.keys(showsByPlatform).forEach(platform => {
    showsByPlatform[platform].sort(
      (a, b) =>
        (b.popularity ?? 0) - (a.popularity ?? 0) ||
        (a.airDate || "").localeCompare(b.airDate || "")
    );
    showsByPlatform[platform] = showsByPlatform[platform].slice(0, 10);
  });

  const requestedPlatformKeys = platformsNormalized.length
    ? platformsNormalized
    : Object.keys(showsByPlatform);

  const topShows = requestedPlatformKeys.flatMap(
    p => showsByPlatform[p] || []
  );

  // await saveShows(topShows); // Cache temporarily disabled

  console.log('[showAggregator] Final outgoing topShows:', topShows);

  return topShows;
}
