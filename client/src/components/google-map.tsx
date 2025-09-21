import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps, createMap, createMarker, createInfoWindow } from "@/lib/google-maps";
import { College } from "@/types/college";

interface GoogleMapProps {
  colleges?: College[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onCollegeClick?: (college: College) => void;
  showCurrentLocation?: boolean;
  currentLocation?: { lat: number; lng: number };
}

export function GoogleMap({ 
  colleges = [], 
  center = { lat: 28.6139, lng: 77.2090 }, 
  zoom = 11,
  height = "h-96",
  onCollegeClick,
  showCurrentLocation = false,
  currentLocation
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        await loadGoogleMaps();
        
        if (!mapRef.current) return;

        const map = createMap(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: "poi",
              elementType: "labels.text",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Google Maps:', err);
        setError('Failed to load map. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add college markers
    colleges.forEach(college => {
      if (!college.location.coordinates) return;

      const marker = createMarker({
        position: college.location.coordinates,
        map: mapInstanceRef.current,
        title: college.name,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#2563eb" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 24)
        }
      });

      const infoWindow = createInfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-sm mb-1">${college.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${college.location.address}</p>
            <div class="flex gap-1 mb-2">
              ${college.streams?.slice(0, 2).map(stream => 
                `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${stream}</span>`
              ).join('')}
            </div>
            ${college.distance ? `<p class="text-xs text-gray-500">${college.distance.toFixed(1)} km away</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        onCollegeClick?.(college);
      });

      markersRef.current.push(marker);
    });

    // Add current location marker if provided
    if (showCurrentLocation && currentLocation) {
      const currentLocationMarker = createMarker({
        position: currentLocation,
        map: mapInstanceRef.current,
        title: "Your Location",
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#ef4444" stroke="white" stroke-width="2"/>
              <circle cx="10" cy="10" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(20, 20),
          anchor: new google.maps.Point(10, 10)
        }
      });

      markersRef.current.push(currentLocationMarker);
    }

    // Adjust map bounds to fit all markers
    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      mapInstanceRef.current.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(mapInstanceRef.current, "idle", () => {
        if (mapInstanceRef.current!.getZoom()! > 15) {
          mapInstanceRef.current!.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [colleges, showCurrentLocation, currentLocation, onCollegeClick]);

  if (error) {
    return (
      <div className={`${height} bg-muted rounded-lg flex items-center justify-center`}>
        <div className="text-center p-4">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} bg-muted rounded-lg relative overflow-hidden`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" data-testid="google-map" />
    </div>
  );
}
