import { getWithTTL, setWithTTL, remove } from '../utils/storage';

export const CAPABILITIES_CACHE_KEY = 'basemap-capabilities:self';
export const DEFAULT_CAPABILITIES_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const CAPABILITIES_ENDPOINT =
  'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/self';

/**
 * Build the /v2/self endpoint URL for a token.
 * @param {string} token
 * @returns {string}
 */
export function buildCapabilitiesUrl(token) {
  if (!token || !token.trim()) {
    throw new Error('A valid API token is required to fetch service capabilities.');
  }

  const url = new URL(CAPABILITIES_ENDPOINT);
  url.searchParams.set('token', token.trim());
  return url.toString();
}

/**
 * Fetch service capabilities from network.
 * @param {Object} options
 * @param {string} options.token
 * @param {Function} [options.fetchImpl=fetch]
 * @returns {Promise<{languages: Array, worldviews: Array, places: Array}>}
 */
export async function fetchCapabilities({ token, fetchImpl = fetch }) {
  const response = await fetchImpl(buildCapabilitiesUrl(token));

  if (!response.ok) {
    throw new Error(`Capabilities request failed (${response.status} ${response.statusText})`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.languages)) {
    throw new Error('Capabilities response is invalid. Expected a "languages" array.');
  }

  return {
    languages: payload.languages,
    worldviews: Array.isArray(payload.worldviews) ? payload.worldviews : [],
    places: Array.isArray(payload.places) ? payload.places : [],
  };
}

/**
 * Returns stale cache data even if TTL is expired.
 * @returns {Object|null}
 */
function getStaleCapabilitiesFallback() {
  try {
    const raw = localStorage.getItem(CAPABILITIES_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed?.value && Array.isArray(parsed.value.languages) ? parsed.value : null;
  } catch {
    return null;
  }
}

/**
 * Load service capabilities with TTL cache and stale-cache fallback.
 * @param {Object} options
 * @param {string} options.token
 * @param {number} [options.ttl=24h]
 * @param {boolean} [options.forceRefresh=false]
 * @param {Function} [options.fetchImpl=fetch]
 * @returns {Promise<{languages: Array, worldviews: Array, places: Array, source: string, isStale: boolean}>}
 */
export async function getCapabilities({
  token,
  ttl = DEFAULT_CAPABILITIES_TTL_MS,
  forceRefresh = false,
  fetchImpl = fetch,
}) {
  const staleFallback = !forceRefresh ? getStaleCapabilitiesFallback() : null;

  if (!forceRefresh) {
    const cached = getWithTTL(CAPABILITIES_CACHE_KEY);
    if (cached && Array.isArray(cached.languages)) {
      return {
        ...cached,
        source: 'cache',
        isStale: false,
      };
    }
  }

  try {
    const capabilities = await fetchCapabilities({ token, fetchImpl });
    setWithTTL(CAPABILITIES_CACHE_KEY, capabilities, ttl);

    return {
      ...capabilities,
      source: 'network',
      isStale: false,
    };
  } catch (error) {
    if (!forceRefresh) {
      const stale = staleFallback || getStaleCapabilitiesFallback();
      if (stale) {
        console.warn(`Using stale capabilities cache after fetch failure: ${error.message}`);
        return {
          ...stale,
          source: 'stale-cache',
          isStale: true,
        };
      }
    }

    throw error;
  }
}

/**
 * Clear cached capabilities entry.
 */
export function clearCapabilitiesCache() {
  remove(CAPABILITIES_CACHE_KEY);
}
