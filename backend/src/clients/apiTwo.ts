import { Show } from "../services/showAggregator";

// Map platform keys to TVmaze provider names
const PLATFORM_NETWORKS: Record<string, string> = {
  netflix: "Netflix",
  hulu: "Hulu",
  amazon: "Amazon Prime",
  prime: "Amazon Prime",
  disney: "Disney+",
  apple: "Apple TV+",
  max: "Max",
  paramount: "Paramount+"
};

export async function fetchFromApiTwo(platforms: string[]): Promise<Show[]> {
  const validPlatforms = platforms.length > 0
    ? platforms
        .map(p => p.toLowerCase())
        .filter(p => PLATFORM_NETWORKS[p])
    : Object.keys(PLATFORM_NETWORKS);
  if (!validPlatforms.length) return [];

  // Get all shows airing soon
  const res = await fetch("https://api.tvmaze.com/schedule?country=US");
  const data = await res.json();

  const shows: Show[] = [];
  for (const showEntry of data) {
    const show = showEntry.show;
    // Check both network and webChannel!
    const networkName = show.network?.name || show.webChannel?.name;
    const platform = Object.entries(PLATFORM_NETWORKS)
      .find(([, name]) => networkName === name)?.[0];

    if (platform && validPlatforms.includes(platform)) {
      shows.push({
        id: show.id.toString(),
        title: show.name,
        platform,
        airDate: showEntry.airdate,
        posterUrl: show.image?.medium || "",
        trailerUrl: "",
        description: show.summary ? show.summary.replace(/<[^>]+>/g, "") : "",
        popularity: show.popularity,
      });
    }
  }

  return platforms.flatMap(platform =>
    shows.filter(s => s.platform === platform).slice(0, 15)
  );
}
