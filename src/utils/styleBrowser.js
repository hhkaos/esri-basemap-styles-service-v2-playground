import { supportsLanguage, supportsPlaces, supportsWorldview } from './styleCapabilities';

export const STYLE_CATEGORY_ORDER = ['Streets', 'Topography', 'Satellite', 'Reference', 'Creative', 'Other'];

function normalizeStylePathValue(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const normalized = value.trim().replace(/^\/+|\/+$/g, '').replace(/^styles\//i, '');
  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('arcgis/') || normalized.startsWith('open/') || normalized.startsWith('osm/')) {
    return normalized;
  }

  return '';
}

function extractStylePathFromUrl(styleUrl = '') {
  if (!styleUrl || typeof styleUrl !== 'string') {
    return '';
  }

  const v2Match = styleUrl.match(/\/styles\/v2\/styles\/([^?{#]+)/i);
  if (v2Match?.[1]) {
    return v2Match[1].replace(/\/+$/g, '');
  }

  const familyMatch = styleUrl.match(/\/styles\/(arcgis|open)\/([^?{#]+)/i);
  if (familyMatch?.[1] && familyMatch?.[2]) {
    return `${familyMatch[1].toLowerCase()}/${familyMatch[2].replace(/\/+$/g, '')}`;
  }

  return '';
}

export function getStylePath(style = {}) {
  const direct = [
    normalizeStylePathValue(style?.path),
    normalizeStylePathValue(style?.id),
    normalizeStylePathValue(style?.name),
  ].find(Boolean);

  if (direct) {
    return direct;
  }

  const fromUrl = normalizeStylePathValue(extractStylePathFromUrl(style?.styleUrl || style?.url || ''));
  if (fromUrl) {
    return fromUrl;
  }

  const family = (style?.family || '').toString().trim().toLowerCase();
  const name = (style?.name || '').toString().trim().replace(/^\/+|\/+$/g, '');
  if ((family === 'arcgis' || family === 'open') && name && !name.includes(' ')) {
    return `${family}/${name}`;
  }

  return '';
}

function normalizeCategoryValue(category) {
  const value = (category || '').trim().toLowerCase();
  if (!value) {
    return null;
  }

  const exactMatch = STYLE_CATEGORY_ORDER.find((item) => item.toLowerCase() === value);
  if (exactMatch) {
    return exactMatch;
  }

  if (value.includes('street') || value.includes('navigation')) {
    return 'Streets';
  }

  if (
    value.includes('topo') ||
    value.includes('terrain') ||
    value.includes('outdoor') ||
    value.includes('ocean') ||
    value.includes('hillshade')
  ) {
    return 'Topography';
  }

  if (value.includes('satellite') || value.includes('imagery') || value.includes('hybrid')) {
    return 'Satellite';
  }

  if (value.includes('reference') || value.includes('gray') || value.includes('canvas')) {
    return 'Reference';
  }

  if (value.includes('creative') || value.includes('nova') || value.includes('antique') || value.includes('newspaper')) {
    return 'Creative';
  }

  return null;
}

function getPathCategory(styleName = '') {
  const value = styleName.trim().toLowerCase();
  if (!value) {
    return null;
  }

  if (value.includes('/streets') || value.includes('/navigation') || value.includes('/community')) {
    return 'Streets';
  }

  if (value.includes('/outdoor') || value.includes('/terrain') || value.includes('/oceans') || value.includes('/hillshade')) {
    return 'Topography';
  }

  if (value.includes('/imagery')) {
    return 'Satellite';
  }

  if (value.includes('/light-gray') || value.includes('/dark-gray') || value.includes('/reference')) {
    return 'Reference';
  }

  if (value.includes('/nova') || value.includes('/modern-antique') || value.includes('/newspaper')) {
    return 'Creative';
  }

  return null;
}

export function getStyleCategory(style) {
  const categoryCandidates = [
    style?.category,
    style?.group,
    style?.theme,
    style?.classification,
    ...(Array.isArray(style?.categories) ? style.categories : []),
  ];

  for (const candidate of categoryCandidates) {
    const resolved = normalizeCategoryValue(candidate);
    if (resolved) {
      return resolved;
    }
  }

  const styleName = style?.path || style?.id || style?.name || '';
  return getPathCategory(styleName) || 'Other';
}

export function getStyleFamily(styleName = '', styleUrl = '') {
  const normalizedStyleName = (styleName || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/^styles\//i, '')
    .toLowerCase();

  if (normalizedStyleName.startsWith('arcgis/')) {
    return 'arcgis';
  }

  if (normalizedStyleName.startsWith('open/')) {
    return 'open';
  }

  if (normalizedStyleName.startsWith('osm/')) {
    return 'osm';
  }

  const styleUrlMatch = styleUrl.match(/\/styles\/(?:v2\/styles\/)?(arcgis|open|osm)\//i);
  if (styleUrlMatch?.[1]) {
    return styleUrlMatch[1].toLowerCase();
  }

  return 'unknown';
}

export function isBaseLayerStyle(styleName = '') {
  return styleName.includes('/base');
}

export function isLabelLayerStyle(styleName = '') {
  return styleName.includes('/labels');
}

function getSortRank(styleName = '') {
  if (isLabelLayerStyle(styleName)) {
    return 2;
  }

  if (isBaseLayerStyle(styleName)) {
    return 1;
  }

  return 0;
}

export function getStyleBadges(style) {
  const styleName = getStylePath(style);

  return {
    language: supportsLanguage(style),
    worldview: supportsWorldview(style),
    places: supportsPlaces(style),
    baseLayer: isBaseLayerStyle(styleName),
    labelLayer: isLabelLayerStyle(styleName),
  };
}

export function groupStylesByCategory(styles) {
  const grouped = new Map();

  styles.forEach((style) => {
    const category = getStyleCategory(style);
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category).push(style);
  });

  return STYLE_CATEGORY_ORDER.map((category) => {
    const group = grouped.get(category) || [];
    if (group.length === 0) {
      return null;
    }

    const sorted = [...group].sort((left, right) => {
      const leftName = getStylePath(left);
      const rightName = getStylePath(right);
      const rankDiff = getSortRank(leftName) - getSortRank(rightName);
      if (rankDiff !== 0) {
        return rankDiff;
      }

      return leftName.localeCompare(rightName);
    });

    return { category, styles: sorted };
  }).filter(Boolean);
}
