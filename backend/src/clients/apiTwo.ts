import { Show } from "../services/showAggregator";

// Stub for API #2 (e.g., TVmaze)
export async function fetchFromApiTwo(platforms: string[]): Promise<Show[]> {
  // TODO: Replace this with real API logic
  // For now, return sample data
  const sample: Show[] = [
    {
      id: "2",
      title: "Sample Disney Show",
      platform: "disney",
      airDate: "2025-07-03",
      posterUrl: "",
      trailerUrl: "",
      description: "A show from API Two."
    }
  ];
  return platforms.length ? sample.filter(s => platforms.includes(s.platform)) : sample;
}
