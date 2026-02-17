import { getStyleCategory, getStylePath } from './styleBrowser';

const DEFAULT_FALLBACK_DESCRIPTION =
  'Use this style in apps where you want clear geographic context and readable labels for your audience.';
const DEFAULT_DOCUMENTATION_URL =
  'https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/arcgis-styles/';

const STYLE_GUIDANCE_PROFILES = [
  {
    match: /navigation/,
    description:
      'Built for turn-by-turn and trip-planning experiences. It increases visual contrast for major roads, ramps, and interchanges, and prioritizes labels and shields that help users make fast driving decisions.',
  },
  {
    match: /outdoor/,
    description:
      'Designed for recreation and field use. It highlights trail networks, parks, green space, water bodies, and terrain context so users can understand where they can travel on foot or bike.',
  },
  {
    match: /imagery|satellite/,
    description:
      'Best when real-world surface detail matters. It uses aerial or satellite imagery so developers can show construction progress, land cover, and site context that vector-only maps cannot communicate as clearly.',
  },
  {
    match: /hybrid/,
    description:
      'Combines imagery with reference labels. It keeps the realism of aerial data while preserving place names and key features so users can orient quickly without losing visual detail.',
  },
  {
    match: /topographic|topo/,
    description:
      'Optimized for terrain interpretation. It emphasizes elevation patterns, landforms, hydrography, and natural features, making it useful for planning in environments where slope and relief matter.',
  },
  {
    match: /terrain|hillshade|relief/,
    description:
      'Highlights terrain shape and elevation cues. Cartography focuses on slope, ridges, and valleys so users can read the landscape at a glance for outdoor routing and hazard awareness.',
  },
  {
    match: /oceans|ocean/,
    description:
      'Tailored for marine and coastal workflows. It increases visibility for shoreline context, water depth patterns, and ocean-focused geography to support nautical and coastal analysis use cases.',
  },
  {
    match: /street|community/,
    description:
      'A general-purpose street map for consumer and enterprise apps. It balances road hierarchy, points of interest, and labels so users can navigate cities and neighborhoods confidently.',
  },
  {
    match: /light-gray|dark-gray|canvas|reference/,
    description:
      'A neutral reference style for thematic overlays. It intentionally reduces basemap visual weight so your operational layers, heatmaps, and analytics stand out clearly.',
  },
  {
    match: /human-geography/,
    description:
      'Emphasizes places and boundaries people identify with. It is useful for demographic and policy storytelling where administrative context and settlement structure are central to interpretation.',
  },
  {
    match: /nova|modern-antique|newspaper|creative/,
    description:
      'Created for storytelling and presentation. The visual style is intentionally distinctive to support brand expression and narrative experiences where mood is part of the product.',
  },
];

const CATEGORY_GUIDANCE_FALLBACKS = {
  Streets:
    'This is a street-oriented style with clear road hierarchy and place labeling, making it a strong default for search, routing, delivery, and everyday navigation scenarios.',
  Topography:
    'This style prioritizes terrain and natural context such as elevation, trails, vegetation, and hydrography, which is useful for outdoor planning and landform-aware decision making.',
  Satellite:
    'This style emphasizes real-world imagery detail and is useful when users must validate ground conditions, construction progress, or environmental context visually.',
  Reference:
    'This style de-emphasizes basemap color and complexity so thematic overlays remain the primary focus, making it ideal for dashboards and analytical web maps.',
  Creative:
    'This style uses a more expressive cartographic look to support storytelling, branded experiences, and presentation-oriented applications.',
  Other:
    'This style offers general geographic context and can be paired with your app-specific overlays while you validate readability for your users.',
};

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeSampleApps(sampleApps = []) {
  if (!Array.isArray(sampleApps)) {
    return [];
  }

  return sampleApps
    .map((item) => ({
      label: normalizeText(item?.label),
      url: normalizeText(item?.url),
    }))
    .filter((item) => item.label && item.url);
}

function mergeSampleApps(styleSampleApps, categorySampleApps) {
  const merged = [...normalizeSampleApps(styleSampleApps), ...normalizeSampleApps(categorySampleApps)];
  const seen = new Set();

  return merged.filter((item) => {
    if (seen.has(item.url)) {
      return false;
    }

    seen.add(item.url);
    return true;
  });
}

function getStyleVariantHint(styleId = '') {
  if (styleId.endsWith('/labels')) {
    return 'This variant is labels-only, so it is best used as an annotation/reference overlay on top of another basemap.';
  }

  if (styleId.endsWith('/base')) {
    return 'This variant is base-map focused with minimal or no labels, making it suitable when your app supplies custom labeling.';
  }

  return '';
}

function buildGeneratedStyleDescription(styleId = '', category = 'Other') {
  if (!styleId) {
    return '';
  }

  const normalizedStyleId = styleId.toLowerCase();
  const profile = STYLE_GUIDANCE_PROFILES.find((entry) => entry.match.test(normalizedStyleId));
  const categoryFallback = CATEGORY_GUIDANCE_FALLBACKS[category] || CATEGORY_GUIDANCE_FALLBACKS.Other;
  const variantHint = getStyleVariantHint(normalizedStyleId);
  const primary = profile?.description || categoryFallback;

  return [primary, variantHint].filter(Boolean).join(' ');
}

function buildDocumentationUrl(styleId = '') {
  if (!styleId) {
    return DEFAULT_DOCUMENTATION_URL;
  }

  if (styleId.startsWith('arcgis/') || styleId.startsWith('open/') || styleId.startsWith('osm/')) {
    return 'https://developers.arcgis.com/rest/basemap-styles/';
  }

  return DEFAULT_DOCUMENTATION_URL;
}

export function resolveStyleInfoContent(style, config = {}) {
  const styleId = getStylePath(style);
  const category = getStyleCategory(style);

  const styleEntry = (config?.styles && styleId && config.styles[styleId]) || null;
  const categoryEntry = (config?.categories && category && config.categories[category]) || null;

  const styleDescription = normalizeText(styleEntry?.description);
  const categoryDescription = normalizeText(categoryEntry?.description);
  const generatedStyleDescription = buildGeneratedStyleDescription(styleId, category);
  const documentationUrl = normalizeText(styleEntry?.documentationUrl) || buildDocumentationUrl(styleId);
  const resolvedStyleDescription = styleDescription || generatedStyleDescription;

  const sampleApps = mergeSampleApps(styleEntry?.sampleApps, categoryEntry?.sampleApps);
  const fallbackDescription = normalizeText(config?.defaultDescription) || DEFAULT_FALLBACK_DESCRIPTION;
  const shouldShowFallback = !resolvedStyleDescription && !categoryDescription;

  return {
    styleId,
    category,
    styleDescription: resolvedStyleDescription,
    categoryDescription,
    documentationUrl,
    sampleApps,
    fallbackDescription,
    shouldShowFallback,
  };
}
