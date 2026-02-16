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
 */
export function MapViewer({ styleName, token, parameters }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
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

  useEffect(() => {
    if (!containerRef.current || !styleUrl || mapRef.current) {
      return;
    }

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
    });

    mapRef.current = map;
  }, [styleUrl]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !styleUrl) {
      return;
    }

    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom();
    const bearing = mapRef.current.getBearing();
    const pitch = mapRef.current.getPitch();

    mapRef.current.setStyle(styleUrl);
    mapRef.current.once('style.load', () => {
      if (!mapRef.current) {
        return;
      }
      mapRef.current.jumpTo({
        center,
        zoom,
        bearing,
        pitch,
      });
    });

    setMapError('');
  }, [styleUrl]);

  return (
    <section className="map-viewer" aria-label="Map viewer">
      {mapError ? <p className="map-viewer-error">Map error: {mapError}</p> : null}

      {styleUrl ? (
        <div ref={containerRef} className="map-viewer-canvas" />
      ) : (
        <div className="map-viewer-empty">Load styles and select one to initialize MapLibre.</div>
      )}
    </section>
  );
}
