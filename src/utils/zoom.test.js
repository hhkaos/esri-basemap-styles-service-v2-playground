import { describe, expect, it, vi } from 'vitest';
import { convertZoomFromMapLibre } from './zoom';

describe('convertZoomFromMapLibre', () => {
  it('keeps MapLibre zoom unchanged by default', () => {
    expect(convertZoomFromMapLibre(9)).toBe(9);
  });

  it('applies the Leaflet offset and keeps fractional zoom values', () => {
    expect(convertZoomFromMapLibre(7, 'leaflet')).toBe(6);
    expect(convertZoomFromMapLibre(7.5, 'leaflet')).toBe(6.5);
  });

  it('clamps converted zoom to target min/max by default', () => {
    expect(convertZoomFromMapLibre(-1, 'maplibre')).toBe(0);
    expect(convertZoomFromMapLibre(100, 'leaflet')).toBe(22);
  });

  it('supports disabling clamping', () => {
    expect(convertZoomFromMapLibre(-1, 'leaflet', { clamp: false })).toBe(-2);
  });

  it('treats non-numeric zoom input as zero', () => {
    expect(convertZoomFromMapLibre('not-a-number', 'leaflet')).toBe(0);
  });

  it('falls back with warning for unknown target library when strict mode is off', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const converted = convertZoomFromMapLibre(4, 'unknown-library');
    expect(converted).toBe(4);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it('throws for unknown target library when strict mode is on', () => {
    expect(() => convertZoomFromMapLibre(4, 'unknown-library', { strict: true })).toThrow(
      'Unsupported zoom conversion target'
    );
  });
});
