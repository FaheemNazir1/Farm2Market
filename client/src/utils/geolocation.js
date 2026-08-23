/**
 * Farm2Market Geolocation & Mapping Utilities
 * Uses browser HTML5 Geolocation API and OpenStreetMap Nominatim
 */

const geocodeCache = new Map();

/**
 * Get user's current GPS position with high accuracy and fallback timeout
 * @param {Object} options
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number }>}
 */
export const getCurrentGPSLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser'));
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute cache
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let message = 'Unable to retrieve location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission was denied. Please allow location in browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
          default:
            message = error.message || message;
        }
        const customError = new Error(message);
        customError.code = error.code;
        reject(customError);
      },
      defaultOptions
    );
  });
};

/**
 * Calculate Great-Circle distance between two coordinates using Haversine formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers (rounded to 1 decimal)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

/**
 * Reverse geocode GPS coordinates to district, state, and pincode via OpenStreetMap Nominatim
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<{ district: string, state: string, pincode: string, formatted: string }>}
 */
export const reverseGeocode = async (latitude, longitude) => {
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'Farm2Market-App/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();
    const address = data.address || {};

    const result = {
      district: address.state_district || address.county || address.city || address.town || 'Pune',
      state: address.state || 'Maharashtra',
      pincode: address.postcode || '411001',
      formatted: data.display_name || `${address.city || address.town || ''}, ${address.state || ''}`
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Reverse geocoding fallback:', error.message);
    // Fallback default Indian location
    return {
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      formatted: 'Pune, Maharashtra'
    };
  }
};
