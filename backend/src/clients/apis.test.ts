const { fetchFromApiOne } = require("./apiOne");
const { fetchFromApiTwo } = require("./apiTwo");

describe("API Integrations", () => {
  const platforms = ["netflix", "hulu"];

  describe("fetchFromApiOne", () => {
    it("should fetch upcoming shows from API One", async () => {
      // Mock TMDB API responses
      const mockTmdbResponse = {
        results: [
          {
            id: 123,
            name: "Test Show",
            first_air_date: "2022-01-01",
            poster_path: "/test.jpg",
            overview: "Test description",
            popularity: 100.5
          }
        ]
      };

      const mockShowDetailsResponse = {
        number_of_seasons: 2,
        number_of_episodes: 20,
        seasons: [
          {
            season_number: 1,
            episode_count: 10,
            air_date: "2022-01-01"
          }
        ]
      };

      const mockCastResponse = {
        cast: [
          { name: "Actor One" },
          { name: "Actor Two" }
        ]
      };

      fetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockTmdbResponse)
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockShowDetailsResponse)
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockCastResponse)
        });

      const shows = await fetchFromApiOne(platforms);
      
      expect(Array.isArray(shows)).toBe(true);
      expect(shows.length).toBeGreaterThan(0);
      
      const show = shows[0];
      expect(show).toHaveProperty("id");
      expect(show).toHaveProperty("title");
      expect(show).toHaveProperty("platform");
      expect(show).toHaveProperty("airDate");
      expect(show).toHaveProperty("popularity");
    });
  });

  describe("fetchFromApiTwo", () => {
    it("should fetch upcoming shows from API Two", async () => {
      // Mock TVmaze API response
      const mockTvmazeResponse = [
        {
          show: {
            id: 456,
            name: "Test Show 2",
            network: { name: "Netflix" },
            image: { medium: "/test2.jpg" },
            summary: "Test summary",
            popularity: 85.5
          },
          airdate: "2022-02-01"
        }
      ];

      const mockShowDetails = {
        seasons: 1,
        episodes: 10
      };

      const mockCast = [
        { person: { name: "Actor Three" } }
      ];

      const mockSeasons = [
        {
          number: 1,
          episodeOrder: 10,
          premiereDate: "2022-02-01"
        }
      ];

      fetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockTvmazeResponse)
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockShowDetails)
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockCast)
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockSeasons)
        });

      const shows = await fetchFromApiTwo(platforms);
      
      expect(Array.isArray(shows)).toBe(true);
    });
  });
});
