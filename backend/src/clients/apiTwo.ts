import { Show } from "../services/showAggregator";

const PLATFORM_NETWORKS: Record<string, string> = {
  netflix: "Netflix",
  hulu: "Hulu",
  amazon: "Amazon Prime",
  disney: "Disney+"
};

export async function fetchFromApiTwo(platforms: string[]): Promise<Show[]> {
  const validPlatforms = platforms.filter(p => PLATFORM_NETWORKS[p]);
  if (!validPlatforms.length) return [];

  // get all shows, filter by network
  // using the shows schedule API for upcoming shows
  const res = await fetch("https://api.tvmaze.com/schedule?country=US");
  const data = await res.json();

  const shows: Show[] = [];
  for (const showEntry of data) {
    const show = showEntry.show;
    if (!show.network) continue;
    const platform = Object.entries(PLATFORM_NETWORKS).find(
      ([, networkName]) => show.network.name === networkName
    )?.[0];

    if (platform && validPlatforms.includes(platform)) {
      shows.push({
        id: show.id.toString(),
        title: show.name,
        platform,
        airDate: showEntry.airdate,
        posterUrl: show.image?.medium || "",
        trailerUrl: "",
        description: show.summary ? show.summary.replace(/<[^>]+>/g, "") : "",
      });
    }
  }

  return platforms.flatMap(platform => 
    shows.filter(s => s.platform === platform).slice(0, 15)
  );
}
