const { fetchFromApiOne } = require("./apiOne");
const { fetchFromApiTwo } = require("./apiTwo");

describe("API Integrations", () => {
  const platforms = ["netflix", "hulu"];

  describe("fetchFromApiOne", () => {
    it("should fetch upcoming shows from API One", async () => {
      const shows = await fetchFromApiOne(platforms);
      expect(Array.isArray(shows)).toBe(true);
      if (shows.length > 0) {
        const show = shows[0];
        expect(show).toHaveProperty("id");
        expect(show).toHaveProperty("title");
        expect(show).toHaveProperty("platform");
        expect(show).toHaveProperty("airDate");
        expect(show).toHaveProperty("popularity");
        // New properties may not always be present, so check conditionally
        if (show.starring) {
          expect(Array.isArray(show.starring)).toBe(true);
        }
        if (show.seasons) {
          expect(Array.isArray(show.seasons)).toBe(true);
        }
      }
    });
  });

  describe("fetchFromApiTwo", () => {
    it("should fetch upcoming shows from API Two", async () => {
      const shows = await fetchFromApiTwo(platforms);
      expect(Array.isArray(shows)).toBe(true);
      if (shows.length > 0) {
        const show = shows[0];
        expect(show).toHaveProperty("id");
        expect(show).toHaveProperty("title");
        expect(show).toHaveProperty("platform");
        expect(show).toHaveProperty("airDate");
        expect(show).toHaveProperty("popularity");
        // New properties may not always be present, so check conditionally
        if (show.starring) {
          expect(Array.isArray(show.starring)).toBe(true);
        }
        if (show.seasons) {
          expect(Array.isArray(show.seasons)).toBe(true);
        }
      }
    });
  });
});
