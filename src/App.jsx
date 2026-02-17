import './App.css';
import { useCallback, useEffect, useState } from 'react';
import {
  CalciteAction,
  CalciteActionBar,
  CalciteBlock,
  CalciteButton,
  CalciteLink,
  CalciteNavigation,
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel,
} from '@esri/calcite-components-react';
import { CodeGenerator } from './components/CodeGenerator/CodeGenerator';
import { MapViewer } from './components/MapViewer/MapViewer';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from './config/mapDefaults';
import { ParameterControls } from './components/ParameterControls/ParameterControls';
import { SharePanel } from './components/SharePanel/SharePanel';
import { StyleBrowser } from './components/StyleBrowser/StyleBrowser';
import { DEFAULT_PLAYGROUND_TOKEN } from './config/playgroundToken';
import { DEFAULT_STYLE_PARAMETERS, sanitizeStyleParameters } from './utils/styleCapabilities';
import { parseSharedConfigFromUrl } from './services/shareService';

const SIDEBAR_COLLAPSE_STORAGE_KEY = 'playground.sidebarCollapsed';

function getInitialSidebarCollapsed() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.sessionStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function getParameterDisplayValue(value, fallbackValue) {
  const normalized = typeof value === 'string' ? value.trim() : '';

  if (!normalized) {
    return `${fallbackValue} (default)`;
  }

  if (normalized === fallbackValue) {
    return `${normalized} (default)`;
  }

  return normalized;
}

function getInitialSharedConfig() {
  if (typeof window === 'undefined') {
    return null;
  }

  return parseSharedConfigFromUrl(window.location.href);
}

