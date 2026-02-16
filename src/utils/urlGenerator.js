/**
 * Build style URLs for the ArcGIS Basemap Styles Service v2
 * https://developers.arcgis.com/rest/basemap-styles/
 */

const BASE_URL = 'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2';

/**
 * Build a complete style URL with all parameters
 * @param {Object} options - URL parameters
 * @param {string} options.styleName - Style name (e.g., "arcgis/navigation")
 * @param {string} [options.language] - Language code (e.g., "en", "global", "local")
 * @param {string} [options.worldview] - Worldview code (e.g., "india", "pakistan")
 * @param {string} [options.places] - Places parameter ("none", "all", "attributed")
 * @param {string} [options.token] - API key or session token
 * @returns {string} Complete style URL
 */
export function buildStyleUrl({ styleName, language, worldview, places, token }) {
  if (!styleName) {
    throw new Error('styleName is required');
  }

  const url = new URL(`${BASE_URL}/styles/${styleName}`);

  // Add optional query parameters
  if (language && language !== 'global') {
    url.searchParams.append('language', language);
  }

  if (worldview) {
    url.searchParams.append('worldview', worldview);
  }

  if (places && places !== 'none') {
    url.searchParams.append('places', places);
  }

  if (token) {
    url.searchParams.append('token', token);
  }

  return url.toString();
}

/**
 * Parse a style URL to extract parameters
 * @param {string} styleUrl - Complete style URL
 * @returns {Object} Parsed parameters
 */
export function parseStyleUrl(styleUrl) {
  try {
    const url = new URL(styleUrl);
    const pathParts = url.pathname.split('/');
    const styleName = pathParts.slice(-2).join('/'); // Get last two parts (e.g., "arcgis/navigation")

    return {
      styleName,
      language: url.searchParams.get('language') || 'global',
      worldview: url.searchParams.get('worldview') || '',
      places: url.searchParams.get('places') || 'none',
      token: url.searchParams.get('token') || '',
    };
  } catch (error) {
    throw new Error(`Invalid style URL: ${error.message}`);
  }
}

/**
 * Get the base API URL
 * @returns {string} Base URL
 */
export function getBaseUrl() {
  return BASE_URL;
}
