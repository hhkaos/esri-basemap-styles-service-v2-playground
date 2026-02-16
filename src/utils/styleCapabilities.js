export const DEFAULT_STYLE_PARAMETERS = {
  language: 'global',
  worldview: '',
  places: 'none',
};

export function getSupportedLanguageCodes(style) {
  if (!Array.isArray(style?.supportedLanguageCodes)) {
    return [];
  }

  return style.supportedLanguageCodes.filter(Boolean);
}

export function supportsLanguage(style) {
  const languages = getSupportedLanguageCodes(style);
  if (languages.length > 0) {
    return true;
  }
  return Boolean(style?.styleUrl?.includes('{?language}'));
}

export function supportsWorldview(style) {
  return Boolean(style?.styleUrl?.includes('{?worldview}'));
}

export function supportsPlaces(style) {
  return Boolean(style?.styleUrl?.includes('{?places}'));
}

export function sanitizeStyleParameters(style, parameters = DEFAULT_STYLE_PARAMETERS) {
  const next = { ...DEFAULT_STYLE_PARAMETERS, ...parameters };

  if (!supportsLanguage(style)) {
    next.language = DEFAULT_STYLE_PARAMETERS.language;
  } else {
    const availableLanguages = getSupportedLanguageCodes(style);
    if (availableLanguages.length > 0 && !availableLanguages.includes(next.language)) {
      next.language = availableLanguages.includes('global') ? 'global' : availableLanguages[0];
    }
  }

  if (!supportsWorldview(style)) {
    next.worldview = DEFAULT_STYLE_PARAMETERS.worldview;
  }

  if (!supportsPlaces(style)) {
    next.places = DEFAULT_STYLE_PARAMETERS.places;
  }

  return next;
}
