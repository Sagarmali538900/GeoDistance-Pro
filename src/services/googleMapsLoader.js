import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance = null;
let googleMapsPromise = null;
let activeApiKey = null;

/**
 * Get current Google Maps API Key from env or localStorage
 */
export function getApiKey() {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (envKey && envKey.trim() !== '' && envKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return envKey.trim();
  }
  const customKey = localStorage.getItem('geometrics_custom_api_key');
  return customKey ? customKey.trim() : '';
}

/**
 * Save dynamic API Key to localStorage
 */
export function saveCustomApiKey(key) {
  if (key) {
    localStorage.setItem('geometrics_custom_api_key', key.trim());
  } else {
    localStorage.removeItem('geometrics_custom_api_key');
  }
  // Reset loader cache so it re-initializes with the new key
  loaderInstance = null;
  googleMapsPromise = null;
  activeApiKey = null;
}

/**
 * Load Google Maps API using Loader from @googlemaps/js-api-loader
 */
export function loadGoogleMapsApi(overrideKey = null) {
  const apiKey = overrideKey || getApiKey();

  if (!apiKey) {
    return Promise.reject(new Error('NO_API_KEY'));
  }

  if (googleMapsPromise && activeApiKey === apiKey) {
    return googleMapsPromise;
  }

  activeApiKey = apiKey;
  loaderInstance = new Loader({
    apiKey: apiKey,
    version: 'weekly',
    libraries: ['places', 'geometry', 'routes']
  });

  googleMapsPromise = loaderInstance.load().then((google) => {
    return google;
  }).catch((err) => {
    console.error('Google Maps API load error:', err);
    throw err;
  });

  return googleMapsPromise;
}

/**
 * Reverse Geocode lat, lng to human readable address
 */
export async function reverseGeocode(lat, lng) {
  await loadGoogleMapsApi();
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve({
          address: results[0].formatted_address,
          placeId: results[0].place_id,
          location: { lat, lng }
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

/**
 * Calculate driving / travel route between multiple location points
 * @param {Array<{address: string, placeId?: string, lat?: number, lng?: number}>} locations 
 * @param {string} travelMode 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT'
 */
export async function calculateRoute(locations, travelMode = 'DRIVING') {
  await loadGoogleMapsApi();
  
  // Filter out empty locations
  const validLocations = locations.filter(loc => loc.address && loc.address.trim() !== '');

  if (validLocations.length < 2) {
    throw new Error('Please select at least two locations (From and To) to calculate distance.');
  }

  const directionsService = new window.google.maps.DirectionsService();

  const origin = validLocations[0].lat && validLocations[0].lng
    ? { lat: validLocations[0].lat, lng: validLocations[0].lng }
    : validLocations[0].address;

  const destination = validLocations[validLocations.length - 1].lat && validLocations[validLocations.length - 1].lng
    ? { lat: validLocations[validLocations.length - 1].lat, lng: validLocations[validLocations.length - 1].lng }
    : validLocations[validLocations.length - 1].address;

  // Intermediate waypoints
  const waypoints = validLocations.slice(1, -1).map(loc => ({
    location: loc.lat && loc.lng ? { lat: loc.lat, lng: loc.lng } : loc.address,
    stopover: true
  }));

  const modeMap = {
    'DRIVING': window.google.maps.TravelMode.DRIVING,
    'WALKING': window.google.maps.TravelMode.WALKING,
    'BICYCLING': window.google.maps.TravelMode.BICYCLING,
    'TRANSIT': window.google.maps.TravelMode.TRANSIT
  };

  const selectedMode = modeMap[travelMode] || window.google.maps.TravelMode.DRIVING;

  const request = {
    origin,
    destination,
    waypoints,
    travelMode: selectedMode,
    optimizeWaypoints: false
  };

  return new Promise((resolve, reject) => {
    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result && result.routes && result.routes[0]) {
        const route = result.routes[0];
        let totalDistanceMeters = 0;
        let totalDurationSeconds = 0;

        const legs = route.legs.map((leg, index) => {
          totalDistanceMeters += leg.distance ? leg.distance.value : 0;
          totalDurationSeconds += leg.duration ? leg.duration.value : 0;

          return {
            legIndex: index,
            from: leg.start_address,
            to: leg.end_address,
            distanceText: leg.distance ? leg.distance.text : 'N/A',
            distanceValueMeters: leg.distance ? leg.distance.value : 0,
            durationText: leg.duration ? leg.duration.text : 'N/A',
            durationValueSeconds: leg.duration ? leg.duration.value : 0,
            startLocation: { lat: leg.start_location.lat(), lng: leg.start_location.lng() },
            endLocation: { lat: leg.end_location.lat(), lng: leg.end_location.lng() },
            stepsCount: leg.steps ? leg.steps.length : 0
          };
        });

        resolve({
          directionsResult: result,
          route,
          totalDistanceMeters,
          totalDurationSeconds,
          totalDistanceKm: (totalDistanceMeters / 1000).toFixed(1),
          totalDistanceMiles: (totalDistanceMeters / 1609.34).toFixed(1),
          totalDurationFormatted: formatDuration(totalDurationSeconds),
          legs,
          validLocationsCount: validLocations.length
        });
      } else {
        let errorMessage = 'Could not calculate route between specified locations.';
        if (status === 'ZERO_RESULTS') {
          errorMessage = 'No route could be found between the specified locations.';
        } else if (status === 'NOT_FOUND') {
          errorMessage = 'One or more of the specified addresses could not be geocoded.';
        } else if (status === 'OVER_QUERY_LIMIT') {
          errorMessage = 'Google Maps API query limit exceeded.';
        } else if (status === 'REQUEST_DENIED') {
          errorMessage = 'Google Maps Directions request denied. Check API key permissions.';
        }
        reject(new Error(errorMessage));
      }
    });
  });
}

/**
 * Format total seconds into clean human readable string (e.g. 28 min, 2 hr 15 min)
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0 min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${minutes} min`;
}
