import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Calcite Design System styles
import '@esri/calcite-components/main.css';

// Import MapLibre GL CSS
import 'maplibre-gl/dist/maplibre-gl.css';

// Initialize Calcite Components
import { setAssetPath } from '@esri/calcite-components/dist/components';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';
// Use CDN for assets (works in both dev and production)
setAssetPath('https://cdn.jsdelivr.net/npm/@esri/calcite-components@5.0.1/dist/cdn/assets');
defineCustomElements();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
