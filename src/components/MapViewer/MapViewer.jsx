import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { buildStyleUrl } from '../../utils/urlGenerator';
import './MapViewer.css';

const DEFAULT_CENTER = [0, 30];
const DEFAULT_ZOOM = 2;

/**
 * @param {Object} props
 * @param {string} [props.styleName]
 * @param {string} [props.token]
 * @param {{language?: string, worldview?: string, places?: string}} [props.parameters]
 * @param {(loading: boolean) => void} [props.onLoadingChange]
 */
export function MapViewer({ styleName, token, parameters, onLoadingChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const styleLoadOperationRef = useRef(0);
  const [mapError, setMapError] = useState('');

  const styleUrl = useMemo(() => {
    if (!styleName || !token) {
      return '';
    }

    return buildStyleUrl({
      styleName,
      token,
      language: parameters?.language,
      worldview: parameters?.worldview,
      places: parameters?.places,
    });
  }, [styleName, token, parameters]);

  // Create or update map
  useEffect(() => {
    if (!containerRef.current || !styleUrl) {
      return;
    }

    const operationId = styleLoadOperationRef.current + 1;
    styleLoadOperationRef.current = operationId;
    onLoadingChange?.(true);

    // No map yet — create one
    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: styleUrl,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: true,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.on('error', (event) => {
        const message = event?.error?.message || 'Map rendering error';
        setMapError(message);
        if (operationId === styleLoadOperationRef.current) {
          onLoadingChange?.(false);
        }
      });
      map.once('load', () => {
        map.resize();
        if (operationId === styleLoadOperationRef.current) {
          onLoadingChange?.(false);
        }
      });

      mapRef.current = map;
      return;
    }

    // Map exists — update its style
    const map = mapRef.current;
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();

    map.setStyle(styleUrl);
    map.once('style.load', () => {
      if (!mapRef.current) {
        return;
      }
      mapRef.current.jumpTo({ center, zoom, bearing, pitch });
      if (operationId === styleLoadOperationRef.current) {
        onLoadingChange?.(false);
      }
    });
    setMapError('');
  }, [styleUrl, onLoadingChange]);

  useEffect(() => {
    if (styleUrl) {
      return;
    }

    onLoadingChange?.(false);
  }, [styleUrl, onLoadingChange]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const resizeMap = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };

    const observer = new ResizeObserver(resizeMap);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      onLoadingChange?.(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLoadingChange]);

  return (
    <section className="map-viewer" aria-label="Map viewer">
      {mapError ? <p className="map-viewer-error">Map error: {mapError}</p> : null}
      <div
        ref={containerRef}
        className="map-viewer-canvas"
        style={styleUrl ? undefined : { display: 'none' }}
      />
      {!styleUrl && (
        <div className="map-viewer-empty">Load styles and select one to initialize MapLibre.</div>
      )}
    </section>
  );
}
