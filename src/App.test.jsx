import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createContext, useContext, useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@esri/calcite-components-react', async () => {
  const RadioGroupValueContext = createContext('');

  return {
    CalciteAction: ({ text, onClick, active }) => (
      <button type="button" data-active={active ? 'true' : 'false'} onClick={onClick}>
        {text}
      </button>
    ),
    CalciteActionBar: ({ children }) => <div>{children}</div>,
    CalciteBlock: ({ children }) => <div>{children}</div>,
    CalciteButton: ({ children, onClick }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    CalciteIcon: () => <span aria-hidden="true" />,
    CalciteLink: ({ children, ...props }) => <a {...props}>{children}</a>,
    CalciteNavigation: ({ children }) => <div>{children}</div>,
    CalcitePanel: ({ children, heading, hidden }) => (
      <section aria-label={heading || 'panel'} hidden={hidden}>
        {children}
      </section>
    ),
    CalciteLabel: ({ children, ...props }) => <label {...props}>{children}</label>,
    CalciteRadioButtonGroup: ({ children, value, onCalciteRadioButtonGroupChange, ...props }) => (
      <RadioGroupValueContext.Provider value={value || ''}>
        <div
          {...props}
          onChange={(event) => {
            onCalciteRadioButtonGroupChange?.(event);
          }}
        >
          {children}
        </div>
      </RadioGroupValueContext.Provider>
    ),
    CalciteRadioButton: ({ value, ...props }) => {
      const groupValue = useContext(RadioGroupValueContext);
      return <input type="radio" value={value} checked={groupValue === value} readOnly {...props} />;
    },
    CalciteTooltip: ({ children }) => <span>{children}</span>,
    CalciteShell: ({ children }) => <div>{children}</div>,
    CalciteShellPanel: ({ children }) => <div>{children}</div>,
  };
});

vi.mock('./services/shareService', async () => {
  return {
    parseSharedConfigFromUrl: vi.fn(() => ({
      style: 'arcgis/imagery',
      parameters: {
        language: 'ca',
        worldview: 'china',
        places: 'all',
      },
      ui: { panel: 'code-generator' },
      codeGenerator: {
        selectedLibrary: 'leaflet',
        hasLibrarySelection: true,
      },
      viewport: {
        center: [0, 30],
        zoom: 2,
      },
    })),
  };
});

vi.mock('./components/StyleBrowser/StyleBrowser', async () => {
  function MockStyleBrowser({ onCapabilitiesLoad, onCatalogLoadComplete, onStyleMetaChange }) {
    useEffect(() => {
      onCapabilitiesLoad?.({
        languages: [
          { code: 'global', name: 'Global' },
          { code: 'ca', name: 'Catalan' },
        ],
        worldviews: [{ code: 'china', name: 'China' }],
        places: [{ code: 'all', name: 'All' }],
      });
      onStyleMetaChange?.({
        styleUrl: 'https://example.com/styles/arcgis/imagery{?language}{?worldview}{?places}',
        supportedLanguageCodes: ['global', 'ca'],
      });
      onCatalogLoadComplete?.(true);
    }, [onCapabilitiesLoad, onCatalogLoadComplete, onStyleMetaChange]);

    return <div data-testid="style-browser-loader" />;
  }

  return {
    StyleBrowser: MockStyleBrowser,
  };
});

vi.mock('./components/CodeGenerator/CodeGenerator', async () => {
  return {
    CodeGenerator: () => <div data-testid="code-generator-panel" />,
  };
});

vi.mock('./components/SharePanel/SharePanel', async () => {
  return {
    SharePanel: () => <div data-testid="share-panel" />,
  };
});

vi.mock('./components/MapViewer/MapViewer', async () => {
  return {
    MapViewer: () => <div data-testid="map-viewer" />,
  };
});

import App from './App';

describe('App shared-link hydration', () => {
  it('keeps StyleBrowser mounted for metadata/capabilities hydration when opening directly on Code Generator', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByTestId('style-browser-loader')).toBeInTheDocument();
    expect(screen.getByTestId('code-generator-panel')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Language' }));
    expect(screen.getByRole('radio', { name: 'Catalan' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Worldview' }));
    expect(screen.getByRole('radio', { name: 'China' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Places' }));
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
  });
});
