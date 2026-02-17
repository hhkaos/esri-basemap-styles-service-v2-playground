import { describe, expect, it, vi } from 'vitest';
import {
  buildSelectiveShareConfig,
  buildShareConfig,
  copyTextToClipboard,
  generateAndCopySelectiveShareUrl,
  generateAndCopyShareUrl,
  parseSharedConfigFromUrl,
} from './shareService';

describe('shareService', () => {
  it('buildShareConfig should normalize shape and defaults', () => {
    const result = buildShareConfig({
      styleName: 'arcgis/navigation',
      parameters: { language: 'es' },
      viewport: { center: ['-3.7', '40.4'], zoom: '7' },
    });

    expect(result).toEqual({
      style: 'arcgis/navigation',
      parameters: { language: 'es', worldview: '', places: 'none' },
      viewport: { center: [-3.7, 40.4], zoom: 7 },
    });
  });

  it('parseSharedConfigFromUrl should return normalized config when valid', () => {
    const url =
      'https://example.com/playground?config=eyJzdHlsZSI6ImFyY2dpcy9uYXZpZ2F0aW9uIiwicGFyYW1ldGVycyI6eyJsYW5ndWFnZSI6ImVuIiwid29ybGR2aWV3IjoiIiwicGxhY2VzIjoibm9uZSJ9LCJ2aWV3cG9ydCI6eyJjZW50ZXIiOlswLDMwXSwiem9vbSI6Mn19';
    const parsed = parseSharedConfigFromUrl(url);

    expect(parsed).toEqual({
      style: 'arcgis/navigation',
      parameters: { language: 'en', worldview: '', places: 'none' },
      viewport: { center: [0, 30], zoom: 2 },
      ui: undefined,
      codeGenerator: null,
    });
  });

  it('parseSharedConfigFromUrl should parse selective payloads and code generator state', () => {
    const url =
      'https://example.com/playground?config=eyJwYXJhbWV0ZXJzIjp7Imxhbmd1YWdlIjoiZXMifSwidWkiOnsicGFuZWwiOiJjb2RlLWdlbmVyYXRvciJ9LCJjb2RlR2VuZXJhdG9yIjp7InNlbGVjdGVkTGlicmFyeSI6ImxlYWZsZXQiLCJmb3JjZURvd25sb2FkIjp0cnVlfX0';
    const parsed = parseSharedConfigFromUrl(url);

    expect(parsed).toEqual({
      style: '',
      parameters: { language: 'es', worldview: '', places: 'none' },
      viewport: undefined,
      ui: { panel: 'code-generator' },
      codeGenerator: {
        selectedLibrary: 'leaflet',
        hasLibrarySelection: true,
        forceDownload: true,
        currentStep: 3,
      },
    });
  });

  it('parseSharedConfigFromUrl should return null for invalid payload', () => {
    const parsed = parseSharedConfigFromUrl('https://example.com/playground?config=badpayload');
    expect(parsed).toBeNull();
  });

  it('copyTextToClipboard should use navigator.clipboard when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await expect(copyTextToClipboard('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: originalClipboard });
  });

  it('generateAndCopyShareUrl should throw when no style is selected', async () => {
    await expect(
      generateAndCopyShareUrl({
        styleName: '',
        parameters: { language: 'global', worldview: '', places: 'none' },
        viewport: { center: [0, 30], zoom: 2 },
        baseUrl: 'https://example.com/playground',
      })
    ).rejects.toThrow('Select a style before creating a share link.');
  });

  it('buildSelectiveShareConfig should include selected code generator state and derive step', () => {
    const config = buildSelectiveShareConfig({
      styleName: 'arcgis/navigation',
      parameters: { language: 'en', worldview: '', places: 'none' },
      viewport: { center: [1, 2], zoom: 3 },
      shareOptions: {
        includeStyle: true,
        includeLanguage: true,
        includeWorldview: false,
        includePlaces: false,
        includeDefaultPanel: true,
        defaultPanel: 'code-generator',
        codeGenerator: {
          includeExportOptions: true,
          includeLibrary: true,
          includeApiKey: false,
          forceDownload: true,
        },
      },
      codeGeneratorState: {
        selectedLibrary: 'leaflet',
        hasLibrarySelection: true,
        token: 'abc123',
        exportOptions: {
          style: true,
          language: true,
          worldview: true,
          places: true,
          location: false,
        },
      },
    });

    expect(config).toEqual({
      style: 'arcgis/navigation',
      parameters: { language: 'en' },
      ui: { panel: 'code-generator' },
      codeGenerator: {
        exportOptions: {
          style: true,
          language: true,
          worldview: true,
          places: true,
          location: false,
        },
        selectedLibrary: 'leaflet',
        hasLibrarySelection: true,
        forceDownload: true,
        currentStep: 3,
      },
      viewport: { center: [1, 2], zoom: 3 },
    });
  });

  it('generateAndCopySelectiveShareUrl should allow sharing without style', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await expect(
      generateAndCopySelectiveShareUrl({
        styleName: '',
        parameters: { language: 'global', worldview: '', places: 'none' },
        viewport: { center: [0, 30], zoom: 2 },
        baseUrl: 'https://example.com/playground',
        shareOptions: {
          includeStyle: false,
          includeLanguage: true,
          includeWorldview: false,
          includePlaces: false,
          includeDefaultPanel: false,
        },
        codeGeneratorState: null,
      })
    ).resolves.toContain('config=');

    expect(writeText).toHaveBeenCalledTimes(1);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: originalClipboard });
  });
});
