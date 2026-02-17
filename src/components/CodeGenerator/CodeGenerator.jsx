import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalciteButton,
  CalciteInput,
  CalciteLabel,
  CalciteLink,
  CalciteRadioButton,
  CalciteRadioButtonGroup,
} from '@esri/calcite-components-react';
import { convertZoomFromMapLibre } from '../../utils/zoom';
import { generateAndCopyShareUrl } from '../../services/shareService';
import maplibreIcon from '../../assets/icons/maplibre-icon-rounded.png';
import leafletIcon from '../../assets/icons/leaflet-icon-rounded.png';
import leafletTilesTemplate from '../../templates/html/leaflet-tiles.html?raw';
import maplibreTilesTemplate from '../../templates/html/maplibre-tiles.html?raw';
import './CodeGenerator.css';

const LIBRARIES = [
  { id: 'maplibre', label: 'MapLibre GL JS', icon: maplibreIcon, iconAlt: 'MapLibre logo' },
  { id: 'leaflet', label: 'Leaflet', icon: leafletIcon, iconAlt: 'Leaflet logo' },
];
const LIBRARY_TUTORIALS = {
  leaflet: 'https://developers.arcgis.com/esri-leaflet/tutorials/',
  maplibre: 'https://developers.arcgis.com/maplibre-gl-js/tutorials/',
};
const CODEPEN_URL = 'https://codepen.io/pen/define';
const DEFAULT_EXPORT_STYLE = 'arcgis/navigation';
const DEFAULT_EXPORT_VIEWPORT = {
  center: [0, 30],
  zoom: 2,
};
const EXPORT_STEPS = [
  { id: 1, title: 'Select Exported Parameters' },
  { id: 2, title: 'Select a Client Library' },
  { id: 3, title: 'Add API Key' },
  { id: 4, title: 'Export' },
];

function createInitialCodeGeneratorMemory() {
  return {
    selectedLibrary: LIBRARIES[0].id,
    hasLibrarySelection: false,
    token: '',
    showToken: false,
    hasAcceptedTokenWarning: false,
    currentStep: 1,
    exportOptions: {
      style: true,
      language: true,
      worldview: true,
      places: true,
      location: true,
    },
  };
}

let codeGeneratorMemory = createInitialCodeGeneratorMemory();

