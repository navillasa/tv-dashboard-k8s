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


  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (show: any) => {
    setSelectedShow(show);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedShow(null);
    setIsModalOpen(false);
  };

  const formatAirDate = (airDate: string) => {
    if (!airDate) return "Unknown";
    
    const date = new Date(airDate);
    const startYear = date.getFullYear();
    const currentYear = new Date().getFullYear();
    
    // If the show started this year, show month and year
    if (startYear === currentYear) {
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      return `${month} ${startYear} - Present`;
    }
    
    // If it's from last year, it might still be airing
    if (startYear === currentYear - 1) {
      return `${startYear} - Present`;
    }
    
    // For older shows, just show when it first aired since we don't know the end date
    return `First aired: ${startYear}`;
  };

  const formatSeasonInfo = (show: any) => {
    if (!show.numberOfSeasons) return null;
    
    const parts = [];
    
    // Basic season/episode info
    if (show.numberOfSeasons === 1) {
      parts.push(`1 season`);
    } else {
      parts.push(`${show.numberOfSeasons} seasons`);
    }
    
    if (show.numberOfEpisodes) {
      parts.push(`${show.numberOfEpisodes} episodes total`);
    }
    
    return parts.join(' • ');
  };

  const formatUpcomingSeason = (show: any) => {
    if (!show.seasons) return null;
    
    const currentYear = new Date().getFullYear();
    const upcomingSeasons = show.seasons.filter((season: any) => {
      const seasonYear = new Date(season.airDate).getFullYear();
      return seasonYear > currentYear || 
             (seasonYear === currentYear && new Date(season.airDate) > new Date());
    });
    
    if (upcomingSeasons.length === 0) return null;
    
    const nextSeason = upcomingSeasons[0];
    const airDate = new Date(nextSeason.airDate);
    const month = airDate.toLocaleDateString('en-US', { month: 'long' });
    const year = airDate.getFullYear();
    
    return `Season ${nextSeason.seasonNumber} coming ${month} ${year}`;
  };

  const getWatchLink = (platform: string, showTitle: string) => {
    const encodedTitle = encodeURIComponent(showTitle);
    
    const platformUrls: Record<string, string> = {
      netflix: `https://www.netflix.com/search?q=${encodedTitle}`,
      disney: `https://www.disneyplus.com/search/${encodedTitle}`,
      prime: `https://www.amazon.com/gp/video/search/ref=atv_hm_hom_1_search?phrase=${encodedTitle}`,
      hulu: `https://www.hulu.com/search?q=${encodedTitle}`,
      apple: `https://tv.apple.com/search?term=${encodedTitle}`,
      max: `https://www.max.com/search?q=${encodedTitle}`,
      paramount: `https://www.paramountplus.com/search/${encodedTitle}`
    };
    
    return platformUrls[platform] || '#';
  };

  const Modal = ({ show, isOpen, onClose }: { show: any; isOpen: boolean; onClose: () => void }) => {
    if (!isOpen || !show) return null;

    return (
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            position: "relative",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "rgba(0, 0, 0, 0.1)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)"}
          >
            ×
          </button>

          {/* Modal content */}
          <div style={{ padding: "30px" }}>
            {/* Poster and title section */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              {show.posterUrl && (
                <img
                  src={show.posterUrl}
                  alt={show.title}
                  style={{
                    width: "150px",
                    height: "225px",
                    objectFit: "cover",
                    borderRadius: 12,
                    flexShrink: 0
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  margin: "0 0 15px 0",
                  color: "#333",
                  lineHeight: 1.2
                }}>
                  {show.title}
                </h2>
              </div>
            </div>

            {/* Description */}
            {show.description && (
              <div style={{
                fontSize: "1rem",
                lineHeight: 1.6,
                color: "#555",
                marginBottom: "25px",
                padding: "20px",
                background: "#f8f9fa",
                borderRadius: 12,
                border: "1px solid #e9ecef"
              }}>
                {show.description}
              </div>
            )}

            {/* Show details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {show.airDate && (
                <div style={{
                  fontSize: "0.9rem",
                  color: "#6c757d",
                  fontWeight: 500,
                  padding: "8px 15px",
                  background: "#e9ecef",
                  borderRadius: 8,
                  display: "inline-block",
                  alignSelf: "flex-start"
                }}>
                  📅 {formatAirDate(show.airDate)}
                </div>
              )}

              {formatSeasonInfo(show) && (
                <div style={{
                  fontSize: "0.9rem",
                  color: "#495057",
                  fontWeight: 500,
                  padding: "8px 15px",
                  background: "#d1ecf1",
                  borderRadius: 8,
                  display: "inline-block",
                  alignSelf: "flex-start"
                }}>
                  📺 {formatSeasonInfo(show)}
                </div>
              )}

              {formatUpcomingSeason(show) && (
                <div style={{
                  fontSize: "0.9rem",
                  color: "#155724",
                  fontWeight: 500,
                  padding: "8px 15px",
                  background: "#d4edda",
                  borderRadius: 8,
                  display: "inline-block",
                  alignSelf: "flex-start"
                }}>
                  🚀 {formatUpcomingSeason(show)}
                </div>
              )}
              
              {/* Watch button */}
              <a
                href={getWatchLink(show.platform, show.title)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: 25,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                  transition: "transform 0.2s ease",
                  marginTop: "15px",
                  alignSelf: "flex-start"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                🎬 Watch on {ALL_PLATFORMS.find(p => p.key === show.platform)?.label || show.platform}
              </a>
            </div>
          </div>
        </div>
      </div>
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem"
        }}>
          <span style={{ fontSize: "2.5rem" }}>📺</span>
          <span style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            TV Hub
          </span>
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
        <button
          onClick={() => setPlatformFilter([])}
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: 25,
            border: "none",
            background: platformFilter.length === 0
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "#f8f9fa",
            color: platformFilter.length === 0 ? "#fff" : "#333",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
            boxShadow: platformFilter.length === 0 
              ? "0 4px 12px rgba(102, 126, 234, 0.3)"
              : "0 2px 8px rgba(0,0,0,0.1)",
            transform: platformFilter.length === 0 ? "translateY(-1px)" : "translateY(0)"
          }}
        >
          All Platforms
        </button>
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
            gap: platformFilter.length === 1 ? 32 : 12,
            gridTemplateColumns: platformFilter.length === 1 
              ? "1fr"
              : platformFilter.length > 1 
                ? `repeat(${platformFilter.length}, minmax(200px, 1fr))`
                : "repeat(7, minmax(150px, 1fr))",
            maxWidth: platformFilter.length === 1 ? "600px" : "100%",
            margin: platformFilter.length === 1 ? "0 auto" : "0",
            minHeight: "400px"
          }}
        >
          {ALL_PLATFORMS
            .filter(platform => 
              platformFilter.length === 0 || 
              platformFilter.includes(platform.key)
            )
            .map((platform) => (
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
                  .map((show, index) => (
                  <div
                    key={show.id + show.platform}
                    style={{
                      border: "1px solid #e9ecef",
                      borderRadius: 16,
                      padding: platformFilter.length === 1 ? 24 : 14,
                      background: "#ffffff",
                      marginBottom: platformFilter.length === 1 ? 24 : 16,
                      position: "relative",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      cursor: "pointer"
                    }}
                    onClick={() => openModal(show)}
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
                          height: platformFilter.length === 1 ? "250px" : "160px",
                          objectFit: "cover",
                          borderRadius: 12, 
                          marginBottom: 12
                        }}
                      />
                    )}
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: platformFilter.length === 1 ? "1.2rem" : "0.95rem",
                      marginBottom: 8,
                      color: "#333",
                      lineHeight: 1.3
                    }}>
                      {show.title}
                    </div>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      alignItems: "center",
                      marginBottom: 12
                    }}>
                      <div style={{ 
                        fontSize: "0.85rem", 
                        color: "#667eea",
                        fontWeight: 600,
                        background: index < 3 
                          ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"  // Gold for top 3
                          : "#f0f2ff",
                        color: index < 3 ? "#d69e2e" : "#667eea",
                        padding: "6px 12px",
                        borderRadius: 12,
                        border: index < 3 ? "1px solid #ffd700" : "none"
                      }}>
                        {index < 3 ? "🏆" : "📈"} #{index + 1} Trending
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Modal */}
      <Modal 
        show={selectedShow} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  );
}

export default App;
