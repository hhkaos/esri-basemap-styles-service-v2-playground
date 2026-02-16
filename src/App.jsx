import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { CalciteNavigation, CalcitePanel, CalciteShell, CalciteShellPanel } from '@esri/calcite-components-react';
import { MapViewer } from './components/MapViewer/MapViewer';
import { ParameterControls } from './components/ParameterControls/ParameterControls';
import { StyleBrowser } from './components/StyleBrowser/StyleBrowser';
import { DEFAULT_STYLE_PARAMETERS, sanitizeStyleParameters } from './utils/styleCapabilities';

const DEFAULT_PLAYGROUND_TOKEN = (import.meta.env.VITE_DEFAULT_PLAYGROUND_API_KEY || '').trim();

function App() {
  const [selectedStyleName, setSelectedStyleName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [parameters, setParameters] = useState(DEFAULT_STYLE_PARAMETERS);
  const [capabilities, setCapabilities] = useState(null);

  const handleCapabilitiesLoad = useCallback((caps) => {
    setCapabilities({ languages: caps.languages, worldviews: caps.worldviews, places: caps.places });
  }, []);

  useEffect(() => {
    setParameters((current) => sanitizeStyleParameters(selectedStyle, current));
  }, [selectedStyle]);

  return (
    <CalciteShell className="app-shell">
      <CalciteNavigation slot="header">
        <span slot="content-start" className="app-title">
          ArcGIS Basemap Styles Service v2 Playground
        </span>
      </CalciteNavigation>

      <CalciteShellPanel slot="panel-start" position="start" widthScale="m" className="app-shell-side">
        <CalcitePanel className="app-style-panel">
          <StyleBrowser
            selectedStyleName={selectedStyleName}
            onStyleSelect={setSelectedStyleName}
            onStyleMetaChange={setSelectedStyle}
            onCapabilitiesLoad={handleCapabilitiesLoad}
          />
        </CalcitePanel>
        <CalcitePanel heading="Parameters" className="app-parameters-panel">
          <ParameterControls selectedStyle={selectedStyle} parameters={parameters} onChange={setParameters} capabilities={capabilities} />
        </CalcitePanel>
      </CalciteShellPanel>

      <CalcitePanel className="app-viewer-panel">
        <MapViewer styleName={selectedStyleName} token={DEFAULT_PLAYGROUND_TOKEN} parameters={parameters} />
        <div slot="footer" className="app-codegen-placeholder">
          Code generator panel (collapsible) will be placed here.
        </div>
      </CalcitePanel>
    </CalciteShell>
  );
}

export default App;
