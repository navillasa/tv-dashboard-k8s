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

// List ALL possible platforms for columns
const ALL_PLATFORMS = [
  { key: "netflix", label: "Netflix" },
  { key: "disney", label: "Disney+" },
  { key: "prime", label: "Prime Video" },
  { key: "hulu", label: "Hulu" },
  { key: "apple", label: "Apple TV+" },
  { key: "max", label: "Max" },
  { key: "paramount", label: "Paramount+" },
];

function App() {
  const [shows, setShows] = useState<Show[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchShows() {
      setLoading(true);
      try {
        const selected =
          platformFilter.length > 0
            ? platformFilter
            : ALL_PLATFORMS.map(p => p.key);
        const params = { platform: selected.join(",") };

        const { data } = await axios.get("/api/shows/upcoming", { params });
        setShows(data);
      } catch (e) {
        setShows([]);
      } finally {
        setLoading(false);
      }
    }
    fetchShows();
  }, [platformFilter]);

  // Group shows by platform
  const showsByPlatform: Record<string, Show[]> = {};
  ALL_PLATFORMS.forEach(p => {
    showsByPlatform[p.key] = [];
  });
  shows.forEach(show => {
    if (showsByPlatform[show.platform]) {
      showsByPlatform[show.platform].push(show);
    }
  });

  const togglePlatform = (key: string) => {
    setPlatformFilter((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const [expandedShowIds, setExpandedShowIds] = useState<string[]>([]);
  const toggleDescription = (id: string) => {
    setExpandedShowIds(prev =>
      prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ textAlign: "center" }}>📺 New & Upcoming TV Shows</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "center" }}>
        {ALL_PLATFORMS.map((p) => (
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
            gap: 24,
            gridTemplateColumns: `repeat(${ALL_PLATFORMS.length}, 1fr)`
          }}
        >
          {ALL_PLATFORMS.map((platform) => (
            <div key={platform.key}>
              <h2 style={{ textAlign: "center", marginBottom: 16 }}>
                {platform.label}
              </h2>
              {showsByPlatform[platform.key].length === 0 ? (
                <p style={{ textAlign: "center", color: "#aaa" }}>No shows found.</p>
              ) : (
                showsByPlatform[platform.key].map((show) => (
                  <div
                    key={show.id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 16,
                      background: "#fafbfc",
                      marginBottom: 16,
                      position: "relative"
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: 18 }}>
                      {show.title}
                    </div>
                    <div style={{ color: "#666", marginBottom: 4 }}>
                      Air Date: {show.airDate}
                    </div>
                    {show.posterUrl && (
                      <img
                        src={show.posterUrl}
                        alt={show.title}
                        style={{ width: "100%", marginTop: 8, borderRadius: 8 }}
                      />
                    )}
                    {show.description && (
                      <button
                        onClick={() => toggleDescription(show.id)}
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          color: "#0070f3",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        {expandedShowIds.includes(show.id)
                          ? "Hide Description"
                          : "Show Description"}
                      </button>
                    )}
                    {show.description && expandedShowIds.includes(show.id) && (
                      <div style={{ marginTop: 8, fontSize: 14, color: "#444" }}>
                        {show.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
