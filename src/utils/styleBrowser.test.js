import { describe, expect, it } from 'vitest';
import {
  getStylePath,
  getStyleCategory,
  getStyleBadges,
  getStyleFamily,
  groupStylesByCategory,
  isBaseLayerStyle,
  isLabelLayerStyle,
} from './styleBrowser';

describe('styleBrowser utilities', () => {
  it('detects style family from style path', () => {
    expect(getStyleFamily('arcgis/navigation')).toBe('arcgis');
    expect(getStyleFamily('open/streets')).toBe('open');
    expect(getStyleFamily('osm/streets-relief')).toBe('osm');
    expect(getStyleFamily('styles/osm/streets-relief')).toBe('osm');
    expect(getStyleFamily('', 'https://example.com/styles/open/streets')).toBe('open');
    expect(
      getStyleFamily(
        '',
        'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/osm/navigation{?language}'
      )
    ).toBe('osm');
    expect(getStyleFamily('custom/example')).toBe('unknown');
  });

  it('resolves style path from styleUrl when path is not provided', () => {
    expect(
      getStylePath({
        styleUrl: 'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/navigation?token=x',
      })
    ).toBe('arcgis/navigation');
    expect(
      getStylePath({
        styleUrl:
          'https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/open/streets{?language}{?token}',
      })
    ).toBe('open/streets');
    expect(
      getStylePath({
        path: 'styles/osm/streets-relief',
      })
    ).toBe('osm/streets-relief');
  });

  it('detects base and label layer style names', () => {
    expect(isBaseLayerStyle('arcgis/light-gray/base')).toBe(true);
    expect(isBaseLayerStyle('arcgis/light-gray')).toBe(false);

    expect(isLabelLayerStyle('arcgis/light-gray/labels')).toBe(true);
    expect(isLabelLayerStyle('arcgis/light-gray')).toBe(false);
  });

  it('returns capability and layer badges for style metadata', () => {
    const style = {
      path: 'arcgis/light-gray/labels',
      styleUrl: 'https://example.com/styles/arcgis/light-gray/labels{?language}{?worldview}{?places}',
    };

    expect(getStyleBadges(style)).toEqual({
      language: true,
      worldview: true,
      places: true,
      baseLayer: false,
      labelLayer: true,
    });
  });

  it('groups styles and sorts base and labels to the end', () => {
    const grouped = groupStylesByCategory([
      { path: 'arcgis/light-gray/base', category: 'Reference' },
      { path: 'arcgis/light-gray', category: 'Reference' },
      { path: 'arcgis/light-gray/labels', category: 'Reference' },
      { path: 'arcgis/navigation', category: 'Streets' },
    ]);

    expect(grouped[0].category).toBe('Streets');
    expect(grouped[0].styles[0].path).toBe('arcgis/navigation');

    expect(grouped[1].category).toBe('Reference');
    expect(grouped[1].styles.map((item) => item.path)).toEqual([
      'arcgis/light-gray',
      'arcgis/light-gray/base',
      'arcgis/light-gray/labels',
    ]);
  });

  it('resolves category from non-exact metadata labels and fallback fields', () => {
    expect(getStyleCategory({ path: 'arcgis/navigation', category: 'street' })).toBe('Streets');
    expect(getStyleCategory({ path: 'arcgis/outdoor', group: 'terrain' })).toBe('Topography');
    expect(getStyleCategory({ path: 'arcgis/imagery', categories: ['imagery basemap'] })).toBe('Satellite');
    expect(getStyleCategory({ path: 'arcgis/light-gray/base', theme: 'gray canvas' })).toBe('Reference');
  });
});
