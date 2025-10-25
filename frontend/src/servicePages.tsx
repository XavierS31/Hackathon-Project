import React, { useEffect, useState, useRef } from "react";

// Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
  
  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options: MapOptions);
        setCenter(latlng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
      }
      
      class Marker {
        constructor(options: MarkerOptions);
        addListener(eventName: string, handler: Function): void;
      }
      
      class InfoWindow {
        constructor(options: InfoWindowOptions);
        open(map: Map, marker: Marker): void;
      }
      
      enum MapTypeId {
        ROADMAP = 'roadmap'
      }
      
      interface MapOptions {
        zoom: number;
        center: LatLng | LatLngLiteral;
        mapTypeId: MapTypeId;
        styles?: any[];
      }
      
      interface MarkerOptions {
        position: LatLng | LatLngLiteral;
        map: Map;
        title?: string;
        label?: any;
      }
      
      interface InfoWindowOptions {
        content: string;
      }
      
      interface LatLng {
        lat(): number;
        lng(): number;
      }
      
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }
    }
  }
}

// Define the Place type based on your database schema
interface Place {
  id: string;
  yelpId: string;
  name: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

function ServicesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Fetch Google Maps API key
  useEffect(() => {
    const fetchMapsKey = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/maps-key");
        const data = await res.json();
        setGoogleMapsApiKey(data.apiKey);
      } catch (err) {
        console.error("Error fetching Google Maps API key:", err);
      }
    };
    fetchMapsKey();
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!googleMapsApiKey || mapLoaded) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [googleMapsApiKey, mapLoaded]);

  // Initialize map when places and map are loaded
  useEffect(() => {
    if (!mapLoaded || !places.length || !mapRef.current) return;

    const initializeMap = () => {
      if (mapInstanceRef.current) return; // Map already initialized

      const orlando = { lat: 28.5383, lng: -81.3792 };
      
      if (mapRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: orlando,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });
      }

      // Add markers for each place
      places.forEach((place) => {
        if (place.latitude && place.longitude) {
          const marker = new google.maps.Marker({
            position: { lat: place.latitude, lng: place.longitude },
            map: mapInstanceRef.current!,
            title: place.name,
            label: {
              text: "⭐",
              color: "#f39c12",
              fontSize: "16px"
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #2c3e50;">${place.name}</h3>
                <p style="margin: 0 0 4px 0; color: #f39c12; font-weight: bold;">
                  ⭐ ${place.rating || 'N/A'}/5
                  ${place.reviewCount ? ` (${place.reviewCount} reviews)` : ''}
                </p>
                <p style="margin: 0; color: #666; font-size: 12px;">
                  📍 ${place.address || 'Address not available'}
                </p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current!, marker);
          });

          markersRef.current.push(marker);
        }
      });
    };

    initializeMap();
  }, [mapLoaded, places]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        console.log("🔍 Fetching places from API...");
        const res = await fetch("http://localhost:3001/api/places");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("📋 Places data received:", data);
        setPlaces(data);
      } catch (err) {
        console.error("❌ Error fetching places:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  if (loading) {
    return (
      <div className="page-wrap" style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Loading Local Services...</h1>
        <p>Fetching the best places in Orlando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrap" style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Error Loading Services</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: "#3498db",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "1rem"
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "1rem 2rem",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.8rem" }}>
              🏪 Orlando Services & Map
            </h1>
            <p style={{ margin: "0", opacity: "0.9" }}>
              Discover the best restaurants and services in Orlando with interactive map
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ← Back
          </button>
        </div>
        {places.length > 0 && (
          <div style={{
            display: "flex",
            gap: "1rem",
            marginTop: "1rem",
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "rgba(255,255,255,0.2)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontSize: "0.9rem"
            }}>
              📊 {places.length} Businesses Found
            </div>
            <div style={{
              background: "rgba(255,255,255,0.2)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontSize: "0.9rem"
            }}>
              ⭐ Average Rating: {(places.reduce((sum, p) => sum + (p.rating || 0), 0) / places.length).toFixed(1)}/5
            </div>
            <div style={{
              background: "rgba(255,255,255,0.2)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontSize: "0.9rem"
            }}>
              🗺️ Interactive Map
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Split Layout */}
      <div style={{ 
        display: "flex", 
        flex: 1, 
        height: "calc(100vh - 120px)" 
      }}>
        {/* Left Side - Places List */}
        <div style={{ 
          width: "50%", 
          background: "#f8f9fa",
          overflowY: "auto",
          padding: "1rem"
        }}>
          <h2 style={{ 
            margin: "0 0 1rem 0", 
            color: "#2c3e50",
            fontSize: "1.3rem"
          }}>
            📋 Places List
          </h2>

          {places.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <h3>No places found</h3>
              <p>Try clicking the "Services" button on the home page to fetch Yelp data first.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {places.map((place) => (
                <div
                  key={place.id}
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    padding: "1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid #e0e0e0",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLDivElement;
                    target.style.transform = "translateY(-2px)";
                    target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLDivElement;
                    target.style.transform = "translateY(0)";
                    target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                  onClick={() => {
                    if (mapInstanceRef.current && place.latitude && place.longitude) {
                      mapInstanceRef.current.setCenter({ lat: place.latitude, lng: place.longitude });
                      mapInstanceRef.current.setZoom(15);
                    }
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: "0 0 0.5rem 0",
                        color: "#2c3e50",
                        fontSize: "1.1rem",
                        fontWeight: "bold"
                      }}>
                        {place.name}
                      </h3>
                      
                      {place.rating && (
                        <div style={{ 
                          display: "flex",
                          alignItems: "center",
                          margin: "0.25rem 0"
                        }}>
                          <span style={{ 
                            color: "#f39c12", 
                            fontSize: "1rem",
                            fontWeight: "bold",
                            marginRight: "0.5rem"
                          }}>
                            ⭐ {place.rating}/5
                          </span>
                          {place.reviewCount && (
                            <span style={{ 
                              fontSize: "0.8rem", 
                              color: "#666"
                            }}>
                              ({place.reviewCount} reviews)
                            </span>
                          )}
                        </div>
                      )}
                      
                      {place.address && (
                        <p style={{ 
                          fontSize: "0.85rem", 
                          color: "#666",
                          margin: "0.25rem 0",
                          lineHeight: "1.3"
                        }}>
                          📍 {place.address}
                          {place.city && `, ${place.city}`}
                        </p>
                      )}
                    </div>
                    
                    {place.latitude && place.longitude && (
                      <div style={{
                        background: "#e8f4fd",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        color: "#666",
                        fontFamily: "monospace"
                      }}>
                        🗺️ {place.latitude.toFixed(3)}, {place.longitude.toFixed(3)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Google Map */}
        <div style={{ 
          width: "50%", 
          background: "#f0f0f0",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            background: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: "0.9rem",
            color: "#2c3e50",
            fontWeight: "bold"
          }}>
            🗺️ Interactive Map
          </div>
          
          {!googleMapsApiKey || googleMapsApiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE" ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              background: "#f8f9fa",
              color: "#666",
              textAlign: "center",
              padding: "2rem"
            }}>
              <div>
                <h3>🗺️ Google Maps Integration</h3>
                <p>Please add your Google Maps API key to server.js</p>
                <p style={{ fontSize: "0.8rem", marginTop: "1rem" }}>
                  Replace "YOUR_GOOGLE_MAPS_API_KEY_HERE" with your actual API key
                </p>
              </div>
            </div>
          ) : (
            <div 
              ref={mapRef} 
              style={{ 
                width: "100%", 
                height: "100%",
                background: "#e0e0e0"
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;

