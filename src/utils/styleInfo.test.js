import { describe, expect, it } from 'vitest';
import { resolveStyleInfoContent } from './styleInfo';

const configFixture = {
  defaultDescription: 'Default fallback',
  styles: {
    'arcgis/navigation': {
      description: 'Style-level guidance',
      documentationUrl: 'https://example.com/docs/navigation',
      sampleApps: [{ label: 'Style sample', url: 'https://example.com/apps/style' }],
    },
  },
  categories: {
    Streets: {
      description: 'Category-level guidance',
      sampleApps: [
        { label: 'Category sample', url: 'https://example.com/apps/category' },
        { label: 'Style sample duplicate', url: 'https://example.com/apps/style' },
      ],
    },
  },
};

describe('resolveStyleInfoContent', () => {
  it('returns style and category descriptions with docs and deduped sample links', () => {
    const content = resolveStyleInfoContent({ path: 'arcgis/navigation', category: 'Streets' }, configFixture);

    expect(content.styleDescription).toBe('Style-level guidance');
    expect(content.categoryDescription).toBe('Category-level guidance');
    expect(content.documentationUrl).toBe('https://example.com/docs/navigation');
    expect(content.sampleApps).toEqual([
      { label: 'Style sample', url: 'https://example.com/apps/style' },
      { label: 'Category sample', url: 'https://example.com/apps/category' },
    ]);
    expect(content.shouldShowFallback).toBe(false);
  });

  it('falls back to category description when style description is missing', () => {
    const content = resolveStyleInfoContent({ path: 'arcgis/streets', category: 'Streets' }, configFixture);

    expect(content.styleDescription.length).toBeGreaterThan(0);
    expect(content.categoryDescription).toBe('Category-level guidance');
    expect(content.shouldShowFallback).toBe(false);
  });

  it('shows default fallback when neither style nor category descriptions exist', () => {
    const content = resolveStyleInfoContent({ path: 'open/custom', category: 'Other' }, configFixture);

    expect(content.styleDescription.length).toBeGreaterThan(0);
    expect(content.categoryDescription).toBe('');
    expect(content.shouldShowFallback).toBe(false);
    expect(content.fallbackDescription).toBe('Default fallback');
  });

  it('provides a documentation URL fallback when style-level docs are missing', () => {
    const content = resolveStyleInfoContent({ path: 'arcgis/outdoor', category: 'Topography' }, configFixture);

    expect(content.documentationUrl).toBe('https://developers.arcgis.com/rest/basemap-styles/');
  });
});
