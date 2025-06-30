import React, { useEffect, useState } from "react";
import axios from "axios";

type Show = {
  id: string;
  title: string;
  platform: string;
  airDate: string;
  posterUrl?: string;
  description?: string;
  trailerUrl?: string;
};

const PLATFORMS = [
  { key: "netflix", label: "Netflix" },
  { key: "disney", label: "Disney+" }
];

function App() {
  const [shows, setShows] = useState<Show[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchShows() {
      setLoading(true);
      try {
        const params = platformFilter.length
          ? { platform: platformFilter.join(",") }
          : {};
        const { data } = await axios.get<Show[]>("/api/shows/upcoming", {
          params
        });
        setShows(data);
      } catch (e) {
        setShows([]);
      } finally {
        setLoading(false);
      }
    }
    fetchShows();
  }, [platformFilter]);

  const togglePlatform = (key: string) => {
    setPlatformFilter((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ textAlign: "center" }}>📺 New & Upcoming TV Shows</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "center" }}>
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            onClick={() => togglePlatform(p.key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: platformFilter.includes(p.key)
                ? "2px solid #0070f3"
                : "1px solid #ccc",
              background: platformFilter.includes(p.key)
                ? "#e6f0fa"
                : "#fff",
              cursor: "pointer"
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p>Loading shows...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))"
          }}
        >
          {shows.length === 0 && <p>No shows found.</p>}
          {shows.map((show) => (
            <div
              key={show.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 16,
                background: "#fafbfc"
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: 18 }}>
                {show.title}
              </div>
              <div style={{ color: "#666", marginBottom: 4 }}>
                {show.platform.charAt(0).toUpperCase() + show.platform.slice(1)}
              </div>
              <div>Air Date: {show.airDate}</div>
              {show.posterUrl && (
                <img
                  src={show.posterUrl}
                  alt={show.title}
                  style={{ width: "100%", marginTop: 8, borderRadius: 8 }}
                />
              )}
              {show.description && (
                <div style={{ marginTop: 8, fontSize: 14, color: "#444" }}>
                  {show.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
