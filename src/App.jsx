import './App.css';
import { StyleBrowser } from './components/StyleBrowser/StyleBrowser';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>ArcGIS Basemap Styles Service v2 Playground</h1>
        <p>Browse available basemap styles from the /self endpoint.</p>
      </header>
      <main className="app-main">
        <StyleBrowser />
      </main>
    </div>
  );
}

export default App;
