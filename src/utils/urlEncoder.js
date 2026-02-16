/**
 * Encode and decode application state for shareable URLs
 */

/**
 * Encode app configuration to URL-safe string
 * @param {Object} config - App configuration object
 * @param {string} config.style - Selected style name
 * @param {Object} config.parameters - Style parameters (language, worldview, places)
 * @param {Object} config.viewport - Map viewport (center, zoom)
 * @returns {string} Base64-encoded URL-safe string
 */
export function encodeConfig(config) {
  try {
    const json = JSON.stringify(config);
    // Use btoa for Base64 encoding, then make it URL-safe
    const base64 = btoa(json);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    throw new Error(`Failed to encode config: ${error.message}`);
  }
}

/**
 * Decode URL-safe string back to app configuration
 * @param {string} encodedString - Base64-encoded URL-safe string
 * @returns {Object} Decoded configuration object
 */
export function decodeConfig(encodedString) {
  try {
    // Convert URL-safe Base64 back to standard Base64
    let base64 = encodedString.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = atob(base64);
    return JSON.parse(json);
  } catch (error) {
    throw new Error(`Failed to decode config: ${error.message}`);
  }
}

/**
 * Generate a shareable URL with encoded configuration
 * @param {Object} config - App configuration
 * @param {string} [baseUrl] - Base URL (defaults to current location)
 * @returns {string} Complete shareable URL
 */
export function generateShareUrl(config, baseUrl = window.location.origin + window.location.pathname) {
  const encoded = encodeConfig(config);
  const url = new URL(baseUrl);
  url.searchParams.set('config', encoded);
  return url.toString();
}

/**
 * Parse shareable URL to extract configuration
 * @param {string} url - Shareable URL or just the query string
 * @returns {Object|null} Decoded configuration or null if not found
 */
export function parseShareUrl(url) {
  try {
    const urlObj = new URL(url);
    const encoded = urlObj.searchParams.get('config');

    if (!encoded) {
      return null;
    }

    return decodeConfig(encoded);
  } catch (error) {
    // If URL parsing fails, try parsing as query string
    try {
      const params = new URLSearchParams(url);
      const encoded = params.get('config');

      if (!encoded) {
        return null;
      }

      return decodeConfig(encoded);
    } catch {
      console.warn(`Failed to parse share URL: ${error.message}`);
      return null;
    }
  }
}

/**
 * Validate configuration object structure
 * @param {Object} config - Configuration to validate
 * @returns {boolean} True if valid
 */
export function isValidConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }

  // Check required fields
  if (!config.style || typeof config.style !== 'string') {
    return false;
  }

  if (!config.parameters || typeof config.parameters !== 'object') {
    return false;
  }

  if (!config.viewport || typeof config.viewport !== 'object') {
    return false;
  }

  // Check viewport structure
  if (!Array.isArray(config.viewport.center) || config.viewport.center.length !== 2) {
    return false;
  }

  if (typeof config.viewport.zoom !== 'number') {
    return false;
  }

  return true;
}
