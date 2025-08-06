import { useEffect, useRef, useState } from "react";

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

const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Load Google Maps script with proper async loading
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

  // Render map when both script and locations are ready
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
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="font-family: sans-serif; max-width: 200px;">
                  <strong style="color: #333;">${location.name}</strong><br/>
                  <em style="color: #666;">${location.address}</em><br/>
                  ${
                    location.floor
                      ? `<div style="margin-top: 8px;"><strong>Floor:</strong> ${location.floor}</div>`
                      : ""
                  }
                  <div style="margin-top: 8px;"><strong>Tags:</strong> 
                    <span style="color: #0066cc;">${location.tags.join(
                      ", "
                    )}</span>
                  </div>
                </div>
              `,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
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
  }, [scriptLoaded, locations]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>BU Study Spots Map</h2>
        <p>Loading locations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>BU Study Spots Map</h2>
        <p style={{ color: "red" }}>Error: {error}</p>
        <p>
          Make sure your backend is running and Google Maps API key is valid.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ textAlign: "center", margin: "1rem" }}></h2>
      {!scriptLoaded && (
        <p style={{ textAlign: "center", color: "#666" }}>
          Loading Google Maps...
        </p>
      )}
      <div
        ref={mapRef}
        style={{
          width: "900px",
          height: "600px",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          backgroundColor: scriptLoaded ? "transparent" : "#f5f5f5",
        }}
      />
    </div>
  );
};

export default Map;
