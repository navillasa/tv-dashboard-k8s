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
  platforms?: string[];  // New multi-platform support (optional for compatibility)
  platform: string;      // Keep original field
  airDate: string;
  posterUrl?: string;
  trailerUrl?: string;
  description?: string;
  popularity?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons?: Array<{
    seasonNumber: number;
    episodeCount: number;
    airDate: string;
  }>;
}

const CACHE_MAX_AGE_MINUTES = 30;

export async function getUpcomingShows(platforms: string[] = []): Promise<Show[]> {
  // Normalize platform keys to canonical
  const platformsNormalized = platforms.map(
    p => PLATFORM_KEY_ALIASES[p.toLowerCase()] || p.toLowerCase()
  );
  const [apiOneShows, apiTwoShows] = await Promise.all([
    fetchFromApiOne(platformsNormalized),
    fetchFromApiTwo(platformsNormalized)
  ]);

  const allShows = [...apiOneShows, ...apiTwoShows];

  // Create a map of all shows by title to get cross-platform availability
  const showsByTitle: Record<string, string[]> = {};
  allShows.forEach((show: any) => {
    const titleKey = show.title.toLowerCase();
    const platform = PLATFORM_KEY_ALIASES[show.platform] || show.platform;
    
    if (!showsByTitle[titleKey]) {
      showsByTitle[titleKey] = [];
    }
    if (!showsByTitle[titleKey].includes(platform)) {
      showsByTitle[titleKey].push(platform);
    }
  });

  // Enhance each show with cross-platform availability data
  const enhancedShows = allShows.map((show: any) => {
    const titleKey = show.title.toLowerCase();
    const platform = PLATFORM_KEY_ALIASES[show.platform] || show.platform;
    
    return {
      ...show,
      platforms: showsByTitle[titleKey] || [platform], // All platforms this show is available on
      platform: platform  // The specific platform for this entry's popularity ranking
    };
  });

  // Deduplicate by title + platform to avoid duplicates from multiple APIs
  const uniqueShows = enhancedShows.filter(
    (show, idx, arr) =>
      arr.findIndex(
        s => s.title.toLowerCase() === show.title.toLowerCase() && 
             (PLATFORM_KEY_ALIASES[s.platform] || s.platform) === (PLATFORM_KEY_ALIASES[show.platform] || show.platform)
      ) === idx
  );

  // Group shows by canonical platform, sort by popularity, take top 10 per platform
  const showsByPlatform: Record<string, any[]> = {};
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

  return topShows;
}
