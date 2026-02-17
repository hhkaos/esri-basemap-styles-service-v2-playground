export const languageFlagPreferences = {
  ar: ['ae', 'sa'],
  bg: ['bg'],
  bs: ['ba'],
  ca: ['es-ct'],
  cs: ['cz'],
  da: ['dk'],
  de: ['de', 'at'],
  el: ['gr'],
  en: ['gb', 'us'],
  et: ['ee'],
  es: ['es', 'mx'],
  fi: ['fi'],
  fr: ['fr', 'ca'],
  he: ['il'],
  hi: ['in'],
  hr: ['hr'],
  hu: ['hu'],
  id: ['id'],
  it: ['it'],
  ja: ['jp'],
  ko: ['kr'],
  lt: ['lt'],
  lv: ['lv'],
  nb: ['no'],
  nl: ['nl', 'be'],
  no: ['no'],
  pl: ['pl'],
  pt: ['pt', 'br'],
  ro: ['ro'],
  ru: ['ru'],
  sk: ['sk'],
  sl: ['si'],
  sr: ['rs'],
  sv: ['se'],
  th: ['th'],
  tr: ['tr'],
  uk: ['ua'],
  vi: ['vn'],
  zh: ['cn', 'tw'],
  'zh-cn': ['cn'],
  'zh-tw': ['tw'],
};

export const worldviewFlagPreferences = {
  argentina: 'ar',
  china: 'cn',
  india: 'in',
  israel: 'il',
  japan: 'jp',
  morocco: 'ma',
  pakistan: 'pk',
  southKorea: 'kr',
  unitedArabEmirates: 'ae',
  unitedStatesOfAmerica: 'us',
  vietnam: 'vn',
};

export function getPreferredLanguageFlags(languageCode) {
  const normalized = String(languageCode || '').toLowerCase();
  const flags = languageFlagPreferences[normalized];

  if (!Array.isArray(flags)) {
    return [];
  }

  return flags.filter((flagCode) => /^[a-z]{2}(?:-[a-z]{2,3})?$/.test(flagCode));
}

export function getPreferredWorldviewFlag(worldviewCode) {
  const normalized = String(worldviewCode || '');
  const flagCode = worldviewFlagPreferences[normalized];

  if (!flagCode || !/^[a-z]{2}$/.test(flagCode)) {
    return '';
  }

  return flagCode;
}
