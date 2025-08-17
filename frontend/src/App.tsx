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
  popularity?: number;
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

        const { data } = await axios.get("/api/shows", { params });

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
    <div style={{ 
        maxWidth: 1400, 
        margin: "0 auto", 
        padding: "2rem 1rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
      }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: 700, 
          margin: "0 0 0.5rem 0",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          📺 Popular TV Shows
        </h1>
        <p style={{ 
          color: "#666", 
          fontSize: "1.1rem", 
          fontWeight: 400, 
          margin: 0,
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          Discover the top 10 most popular shows across major streaming platforms
        </p>
      </header>
      <div style={{ 
        display: "flex", 
        gap: 12, 
        marginBottom: "3rem", 
        justifyContent: "center",
        flexWrap: "wrap"
      }}>
        {ALL_PLATFORMS.map((p) => (
          <button
            key={p.key}
            onClick={() => togglePlatform(p.key)}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: 25,
              border: "none",
              background: platformFilter.includes(p.key)
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#f8f9fa",
              color: platformFilter.includes(p.key) ? "#fff" : "#333",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
              boxShadow: platformFilter.includes(p.key) 
                ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                : "0 2px 8px rgba(0,0,0,0.1)",
              transform: platformFilter.includes(p.key) ? "translateY(-1px)" : "translateY(0)"
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ 
          textAlign: "center", 
          padding: "4rem 0",
          color: "#666",
          fontSize: "1.1rem"
        }}>
          <div style={{ marginBottom: "1rem" }}>🔄</div>
          Loading shows...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 32,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            maxWidth: "100%"
          }}
        >
          {ALL_PLATFORMS.map((platform) => (
            <div key={platform.key} style={{ minHeight: "300px" }}>
              <h2 style={{ 
                textAlign: "center", 
                marginBottom: "1.5rem",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#333",
                padding: "1rem",
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                borderRadius: "12px",
                border: "1px solid #dee2e6",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}>
                {platform.label}
              </h2>
              {showsByPlatform[platform.key].length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  color: "#999", 
                  padding: "2rem",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  border: "1px dashed #dee2e6"
                }}>
                  📺 No shows found
                </div>
              ) : (
                showsByPlatform[platform.key]
                  .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                  .map((show) => (
                  <div
                    key={show.id + show.platform}
                    style={{
                      border: "1px solid #e9ecef",
                      borderRadius: 16,
                      padding: 20,
                      background: "#ffffff",
                      marginBottom: 20,
                      position: "relative",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    }}
                  >
                    {show.posterUrl && (
                      <img
                        src={show.posterUrl}
                        alt={show.title}
                        style={{ 
                          width: "100%", 
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: 12, 
                          marginBottom: 16
                        }}
                      />
                    )}
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: "1.1rem",
                      marginBottom: 8,
                      color: "#333",
                      lineHeight: 1.3
                    }}>
                      {show.title}
                    </div>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      marginBottom: 8
                    }}>
                      {typeof show.popularity === "number" && (
                        <div style={{ 
                          fontSize: "0.85rem", 
                          color: "#667eea",
                          fontWeight: 500,
                          background: "#f0f2ff",
                          padding: "4px 8px",
                          borderRadius: 12
                        }}>
                          ⭐ {show.popularity.toFixed(1)}
                        </div>
                      )}
                      {show.airDate && (
                        <div style={{ 
                          fontSize: "0.85rem", 
                          color: "#6c757d",
                          fontWeight: 500
                        }}>
                          {new Date(show.airDate).getFullYear()}
                        </div>
                      )}
                    </div>
                    {show.description && (
                      <>
                        <button
                          onClick={() => toggleDescription(show.id)}
                          style={{
                            marginTop: 12,
                            fontSize: "0.85rem",
                            color: "#667eea",
                            background: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            borderRadius: 8,
                            padding: "6px 12px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            fontWeight: 500
                          }}
                        >
                          {expandedShowIds.includes(show.id)
                            ? "Hide Description ▲"
                            : "Show Description ▼"}
                        </button>
                        {expandedShowIds.includes(show.id) && (
                          <div style={{ 
                            marginTop: 12, 
                            fontSize: "0.9rem", 
                            color: "#555",
                            lineHeight: 1.5,
                            padding: "12px",
                            background: "#f8f9fa",
                            borderRadius: 8,
                            border: "1px solid #e9ecef"
                          }}>
                            {show.description}
                          </div>
                        )}
                      </>
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
