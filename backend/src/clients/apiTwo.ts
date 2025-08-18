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

// Helper function to fetch detailed show information from TVmaze
async function fetchShowDetailsFromTVmaze(showId: string) {
  try {
    // Fetch show details, cast, and seasons in parallel
    const [showRes, castRes, seasonsRes] = await Promise.all([
      fetch(`https://api.tvmaze.com/shows/${showId}`),
      fetch(`https://api.tvmaze.com/shows/${showId}/cast`),
      fetch(`https://api.tvmaze.com/shows/${showId}/seasons`)
    ]);
    
    const [showData, castData, seasonsData] = await Promise.all([
      showRes.json(),
      castRes.json(),
      seasonsRes.json()
    ]);
    
    // Extract starring cast (top 5 main cast members)
    const starring = (castData || [])
      .slice(0, 5)
      .map((castMember: any) => castMember.person?.name)
      .filter(Boolean);
    
    // Process seasons data
    const seasons = (seasonsData || [])
      .map((season: any) => ({
        seasonNumber: season.number,
        episodeCount: season.episodeOrder || 0,
        airDate: season.premiereDate || "",
        year: season.premiereDate ? season.premiereDate.split('-')[0] : ""
      }));
    
    return {
      numberOfSeasons: showData.seasons || seasons.length || 0,
      numberOfEpisodes: showData.episodes || 0,
      starring,
      seasons
    };
  } catch (err) {
    console.error(`[apiTwo] Error fetching details for show ${showId}:`, err);
    return {
      numberOfSeasons: 0,
      numberOfEpisodes: 0,
      starring: [],
      seasons: []
    };
  }
}

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

  const basicShows: any[] = [];
  for (const showEntry of data) {
    const show = showEntry.show;
    // Check both network and webChannel!
    const networkName = show.network?.name || show.webChannel?.name;
    const platform = Object.entries(PLATFORM_NETWORKS)
      .find(([, name]) => networkName === name)?.[0];

    if (platform && validPlatforms.includes(platform)) {
      basicShows.push({
        id: show.id.toString(),
        title: show.name,
        platforms: [platform],  // Changed to array
        platform,               // Keep for compatibility during transition
        airDate: showEntry.airdate,
        posterUrl: show.image?.medium || "",
        trailerUrl: "",
        description: show.summary ? show.summary.replace(/<[^>]+>/g, "") : "",
        popularity: show.popularity,
      });
    }
  }

  // Get top 10 shows per platform and fetch detailed info
  const enhancedShows = await Promise.all(
    validPlatforms.flatMap(platform => {
      const platformShows = basicShows.filter((s: any) => s.platform === platform).slice(0, 10);
      return platformShows.map(async (show: any) => {
        const details = await fetchShowDetailsFromTVmaze(show.id);
        return {
          ...show,
          ...details
        };
      });
    })
  );

  return enhancedShows;
}
