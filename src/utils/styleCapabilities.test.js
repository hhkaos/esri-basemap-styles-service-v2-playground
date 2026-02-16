import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STYLE_PARAMETERS,
  getSupportedLanguageCodes,
  sanitizeStyleParameters,
  supportsLanguage,
  supportsPlaces,
  supportsWorldview,
} from './styleCapabilities';

describe('styleCapabilities', () => {
  const fullStyle = {
    supportedLanguageCodes: ['global', 'en', 'es'],
    styleUrl: 'https://example.com/styles/arcgis/navigation{?language}{?worldview}{?places}',
  };

  it('should detect language capability', () => {
    expect(supportsLanguage(fullStyle)).toBe(true);
    expect(supportsLanguage({ styleUrl: 'https://example.com/style{?language}' })).toBe(true);
    expect(supportsLanguage({ styleUrl: 'https://example.com/style' })).toBe(false);
  });

  it('should detect worldview and places capabilities', () => {
    expect(supportsWorldview(fullStyle)).toBe(true);
    expect(supportsPlaces(fullStyle)).toBe(true);
    expect(supportsWorldview({ styleUrl: 'https://example.com/style' })).toBe(false);
    expect(supportsPlaces({ styleUrl: 'https://example.com/style' })).toBe(false);
  });

  it('should return supported language codes', () => {
    expect(getSupportedLanguageCodes(fullStyle)).toEqual(['global', 'en', 'es']);
    expect(getSupportedLanguageCodes({})).toEqual([]);
  });

  it('should sanitize unsupported parameters', () => {
    const style = { styleUrl: 'https://example.com/style{?language}' };
    const sanitized = sanitizeStyleParameters(style, {
      language: 'es',
      worldview: 'india',
      places: 'all',
    });

    expect(sanitized.language).toBe('es');
    expect(sanitized.worldview).toBe(DEFAULT_STYLE_PARAMETERS.worldview);
    expect(sanitized.places).toBe(DEFAULT_STYLE_PARAMETERS.places);
  });

  it('should coerce invalid language to available list', () => {
    const sanitized = sanitizeStyleParameters(fullStyle, { language: 'fr' });
    expect(sanitized.language).toBe('global');
  });
});
