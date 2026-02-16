import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildStyleCatalogUrl,
  clearStyleCatalogCache,
  DEFAULT_STYLE_CATALOG_TTL_MS,
  fetchStyleCatalog,
  getStyleCatalog,
  STYLE_CATALOG_CACHE_KEY,
} from './styleService';

describe('styleService', () => {
  const token = 'test-token';
  const networkStyles = [{ name: 'arcgis/navigation' }, { name: 'arcgis/streets' }];

  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('buildStyleCatalogUrl', () => {
    it('should include token query parameter', () => {
      const url = new URL(buildStyleCatalogUrl(token));
      expect(url.searchParams.get('token')).toBe(token);
    });

    it('should throw for missing token', () => {
      expect(() => buildStyleCatalogUrl('')).toThrow(/token/i);
    });
  });

  describe('fetchStyleCatalog', () => {
    it('should return styles array from valid response', async () => {
      const fetchImpl = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ styles: networkStyles }),
      });

      const styles = await fetchStyleCatalog({ token, fetchImpl });
      expect(styles).toEqual(networkStyles);
    });

    it('should throw when response is not ok', async () => {
      const fetchImpl = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      await expect(fetchStyleCatalog({ token, fetchImpl })).rejects.toThrow(/500/);
    });
  });

  describe('getStyleCatalog', () => {
    it('should return cached data when cache is valid', async () => {
      const cachedStyles = [{ name: 'arcgis/light-gray' }];
      const item = {
        value: cachedStyles,
        timestamp: Date.now(),
        ttl: DEFAULT_STYLE_CATALOG_TTL_MS,
      };
      globalThis.localStorage.setItem(STYLE_CATALOG_CACHE_KEY, JSON.stringify(item));

      const fetchImpl = vi.fn();
      const result = await getStyleCatalog({ token, fetchImpl });

      expect(result.styles).toEqual(cachedStyles);
      expect(result.source).toBe('cache');
      expect(result.isStale).toBe(false);
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('should fetch, cache, and return network data when cache is missing', async () => {
      const fetchImpl = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ styles: networkStyles }),
      });

      const result = await getStyleCatalog({ token, fetchImpl });

      expect(result.styles).toEqual(networkStyles);
      expect(result.source).toBe('network');
      expect(result.isStale).toBe(false);

      const cachedRaw = globalThis.localStorage.getItem(STYLE_CATALOG_CACHE_KEY);
      expect(cachedRaw).toBeTruthy();
      const cached = JSON.parse(cachedRaw);
      expect(cached.value).toEqual(networkStyles);
    });

    it('should return stale cache when fetch fails and stale cache exists', async () => {
      const staleStyles = [{ name: 'arcgis/dark-gray' }];
      const expiredItem = {
        value: staleStyles,
        timestamp: Date.now() - 2 * DEFAULT_STYLE_CATALOG_TTL_MS,
        ttl: DEFAULT_STYLE_CATALOG_TTL_MS,
      };
      globalThis.localStorage.setItem(STYLE_CATALOG_CACHE_KEY, JSON.stringify(expiredItem));

      const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getStyleCatalog({ token, fetchImpl });

      expect(result.styles).toEqual(staleStyles);
      expect(result.source).toBe('stale-cache');
      expect(result.isStale).toBe(true);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw when fetch fails and no cache exists', async () => {
      const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'));
      await expect(getStyleCatalog({ token, fetchImpl })).rejects.toThrow(/network down/);
    });

    it('should bypass cache when forceRefresh is true', async () => {
      const cachedStyles = [{ name: 'arcgis/light-gray' }];
      const item = {
        value: cachedStyles,
        timestamp: Date.now(),
        ttl: DEFAULT_STYLE_CATALOG_TTL_MS,
      };
      globalThis.localStorage.setItem(STYLE_CATALOG_CACHE_KEY, JSON.stringify(item));

      const fetchImpl = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ styles: networkStyles }),
      });

      const result = await getStyleCatalog({ token, fetchImpl, forceRefresh: true });
      expect(result.source).toBe('network');
      expect(result.styles).toEqual(networkStyles);
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearStyleCatalogCache', () => {
    it('should remove style cache key', () => {
      globalThis.localStorage.setItem(STYLE_CATALOG_CACHE_KEY, JSON.stringify({ value: [] }));
      clearStyleCatalogCache();
      expect(globalThis.localStorage.getItem(STYLE_CATALOG_CACHE_KEY)).toBeNull();
    });
  });
});
