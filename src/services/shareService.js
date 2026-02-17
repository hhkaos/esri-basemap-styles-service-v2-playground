import { generateShareUrl, parseShareUrl } from '../utils/urlEncoder';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../config/mapDefaults';
import { DEFAULT_STYLE_PARAMETERS } from '../utils/styleCapabilities';

const TOOL_PANELS = new Set([
  'style-selection',
  'language',
  'worldview',
  'places',
  'code-generator',
  'share',
  'contact',
]);
const CODE_GENERATOR_LIBRARIES = new Set(['maplibre', 'leaflet']);
const DEFAULT_CODE_GENERATOR_EXPORT_OPTIONS = {
  style: true,
  language: true,
  worldview: true,
  places: true,
  location: true,
};

function normalizeCenter(center) {
  if (!Array.isArray(center) || center.length !== 2) {
    return DEFAULT_MAP_CENTER;
  }

  const lng = Number(center[0]);
  const lat = Number(center[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return DEFAULT_MAP_CENTER;
  }

  return [lng, lat];
}

function normalizeZoom(zoom) {
  const numericZoom = Number(zoom);
  return Number.isFinite(numericZoom) ? numericZoom : DEFAULT_MAP_ZOOM;
}

function normalizeCodeGeneratorExportOptions(exportOptions) {
  if (!exportOptions || typeof exportOptions !== 'object') {
    return { ...DEFAULT_CODE_GENERATOR_EXPORT_OPTIONS };
  }

  return {
    style: exportOptions.style !== false,
    language: exportOptions.language !== false,
    worldview: exportOptions.worldview !== false,
    places: exportOptions.places !== false,
    location: exportOptions.location !== false,
  };
}

function normalizePanel(panel) {
  return TOOL_PANELS.has(panel) ? panel : 'style-selection';
}

function normalizeCodeGeneratorShareConfig(codeGenerator) {
  if (!codeGenerator || typeof codeGenerator !== 'object') {
    return null;
  }

  const normalized = {};
  if (CODE_GENERATOR_LIBRARIES.has(codeGenerator.selectedLibrary)) {
    normalized.selectedLibrary = codeGenerator.selectedLibrary;
    normalized.hasLibrarySelection = true;
  }

  if (codeGenerator.exportOptions && typeof codeGenerator.exportOptions === 'object') {
    normalized.exportOptions = normalizeCodeGeneratorExportOptions(codeGenerator.exportOptions);
  }

  const token = typeof codeGenerator.token === 'string' ? codeGenerator.token.trim() : '';
  if (token) {
    normalized.token = token;
    normalized.hasAcceptedTokenWarning = true;
  }

  if (codeGenerator.forceDownload === true) {
    normalized.forceDownload = true;
  }

  const requestedStep = Number(codeGenerator.currentStep);
  if (Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 4) {
    normalized.currentStep = requestedStep;
  }

  return Object.keys(normalized).length ? normalized : null;
}

function deriveCodeGeneratorStep(sharedCodeGenerator) {
  if (!sharedCodeGenerator) {
    return 1;
  }

  if (sharedCodeGenerator.token) {
    return 4;
  }

  if (sharedCodeGenerator.selectedLibrary) {
    return 3;
  }

  if (sharedCodeGenerator.exportOptions) {
    return 2;
  }

  return 1;
}

function hasSupportedShareValue(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }

  return ['style', 'parameters', 'viewport', 'ui', 'codeGenerator'].some((key) => Object.hasOwn(config, key));
}

function normalizeShareParameters(parameters) {
  return {
    language: parameters?.language || DEFAULT_STYLE_PARAMETERS.language,
    worldview: parameters?.worldview || DEFAULT_STYLE_PARAMETERS.worldview,
    places: parameters?.places || DEFAULT_STYLE_PARAMETERS.places,
  };
}

function normalizeViewport(viewport) {
  if (!viewport || typeof viewport !== 'object') {
    return undefined;
  }

  return {
    center: normalizeCenter(viewport.center),
    zoom: normalizeZoom(viewport.zoom),
  };
}

export function buildShareConfig({ styleName, parameters, viewport }) {
  const config = {
    style: typeof styleName === 'string' ? styleName.trim() : '',
    parameters: normalizeShareParameters(parameters),
    viewport: {
      center: normalizeCenter(viewport?.center),
      zoom: normalizeZoom(viewport?.zoom),
    },
  };

  return config;
}

