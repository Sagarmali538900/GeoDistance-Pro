import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Maximize2 } from 'lucide-react';

export default function MapView({ directionsResult, locations }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const tileLayerRef = useRef(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default view center (US/Europe/India region)
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 4,
        zoomControl: true
      });

      // Default OpenStreetMap tiles (100% free)
      const osmTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      tileLayerRef.current = osmTiles;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapType changes (Roadmap vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapType === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
    }
  }, [mapType]);

  // Create custom SVG colored pin icon for markers
  const createCustomPinIcon = (label, colorBg, numberStr) => {
    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="position: relative; width: 32px; height: 42px; display: flex; flex-direction: column; align-items: center;">
          <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="${colorBg}" stroke="#ffffff" stroke-width="2"/>
            <circle cx="16" cy="16" r="10" fill="#ffffff"/>
          </svg>
          <span style="position: absolute; top: 7px; width: 100%; text-align: center; font-size: 11px; font-weight: 800; color: ${colorBg}; font-family: sans-serif;">
            ${numberStr}
          </span>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -38]
    });
  };

  // Update Markers and Polyline when route or locations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Clear existing polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const bounds = L.latLngBounds();

    // Draw route polyline if OSRM route calculation exists
    if (directionsResult && directionsResult.routePolylineCoords && directionsResult.routePolylineCoords.length > 0) {
      const polyline = L.polyline(directionsResult.routePolylineCoords, {
        color: '#0074c5',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      polylineRef.current = polyline;

      directionsResult.routePolylineCoords.forEach(coord => bounds.extend(coord));
    }

    // Render Markers for resolved locations
    const locsToMark = directionsResult?.resolvedLocations || locations.filter(l => l.lat && l.lng);

    locsToMark.forEach((loc, idx) => {
      if (!loc.lat || !loc.lng) return;

      const isFirst = idx === 0;
      const isLast = idx === locsToMark.length - 1;
      
      let badgeColor = '#3b82f6'; // blue for waypoints
      let labelLetter = `${idx + 1}`;

      if (isFirst) {
        badgeColor = '#10b981'; // green for From
        labelLetter = 'A';
      } else if (isLast) {
        badgeColor = '#f43f5e'; // red for To
        labelLetter = 'B';
      }

      const pinIcon = createCustomPinIcon(isFirst ? 'From' : isLast ? 'To' : `Stop ${idx}`, badgeColor, labelLetter);
      const marker = L.marker([loc.lat, loc.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 2px;">
            <strong style="color: ${badgeColor}; font-size: 11px; text-transform: uppercase;">${isFirst ? 'From' : isLast ? 'To' : `Waypoint ${idx}`}</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #1e293b;">${loc.address}</p>
          </div>
        `);

      markersRef.current.push(marker);
      bounds.extend([loc.lat, loc.lng]);
    });

    // Auto zoom and fit bounds if valid locations/route exist
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [directionsResult, locations]);

  // Fullscreen trigger
  const handleFullscreen = () => {
    if (mapContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapContainerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[450px] lg:min-h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-slate-100 flex flex-col">
      
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px] lg:min-h-[600px] flex-1 z-0" />

      {/* Map Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
          className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-xs text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-semibold transition-all hover:bg-slate-50"
          title="Toggle Map View"
        >
          <Layers className="w-3.5 h-3.5 text-brand-600" />
          <span>{mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
        </button>

        <button
          type="button"
          onClick={handleFullscreen}
          className="p-2 bg-white/95 backdrop-blur-xs text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 shadow-md transition-all hover:bg-slate-50"
          title="Fullscreen Map"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
