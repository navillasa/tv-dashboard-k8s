import React, { useEffect, useState } from "react";
import axios from "axios";
import { MOCK_SHOWS } from "./mockData";

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
  { key: "netflix", label: "Netflix", logo: "🔴", color: "#E50914" },
  { key: "disney", label: "Disney+", logo: "✨", color: "#113CCF" },
  { key: "prime", label: "Prime Video", logo: "📦", color: "#00A8E1" },
  { key: "hulu", label: "Hulu", logo: "🟢", color: "#1CE783" },
  { key: "apple", label: "Apple TV+", logo: "🍎", color: "#1D1D1F" },
  { key: "max", label: "Max", logo: "🔵", color: "#0073E6" },
  { key: "paramount", label: "Paramount+", logo: "⭐", color: "#0064FF" },
];

function App() {
  const [shows, setShows] = useState<Show[]>([]); // Start empty - no mock data!
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [realShowData, setRealShowData] = useState<Show[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, number>>({});
  const [animatingTiles, setAnimatingTiles] = useState<Set<string>>(new Set());
  
  // Add CSS animations
  const animations = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes tileSlideIn {
      0% { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      100% { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .tile-animate {
      animation: tileSlideIn 0.6s ease-out forwards;
    }
  `;
  
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = animations;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Helper function to get darker color for platform headers
  const getDarkerColor = (color: string): string => {
    // Convert hex to RGB and darken
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Mapping of show titles to cached image filenames
  const cachedImageMap: Record<string, string> = {
    "Wednesday": "/images/posters/wednesday.jpg",
    "Breaking Bad": "/images/posters/breaking-bad.jpg", 
    "Squid Game": "/images/posters/squid-game.jpg",
    "The Simpsons": "/images/posters/the-simpsons.jpg",
    "The Summer I Turned Pretty": "/images/posters/summer-turned-pretty.jpg",
    "The Rookie": "/images/posters/the-rookie.jpg",
    "Grey's Anatomy": "/images/posters/greys-anatomy.jpg",
    "NCIS": "/images/posters/ncis.jpg",
    "Prison Break": "/images/posters/prison-break.jpg",
    "Shameless": "/images/posters/shameless.jpg",
    "Supernatural": "/images/posters/supernatural.jpg",
    "Miraculous: Tales of Ladybug & Cat Noir": "/images/posters/miraculous.jpg",
    "Alien: Earth": "/images/posters/alien-earth.jpg",
    "In the Mud": "/images/posters/in-the-mud.jpg"
  };

  // Function to use cached image if available, otherwise fallback to API image
  const getOptimizedPosterUrl = (show: Show): string => {
    // The posterUrl should already be optimized from the data mapping
    return show.posterUrl || cachedImageMap[show.title] || "";
  };

  // Function to preload all images from real data with timeout
  const preloadImages = async (showsData: Show[]): Promise<void> => {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalImages = showsData.filter(show => show.posterUrl).length;
      
      if (totalImages === 0) {
        resolve();
        return;
      }

      // Timeout after 10 seconds regardless of loading status
      const timeout = setTimeout(() => {
        console.log(`Image preloading timed out. Loaded ${loadedCount}/${totalImages} images.`);
        resolve();
      }, 10000);

      showsData.forEach(show => {
        if (show.posterUrl) {
          const img = new Image();
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              clearTimeout(timeout);
              resolve();
            }
          };
          img.src = show.posterUrl;
        }
      });
    });
  };
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    async function fetchShows() {
      console.log("🎉 TV Hub loading with poster optimization enabled");
      
      setLoading(true);
      try {
        const selected =
          platformFilter.length > 0
            ? platformFilter
            : ALL_PLATFORMS.map(p => p.key);
        const params = { platform: selected.join(",") };

        const { data } = await axios.get("/api/shows", { params });
        console.log(`📡 Received ${data.length} shows from API`);
        
        // Show tiles immediately - no waiting!
        setShows(data);
        setIsRealData(true);
        setRealShowData(data);
        setAnimatingTiles(new Set());
        setLoading(false); // Stop loading immediately when data arrives
      } catch (e) {
        console.error("Failed to fetch shows:", e);
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
  const [selectedShowIndex, setSelectedShowIndex] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllSeasons, setShowAllSeasons] = useState(false);

  const openModal = (show: any, index?: number) => {
    setSelectedShow(show);
    setSelectedShowIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedShow(null);
    setIsModalOpen(false);
    setShowAllSeasons(false);
  };

  // Helper to get first aired year
  const getFirstAiredYear = (airDate: string) => {
    if (!airDate) return "Unknown";
    return new Date(airDate).getFullYear().toString();
  };

  // Helper to format starring cast
  const formatStarring = (starring: string[]) => {
    if (!starring || starring.length === 0) return null;
    return starring.slice(0, 3).join(', '); // Show top 3 actors
  };

  // Helper to get all platform rankings for a show
  const getAllPlatformRankings = (show: any) => {
    const rankings: Array<{platform: string, rank: number, platformInfo: any}> = [];
    
    // Look through all platforms to find where this show appears
    ALL_PLATFORMS.forEach(platformInfo => {
      const platformShows = showsByPlatform[platformInfo.key] || [];
      const showIndex = platformShows.findIndex(s => 
        s.title.toLowerCase() === show.title.toLowerCase()
      );
      
      if (showIndex !== -1) {
        rankings.push({
          platform: platformInfo.key,
          rank: showIndex + 1,
          platformInfo
        });
      }
    });
    
    // Sort by rank (best rankings first)
    return rankings.sort((a, b) => a.rank - b.rank);
  };

  // Helper to format season details with status info
  const formatSeasonDetails = (show: any) => {
    if (!show.seasons || show.seasons.length === 0) return [];
    
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    
    return show.seasons.map((season: any) => {
      const year = season.year || (season.airDate ? season.airDate.split('-')[0] : '');
      const episodes = season.episodeCount || 0;
      const airDate = season.airDate ? new Date(season.airDate) : null;
      
      let status = '';
      let statusColor = '#666';
      
      if (airDate) {
        if (airDate > currentDate) {
          // Future season
          const month = airDate.toLocaleDateString('en-US', { month: 'long' });
          status = `Coming ${month} ${year}`;
          statusColor = '#28a745';
        } else if (parseInt(year) === currentYear) {
          // Current year - might be airing now
          status = episodes > 0 ? 'Aired' : 'Airing now';
          statusColor = episodes > 0 ? '#666' : '#007bff';
        } else {
          // Past season
          status = 'Aired';
          statusColor = '#666';
        }
      } else if (episodes === 0 && !year) {
        // Unknown season info
        status = 'TBA';
        statusColor = '#ffc107';
      } else {
        status = 'Aired';
        statusColor = '#666';
      }
      
      return {
        seasonNumber: season.seasonNumber,
        year: year || 'TBA',
        episodes: episodes > 0 ? episodes : 'TBA',
        status,
        statusColor,
        episodeText: episodes > 0 ? `${episodes} episodes` : 'Episodes TBA'
      };
    });
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

  // Create a lighter, more subtle version of the platform color
  const getLighterColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Make it lighter by blending with white (increase values towards 255)
    const lightenFactor = 0.8; // Made even lighter for tiles
    const newR = Math.round(r + (255 - r) * lightenFactor);
    const newG = Math.round(g + (255 - g) * lightenFactor);
    const newB = Math.round(b + (255 - b) * lightenFactor);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  // Create a medium-light version for headers
  const getMediumLightColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Make it lighter by blending with white
    const lightenFactor = 0.6; // Medium lightness for headers
    const newR = Math.round(r + (255 - r) * lightenFactor);
    const newG = Math.round(g + (255 - g) * lightenFactor);
    const newB = Math.round(b + (255 - b) * lightenFactor);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  // Create a darker accent color for 3D effect
  const getDarkerAccent = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Make it darker by reducing values
    const darkenFactor = 0.3; // How much to darken
    const newR = Math.round(r * (1 - darkenFactor));
    const newG = Math.round(g * (1 - darkenFactor));
    const newB = Math.round(b * (1 - darkenFactor));
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };



  const Modal = ({ show, isOpen, onClose, showIndex }: { show: any; isOpen: boolean; onClose: () => void; showIndex?: number }) => {
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
            maxWidth: window.innerWidth <= 768 ? "95%" : "600px",
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
          <div style={{ padding: window.innerWidth <= 768 ? "20px" : "30px" }}>
            {/* Poster and title section */}
            <div style={{ 
              display: "flex", 
              flexDirection: window.innerWidth <= 768 ? "column" : "row",
              gap: "20px", 
              marginBottom: "20px",
              alignItems: window.innerWidth <= 768 ? "center" : "flex-start"
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
                {(show.posterUrl || cachedImageMap[show.title]) && (
                  <img
                    src={getOptimizedPosterUrl(show)}
                    alt={show.title}
                    loading="eager"
                    style={{
                      width: "150px",
                      height: "225px",
                      objectFit: "cover",
                      borderRadius: 12,
                      flexShrink: 0,
                      opacity: 1,
                      transition: "opacity 0.3s ease"
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onLoadStart={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                    }}
                  />
                )}
                
                {/* Watch buttons under poster */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "150px" }}>
                  {(show.platforms || [show.platform]).map((platform: string) => {
                    const platformInfo = ALL_PLATFORMS.find(p => p.key === platform);
                    if (!platformInfo) return null;
                    
                    return (
                      <a
                        key={platform}
                        href={getWatchLink(platform, show.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          background: platformInfo.color,
                          color: "#fff",
                          padding: "8px 12px",
                          borderRadius: 20,
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                          transition: "transform 0.2s ease",
                          border: "none",
                          textAlign: "center"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        <span>{platformInfo.logo}</span>
                        <span>Watch on {platformInfo.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  margin: "0 0 10px 0",
                  color: "#333",
                  lineHeight: 1.2
                }}>
                  {show.title}
                </h2>
                
                {/* Trending badges for all platforms */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "15px" }}>
                  {getAllPlatformRankings(show).map((ranking) => (
                    <div key={ranking.platform} style={{
                      display: "inline-block",
                      fontSize: "0.9rem",
                      color: ranking.rank <= 3 ? "#d69e2e" : "#667eea",
                      fontWeight: 600,
                      background: ranking.rank <= 3 
                        ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                        : "#f0f2ff",
                      padding: "6px 12px",
                      borderRadius: 12,
                      border: ranking.rank <= 3 ? "1px solid #ffd700" : "none",
                      alignSelf: "flex-start"
                    }}>
                      {ranking.rank <= 3 ? "🏆" : "📈"} #{ranking.rank} Trending on {ranking.platformInfo.label}
                    </div>
                  ))}
                </div>
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

            {/* Show Info Table */}
            <div style={{
              background: "#f8f9fa",
              borderRadius: 12,
              padding: "20px",
              marginBottom: "25px",
              border: "1px solid #e9ecef"
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "140px 1fr",
                gap: window.innerWidth <= 768 ? "8px" : "12px",
                fontSize: "0.95rem"
              }}>
                {/* Starring cast */}
                {formatStarring(show.starring) && (
                  window.innerWidth <= 768 ? (
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontWeight: 600, color: "#495057" }}>Starring: </span>
                      <span style={{ color: "#666" }}>{formatStarring(show.starring)}</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600, color: "#495057" }}>Starring:</div>
                      <div style={{ color: "#666" }}>{formatStarring(show.starring)}</div>
                    </>
                  )
                )}

                {/* First aired */}
                {show.airDate && (
                  window.innerWidth <= 768 ? (
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontWeight: 600, color: "#495057" }}>First Aired: </span>
                      <span style={{ color: "#666" }}>{getFirstAiredYear(show.airDate)}</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600, color: "#495057" }}>First Aired:</div>
                      <div style={{ color: "#666" }}>{getFirstAiredYear(show.airDate)}</div>
                    </>
                  )
                )}

                {/* Total seasons */}
                {show.numberOfSeasons && (
                  window.innerWidth <= 768 ? (
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontWeight: 600, color: "#495057" }}>Total Seasons: </span>
                      <span style={{ color: "#666" }}>{show.numberOfSeasons}</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600, color: "#495057" }}>Total Seasons:</div>
                      <div style={{ color: "#666" }}>{show.numberOfSeasons}</div>
                    </>
                  )
                )}

                {/* Total episodes */}
                {show.numberOfEpisodes && (
                  window.innerWidth <= 768 ? (
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontWeight: 600, color: "#495057" }}>Total Episodes: </span>
                      <span style={{ color: "#666" }}>{show.numberOfEpisodes}</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600, color: "#495057" }}>Total Episodes:</div>
                      <div style={{ color: "#666" }}>{show.numberOfEpisodes}</div>
                    </>
                  )
                )}
              </div>
            </div>

            {/* Seasons Table */}
            {formatSeasonDetails(show).length > 0 && (
              <div style={{
                background: "#ffffff",
                borderRadius: 12,
                padding: "20px",
                marginBottom: "25px",
                border: "1px solid #e9ecef",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}>
                <div style={{
                  overflowX: "auto"
                }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.9rem"
                  }}>
                    <thead>
                      <tr style={{
                        background: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6"
                      }}>
                        <th style={{
                          padding: "12px 8px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#495057"
                        }}>
                          Season
                        </th>
                        <th style={{
                          padding: "12px 8px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#495057"
                        }}>
                          Year
                        </th>
                        <th style={{
                          padding: "12px 8px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#495057"
                        }}>
                          Episodes
                        </th>
                        <th style={{
                          padding: "12px 8px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#495057"
                        }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formatSeasonDetails(show)
                        .slice(0, showAllSeasons ? undefined : 3)
                        .map((season, index) => (
                        <tr key={season.seasonNumber} style={{
                          borderBottom: index < (showAllSeasons ? formatSeasonDetails(show).length : Math.min(3, formatSeasonDetails(show).length)) - 1 ? "1px solid #e9ecef" : "none"
                        }}>
                          <td style={{
                            padding: "12px 8px",
                            fontWeight: 500,
                            color: "#333"
                          }}>
                            Season {season.seasonNumber}
                          </td>
                          <td style={{
                            padding: "12px 8px",
                            color: "#666"
                          }}>
                            {season.year}
                          </td>
                          <td style={{
                            padding: "12px 8px",
                            color: "#666"
                          }}>
                            {season.episodeText}
                          </td>
                          <td style={{
                            padding: "12px 8px"
                          }}>
                            <span style={{
                              color: season.statusColor,
                              fontWeight: 500,
                              padding: "4px 8px",
                              background: season.statusColor === '#28a745' ? '#d4edda' : 
                                         season.statusColor === '#007bff' ? '#cce7ff' :
                                         season.statusColor === '#ffc107' ? '#fff3cd' : 'transparent',
                              borderRadius: "6px",
                              fontSize: "0.85rem"
                            }}>
                              {season.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Expand/Collapse button for seasons > 3 */}
                {formatSeasonDetails(show).length > 3 && (
                  <div style={{ marginTop: "15px", textAlign: "center" }}>
                    <button
                      onClick={() => setShowAllSeasons(!showAllSeasons)}
                      style={{
                        background: "none",
                        border: "1px solid #dee2e6",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        color: "#667eea",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8f9fa";
                        e.currentTarget.style.borderColor = "#667eea";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.borderColor = "#dee2e6";
                      }}
                    >
                      {showAllSeasons ? 
                        `Show less (${formatSeasonDetails(show).length - 3} seasons hidden)` : 
                        `Show all ${formatSeasonDetails(show).length} seasons (+${formatSeasonDetails(show).length - 3} more)`
                      }
                    </button>
                  </div>
                )}
              </div>
            )}
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
          <div style={{ 
            marginBottom: "1rem",
            animation: "spin 2s linear infinite"
          }}>📺</div>
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
                : window.innerWidth <= 768 
                  ? "repeat(3, minmax(120px, 1fr))" // Mobile: 3 columns for compact view
                  : window.innerWidth <= 1024
                    ? "repeat(auto-fit, minmax(200px, 1fr))" // Tablet: smaller columns
                    : "repeat(7, minmax(150px, 1fr))", // Desktop: original layout
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
                color: "#fff",
                padding: "1rem",
                background: `linear-gradient(135deg, ${platform.color} 0%, ${getDarkerColor(platform.color)} 100%)`,
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
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
                      border: "none",
                      borderRadius: 16,
                      padding: platformFilter.length === 1 ? 24 : 14,
                      background: getLighterColor(platform.color),
                      marginBottom: platformFilter.length === 1 ? 24 : 16,
                      position: "relative",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      cursor: "pointer"
                    }}
                    onClick={() => openModal(show, index)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    }}
                  >
                    <div style={{
                      width: "100%", 
                      height: platformFilter.length === 1 ? "250px" : "160px",
                      background: `linear-gradient(135deg, ${getLighterColor(platform.color)} 0%, ${platform.color}20 100%)`,
                      borderRadius: 12, 
                      marginBottom: 12,
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      {(show.posterUrl || cachedImageMap[show.title]) ? (
                        <img
                          src={getOptimizedPosterUrl(show)}
                          alt={show.title}
                          loading="eager"
                          style={{
                            width: "100%", 
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 12,
                            position: "absolute",
                            top: 0,
                            left: 0,
                            opacity: 0,
                            transition: "opacity 0.5s ease"
                          }}
                          onLoad={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                          onError={(e) => {
                            // If image fails to load, show the placeholder content
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                      {/* Static platform-colored background icon - only show when no poster */}
                      {!(show.posterUrl || cachedImageMap[show.title]) && (
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: platform.color,
                          fontSize: "2rem",
                          opacity: 0.7,
                          zIndex: 1
                        }}>
                          📺
                        </div>
                      )}
                    </div>
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
      
      {/* Loading indicator when no data yet */}
      {shows.length === 0 && !loading && (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem 2rem",
          color: "#666",
          fontSize: "1.1rem",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          borderRadius: "16px",
          margin: "2rem 0",
          border: "1px solid #dee2e6",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}>
          <div style={{ 
            marginBottom: "1rem", 
            fontSize: "2rem",
            animation: "spin 2s linear infinite"
          }}>🔄</div>
          <div style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
            {realShowData.length > 0 ? "Preloading images..." : "Loading more shows..."}
          </div>
          <div style={{ fontSize: "0.9rem", color: "#888" }}>
            {realShowData.length > 0 
              ? "Preparing seamless transition to real data" 
              : "Fetching real-time data from streaming platforms"
            }
          </div>
        </div>
      )}
      
      {/* Modal */}
      <Modal 
        show={selectedShow} 
        isOpen={isModalOpen} 
        onClose={closeModal}
        showIndex={selectedShowIndex}
      />
    </div>
  );
}

export default App;
