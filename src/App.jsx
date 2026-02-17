import './App.css';
import { useCallback, useEffect, useState } from 'react';
import {
  CalciteAction,
  CalciteActionBar,
  CalciteBlock,
  CalciteButton,
  CalciteNavigation,
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel,
} from '@esri/calcite-components-react';
import { MapViewer } from './components/MapViewer/MapViewer';
import { ParameterControls } from './components/ParameterControls/ParameterControls';
import { StyleBrowser } from './components/StyleBrowser/StyleBrowser';
import { DEFAULT_STYLE_PARAMETERS, sanitizeStyleParameters } from './utils/styleCapabilities';

const DEFAULT_PLAYGROUND_TOKEN = (import.meta.env.VITE_DEFAULT_PLAYGROUND_API_KEY || '').trim();
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

function App() {
  const [selectedStyleName, setSelectedStyleName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [parameters, setParameters] = useState(DEFAULT_STYLE_PARAMETERS);
  const [capabilities, setCapabilities] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialSidebarCollapsed);
  const [activeToolPanel, setActiveToolPanel] = useState('style-selection');
  const [actionBarExpanded, setActionBarExpanded] = useState(true);

  const handleCapabilitiesLoad = useCallback((caps) => {
    setCapabilities({ languages: caps.languages, worldviews: caps.worldviews, places: caps.places });
  }, []);

  useEffect(() => {
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
          </CalciteActionBar>

          {activeToolPanel === 'style-selection' ? (
            <CalcitePanel heading="Style Selection" className="app-tools-panel-content app-style-panel">
              <div className="app-style-panel-content">
                <StyleBrowser
                  selectedStyleName={selectedStyleName}
                  onStyleSelect={setSelectedStyleName}
                  onStyleMetaChange={setSelectedStyle}
                  onCapabilitiesLoad={handleCapabilitiesLoad}
                />
              </div>
            </CalcitePanel>
          ) : null}

          {activeToolPanel === 'language' ? (
            <CalcitePanel heading="Language" className="app-tools-panel-content">
              <CalciteBlock open className="app-tools-block">
                <ParameterControls
                  selectedStyle={selectedStyle}
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
              <CalciteBlock open className="app-tools-block">
                <ParameterControls
                  selectedStyle={selectedStyle}
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
              <CalciteBlock open className="app-tools-block">
                <ParameterControls
                  selectedStyle={selectedStyle}
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
                <p className="app-placeholder-message">Code generator controls will be added here.</p>
              </CalciteBlock>
            </CalcitePanel>
          ) : null}
        </CalciteShellPanel>
      ) : null}

      <div className="app-viewer-panel">
        <MapViewer styleName={selectedStyleName} token={DEFAULT_PLAYGROUND_TOKEN} parameters={parameters} />
      </div>
    </CalciteShell>
  );
}

export default App;
