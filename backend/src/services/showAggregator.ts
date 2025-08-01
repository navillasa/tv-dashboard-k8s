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
}

const CACHE_MAX_AGE_MINUTES = 30;

export async function getUpcomingShows(platforms: string[] = []): Promise<Show[]> {
  const cached = await getCachedShows(platforms, CACHE_MAX_AGE_MINUTES);

  // check if cache covers all requested platforms
  const hasAllPlatforms =
    platforms.length === 0 ||
    platforms.every(p => cached.some(show => show.platform === p));

  if (cached.length > 0 && hasAllPlatforms) {
    // return cache if all platforms are covered and fresh
    return cached;
  }

  const [apiOneShows, apiTwoShows] = await Promise.all([
    fetchFromApiOne(platforms),
    fetchFromApiTwo(platforms)
  ]);

  const allShows = [...apiOneShows, ...apiTwoShows];

  const uniqueShows = allShows.filter(
    (show, idx, arr) =>
      arr.findIndex(
        s => s.title.toLowerCase() === show.title.toLowerCase() && s.platform === show.platform
      ) === idx
  );

  // sort by airDate ascending
  uniqueShows.sort((a, b) => a.airDate.localeCompare(b.airDate));

  await saveShows(uniqueShows);

  return uniqueShows;
}
