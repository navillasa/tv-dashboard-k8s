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
  // Always normalize platform keys to lowercase
  const platformsNormalized = platforms.map(p => p.toLowerCase());

  const cached = await getCachedShows(platformsNormalized, CACHE_MAX_AGE_MINUTES);
  console.log('Cached shows:', cached);

  const hasAllPlatforms =
    platformsNormalized.length === 0 ||
    platformsNormalized.every(p => cached.some(show => show.platform === p));

  if (cached.length > 0 && hasAllPlatforms) {
    console.log('Returning cached shows');
    return cached;
  }

  console.log('Fetching from APIs...');
  const [apiOneShows, apiTwoShows] = await Promise.all([
    fetchFromApiOne(platformsNormalized),
    fetchFromApiTwo(platformsNormalized)
  ]);
  console.log('apiOneShows:', apiOneShows);
  console.log('apiTwoShows:', apiTwoShows);

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
