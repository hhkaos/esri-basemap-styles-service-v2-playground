import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@esri/calcite-components-react', async () => {
  return {
    CalciteLabel: ({ children, ...props }) => <label {...props}>{children}</label>,
    CalciteLink: ({ children, ...props }) => <a {...props}>{children}</a>,
    CalciteRadioButton: (props) => <input type="radio" readOnly {...props} />,
    CalciteRadioButtonGroup: ({ children, onCalciteRadioButtonGroupChange, ...props }) => (
      <div
        {...props}
        onChange={(event) => {
          onCalciteRadioButtonGroupChange?.(event);
        }}
      >
        {children}
      </div>
    ),
    CalciteTooltip: ({ children }) => <span>{children}</span>,
  };
});

import { ParameterControls } from './ParameterControls';

const DEFAULT_PARAMETERS = {
  language: 'global',
  worldview: '',
  places: 'none',
};

describe('ParameterControls', () => {
  it('shows loading capability messaging while selected style metadata is unresolved', () => {
    render(
      <ParameterControls
        selectedStyle={null}
        selectedStyleName="arcgis/imagery"
        styleCatalogLoaded={false}
        parameters={DEFAULT_PARAMETERS}
        onChange={() => {}}
      />
    );

    expect(screen.getAllByText('Loading style capabilities for selected style.')).toHaveLength(3);
    expect(screen.queryByText('This style does not support language changes.')).not.toBeInTheDocument();
    expect(screen.queryByText('⚠')).not.toBeInTheDocument();
  });

  it('shows unsupported messaging when catalog is loaded and style capability is unavailable', () => {
    render(
      <ParameterControls
        selectedStyle={null}
        selectedStyleName="arcgis/imagery"
        styleCatalogLoaded
        parameters={DEFAULT_PARAMETERS}
        onChange={() => {}}
        section="worldview"
      />
    );

    expect(screen.getByText('This style does not support worldview capability.')).toBeInTheDocument();
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('marks hydrated language/worldview/places radios as checked', () => {
    render(
      <ParameterControls
        selectedStyle={{
          styleUrl: 'https://example.com/styles/arcgis/imagery{?language}{?worldview}{?places}',
          supportedLanguageCodes: ['global', 'ca', 'en'],
        }}
        selectedStyleName="arcgis/imagery"
        styleCatalogLoaded
        parameters={{ language: 'ca', worldview: 'china', places: 'all' }}
        onChange={() => {}}
        capabilities={{
          languages: [
            { code: 'global', name: 'Global' },
            { code: 'ca', name: 'Catalan' },
            { code: 'en', name: 'English' },
          ],
          worldviews: [{ code: 'china', name: 'China' }],
          places: [{ code: 'all', name: 'All' }],
        }}
      />
    );

    expect(screen.getByRole('radio', { name: 'Catalan' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'China' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
  });
});
