import axios from 'axios';
import { config } from '../config/index.js';

// Server-side wrappers for Google Maps APIs (Directions + Distance Matrix).
// Keeps the server-only Maps key out of the browser bundle. Google Maps is
// the ONLY provider used, per the project brief.

export async function getDirections(origin, destination, waypoints = []) {
  const params = {
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    key: config.googleMapsServerKey,
  };
  if (waypoints.length) {
    params.waypoints = waypoints.map((w) => `${w.lat},${w.lng}`).join('|');
  }
  const { data } = await axios.get('https://maps.googleapis.com/maps/api/directions/json', { params });
  return data;
}

export async function getEta(origin, destination) {
  const params = {
    origins: `${origin.lat},${origin.lng}`,
    destinations: `${destination.lat},${destination.lng}`,
    key: config.googleMapsServerKey,
  };
  const { data } = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', { params });
  return data;
}

// Builds a route that detours around active, unresolved hazards
// (blueprint §6 "re-routing around a reported hazard").
export async function getDirectionsAvoidingHazards(origin, destination, activeHazards) {
  const waypoints = activeHazards
    .filter((h) => h.status === 'active')
    .map((h) => ({ lat: h.lat + 0.002, lng: h.lng + 0.002 })); // simple offset detour
  return getDirections(origin, destination, waypoints);
}
