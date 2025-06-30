import { fetchFromApiOne } from "../clients/apiOne";
import { fetchFromApiTwo } from "../clients/apiTwo";

export interface Show {
  id: string;
  title: string;
  platform: string;
  airDate: string;
  posterUrl?: string;
  trailerUrl?: string;
  description?: string;
}

// platforms: array of strings, e.g. ["netflix", "disney"]
export async function getUpcomingShows(platforms: string[] = []): Promise<Show[]> {
  // Fetch from both APIs
  const [apiOneShows, apiTwoShows] = await Promise.all([
    fetchFromApiOne(platforms),
    fetchFromApiTwo(platforms)
  ]);

  // Example: Merge, deduplicate, and sort by air date
  const allShows = [...apiOneShows, ...apiTwoShows];

  // Deduplicate (by title + platform for demo, but real logic might be more complex)
  const uniqueShows = allShows.filter(
    (show, idx, arr) =>
      arr.findIndex(
        s => s.title.toLowerCase() === show.title.toLowerCase() && s.platform === show.platform
      ) === idx
  );

  // Sort by airDate ascending
  uniqueShows.sort((a, b) => a.airDate.localeCompare(b.airDate));

  return uniqueShows;
}
