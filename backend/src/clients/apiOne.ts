import { Show } from "../services/showAggregator";

// Stub for API #1 (e.g., TMDB)
export async function fetchFromApiOne(platforms: string[]): Promise<Show[]> {
  // TODO: Replace this with real API logic
  // For now, return sample data
  const sample: Show[] = [
    {
      id: "1",
      title: "Sample Netflix Show",
      platform: "netflix",
      airDate: "2025-07-01",
      posterUrl: "",
      trailerUrl: "",
      description: "A show from API One."
    }
  ];
  return platforms.length ? sample.filter(s => platforms.includes(s.platform)) : sample;
}
