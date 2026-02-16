import { getWithTTL, setWithTTL, remove } from '../utils/storage';

export const STYLE_CATALOG_CACHE_KEY = 'basemap-styles:self';
export const DEFAULT_STYLE_CATALOG_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const STYLE_CATALOG_ENDPOINT =
  'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/self';

/**
 * Build the /self endpoint URL for a token.
 * @param {string} token
 * @returns {string}
 */
export function buildStyleCatalogUrl(token) {
  if (!token || !token.trim()) {
    throw new Error('A valid API token is required to fetch style catalog data.');
  }

  const url = new URL(STYLE_CATALOG_ENDPOINT);
  url.searchParams.set('token', token.trim());
  return url.toString();
}

/**
 * Fetch style catalog from network.
 * @param {Object} options
 * @param {string} options.token
 * @param {Function} [options.fetchImpl=fetch]
 * @returns {Promise<Array>}
 */
export async function fetchStyleCatalog({ token, fetchImpl = fetch }) {
  const response = await fetchImpl(buildStyleCatalogUrl(token));

  if (!response.ok) {
    throw new Error(`Style catalog request failed (${response.status} ${response.statusText})`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.styles)) {
    throw new Error('Style catalog response is invalid. Expected a "styles" array.');
  }

  return payload.styles;
}

/**
 * Returns stale cache data even if TTL is expired.
 * Used as a fallback when network requests fail.
 * @returns {Array|null}
 */
function getStaleCatalogFallback() {
  try {
    const raw = localStorage.getItem(STYLE_CATALOG_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.value) ? parsed.value : null;
  } catch {
    return null;
  }
}

/**
 * Load style catalog with TTL cache and stale-cache fallback.
 * @param {Object} options
 * @param {string} options.token
 * @param {number} [options.ttl=24h]
 * @param {boolean} [options.forceRefresh=false]
 * @param {Function} [options.fetchImpl=fetch]
 * @returns {Promise<{styles: Array, source: 'cache' | 'network' | 'stale-cache', isStale: boolean}>}
 */
export async function getStyleCatalog({
  token,
  ttl = DEFAULT_STYLE_CATALOG_TTL_MS,
  forceRefresh = false,
  fetchImpl = fetch,
}) {
  const staleFallback = !forceRefresh ? getStaleCatalogFallback() : null;

  if (!forceRefresh) {
    const cached = getWithTTL(STYLE_CATALOG_CACHE_KEY);
    if (Array.isArray(cached)) {
      return {
        styles: cached,
        source: 'cache',
        isStale: false,
      };
    }
  }

  try {
    const styles = await fetchStyleCatalog({ token, fetchImpl });
    setWithTTL(STYLE_CATALOG_CACHE_KEY, styles, ttl);

    return {
      styles,
      source: 'network',
      isStale: false,
    };
  } catch (error) {
    if (!forceRefresh) {
      const stale = Array.isArray(staleFallback) ? staleFallback : getStaleCatalogFallback();
      if (Array.isArray(stale)) {
        console.warn(`Using stale style catalog cache after fetch failure: ${error.message}`);
        return {
          styles: stale,
          source: 'stale-cache',
          isStale: true,
        };
      }
    }

    throw error;
  }
}

/**
 * Clear cached style catalog entry.
 */
export function clearStyleCatalogCache() {
  remove(STYLE_CATALOG_CACHE_KEY);
}
