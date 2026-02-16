import { describe, it, expect } from 'vitest';
import {
  encodeConfig,
  decodeConfig,
  generateShareUrl,
  parseShareUrl,
  isValidConfig,
} from './urlEncoder';

describe('urlEncoder', () => {
  const mockConfig = {
    style: 'arcgis/navigation',
    parameters: {
      language: 'en',
      worldview: '',
      places: 'none',
    },
    viewport: {
      center: [0, 30],
      zoom: 2,
    },
  };

  describe('encodeConfig', () => {
    it('should encode configuration to URL-safe Base64 string', () => {
      const encoded = encodeConfig(mockConfig);

      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
      // Should be URL-safe (no +, /, or =)
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    it('should throw error for invalid input', () => {
      // Create a circular reference which can't be JSON stringified
      const circular = {};
      circular.self = circular;

      expect(() => encodeConfig(circular)).toThrow('Failed to encode config');
    });
  });

  describe('decodeConfig', () => {
    it('should decode Base64 string back to configuration', () => {
      const encoded = encodeConfig(mockConfig);
      const decoded = decodeConfig(encoded);

      expect(decoded).toEqual(mockConfig);
    });

    it('should handle Base64 strings with padding', () => {
      // Manually create a Base64 string with padding
      const json = JSON.stringify(mockConfig);
      const base64 = btoa(json); // This will have padding
      const decoded = decodeConfig(base64);

      expect(decoded).toEqual(mockConfig);
    });

    it('should throw error for invalid Base64', () => {
      expect(() => decodeConfig('invalid!!!')).toThrow('Failed to decode config');
    });
  });

  describe('encodeConfig and decodeConfig round-trip', () => {
    it('should successfully encode and decode configuration', () => {
      const encoded = encodeConfig(mockConfig);
      const decoded = decodeConfig(encoded);

      expect(decoded).toEqual(mockConfig);
    });

    it('should handle complex configurations', () => {
      const complexConfig = {
        style: 'arcgis/streets',
        parameters: {
          language: 'zh-CN',
          worldview: 'china',
          places: 'attributed',
        },
        viewport: {
          center: [116.4074, 39.9042], // Beijing
          zoom: 12,
        },
      };

      const encoded = encodeConfig(complexConfig);
      const decoded = decodeConfig(encoded);

      expect(decoded).toEqual(complexConfig);
    });
  });

  describe('generateShareUrl', () => {
    it('should generate shareable URL with default base', () => {
      const shareUrl = generateShareUrl(mockConfig);

      expect(shareUrl).toContain('config=');
      expect(shareUrl).toMatch(/^http/);
    });

    it('should generate shareable URL with custom base', () => {
      const customBase = 'https://example.com/playground';
      const shareUrl = generateShareUrl(mockConfig, customBase);

      expect(shareUrl).toContain('https://example.com/playground');
      expect(shareUrl).toContain('config=');
    });

    it('should preserve existing query parameters', () => {
      const baseWithParams = 'https://example.com/app?foo=bar';
      const shareUrl = generateShareUrl(mockConfig, baseWithParams);

      expect(shareUrl).toContain('foo=bar');
      expect(shareUrl).toContain('config=');
    });
  });

  describe('parseShareUrl', () => {
    it('should parse full shareable URL', () => {
      const shareUrl = generateShareUrl(mockConfig);
      const parsed = parseShareUrl(shareUrl);

      expect(parsed).toEqual(mockConfig);
    });

    it('should return null for URL without config param', () => {
      const url = 'https://example.com/playground';
      const parsed = parseShareUrl(url);

      expect(parsed).toBeNull();
    });

    it('should parse query string directly', () => {
      const encoded = encodeConfig(mockConfig);
      const queryString = `?config=${encoded}`;
      const parsed = parseShareUrl(queryString);

      expect(parsed).toEqual(mockConfig);
    });

    it('should handle malformed URLs gracefully', () => {
      const parsed = parseShareUrl('not-a-url');
      expect(parsed).toBeNull();
    });
  });

  describe('isValidConfig', () => {
    it('should return true for valid configuration', () => {
      expect(isValidConfig(mockConfig)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isValidConfig(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isValidConfig('string')).toBe(false);
      expect(isValidConfig(123)).toBe(false);
    });

    it('should return false for missing style', () => {
      const invalid = { ...mockConfig };
      delete invalid.style;

      expect(isValidConfig(invalid)).toBe(false);
    });

    it('should return false for missing parameters', () => {
      const invalid = { ...mockConfig };
      delete invalid.parameters;

      expect(isValidConfig(invalid)).toBe(false);
    });

    it('should return false for missing viewport', () => {
      const invalid = { ...mockConfig };
      delete invalid.viewport;

      expect(isValidConfig(invalid)).toBe(false);
    });

    it('should return false for invalid viewport center', () => {
      const invalid = {
        ...mockConfig,
        viewport: { center: [0], zoom: 2 }, // Only 1 element
      };

      expect(isValidConfig(invalid)).toBe(false);
    });

    it('should return false for invalid viewport zoom', () => {
      const invalid = {
        ...mockConfig,
        viewport: { center: [0, 30], zoom: 'not-a-number' },
      };

      expect(isValidConfig(invalid)).toBe(false);
    });
  });
});
