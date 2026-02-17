const LIBRARY_ZOOM_PROFILES_FROM_MAPLIBRE = {
  maplibre: { offset: 0, min: 0, max: 24 },
  leaflet: { offset: -1, min: 0, max: 22 },
  openlayers: { offset: -1, min: 0, max: 28 },
  'arcgis-image': { offset: -1, min: 0, max: 23 },
  'arcgis-vector': { offset: 0, min: 0, max: 22 },
};

function clampZoom(zoom, min, max) {
  if (zoom < min) {
    return min;
  }

  if (zoom > max) {
    return max;
  }

  return zoom;
}

/**
 * Convert a MapLibre zoom value to a target library zoom baseline.
 *
 * @param {number|string} zoom
 * @param {'maplibre'|'leaflet'|'openlayers'|'arcgis-image'|'arcgis-vector'} [targetLibrary]
 * @param {{strict?: boolean, clamp?: boolean}} [options]
 * @returns {number}
 */
export function convertZoomFromMapLibre(zoom, targetLibrary = 'maplibre', options = {}) {
  const numericZoom = Number(zoom);
  const safeZoom = Number.isFinite(numericZoom) ? numericZoom : 0;
  const { strict = false, clamp = true } = options;

  const profile = LIBRARY_ZOOM_PROFILES_FROM_MAPLIBRE[targetLibrary];
  if (!profile) {
    if (strict) {
      throw new Error(`Unsupported zoom conversion target: "${targetLibrary}"`);
    }

    console.warn(
      `Unsupported zoom conversion target "${targetLibrary}". Falling back to MapLibre baseline conversion.`
    );
    return clamp ? clampZoom(safeZoom, 0, 24) : safeZoom;
  }

  const convertedZoom = safeZoom + profile.offset;
  return clamp ? clampZoom(convertedZoom, profile.min, profile.max) : convertedZoom;
}
