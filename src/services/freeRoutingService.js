/**
 * Free Routing & Geocoding Service powered by OpenStreetMap, OSRM, and Photon/Nominatim.
 * 100% Free, Open Source, and zero API key or billing required.
 */

// Search places using Photon API (built on OpenStreetMap Nominatim, ultra-fast autocomplete)
export async function searchPlacesFree(query) {
  if (!query || query.trim().length < 2) return [];

  const sanitizedQuery = encodeURIComponent(query.trim());
  
  try {
    // Primary: Photon API (Fast CORS-friendly OSM search)
    const res = await fetch(`https://photon.komoot.io/api/?q=${sanitizedQuery}&limit=6`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        return data.features.map((feature, idx) => {
          const props = feature.properties || {};
          const coords = feature.geometry?.coordinates || [0, 0]; // [lng, lat]
          
          const title = props.name || props.street || props.city || props.country || query;
          const detailsParts = [props.street, props.city, props.state, props.postcode, props.country].filter(Boolean);
          const subtitle = detailsParts.join(', ');

          return {
            id: `photon-${idx}-${Date.now()}`,
            formattedAddress: subtitle ? (title !== subtitle ? `${title}, ${subtitle}` : title) : title,
            name: title,
            lat: coords[1],
            lng: coords[0],
            city: props.city || props.town || '',
            country: props.country || ''
          };
        });
      }
    }
  } catch (e) {
    console.warn("Photon search failed, falling back to Nominatim:", e);
  }

  // Fallback: OpenStreetMap Nominatim API
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${sanitizedQuery}&limit=6&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    if (res.ok) {
      const data = await res.json();
      return data.map((item, idx) => ({
        id: `nominatim-${item.place_id || idx}`,
        formattedAddress: item.display_name,
        name: item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        city: item.address?.city || item.address?.town || '',
        country: item.address?.country || ''
      }));
    }
  } catch (err) {
    console.error("Nominatim search error:", err);
  }

  return [];
}

// Reverse Geocode GPS lat, lng to human address via Nominatim
export async function reverseGeocodeFree(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (res.ok) {
      const data = await res.json();
      return {
        address: data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat,
        lng
      };
    }
  } catch (err) {
    console.warn("OSM Reverse geocoding failed:", err);
  }
  return {
    address: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    lat,
    lng
  };
}

// Calculate road distance and route using OSRM (Open Source Routing Machine) API
export async function calculateRouteFree(locations, travelMode = 'DRIVING') {
  // Filter valid locations with valid address
  const validLocations = locations.filter(loc => loc.address && loc.address.trim() !== '');

  if (validLocations.length < 2) {
    throw new Error('Please enter at least two locations (From and To) to calculate distance.');
  }

  // Ensure all locations have lat/lng coordinates. Geocode any missing address on the fly.
  const resolvedLocations = await Promise.all(
    validLocations.map(async (loc) => {
      if (loc.lat && loc.lng) return loc;
      const searchResults = await searchPlacesFree(loc.address);
      if (searchResults && searchResults.length > 0) {
        return {
          ...loc,
          lat: searchResults[0].lat,
          lng: searchResults[0].lng,
          address: loc.address || searchResults[0].formattedAddress
        };
      }
      throw new Error(`Could not find geographic location for "${loc.address}". Please pick a location from the search dropdown.`);
    })
  );

  // Map travel mode to OSRM profile ('driving', 'cycling', 'foot')
  let osrmProfile = 'driving';
  if (travelMode === 'BICYCLING') osrmProfile = 'bike';
  if (travelMode === 'WALKING') osrmProfile = 'foot';

  // Construct OSRM coordinate string: lng1,lat1;lng2,lat2;...
  const coordString = resolvedLocations.map(loc => `${loc.lng},${loc.lat}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordString}?overview=full&geometries=geojson&steps=true&annotations=true`;

  const response = await fetch(osrmUrl);
  if (!response.ok) {
    throw new Error('Routing server error. Could not calculate road distance between locations.');
  }

  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('No driving route could be found connecting these locations.');
  }

  const route = data.routes[0];
  const totalDistanceMeters = route.distance;
  const totalDurationSeconds = route.duration;

  // Convert OSRM GeoJSON [lng, lat] coordinates to Leaflet [lat, lng] format
  const routePolylineCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

  // Format segment legs
  const legs = route.legs.map((leg, index) => {
    const fromLoc = resolvedLocations[index].address;
    const toLoc = resolvedLocations[index + 1].address;
    const legMeters = leg.distance;
    const legSecs = leg.duration;

    return {
      legIndex: index,
      from: fromLoc,
      to: toLoc,
      distanceText: `${(legMeters / 1000).toFixed(1)} km`,
      distanceValueMeters: legMeters,
      durationText: formatDuration(legSecs),
      durationValueSeconds: legSecs,
      startLocation: { lat: resolvedLocations[index].lat, lng: resolvedLocations[index].lng },
      endLocation: { lat: resolvedLocations[index + 1].lat, lng: resolvedLocations[index + 1].lng }
    };
  });

  return {
    totalDistanceMeters,
    totalDurationSeconds,
    totalDistanceKm: (totalDistanceMeters / 1000).toFixed(1),
    totalDistanceMiles: (totalDistanceMeters / 1609.34).toFixed(1),
    totalDurationFormatted: formatDuration(totalDurationSeconds),
    routePolylineCoords,
    resolvedLocations,
    legs
  };
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0 min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${minutes} min`;
}
