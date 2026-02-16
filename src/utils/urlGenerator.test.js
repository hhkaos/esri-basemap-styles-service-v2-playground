import { describe, it, expect } from 'vitest';
import { buildStyleUrl, parseStyleUrl, getBaseUrl } from './urlGenerator';

describe('urlGenerator', () => {
  describe('buildStyleUrl', () => {
    it('should build URL with only style name', () => {
      const url = buildStyleUrl({ styleName: 'arcgis/navigation' });
      expect(url).toBe(
        'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/navigation'
      );
    });

    it('should include language parameter', () => {
      const url = buildStyleUrl({
        styleName: 'arcgis/navigation',
        language: 'en',
      });
      expect(url).toContain('language=en');
    });

    it('should not include language if set to "global"', () => {
      const url = buildStyleUrl({
        styleName: 'arcgis/navigation',
        language: 'global',
      });
      expect(url).not.toContain('language');
    });

    it('should include worldview parameter', () => {
      const url = buildStyleUrl({
        styleName: 'arcgis/navigation',
        worldview: 'india',
      });
      expect(url).toContain('worldview=india');
    });

    it('should include places parameter', () => {
      const url = buildStyleUrl({
        styleName: 'arcgis/navigation',
        places: 'all',
      });
      expect(url).toContain('places=all');
    });

    it('should not include places if set to "none"', () => {
      const url = buildStyleUrl({
        styleName: 'arcgis/navigation',
        places: 'none',
      });
      expect(url).not.toContain('places');
    });

    it('should include token parameter', () => {
      const url = buildStyleUrl({
        styleName: 'arcgis/navigation',
        token: 'test-api-key-123',
      });
      expect(url).toContain('token=test-api-key-123');
    });

    it('should include all parameters', () => {
      const url = buildStyleUrl({
        styleName: 'arcgis/streets',
        language: 'es',
        worldview: 'argentina',
        places: 'attributed',
        token: 'my-token',
      });

      expect(url).toContain('arcgis/streets');
      expect(url).toContain('language=es');
      expect(url).toContain('worldview=argentina');
      expect(url).toContain('places=attributed');
      expect(url).toContain('token=my-token');
    });

    it('should throw error if styleName is missing', () => {
      expect(() => buildStyleUrl({})).toThrow('styleName is required');
    });

    it('should handle style names with slashes', () => {
      const url = buildStyleUrl({ styleName: 'arcgis/light-gray/base' });
      expect(url).toContain('arcgis/light-gray/base');
    });
  });

  describe('parseStyleUrl', () => {
    it('should parse URL with only style name', () => {
      const url =
        'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/navigation';
      const parsed = parseStyleUrl(url);

      expect(parsed.styleName).toBe('arcgis/navigation');
      expect(parsed.language).toBe('global');
      expect(parsed.worldview).toBe('');
      expect(parsed.places).toBe('none');
    });

    it('should parse all parameters', () => {
      const url =
        'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/streets?language=fr&worldview=brazil&places=all&token=abc123';
      const parsed = parseStyleUrl(url);

      expect(parsed.styleName).toBe('arcgis/streets');
      expect(parsed.language).toBe('fr');
      expect(parsed.worldview).toBe('brazil');
      expect(parsed.places).toBe('all');
      expect(parsed.token).toBe('abc123');
    });

    it('should throw error for invalid URL', () => {
      expect(() => parseStyleUrl('not-a-url')).toThrow('Invalid style URL');
    });
  });

  describe('getBaseUrl', () => {
    it('should return base URL', () => {
      expect(getBaseUrl()).toBe(
        'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2'
      );
    });
  });
});
