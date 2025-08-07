//avdeep
import { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import type { User } from "../api/users";
//import User from "../interfaces/User";

interface Location {
  _id: string;
  name: string;
  address: string;
  tags: string[];
  floor?: string;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

//pin mark svg compatible with google maps T-T
const pinSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="28">
    📌
  </text>
</svg>
`;

const iconUrl =
  "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(pinSvg);

//the favorite icons svg in MUI taken directly from the node_modules folder so i can use it in the info window
const favoriteRoundedSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#d32f2f" xmlns="http://www.w3.org/2000/svg"><path d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76z"/></svg>`;

const favoriteBorderSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3m-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05"/></svg>`;

const MapContainer = styled.div`
  width: 80vw;
  height: 60vh;
  margin: 2rem auto;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  padding: 1rem;
  color: #555;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  font-weight: bold;
  padding: 1rem;
`;

//getting rid of the x mark on the info window
const GlobalStyle = createGlobalStyle`
.gm-style-iw button[aria-label="Close"],
.gm-style-iw-c button[aria-label="Close"],
.gm-ui-hover-effect {
  display: none !important;
}
`;

const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const currentInfoWindowRef = useRef<any>(null);

  // Mock current user for testing
  // useEffect(() => {
  //   const mockUser: User = {
  //     _id: "user123",
  //     favoriteLocationIds: [],
  //   };
  //   setCurrentUser(mockUser);
  //   fetchUserFavorites(mockUser._id);
  // }, []);

  useEffect(() => {
    const fetchCurrentUserAndFavorites = async () => {
      const token = localStorage.getItem("token"); // the JWT token
      if (!token) {
        setCurrentUser(null);
        return;
      }
      try {
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          // Fetch this user's favorites with the token as well
          fetchUserFavorites(user._id, token);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        setCurrentUser(null);
      }
    };
    fetchCurrentUserAndFavorites();
  }, []);

  // Fetch user favorites when current user changes
  const fetchUserFavorites = async (userId: string, token?: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/favorites`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });
      if (response.ok) {
        const favorites = await response.json();
        setUserFavorites(new Set(favorites.map((loc: Location) => loc._id)));
      }
    } catch (err) {
      console.error("Failed to fetch user favorites:", err);
    }
  };

  // Create InfoWindow content HTML in a way that can be passed to Google Maps
  const createInfoWindowContent = (
    location: Location,
    isFavorited: boolean
  ) => {
    const heartSvg = isFavorited ? favoriteRoundedSvg : favoriteBorderSvg;

    return `
    <div style="font-family: Arial, sans-serif; max-width: 280px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
      <strong style="font-size: 16px; color: #1d3557;">${location.name}</strong>
        <span id="favorite-btn-${
          location._id
        }" style="cursor: pointer; font-size: 24px; user-select: none; color:${
      isFavorited ? "red" : "gray"
    };" title="${isFavorited ? "Remove favorite" : "Add favorite"}">
          ${heartSvg}
        </span>
      </div>
      <p style="margin: 8px 0 0 0;">📍${location.address}</p>
      ${
        location.floor
          ? `<p style="margin: 4px 0 0 0;">Floor: ${location.floor}</p>`
          : ""
      }
      <p style="margin: 8px 0 0 0;">🏷️ Tags: ${location.tags.join(", ")}</p>
    </div>
  `;
  };

  // Toggle favorite status for a location
  const toggleFavorite = async (locationId: string) => {
    if (!currentUser) return;

    const token = localStorage.getItem("token"); // the JWT token
    const isFavorited = userFavorites.has(locationId);

    try {
      if (isFavorited) {
        const response = await fetch(`/api/users/favorites/${locationId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setUserFavorites((prev) => {
            const newSet = new Set(prev);
            newSet.delete(locationId);
            return newSet;
          });
        }
      } else {
        const response = await fetch(`/api/users/favorites/${locationId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setUserFavorites((prev) => {
            const newSet = new Set(prev);
            newSet.add(locationId);
            return newSet;
          });
        }
      }

      // Update InfoWindow content
      if (currentInfoWindowRef.current) {
        const location = locations.find((loc) => loc._id === locationId);
        if (location) {
          const newIsFavorited = !isFavorited;
          currentInfoWindowRef.current.setContent(
            createInfoWindowContent(location, newIsFavorited)
          );
          setTimeout(() => {
            const favoriteBtn = document.getElementById(
              `favorite-btn-${locationId}`
            );
            if (favoriteBtn) {
              favoriteBtn.addEventListener("click", () =>
                toggleFavorite(locationId)
              );
            }
          }, 50);
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  // Fetch location data from backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        console.log("Fetching locations...");
        setLoading(true);

        const response = await fetch("/api/locations");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received locations:", data);
        setLocations(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch locations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Load Google Maps script with async loading
  useEffect(() => {
    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log(
      "Loading Google Maps with API key:",
      GOOGLE_MAPS_API_KEY ? "Present" : "Missing"
    );

    const existingScript = document.getElementById("google-maps");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;
      script.id = "google-maps";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("Google Maps script loaded successfully");
        setScriptLoaded(true);
      };

      script.onerror = (error) => {
        console.error("Error loading Google Maps script:", error);
        setError("Failed to load Google Maps");
      };

      document.body.appendChild(script);
    } else {
      existingScript.addEventListener("load", () => {
        setScriptLoaded(true);
      });
    }
  }, []);

  // Render map when everything is ready
  useEffect(() => {
    if (
      !scriptLoaded ||
      !window.google ||
      !mapRef.current ||
      locations.length === 0
    ) {
      return;
    }

    console.log("Rendering map with", locations.length, "locations");

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 42.3505, lng: -71.1054 }, // BU coords
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    const geocoder = new window.google.maps.Geocoder();
    let markersCreated = 0;

    locations.forEach((location, index) => {
      geocoder.geocode(
        { address: location.address },
        (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const marker = new window.google.maps.Marker({
              map,
              position: results[0].geometry.location,
              title: location.name,
              animation: window.google.maps.Animation.DROP,
              icon: {
                url: iconUrl,
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 32),
              },
            });

            const isFavorited = userFavorites.has(location._id);
            const infoWindow = new window.google.maps.InfoWindow({
              content: createInfoWindowContent(location, isFavorited),
              maxWidth: 300,
              closeBoxURL: "",
            });

            marker.addListener("click", () => {
              // Close any existing info window
              if (currentInfoWindowRef.current) {
                currentInfoWindowRef.current.close();
              }

              // Open new info window
              infoWindow.open(map, marker);
              currentInfoWindowRef.current = infoWindow;

              // Attach event listener to favorite button
              setTimeout(() => {
                const favoriteBtn = document.getElementById(
                  `favorite-btn-${location._id}`
                );
                if (favoriteBtn) {
                  favoriteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleFavorite(location._id);
                  });
                }
              }, 100);
            });

            // Close info window when clicking elsewhere
            infoWindow.addListener("closeclick", () => {
              currentInfoWindowRef.current = null;
            });

            markersCreated++;
            console.log(
              `Created marker ${markersCreated}/${locations.length} for: ${location.name}`
            );
          } else {
            console.warn(
              "Geocoding failed for:",
              location.address,
              "Status:",
              status
            );
          }
        }
      );
    });
  }, [scriptLoaded, locations, userFavorites]);

  return (
    <>
      <GlobalStyle />
      {loading && <LoadingMessage>Loading locations...</LoadingMessage>}
      {error && (
        <ErrorMessage>
          Error: {error}
          <br />
          Make sure your backend is running and Google Maps API key is valid.
        </ErrorMessage>
      )}
      {!scriptLoaded && <LoadingMessage>Loading Google Maps...</LoadingMessage>}
      <MapContainer ref={mapRef} />
    </>
  );
};

export default Map;