function App() {
  const [initialSharedConfig] = useState(getInitialSharedConfig);
  const [sharedCodeGeneratorPreset, setSharedCodeGeneratorPreset] = useState(() => initialSharedConfig?.codeGenerator || null);
  const [selectedStyleName, setSelectedStyleName] = useState(() => initialSharedConfig?.style || '');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [styleCatalogLoaded, setStyleCatalogLoaded] = useState(false);
  const [parameters, setParameters] = useState(() => ({
    ...DEFAULT_STYLE_PARAMETERS,
    ...(initialSharedConfig?.parameters || {}),
  }));
  const [capabilities, setCapabilities] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialSidebarCollapsed);
  const [activeToolPanel, setActiveToolPanel] = useState(() => initialSharedConfig?.ui?.panel || 'style-selection');
  const [actionBarExpanded, setActionBarExpanded] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [codeGeneratorState, setCodeGeneratorState] = useState(() => {
    if (!initialSharedConfig?.codeGenerator) {
      return null;
    }

    return {
      selectedLibrary: initialSharedConfig.codeGenerator.selectedLibrary || 'maplibre',
      hasLibrarySelection: Boolean(initialSharedConfig.codeGenerator.hasLibrarySelection),
      token: initialSharedConfig.codeGenerator.token || '',
      exportOptions: initialSharedConfig.codeGenerator.exportOptions || null,
    };
  });
  const [mapViewport, setMapViewport] = useState(() => ({
    center: initialSharedConfig?.viewport?.center || DEFAULT_MAP_CENTER,
    zoom: initialSharedConfig?.viewport?.zoom ?? DEFAULT_MAP_ZOOM,
  }));

  const handleCapabilitiesLoad = useCallback((caps) => {
    setCapabilities({ languages: caps.languages, worldviews: caps.worldviews, places: caps.places });
  }, []);

  useEffect(() => {
    if (!selectedStyle) {
      return;
    }

    setParameters((current) => sanitizeStyleParameters(selectedStyle, current));
  }, [selectedStyle]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.sessionStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      // no-op: storage may be unavailable in private contexts
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (typeof window === 'undefined' || sidebarCollapsed) {
      return;
    }

    setActionBarExpanded(false);
    let frameTwo = 0;
    const frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(() => {
        setActionBarExpanded(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(frameOne);
      if (frameTwo) {
        window.cancelAnimationFrame(frameTwo);
      }
    };
  }, [sidebarCollapsed]);

  const viewerHeading = selectedStyle?.name || selectedStyleName || 'No style selected';
  const languageDescription = getParameterDisplayValue(parameters.language, DEFAULT_STYLE_PARAMETERS.language);
  const placesDescription = getParameterDisplayValue(parameters.places, DEFAULT_STYLE_PARAMETERS.places);
  const worldviewDescription = getParameterDisplayValue(parameters.worldview, 'global');
  const viewerDescription = `Language: ${languageDescription} • Places: ${placesDescription} • Worldview: ${worldviewDescription}`;

  return (
    <CalciteShell className="app-shell">
      <CalciteNavigation slot="header">
        <span slot="content-start" className="app-title">
          ArcGIS Basemap Styles Service v2 Playground
        </span>
        <span slot="content-end" className="app-header-actions">
          <CalciteButton appearance="outline" scale="s" onClick={() => setSidebarCollapsed((current) => !current)}>
            {sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          </CalciteButton>
        </span>
      </CalciteNavigation>

      {!sidebarCollapsed ? (
        <CalciteShellPanel
          slot="panel-start"
          displayMode="dock"
          layout="vertical"
          position="start"
          widthScale="m"
          className="app-shell-tools"
        >
          <CalciteActionBar
            slot="action-bar"
            layout="vertical"
            overlayPositioning="absolute"
            scale="m"
            expanded={actionBarExpanded}
          >
            <CalciteAction
              icon="selection"
              text="Style Selection"
              textEnabled={actionBarExpanded}
              active={activeToolPanel === 'style-selection'}
              onClick={() => setActiveToolPanel('style-selection')}
            />
            <CalciteAction
              icon="language"
              text="Language"
              textEnabled={actionBarExpanded}
              active={activeToolPanel === 'language'}
              onClick={() => setActiveToolPanel('language')}
            />
            <CalciteAction
              icon="globe"
              text="Worldview"
              textEnabled={actionBarExpanded}
              active={activeToolPanel === 'worldview'}
              onClick={() => setActiveToolPanel('worldview')}
            />
            <CalciteAction
              icon="pin-plus"
              text="Places"
              textEnabled={actionBarExpanded}
              active={activeToolPanel === 'places'}
              onClick={() => setActiveToolPanel('places')}
            />
            <CalciteAction
              icon="code"
              text="Code Generator"
              textEnabled={actionBarExpanded}
              active={activeToolPanel === 'code-generator'}
              onClick={() => setActiveToolPanel('code-generator')}
            />
            <CalciteAction
              icon="share"
              text="Share"
              textEnabled={actionBarExpanded}
              active={activeToolPanel === 'share'}
              onClick={() => setActiveToolPanel('share')}
            />
            <CalciteAction
              icon="information"
              text="Contact"
              textEnabled={actionBarExpanded}
              active={activeToolPanel === 'contact'}
              onClick={() => setActiveToolPanel('contact')}
            />
          </CalciteActionBar>

          <CalcitePanel
            heading="Style Selection"
            className="app-tools-panel-content app-style-panel"
            hidden={activeToolPanel !== 'style-selection'}
          >
            <CalciteBlock open className="app-tools-block">
              <div className="app-style-panel-content">
                <StyleBrowser
                  selectedStyleName={selectedStyleName}
                  onStyleSelect={setSelectedStyleName}
                  onStyleMetaChange={setSelectedStyle}
                  onCapabilitiesLoad={handleCapabilitiesLoad}
                  onCatalogLoadComplete={setStyleCatalogLoaded}
                />
              </div>
            </CalciteBlock>
          </CalcitePanel>

          {activeToolPanel === 'language' ? (
            <CalcitePanel heading="Language" className="app-tools-panel-content">
              <CalciteBlock open className="app-tools-block app-parameter-block">
                <ParameterControls
                  selectedStyle={selectedStyle}
                  selectedStyleName={selectedStyleName}
                  styleCatalogLoaded={styleCatalogLoaded}
                  parameters={parameters}
                  onChange={setParameters}
                  capabilities={capabilities}
                  section="language"
                />
              </CalciteBlock>
            </CalcitePanel>
          ) : null}

          {activeToolPanel === 'worldview' ? (
            <CalcitePanel heading="Worldview" className="app-tools-panel-content">
              <CalciteBlock open className="app-tools-block app-parameter-block">
                <ParameterControls
                  selectedStyle={selectedStyle}
                  selectedStyleName={selectedStyleName}
                  styleCatalogLoaded={styleCatalogLoaded}
                  parameters={parameters}
                  onChange={setParameters}
                  capabilities={capabilities}
                  section="worldview"
                />
              </CalciteBlock>
            </CalcitePanel>
          ) : null}

          {activeToolPanel === 'places' ? (
            <CalcitePanel heading="Places" className="app-tools-panel-content">
              <CalciteBlock open className="app-tools-block app-parameter-block">
                <ParameterControls
                  selectedStyle={selectedStyle}
                  selectedStyleName={selectedStyleName}
                  styleCatalogLoaded={styleCatalogLoaded}
                  parameters={parameters}
                  onChange={setParameters}
                  capabilities={capabilities}
                  section="places"
                />
              </CalciteBlock>
            </CalcitePanel>
          ) : null}

          {activeToolPanel === 'code-generator' ? (
            <CalcitePanel heading="Code Generator" className="app-tools-panel-content">
              <CalciteBlock open className="app-tools-block">
                <CodeGenerator
                  selectedStyleName={selectedStyleName}
                  parameters={parameters}
                  viewport={mapViewport}
                  sharedPreset={sharedCodeGeneratorPreset}
                  onSharedPresetConsumed={() => setSharedCodeGeneratorPreset(null)}
                  onStateChange={setCodeGeneratorState}
                />
              </CalciteBlock>
            </CalcitePanel>
          ) : null}

          {activeToolPanel === 'share' ? (
            <CalcitePanel heading="Share" className="app-tools-panel-content">
              <CalciteBlock open className="app-tools-block">
                <SharePanel
                  selectedStyleName={selectedStyleName}
                  parameters={parameters}
                  viewport={mapViewport}
                  codeGeneratorState={codeGeneratorState}
                />
              </CalciteBlock>
            </CalcitePanel>
          ) : null}

          {activeToolPanel === 'contact' ? (
            <CalcitePanel heading="Contact" className="app-tools-panel-content">
              <CalciteBlock open className="app-tools-block">
                <div className="app-contact-content">
                  <p>Thanks a lot for trying this playground — you rock! 🚀</p>
                  <p>
                    Found a bug, got a question, or want a new feature? Please open an issue in the{' '}
                    <CalciteLink
                      href="https://github.com/hhkaos/esri-basemap-styles-service-v2-playground"
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub repository
                    </CalciteLink>
                    .
                  </p>
                  <p>
                    Not into GitHub workflows? No problem — you can contact me directly via{' '}
                    <CalciteLink href="https://links.rauljimenez.info/" target="_blank" rel="noreferrer">
                      links.rauljimenez.info
                    </CalciteLink>
                    .
                  </p>
                  <p>
                    This project is open source and built to experiment with AI models, so expect a little chaos,
                    a few rough edges, and plenty of learning along the way 😄.
                  </p>
                  <p>
                    Also, heads up: not every style description has been fully reviewed yet, so if you spot anything
                    odd, please let me know.
                  </p>
                  <p>
                    Curious about plans and priorities? Check the{' '}
                    <CalciteLink
                      href="https://github.com/hhkaos/esri-basemap-styles-service-v2-playground/blob/main/docs/SPEC.md"
                      target="_blank"
                      rel="noreferrer"
                    >
                      SPEC.md
                    </CalciteLink>{' '}
                    (for PRD) and{' '}
                    <CalciteLink
                      href="https://github.com/hhkaos/esri-basemap-styles-service-v2-playground/blob/main/docs/TODO.md"
                      target="_blank"
                      rel="noreferrer"
                    >
                      TODO.md
                    </CalciteLink> (for the roadmap)
                    .
                  </p>
                </div>
              </CalciteBlock>
            </CalcitePanel>
          ) : null}
        </CalciteShellPanel>
      ) : null}

      <CalcitePanel
        className="app-viewer-panel"
        loading={mapLoading}
        heading={viewerHeading}
        description={viewerDescription}
      >
        <MapViewer
          styleName={selectedStyleName}
          token={DEFAULT_PLAYGROUND_TOKEN}
          parameters={parameters}
          initialViewport={initialSharedConfig?.viewport}
          onLoadingChange={setMapLoading}
          onViewportChange={setMapViewport}
        />
      </CalcitePanel>
    </CalciteShell>
  );
}

export default App;
