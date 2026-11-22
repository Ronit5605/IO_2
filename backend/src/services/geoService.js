/**
 * Geolocation & Route Calculation Service
 * Uses Haversine formula to compute great-circle distance between two GPS coordinates
 * and estimates realistic Emergency Transit Time (ETA).
 */

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100; // 2 decimal places
};

/**
 * Computes Estimated Arrival Time (ETA) in minutes
 * @param {number} distanceKm
 * @param {number} currentSpeedKmH
 * @returns {number} ETA in minutes (minimum 1 minute)
 */
export const calculateETA = (distanceKm, currentSpeedKmH = 45) => {
  const effectiveSpeed = currentSpeedKmH > 15 ? currentSpeedKmH : 40; // Default emergency speed
  // Traffic buffer factor 1.25x for urban junctions
  const travelHours = (distanceKm * 1.25) / effectiveSpeed;
  const etaMinutes = Math.max(1, Math.round(travelHours * 60));
  return etaMinutes;
};

/**
 * Computes bearing angle (0 - 360 degrees) from point A to point B
 */
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};