function sanitizeSharedPreset(sharedPreset) {
  if (!sharedPreset || typeof sharedPreset !== 'object') {
    return null;
  }

  const preset = {};
  if (sharedPreset.selectedLibrary === 'maplibre' || sharedPreset.selectedLibrary === 'leaflet') {
    preset.selectedLibrary = sharedPreset.selectedLibrary;
    preset.hasLibrarySelection = true;
  }

  if (sharedPreset.exportOptions && typeof sharedPreset.exportOptions === 'object') {
    preset.exportOptions = {
      style: sharedPreset.exportOptions.style !== false,
      language: sharedPreset.exportOptions.language !== false,
      worldview: sharedPreset.exportOptions.worldview !== false,
      places: sharedPreset.exportOptions.places !== false,
      location: sharedPreset.exportOptions.location !== false,
    };
  }

  const token = typeof sharedPreset.token === 'string' ? sharedPreset.token.trim() : '';
  if (token) {
    preset.token = token;
    preset.hasAcceptedTokenWarning = true;
  }

  if (sharedPreset.forceDownload === true) {
    preset.forceDownload = true;
  }

  const step = Number(sharedPreset.currentStep);
  if (Number.isInteger(step) && step >= 1 && step <= 4) {
    preset.currentStep = step;
  }

  return Object.keys(preset).length ? preset : null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeFilenameSegment(value, fallback = 'style') {
  const normalized = (value || fallback).toLowerCase().replaceAll('/', '-').replaceAll(/[^a-z0-9-]/g, '-');
  const collapsed = normalized.replaceAll(/-+/g, '-').replaceAll(/^-|-$/g, '');
  return collapsed || fallback;
}

function renderTemplate(template, values) {
  return template.replaceAll(/{{([a-zA-Z0-9_]+)}}/g, (match, key) => {
    return Object.hasOwn(values, key) ? String(values[key]) : match;
  });
}

function buildTemplateHtml({ selectedLibrary, styleName, token, parameters, viewport }) {
  const center = Array.isArray(viewport?.center) && viewport.center.length === 2 ? viewport.center : [0, 30];
  const sourceZoom = Number.isFinite(viewport?.zoom) ? viewport.zoom : 2;
  const convertedZoom = convertZoomFromMapLibre(sourceZoom, selectedLibrary);

  if (selectedLibrary === 'leaflet') {
    return renderTemplate(leafletTilesTemplate, {
      pageTitle: `ArcGIS Basemap Style (${escapeHtml(styleName)}) - Leaflet`,
      accessToken: escapeHtml(token),
      centerLat: escapeHtml(center[1]),
      centerLng: escapeHtml(center[0]),
      zoom: escapeHtml(convertedZoom),
      basemapEnum: escapeHtml(styleName),
      language: escapeHtml(parameters.language || 'global'),
      worldview: escapeHtml(parameters.worldview || ''),
      places: escapeHtml(parameters.places || 'none'),
    });
  }

  return renderTemplate(maplibreTilesTemplate, {
    pageTitle: `ArcGIS Basemap Style (${escapeHtml(styleName)}) - MapLibre`,
    accessToken: escapeHtml(token),
    centerLat: escapeHtml(center[1]),
    centerLng: escapeHtml(center[0]),
    zoom: escapeHtml(convertedZoom),
    basemapEnum: escapeHtml(styleName),
    language: escapeHtml(parameters.language || 'global'),
    worldview: escapeHtml(parameters.worldview || ''),
    places: escapeHtml(parameters.places || 'none'),
  });
}

function openInCodePen(html, selectedLibrary, styleName) {
  if (typeof document === 'undefined') {
    return;
  }

  const payload = {
    title: `ArcGIS Basemap (${selectedLibrary}) - ${styleName}`,
    html,
    editors: '100',
  };

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = CODEPEN_URL;
  form.target = '_blank';
  form.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'data';
  input.value = JSON.stringify(payload);
  form.append(input);
  document.body.append(form);
  form.submit();
  form.remove();
}

function downloadTemplate(html, selectedLibrary, styleName) {
  if (typeof window === 'undefined') {
    return;
  }

  const styleSegment = normalizeFilenameSegment(styleName, 'style');
  const librarySegment = normalizeFilenameSegment(selectedLibrary, 'maplibre');
  const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
  const filename = `${librarySegment}-${styleSegment}-${timestamp}.html`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
}

function getInputValue(event) {
  const value = event?.target?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function formatViewport(viewport) {
  const center = Array.isArray(viewport?.center) && viewport.center.length === 2 ? viewport.center : [0, 30];
  const zoom = Number.isFinite(viewport?.zoom) ? viewport.zoom : 2;
  const [lng, lat] = center;
  return `Lng ${Number(lng).toFixed(4)}, Lat ${Number(lat).toFixed(4)}, Zoom ${Number(zoom).toFixed(2)}`;
}

/**
 * @param {Object} props
 * @param {string} [props.selectedStyleName]
 * @param {{language:string,worldview:string,places:string}} props.parameters
 * @param {{center:[number,number],zoom:number}} [props.viewport]
 * @param {{
 *  selectedLibrary?:string,
 *  hasLibrarySelection?:boolean,
 *  token?:string,
 *  hasAcceptedTokenWarning?:boolean,
 *  currentStep?:number,
 *  exportOptions?:Object,
 *  forceDownload?:boolean
 * }} [props.sharedPreset]
 * @param {() => void} [props.onSharedPresetConsumed]
 * @param {(state: {
 *  selectedLibrary:string,
 *  hasLibrarySelection:boolean,
 *  token:string,
 *  exportOptions: Object,
 *  currentStep:number
 * }) => void} [props.onStateChange]
 */
export function CodeGenerator({
  selectedStyleName,
  parameters,
  viewport,
  sharedPreset,
  onSharedPresetConsumed,
  onStateChange,
}) {
  const normalizedSharedPreset = useMemo(() => sanitizeSharedPreset(sharedPreset), [sharedPreset]);

  const initialState = useMemo(() => {
    if (!normalizedSharedPreset) {
      return codeGeneratorMemory;
    }

    return {
      ...codeGeneratorMemory,
      ...normalizedSharedPreset,
      exportOptions: normalizedSharedPreset.exportOptions || codeGeneratorMemory.exportOptions,
      hasAcceptedTokenWarning:
        normalizedSharedPreset.hasAcceptedTokenWarning ?? codeGeneratorMemory.hasAcceptedTokenWarning,
      hasLibrarySelection: normalizedSharedPreset.hasLibrarySelection ?? codeGeneratorMemory.hasLibrarySelection,
      forceDownload: normalizedSharedPreset.forceDownload === true,
    };
  }, [normalizedSharedPreset]);

  const [selectedLibrary, setSelectedLibrary] = useState(() => initialState.selectedLibrary);
  const [hasLibrarySelection, setHasLibrarySelection] = useState(() => initialState.hasLibrarySelection);
  const [token, setToken] = useState(() => initialState.token);
  const [showToken, setShowToken] = useState(() => initialState.showToken);
  const [hasAcceptedTokenWarning, setHasAcceptedTokenWarning] = useState(() => initialState.hasAcceptedTokenWarning);
  const [currentStep, setCurrentStep] = useState(() => initialState.currentStep);
  const [shareStatus, setShareStatus] = useState({ kind: '', message: '' });
  const [shareBusy, setShareBusy] = useState(false);
  const [exportOptions, setExportOptions] = useState(() => initialState.exportOptions);
  const [forceDownloadOnLoad] = useState(() => Boolean(initialState.forceDownload));
  const shareToastTimeoutRef = useRef(0);
  const hasTriggeredForceDownloadRef = useRef(false);

  const hasToken = token.length > 0;
  const selectedStyleForExport = exportOptions.style ? selectedStyleName || '' : DEFAULT_EXPORT_STYLE;
  const exportedParameters = useMemo(
    () => ({
      language: exportOptions.language ? parameters.language || 'global' : 'global',
      worldview: exportOptions.worldview ? parameters.worldview || '' : '',
      places: exportOptions.places ? parameters.places || 'none' : 'none',
    }),
    [
      exportOptions.language,
      exportOptions.places,
      exportOptions.worldview,
      parameters.language,
      parameters.places,
      parameters.worldview,
    ]
  );
  const exportedViewport = useMemo(
    () => (exportOptions.location ? viewport : DEFAULT_EXPORT_VIEWPORT),
    [exportOptions.location, viewport]
  );

  const hasSelectedStyle = Boolean(selectedStyleForExport);
  const canExport = hasToken && hasSelectedStyle;
  const canShare = Boolean(selectedStyleName);
  const tokenToggleLabel = showToken ? 'Hide API key' : 'Show API key';
  const tokenToggleIcon = showToken ? 'view-hide' : 'view-visible';

  const templateHtml = useMemo(
    () =>
      canExport
        ? buildTemplateHtml({
            selectedLibrary,
            styleName: selectedStyleForExport,
            token,
            parameters: exportedParameters,
            viewport: exportedViewport,
          })
        : '',
    [canExport, exportedParameters, exportedViewport, selectedLibrary, selectedStyleForExport, token]
  );

  const selectedLibraryLabel = useMemo(
    () => LIBRARIES.find((library) => library.id === selectedLibrary)?.label || 'MapLibre GL JS',
    [selectedLibrary]
  );
  const selectedLibraryTutorialUrl = LIBRARY_TUTORIALS[selectedLibrary] || LIBRARY_TUTORIALS.maplibre;

  const summaryRows = useMemo(
    () => [
      { label: 'Library', value: selectedLibraryLabel },
      {
        label: 'Style',
        value: exportOptions.style ? selectedStyleForExport || 'None selected' : `Default (${DEFAULT_EXPORT_STYLE})`,
      },
      {
        label: 'Language',
        value: exportOptions.language ? parameters.language || 'global' : 'Default (global)',
      },
      {
        label: 'Worldview',
        value: exportOptions.worldview ? parameters.worldview || 'global' : 'Default (global)',
      },
      {
        label: 'Places',
        value: exportOptions.places ? parameters.places || 'none' : 'Default (none)',
      },
      {
        label: 'Map Location',
        value: exportOptions.location ? formatViewport(viewport) : `Default (${formatViewport(DEFAULT_EXPORT_VIEWPORT)})`,
      },
    ],
    [
      exportOptions.language,
      exportOptions.location,
      exportOptions.places,
      exportOptions.style,
      exportOptions.worldview,
      parameters.language,
      parameters.places,
      parameters.worldview,
      selectedLibraryLabel,
      selectedStyleForExport,
      viewport,
    ]
  );

  const stepHeading = EXPORT_STEPS.find((step) => step.id === currentStep)?.title || 'Export';
  const nextDisabled =
    (currentStep === 2 && !hasLibrarySelection) ||
    (currentStep === 3 && (!hasToken || !hasAcceptedTokenWarning));

  useEffect(() => {
    return () => {
      if (shareToastTimeoutRef.current) {
        window.clearTimeout(shareToastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!normalizedSharedPreset) {
      return;
    }

    onSharedPresetConsumed?.();
  }, [normalizedSharedPreset, onSharedPresetConsumed]);

  useEffect(() => {
    codeGeneratorMemory = {
      selectedLibrary,
      hasLibrarySelection,
      token,
      showToken,
      hasAcceptedTokenWarning,
      currentStep,
      exportOptions,
      forceDownload: false,
    };
  }, [currentStep, exportOptions, hasAcceptedTokenWarning, hasLibrarySelection, selectedLibrary, showToken, token]);

  useEffect(() => {
    onStateChange?.({
      selectedLibrary,
      hasLibrarySelection,
      token,
      exportOptions,
      currentStep,
    });
  }, [currentStep, exportOptions, hasLibrarySelection, onStateChange, selectedLibrary, token]);

  const parameterRows = [
    {
      id: 'style',
      label: 'Style',
      value: selectedStyleName || 'No style selected',
    },
    {
      id: 'language',
      label: 'Language',
      value: parameters.language || 'global',
    },
    {
      id: 'worldview',
      label: 'Worldview',
      value: parameters.worldview || 'global',
    },
    {
      id: 'places',
      label: 'Places',
      value: parameters.places || 'none',
    },
    {
      id: 'location',
      label: 'Current map location',
      value: formatViewport(viewport),
    },
  ];

  function toggleExportOption(option) {
    setExportOptions((current) => ({
      ...current,
      [option]: !current[option],
    }));
  }

  function goToNextStep() {
    setCurrentStep((step) => Math.min(step + 1, EXPORT_STEPS.length));
  }

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  function showShareStatus(kind, message) {
    if (shareToastTimeoutRef.current) {
      window.clearTimeout(shareToastTimeoutRef.current);
    }

    setShareStatus({ kind, message });
    shareToastTimeoutRef.current = window.setTimeout(() => {
      setShareStatus({ kind: '', message: '' });
      shareToastTimeoutRef.current = 0;
    }, 3200);
  }

  async function handleShareLinkCopy() {
    if (!selectedStyleName || shareBusy) {
      return;
    }

    setShareBusy(true);
    try {
      await generateAndCopyShareUrl({
        styleName: selectedStyleName,
        parameters,
        viewport,
        baseUrl: window.location.origin + window.location.pathname,
      });
      showShareStatus('success', 'Share link copied to clipboard.');
    } catch (error) {
      showShareStatus('danger', error.message || 'Failed to create share link.');
    } finally {
      setShareBusy(false);
    }
  }

  useEffect(() => {
    if (!forceDownloadOnLoad || hasTriggeredForceDownloadRef.current) {
      return;
    }

    if (!canExport || currentStep !== 4) {
      return;
    }

    downloadTemplate(templateHtml, selectedLibrary, selectedStyleForExport);
    hasTriggeredForceDownloadRef.current = true;
  }, [canExport, currentStep, forceDownloadOnLoad, selectedLibrary, selectedStyleForExport, templateHtml]);

  return (
    <div className="code-generator" aria-live="polite">
      <p className="code-generator-intro">
        Build a ready-to-run HTML sample from your current playground configuration and export it to CodePen or as a
        local file.
      </p>

      <div className="code-generator-step-header">
        <p className="code-generator-step-index">Step {currentStep} of 4</p>
        <h4 className="code-generator-step-title">{stepHeading}</h4>
      </div>

      {currentStep === 1 ? (
        <div className="code-generator-step-content">
          <p className="code-generator-step-copy">
            Choose which parameters should be included in the exported code. Unchecked parameters will fall back to
            template defaults.
          </p>
          <div className="code-generator-parameter-list" role="group" aria-label="Exported parameters">
            {parameterRows.map((parameter) => {
              const checked = exportOptions[parameter.id];

              return (
                <label key={parameter.id} className="code-generator-parameter-item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleExportOption(parameter.id)}
                    aria-label={`Include ${parameter.label}`}
                  />
                  <span className="code-generator-parameter-content">
                    <span className="code-generator-parameter-label">{parameter.label}</span>
                    <span className="code-generator-parameter-value">{parameter.value}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="code-generator-note">
            If Style is unchecked, export uses `{DEFAULT_EXPORT_STYLE}`. If Current map location is unchecked, export
            uses the default world view.
          </p>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="code-generator-step-content">
          <p className="code-generator-step-copy">Select the client library used by the generated sample.</p>
          <CalciteRadioButtonGroup
            name="code-generator-library"
            value={selectedLibrary}
            layout="vertical"
            scale="s"
            className="code-generator-library-group"
            onCalciteRadioButtonGroupChange={(event) => {
              setSelectedLibrary(event?.target?.value || LIBRARIES[0].id);
              setHasLibrarySelection(true);
            }}
          >
            {LIBRARIES.map((library) => {
              return (
                <CalciteLabel key={library.id} layout="inline" className="code-generator-library-option">
                  <CalciteRadioButton
                    value={library.id}
                    checked={selectedLibrary === library.id}
                    onClick={() => {
                      setSelectedLibrary(library.id);
                      setHasLibrarySelection(true);
                    }}
                    onCalciteRadioButtonChange={() => {
                      setSelectedLibrary(library.id);
                      setHasLibrarySelection(true);
                    }}
                  />
                  <span className="code-generator-library-button-content">
                    <img className="code-generator-library-icon" src={library.icon} alt={library.iconAlt} />
                    <span>{library.label}</span>
                  </span>
                </CalciteLabel>
              );
            })}
          </CalciteRadioButtonGroup>
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="code-generator-step-content">
          <CalciteLabel>
            API Key
            <div className="code-generator-token-row">
              <CalciteInput
                data-testid="codegen-token-input"
                type={showToken ? 'text' : 'password'}
                value={token}
                placeholder="Paste your API key"
                icon="key"
                onCalciteInputInput={(event) => {
                  const value = getInputValue(event);
                  setToken(value);
                  if (!value) {
                    setHasAcceptedTokenWarning(false);
                  }
                }}
              />
              <CalciteButton
                data-testid="codegen-token-toggle"
                className="code-generator-token-toggle"
                appearance="outline"
                kind="neutral"
                iconStart={tokenToggleIcon}
                label={tokenToggleLabel}
                title={tokenToggleLabel}
                aria-label={tokenToggleLabel}
                onClick={() => setShowToken((current) => !current)}
              />
            </div>
          </CalciteLabel>

          {!hasToken ? (
            <div className="code-generator-cta-card">
              <h4>Need an API key?</h4>
              <p>Create a free ArcGIS Location Platform account to get started.</p>
              <div className="code-generator-cta-actions">
                <CalciteButton
                  href="https://developers.arcgis.com/sign-up/"
                  target="_blank"
                  rel="noreferrer"
                  width="full"
                  iconStart="user"
                >
                  Create Free Account
                </CalciteButton>
                <CalciteButton
                  href="https://www.youtube.com/watch?v=h68pd449wd4"
                  target="_blank"
                  rel="noreferrer"
                  width="full"
                  appearance="outline"
                  iconStart="video"
                >
                  {'Create and configure an API key tutorial'}
                </CalciteButton>
                <CalciteButton
                  href="https://developers.arcgis.com/documentation/security-and-authentication/api-key-authentication/"
                  target="_blank"
                  rel="noreferrer"
                  width="full"
                  appearance="outline"
                  iconStart="information"
                >
                  Intro to API key documentation
                </CalciteButton>
              </div>
            </div>
          ) : null}

          <p className="code-generator-note">
            API keys are exposed in client-side code. Scope keys to allowed referrers, apply least privilege principle, and rotate them often.{' '}
            <CalciteLink
              href="https://developers.arcgis.com/documentation/security-and-authentication/api-key-authentication/#best-practices"
              target="_blank"
              rel="noreferrer"
            >
              Security best practices
            </CalciteLink>
          </p>

          <label className="code-generator-parameter-item" data-testid="codegen-token-warning-checkbox-row">
            <input
              type="checkbox"
              checked={hasAcceptedTokenWarning}
              onChange={(event) => setHasAcceptedTokenWarning(Boolean(event?.target?.checked))}
              aria-label="I confirm I read and understood the API key security warning"
            />
            <span className="code-generator-parameter-content">
              <span className="code-generator-parameter-label">I read and understood the API key warning</span>
              <span className="code-generator-parameter-value">
                I will use a scoped key, avoid committing secrets, and rotate the key if frequently.
              </span>
            </span>
          </label>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className="code-generator-step-content">
          <div className="code-generator-summary" role="group" aria-label="Export summary">
            {summaryRows.map((item) => (
              <p key={item.label} className="code-generator-summary-row">
                <span className="code-generator-summary-label">{item.label}</span>
                <span className="code-generator-summary-value">{item.value}</span>
              </p>
            ))}
          </div>

          <div className="code-generator-export-actions">
            <CalciteButton
              data-testid="codegen-export-codepen"
              disabled={!canExport}
              width="full"
              iconStart="launch"
              onClick={() => openInCodePen(templateHtml, selectedLibrary, selectedStyleForExport)}
            >
              Open in CodePen
            </CalciteButton>
            <CalciteButton
              data-testid="codegen-export-download"
              disabled={!canExport}
              width="full"
              appearance="outline"
              iconStart="download"
              onClick={() => downloadTemplate(templateHtml, selectedLibrary, selectedStyleForExport)}
            >
              Download HTML
            </CalciteButton>
            <CalciteButton
              data-testid="codegen-share-copy"
              disabled={!canShare || shareBusy}
              width="full"
              appearance="outline"
              iconStart="share"
              onClick={handleShareLinkCopy}
            >
              {shareBusy ? 'Copying Link...' : 'Copy Share Link'}
            </CalciteButton>
          </div>

          {!selectedStyleName && exportOptions.style ? (
            <p className="code-generator-warning">Select a style (or uncheck Style in step 1) before exporting code.</p>
          ) : null}
          {!selectedStyleName ? (
            <p className="code-generator-warning">Select a style before creating a share link.</p>
          ) : null}
        </div>
      ) : null}

      {currentStep === 4 ? (
        <p className="code-generator-note">
          Do you want to learn more? Check the{' '}
          <CalciteLink href={selectedLibraryTutorialUrl} target="_blank" rel="noreferrer">
            {selectedLibraryLabel} tutorials page
          </CalciteLink>
          .
        </p>
      ) : null}

      <div className="code-generator-step-actions">
        <CalciteButton
          data-testid="codegen-step-back"
          appearance="outline"
          disabled={currentStep === 1}
          onClick={goToPreviousStep}
        >
          Back
        </CalciteButton>
        {currentStep < EXPORT_STEPS.length ? (
          <CalciteButton data-testid="codegen-step-next" disabled={nextDisabled} onClick={goToNextStep}>
            Next
          </CalciteButton>
        ) : null}
      </div>

      {shareStatus.message ? (
        <div
          className={`code-generator-toast code-generator-toast-${shareStatus.kind}`}
          role="status"
          aria-live="polite"
        >
          {shareStatus.message}
        </div>
      ) : null}
    </div>
  );
}

CodeGenerator.__resetMemoryForTests = () => {
  codeGeneratorMemory = createInitialCodeGeneratorMemory();
};
