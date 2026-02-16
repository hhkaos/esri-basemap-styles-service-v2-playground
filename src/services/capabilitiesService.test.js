import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildCapabilitiesUrl,
  CAPABILITIES_CACHE_KEY,
  clearCapabilitiesCache,
  DEFAULT_CAPABILITIES_TTL_MS,
  fetchCapabilities,
  getCapabilities,
} from './capabilitiesService';

describe('capabilitiesService', () => {
  const token = 'test-token';
  const networkCapabilities = {
    languages: [
      { code: 'global', name: 'Global' },
      { code: 'en', name: 'English' },
    ],
    worldviews: [
      { code: 'china', name: 'China' },
      { code: 'india', name: 'India' },
    ],
    places: [
      { code: 'all', name: 'All' },
      { code: 'none', name: 'None' },
    ],
  };

  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('buildCapabilitiesUrl', () => {
    it('should include token query parameter', () => {
      const url = new URL(buildCapabilitiesUrl(token));
      expect(url.searchParams.get('token')).toBe(token);
    });

    it('should throw for missing token', () => {
      expect(() => buildCapabilitiesUrl('')).toThrow(/token/i);
    });
  });

  describe('fetchCapabilities', () => {
    it('should return capabilities from valid response', async () => {
      const fetchImpl = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => networkCapabilities,
      });

      const result = await fetchCapabilities({ token, fetchImpl });
      expect(result.languages).toEqual(networkCapabilities.languages);
      expect(result.worldviews).toEqual(networkCapabilities.worldviews);
      expect(result.places).toEqual(networkCapabilities.places);
    });

    it('should throw when response is not ok', async () => {
      const fetchImpl = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      await expect(fetchCapabilities({ token, fetchImpl })).rejects.toThrow(/500/);
    });

    it('should default worldviews and places to empty arrays if missing', async () => {
      const fetchImpl = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ languages: [{ code: 'en', name: 'English' }] }),
      });

      const result = await fetchCapabilities({ token, fetchImpl });
      expect(result.worldviews).toEqual([]);
      expect(result.places).toEqual([]);
    });
  });

  describe('getCapabilities', () => {
    it('should return cached data when cache is valid', async () => {
      const item = {
        value: networkCapabilities,
        timestamp: Date.now(),
        ttl: DEFAULT_CAPABILITIES_TTL_MS,
      };
      globalThis.localStorage.setItem(CAPABILITIES_CACHE_KEY, JSON.stringify(item));

      const fetchImpl = vi.fn();
      const result = await getCapabilities({ token, fetchImpl });

      expect(result.languages).toEqual(networkCapabilities.languages);
      expect(result.worldviews).toEqual(networkCapabilities.worldviews);
      expect(result.source).toBe('cache');
      expect(result.isStale).toBe(false);
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('should fetch, cache, and return network data when cache is missing', async () => {
      const fetchImpl = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => networkCapabilities,
      });

      const result = await getCapabilities({ token, fetchImpl });

      expect(result.languages).toEqual(networkCapabilities.languages);
      expect(result.source).toBe('network');
      expect(result.isStale).toBe(false);

      const cachedRaw = globalThis.localStorage.getItem(CAPABILITIES_CACHE_KEY);
      expect(cachedRaw).toBeTruthy();
      const cached = JSON.parse(cachedRaw);
      expect(cached.value.languages).toEqual(networkCapabilities.languages);
    });

    it('should return stale cache when fetch fails and stale cache exists', async () => {
      const expiredItem = {
        value: networkCapabilities,
        timestamp: Date.now() - 2 * DEFAULT_CAPABILITIES_TTL_MS,
        ttl: DEFAULT_CAPABILITIES_TTL_MS,
      };
      globalThis.localStorage.setItem(CAPABILITIES_CACHE_KEY, JSON.stringify(expiredItem));

      const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getCapabilities({ token, fetchImpl });

      expect(result.languages).toEqual(networkCapabilities.languages);
      expect(result.source).toBe('stale-cache');
      expect(result.isStale).toBe(true);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw when fetch fails and no cache exists', async () => {
      const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'));
      await expect(getCapabilities({ token, fetchImpl })).rejects.toThrow(/network down/);
    });

    it('should bypass cache when forceRefresh is true', async () => {
      const item = {
        value: networkCapabilities,
        timestamp: Date.now(),
        ttl: DEFAULT_CAPABILITIES_TTL_MS,
      };
      globalThis.localStorage.setItem(CAPABILITIES_CACHE_KEY, JSON.stringify(item));

      const freshCapabilities = {
        ...networkCapabilities,
        languages: [{ code: 'fr', name: 'French' }],
      };
      const fetchImpl = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => freshCapabilities,
      });

      const result = await getCapabilities({ token, fetchImpl, forceRefresh: true });
      expect(result.source).toBe('network');
      expect(result.languages).toEqual(freshCapabilities.languages);
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearCapabilitiesCache', () => {
    it('should remove capabilities cache key', () => {
      globalThis.localStorage.setItem(CAPABILITIES_CACHE_KEY, JSON.stringify({ value: {} }));
      clearCapabilitiesCache();
      expect(globalThis.localStorage.getItem(CAPABILITIES_CACHE_KEY)).toBeNull();
    });
  });
});
