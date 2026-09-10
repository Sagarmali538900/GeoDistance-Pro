import { Loader } from '@googlemaps/js-api-loader';
import { calculateRouteFree } from './freeRoutingService';

let loaderInstance = null;
let googleMapsPromise = null;
let activeApiKey = null;

export function getApiKey() {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (envKey && envKey.trim() !== '' && envKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return envKey.trim();
  }
  const customKey = localStorage.getItem('geometrics_custom_api_key');
  return customKey ? customKey.trim() : '';
}

export function saveCustomApiKey(key) {
  if (key) {
    localStorage.setItem('geometrics_custom_api_key', key.trim());
  } else {
    localStorage.removeItem('geometrics_custom_api_key');
  }
  loaderInstance = null;
  googleMapsPromise = null;
  activeApiKey = null;
}

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

export async function reverseGeocode(lat, lng) {
  try {
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
  } catch (e) {
    return { address: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, lat, lng };
  }
}

/**
 * Calculate driving / travel route using 100% Exact Google Maps Directions API
 */
export async function calculateRouteGoogle(locations, travelMode = 'DRIVING') {
  const apiKey = getApiKey();
  
  // If no API key is set, fallback seamlessly to OpenStreetMap engine
  if (!apiKey) {
    return calculateRouteFree(locations, travelMode);
  }

  await loadGoogleMapsApi();
  
  const validLocations = locations.filter(loc => loc.address && loc.address.trim() !== '');
  if (validLocations.length < 2) {
    throw new Error('Please enter at least two locations (From and To) to calculate distance.');
  }

  const directionsService = new window.google.maps.DirectionsService();

  const origin = validLocations[0].lat && validLocations[0].lng
    ? { lat: validLocations[0].lat, lng: validLocations[0].lng }
    : validLocations[0].address;

  const destination = validLocations[validLocations.length - 1].lat && validLocations[validLocations.length - 1].lng
    ? { lat: validLocations[validLocations.length - 1].lat, lng: validLocations[validLocations.length - 1].lng }
    : validLocations[validLocations.length - 1].address;

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

  const request = {
    origin,
    destination,
    waypoints,
    travelMode: modeMap[travelMode] || window.google.maps.TravelMode.DRIVING
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
            endLocation: { lat: leg.end_location.lat(), lng: leg.end_location.lng() }
          };
        });

        const routePolylineCoords = route.overview_path.map(p => [p.lat(), p.lng()]);

        resolve({
          isGoogleResult: true,
          directionsResult: result,
          route,
          totalDistanceMeters,
          totalDurationSeconds,
          totalDistanceKm: (totalDistanceMeters / 1000).toFixed(1),
          totalDistanceMiles: (totalDistanceMeters / 1609.34).toFixed(1),
          totalDurationFormatted: formatDuration(totalDurationSeconds),
          routePolylineCoords,
          legs
        });
      } else {
        reject(new Error(`Google Maps Directions failed: ${status}`));
      }
    });
  });
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
