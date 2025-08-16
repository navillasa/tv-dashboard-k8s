import { fetchFromApiOne } from "../clients/apiOne";
import { fetchFromApiTwo } from "../clients/apiTwo";
import { getCachedShows, saveShows } from "../db/shows";

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
  // Always normalize platform keys to lowercase
  const platformsNormalized = platforms.map(p => p.toLowerCase());

  const cached = await getCachedShows(platformsNormalized, CACHE_MAX_AGE_MINUTES);
  console.log('Cached shows:', cached);

  const hasAllPlatforms =
    platformsNormalized.length === 0 ||
    platformsNormalized.every(p => cached.some(show => show.platform === p));

  if (cached.length > 0 && hasAllPlatforms) {
    console.log('Returning cached shows');
    // Only return shows for requested platforms
    if (platformsNormalized.length === 0) {
      return cached;
    }
    return cached.filter(show => platformsNormalized.includes(show.platform.toLowerCase()));
  }

  console.log('Fetching from APIs...');
  const [apiOneShows, apiTwoShows] = await Promise.all([
    fetchFromApiOne(platformsNormalized),
    fetchFromApiTwo(platformsNormalized)
  ]);
  console.log('apiOneShows:', apiOneShows);
  console.log('apiTwoShows:', apiTwoShows);

  const allShows = [...apiOneShows, ...apiTwoShows];

  // Deduplicate by title (case-insensitive) + platform
  const uniqueShows = allShows.filter(
    (show, idx, arr) =>
      arr.findIndex(
        s => s.title.toLowerCase() === show.title.toLowerCase() && s.platform === show.platform
      ) === idx
  );

  // Group shows by platform and sort by popularity, take top 10 per platform
  const showsByPlatform: Record<string, Show[]> = {};
  uniqueShows.forEach(show => {
    const plat = show.platform.toLowerCase();
    if (!showsByPlatform[plat]) showsByPlatform[plat] = [];
    showsByPlatform[plat].push(show);
  });

  Object.keys(showsByPlatform).forEach(platform => {
    showsByPlatform[platform].sort(
      (a, b) =>
        (b.popularity ?? 0) - (a.popularity ?? 0) ||
        (a.airDate || "").localeCompare(b.airDate || "")
    );
    showsByPlatform[platform] = showsByPlatform[platform].slice(0, 10);
  });

  // Only save the top shows for all platforms (cache is always all)
  const allTopShows = Object.values(showsByPlatform).flat();
  await saveShows(allTopShows);

  // Only return shows for requested platforms
  if (platformsNormalized.length === 0) {
    return allTopShows;
  }
  return platformsNormalized.flatMap(p => showsByPlatform[p] ?? []);
}
