import { describe, expect, it } from 'vitest';
import { getPreferredLanguageFlags } from './languageFlagConfig';

describe('languageFlagConfig', () => {
  it('maps catalan language code to the catalonia flag icon code', () => {
    expect(getPreferredLanguageFlags('ca')).toEqual(['es-ct']);
  });

  it('maps greek language code to the greece flag icon code', () => {
    expect(getPreferredLanguageFlags('el')).toEqual(['gr']);
  });

  it('supports hyphenated icon codes in preferences', () => {
    expect(getPreferredLanguageFlags('ca')).toContain('es-ct');
  });

  it('normalizes uppercase language codes', () => {
    expect(getPreferredLanguageFlags('EL')).toEqual(['gr']);
  });
});
