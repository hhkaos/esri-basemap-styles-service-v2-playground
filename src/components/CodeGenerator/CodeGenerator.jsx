import { useMemo, useState } from 'react';
import {
  CalciteButton,
  CalciteInput,
  CalciteLabel,
  CalciteLink,
  CalciteRadioButton,
  CalciteRadioButtonGroup,
} from '@esri/calcite-components-react';
import { convertZoomFromMapLibre } from '../../utils/zoom';
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
 */
export function CodeGenerator({ selectedStyleName, parameters, viewport }) {
  const [selectedLibrary, setSelectedLibrary] = useState(LIBRARIES[0].id);
  const [hasLibrarySelection, setHasLibrarySelection] = useState(false);
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [exportOptions, setExportOptions] = useState({
    style: true,
    language: true,
    worldview: true,
    places: true,
    location: true,
  });

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
      { label: 'Style', value: selectedStyleForExport || 'None selected' },
      { label: 'Language', value: exportedParameters.language || 'global' },
      { label: 'Worldview', value: exportedParameters.worldview || 'global' },
      { label: 'Places', value: exportedParameters.places || 'none' },
      { label: 'Map Location', value: formatViewport(exportedViewport) },
    ],
    [
      exportedParameters.language,
      exportedParameters.places,
      exportedParameters.worldview,
      exportedViewport,
      selectedLibraryLabel,
      selectedStyleForExport,
    ]
  );

  const stepHeading = EXPORT_STEPS.find((step) => step.id === currentStep)?.title || 'Export';
  const nextDisabled = (currentStep === 2 && !hasLibrarySelection) || (currentStep === 3 && !hasToken);

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
                  <CalciteRadioButton value={library.id} />
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
                onCalciteInputInput={(event) => setToken(getInputValue(event))}
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
                >
                  Create Free Account
                </CalciteButton>
                <CalciteButton
                  href="https://developers.arcgis.com/documentation/security-and-authentication/"
                  target="_blank"
                  rel="noreferrer"
                  width="full"
                  appearance="outline"
                >
                  Learn More
                </CalciteButton>
              </div>
            </div>
          ) : null}

          <p className="code-generator-note">
            API keys are exposed in client-side code. Scope keys to allowed referrers and rotate them often.{' '}
            <CalciteLink
              href="https://developers.arcgis.com/documentation/security-and-authentication/api-key-authentication/#best-practices"
              target="_blank"
              rel="noreferrer"
            >
              Security best practices
            </CalciteLink>
          </p>
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
          </div>

          {!selectedStyleName && exportOptions.style ? (
            <p className="code-generator-warning">Select a style (or uncheck Style in step 1) before exporting code.</p>
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
    </div>
  );
}