export function buildSelectiveShareConfig({ styleName, parameters, viewport, shareOptions, codeGeneratorState }) {
  const options = shareOptions || {};
  const config = {};

  if (options.includeStyle) {
    const normalizedStyle = typeof styleName === 'string' ? styleName.trim() : '';
    if (!normalizedStyle) {
      throw new Error('Select a style or disable Style before creating a share link.');
    }
    config.style = normalizedStyle;
  }

  const parameterConfig = {};
  if (options.includeLanguage) {
    parameterConfig.language = parameters?.language || DEFAULT_STYLE_PARAMETERS.language;
  }
  if (options.includeWorldview) {
    parameterConfig.worldview = parameters?.worldview || DEFAULT_STYLE_PARAMETERS.worldview;
  }
  if (options.includePlaces) {
    parameterConfig.places = parameters?.places || DEFAULT_STYLE_PARAMETERS.places;
  }
  if (Object.keys(parameterConfig).length) {
    config.parameters = parameterConfig;
  }

  if (options.includeDefaultPanel) {
    config.ui = { panel: normalizePanel(options.defaultPanel) };
  }

  if (config.ui?.panel === 'code-generator') {
    const codeGeneratorOptions = options.codeGenerator || {};
    const codeGenerator = {};

    if (codeGeneratorOptions.includeExportOptions && codeGeneratorState?.exportOptions) {
      codeGenerator.exportOptions = normalizeCodeGeneratorExportOptions(codeGeneratorState.exportOptions);
    }

    const selectedLibrary = codeGeneratorState?.selectedLibrary;
    if (codeGeneratorOptions.includeLibrary && codeGeneratorState?.hasLibrarySelection && CODE_GENERATOR_LIBRARIES.has(selectedLibrary)) {
      codeGenerator.selectedLibrary = selectedLibrary;
      codeGenerator.hasLibrarySelection = true;
    }

    const token = typeof codeGeneratorState?.token === 'string' ? codeGeneratorState.token.trim() : '';
    if (codeGeneratorOptions.includeApiKey && token) {
      codeGenerator.token = token;
      codeGenerator.hasAcceptedTokenWarning = true;
    }

    if (codeGeneratorOptions.forceDownload) {
      codeGenerator.forceDownload = true;
    }

    const derivedStep = deriveCodeGeneratorStep(codeGenerator);
    if (derivedStep > 1) {
      codeGenerator.currentStep = derivedStep;
    }

    if (Object.keys(codeGenerator).length) {
      config.codeGenerator = codeGenerator;
    }
  }

  if (viewport && typeof viewport === 'object' && Object.keys(config).length) {
    config.viewport = {
      center: normalizeCenter(viewport.center),
      zoom: normalizeZoom(viewport.zoom),
    };
  }

  if (!Object.keys(config).length) {
    throw new Error('Select at least one item to share.');
  }

  return config;
}

export function parseSharedConfigFromUrl(url) {
  const parsed = parseShareUrl(url);

  if (!hasSupportedShareValue(parsed)) {
    return null;
  }

  const normalizedCodeGenerator = normalizeCodeGeneratorShareConfig(parsed.codeGenerator);
  if (normalizedCodeGenerator && !normalizedCodeGenerator.currentStep) {
    normalizedCodeGenerator.currentStep = deriveCodeGeneratorStep(normalizedCodeGenerator);
  }

  return {
    style: typeof parsed.style === 'string' ? parsed.style.trim() : '',
    parameters: normalizeShareParameters(parsed.parameters),
    viewport: normalizeViewport(parsed.viewport),
    ui: parsed.ui && typeof parsed.ui === 'object' ? { panel: normalizePanel(parsed.ui.panel) } : undefined,
    codeGenerator: normalizedCodeGenerator,
  };
}

function copyWithExecCommand(text) {
  if (typeof document === 'undefined') {
    return false;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.append(textArea);
  textArea.select();

  let copied = false;
  try {
    copied = Boolean(document.execCommand('copy'));
  } catch {
    copied = false;
  }

  textArea.remove();
  return copied;
}

export async function copyTextToClipboard(text) {
  if (!text) {
    return false;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback to execCommand
    }
  }

  return copyWithExecCommand(text);
}

export async function generateAndCopyShareUrl({ styleName, parameters, viewport, baseUrl }) {
  const config = buildShareConfig({ styleName, parameters, viewport });
  if (!config.style) {
    throw new Error('Select a style before creating a share link.');
  }

  const shareUrl = generateShareUrl(config, baseUrl);
  const copied = await copyTextToClipboard(shareUrl);
  if (!copied) {
    throw new Error('Could not copy link automatically. Please copy it manually from the address bar.');
  }

  return shareUrl;
}

export async function generateAndCopySelectiveShareUrl({
  styleName,
  parameters,
  viewport,
  baseUrl,
  shareOptions,
  codeGeneratorState,
}) {
  const config = buildSelectiveShareConfig({
    styleName,
    parameters,
    viewport,
    shareOptions,
    codeGeneratorState,
  });
  const shareUrl = generateShareUrl(config, baseUrl);
  const copied = await copyTextToClipboard(shareUrl);
  if (!copied) {
    throw new Error('Could not copy link automatically. Please copy it manually from the address bar.');
  }

  return shareUrl;
}
