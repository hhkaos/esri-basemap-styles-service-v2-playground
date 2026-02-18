import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@esri/calcite-components-react', async () => {
  return {
    CalciteButton: ({ children, onClick, disabled, ...props }) => {
      const buttonProps = { ...props };
      delete buttonProps.iconStart;
      delete buttonProps.width;
      delete buttonProps.kind;
      delete buttonProps.appearance;

      return (
        <button type="button" onClick={onClick} disabled={disabled} {...buttonProps}>
          {children}
        </button>
      );
    },
    CalciteInput: ({ onCalciteInputInput, ...props }) => (
      <input
        {...props}
        onInput={(event) => {
          onCalciteInputInput?.(event);
        }}
      />
    ),
    CalciteRadioButtonGroup: ({ children, onCalciteRadioButtonGroupChange, ...props }) => {
      const groupProps = { ...props };
      delete groupProps.layout;
      delete groupProps.scale;
      delete groupProps.value;

      return (
        <div
          {...groupProps}
          onChange={(event) => {
            onCalciteRadioButtonGroupChange?.(event);
          }}
        >
          {children}
        </div>
      );
    },
    CalciteRadioButton: ({ onCalciteRadioButtonChange, ...props }) => (
      <input
        type="radio"
        {...props}
        onChange={(event) => {
          onCalciteRadioButtonChange?.(event);
        }}
      />
    ),
    CalciteLabel: ({ children, ...props }) => <label {...props}>{children}</label>,
    CalciteLink: ({ children, ...props }) => <a {...props}>{children}</a>,
  };
});

import { CodeGenerator } from './CodeGenerator';

const DEFAULT_PARAMETERS = {
  language: 'global',
  worldview: '',
  places: 'none',
};

function moveFromStep2ToStep3WithLibrary(libraryValue = 'maplibre') {
  fireEvent.click(screen.getByDisplayValue(libraryValue));
  fireEvent.click(screen.getByTestId('codegen-step-next'));
}

function moveToStep3(libraryValue = 'maplibre') {
  fireEvent.click(screen.getByTestId('codegen-step-next'));
  moveFromStep2ToStep3WithLibrary(libraryValue);
}

describe('CodeGenerator', () => {
  beforeEach(() => {
    CodeGenerator.__resetMemoryForTests?.();
  });

  it('starts at step 1 and shows exported parameter checkboxes', () => {
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Include Style')).toBeChecked();
    expect(screen.getByLabelText('Include Language')).toBeChecked();
    expect(screen.getByLabelText('Include Worldview')).toBeChecked();
    expect(screen.getByLabelText('Include Places')).toBeChecked();
    expect(screen.getByLabelText('Include Current map location')).toBeChecked();
  });

  it('navigates through the 4-step flow', () => {
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    fireEvent.click(screen.getByTestId('codegen-step-next'));
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();

    moveFromStep2ToStep3WithLibrary('maplibre');
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();

    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));
    expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('codegen-step-back'));
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
  });

  it('requires selecting a library on step 2 before next is enabled', () => {
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    fireEvent.click(screen.getByTestId('codegen-step-next'));
    const nextButton = screen.getByTestId('codegen-step-next');
    expect(nextButton).toHaveAttribute('disabled');

    fireEvent.click(screen.getByDisplayValue('maplibre'));
    expect(screen.getByTestId('codegen-step-next')).not.toHaveAttribute('disabled');
  });

  it('keeps selected library checked when navigating to step 3 and back to step 2', () => {
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    fireEvent.click(screen.getByTestId('codegen-step-next'));
    fireEvent.click(screen.getByDisplayValue('leaflet'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('codegen-step-back'));
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(screen.getByDisplayValue('leaflet')).toBeChecked();
    expect(screen.getByDisplayValue('maplibre')).not.toBeChecked();
  });

  it('requires entering an API key on step 3 before next is enabled', () => {
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    moveToStep3('maplibre');
    const nextButton = screen.getByTestId('codegen-step-next');
    expect(nextButton).toHaveAttribute('disabled');

    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    expect(screen.getByTestId('codegen-step-next')).toHaveAttribute('disabled');

    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    expect(screen.getByTestId('codegen-step-next')).not.toHaveAttribute('disabled');
  });

  it('shows token CTA on step 3 and requires token acknowledgement before next is enabled', () => {
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    moveToStep3('maplibre');
    expect(screen.getByText('Need an API key?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Free Account' })).toHaveAttribute(
      'href',
      'https://developers.arcgis.com/sign-up/'
    );
    expect(screen.getByRole('button', { name: 'Create and configure an API key tutorial' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=h68pd449wd4'
    );
    expect(screen.getByRole('button', { name: 'Intro to API key documentation' })).toHaveAttribute(
      'href',
      'https://developers.arcgis.com/documentation/security-and-authentication/api-key-authentication/'
    );

    const ctaCard = screen.getByText('Need an API key?').closest('.code-generator-cta-card');
    expect(ctaCard).not.toBeNull();
    const ctaButtons = within(ctaCard).getAllByRole('button');
    expect(ctaButtons.map((button) => button.textContent)).toEqual([
      'Create Free Account',
      'Create and configure an API key tutorial',
      'Intro to API key documentation',
    ]);

    expect(screen.getByTestId('codegen-step-next')).toHaveAttribute('disabled');

    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    expect(screen.getByTestId('codegen-step-next')).toHaveAttribute('disabled');

    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    expect(screen.getByTestId('codegen-step-next')).not.toHaveAttribute('disabled');
  });

  it('enables export actions when token is entered on step 3', () => {
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    moveToStep3('maplibre');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));

    fireEvent.click(screen.getByTestId('codegen-step-next'));
    expect(screen.getByTestId('codegen-export-codepen')).not.toHaveAttribute('disabled');
    expect(screen.getByTestId('codegen-export-download')).not.toHaveAttribute('disabled');
  });

  it('keeps export actions disabled when no style is selected and style export is enabled', () => {
    render(<CodeGenerator selectedStyleName="" parameters={DEFAULT_PARAMETERS} />);

    moveToStep3('maplibre');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));

    expect(screen.getByText('Select a style (or uncheck Style in step 1) before exporting code.')).toBeInTheDocument();
    expect(screen.getByTestId('codegen-export-codepen')).toHaveAttribute('disabled');
    expect(screen.getByTestId('codegen-export-download')).toHaveAttribute('disabled');
  });

  it('allows export with default style when style parameter is unchecked', () => {
    let submittedData = '';
    const submitMock = vi.spyOn(window.HTMLFormElement.prototype, 'submit').mockImplementation(function submit() {
      submittedData = this.querySelector('input[name="data"]')?.value || '';
    });

    render(<CodeGenerator selectedStyleName="" parameters={DEFAULT_PARAMETERS} />);

    fireEvent.click(screen.getByLabelText('Include Style'));
    moveToStep3('maplibre');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));

    fireEvent.click(screen.getByTestId('codegen-export-codepen'));

    expect(submittedData).toContain("const basemapStyleId = 'arcgis/navigation';");
    submitMock.mockRestore();
  });

  it('toggles API key visibility with the icon button on step 3', () => {
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    moveToStep3('maplibre');

    const tokenInput = screen.getByTestId('codegen-token-input');
    const toggle = screen.getByTestId('codegen-token-toggle');

    expect(tokenInput).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-label', 'Show API key');

    fireEvent.click(toggle);

    expect(screen.getByTestId('codegen-token-input')).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-label', 'Hide API key');
  });

  it('uses the Leaflet template and excludes unchecked parameters', () => {
    let submittedData = '';
    const submitMock = vi.spyOn(window.HTMLFormElement.prototype, 'submit').mockImplementation(function submit() {
      submittedData = this.querySelector('input[name="data"]')?.value || '';
    });

    render(
      <CodeGenerator
        selectedStyleName="arcgis/navigation"
        parameters={{ language: 'es', worldview: 'india', places: 'all' }}
        viewport={{ center: [12.5, 41.9], zoom: 7 }}
      />
    );

    fireEvent.click(screen.getByLabelText('Include Worldview'));
    fireEvent.click(screen.getByLabelText('Include Places'));

    fireEvent.click(screen.getByTestId('codegen-step-next'));
    moveFromStep2ToStep3WithLibrary('leaflet');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));
    fireEvent.click(screen.getByTestId('codegen-export-codepen'));

    expect(submittedData).toContain('esri-leaflet-vector');
    expect(submittedData).toContain("const basemapStyle = 'arcgis/navigation';");
    expect(submittedData).toContain("const accessToken = 'abc123';");
    expect(submittedData).toContain("const language = 'es';");
    expect(submittedData).toContain("const worldview = '';");
    expect(submittedData).toContain("const places = 'none';");
    expect(submittedData).toContain('map.setView([41.9, 12.5], 6);');
    expect(submittedData).toContain("const map = L.map('map');");
    expect(submittedData).toContain('vectorBasemapLayer(basemapStyle, layerOptions)');
    expect(submittedData).toContain('version: 2');
    expect(submittedData).not.toContain('vectorTileLayer(');

    submitMock.mockRestore();
  });

  it('uses ArcGIS JS SDK template and includes map components recommendation comment when places is none', () => {
    let submittedData = '';
    const submitMock = vi.spyOn(window.HTMLFormElement.prototype, 'submit').mockImplementation(function submit() {
      submittedData = this.querySelector('input[name="data"]')?.value || '';
    });

    render(
      <CodeGenerator
        selectedStyleName="arcgis/imagery"
        parameters={{ language: 'ca', worldview: 'china', places: 'none' }}
        viewport={{ center: [37.8, 30.3], zoom: 6.84 }}
      />
    );

    fireEvent.click(screen.getByTestId('codegen-step-next'));
    moveFromStep2ToStep3WithLibrary('arcgis-js-sdk');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));
    fireEvent.click(screen.getByTestId('codegen-export-codepen'));

    const payload = JSON.parse(submittedData);
    const html = payload.html;

    expect(html).toContain('@arcgis/core/Map.js');
    expect(html).toContain("esriConfig.apiKey = 'abc123';");
    expect(html).toContain("id: 'arcgis/imagery'");
    expect(html).toContain("const places = 'none';");
    expect(html).not.toContain('id="map-components-note"');
    expect(html).toContain('If places is "none" and you only need map display');
    expect(html).toContain('tutorials/display-a-map/');

    submitMock.mockRestore();
  });

  it('uses OpenLayers template with style URL parameters and Esri attribution', () => {
    let submittedData = '';
    const submitMock = vi.spyOn(window.HTMLFormElement.prototype, 'submit').mockImplementation(function submit() {
      submittedData = this.querySelector('input[name="data"]')?.value || '';
    });

    render(
      <CodeGenerator
        selectedStyleName="arcgis/navigation"
        parameters={{ language: 'ca', worldview: 'china', places: 'all' }}
        viewport={{ center: [48.879, 35.7088], zoom: 3 }}
      />
    );

    fireEvent.click(screen.getByTestId('codegen-step-next'));
    moveFromStep2ToStep3WithLibrary('openlayers');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));
    fireEvent.click(screen.getByTestId('codegen-export-codepen'));

    const payload = JSON.parse(submittedData);
    const html = payload.html;

    expect(html).toContain('cdn.jsdelivr.net/npm/ol@v10.8.0');
    expect(html).toContain('ol-mapbox-style@13.2.1');
    expect(html).toContain("const basemapStyle = 'arcgis/navigation';");
    expect(html).toContain("styleUrl.searchParams.set('token', accessToken);");
    expect(html).toContain("styleUrl.searchParams.set('language', language);");
    expect(html).toContain("styleUrl.searchParams.set('worldview', worldview);");
    expect(html).toContain("styleUrl.searchParams.set('places', places);");
    expect(html).toContain('olms.apply(map, styleUrl.toString())');
    expect(html).toContain('Powered by <a href=');
    expect(html).toContain('center: ol.proj.fromLonLat([48.879, 35.7088])');

    submitMock.mockRestore();
  });

  it('shows CesiumJS as disabled with a coming-soon tooltip', () => {
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    fireEvent.click(screen.getByTestId('codegen-step-next'));
    const cesiumRadio = screen.getByDisplayValue('cesium-js');

    expect(cesiumRadio).toHaveAttribute('disabled');
    expect(screen.getByText('CesiumJS (Coming soon)')).toBeInTheDocument();
    expect(screen.getByText('CesiumJS (Coming soon)').closest('label')).toHaveAttribute(
      'title',
      'Available soon when static basemap tiles are fully supported by the playground.'
    );
  });

  it('uses default viewport when current map location is unchecked', () => {
    let submittedData = '';
    const submitMock = vi.spyOn(window.HTMLFormElement.prototype, 'submit').mockImplementation(function submit() {
      submittedData = this.querySelector('input[name="data"]')?.value || '';
    });

    render(
      <CodeGenerator
        selectedStyleName="arcgis/navigation"
        parameters={DEFAULT_PARAMETERS}
        viewport={{ center: [-3.7038, 40.4168], zoom: 9 }}
      />
    );

    fireEvent.click(screen.getByLabelText('Include Current map location'));
    moveToStep3('maplibre');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));
    fireEvent.click(screen.getByTestId('codegen-export-codepen'));

    expect(submittedData).toContain('center: [0, 30]');
    expect(submittedData).toContain('zoom: 2');

    submitMock.mockRestore();
  });

  it('shows "Default (...)" in summary for parameters excluded in step 1', () => {
    render(
      <CodeGenerator
        selectedStyleName="arcgis/navigation"
        parameters={{ language: 'es', worldview: 'india', places: 'all' }}
        viewport={{ center: [12.5, 41.9], zoom: 7 }}
      />
    );

    fireEvent.click(screen.getByLabelText('Include Worldview'));
    fireEvent.click(screen.getByLabelText('Include Current map location'));
    moveToStep3('maplibre');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));

    expect(screen.getByText('Default (global)')).toBeInTheDocument();
    expect(screen.getByText('Default (Lng 0.0000, Lat 30.0000, Zoom 2.00)')).toBeInTheDocument();
  });

  it('creates and revokes a blob URL when download is clicked', () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const createObjectURLMock = vi.fn(() => 'blob:test');
    const revokeObjectURLMock = vi.fn();
    const clickMock = vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    URL.createObjectURL = createObjectURLMock;
    URL.revokeObjectURL = revokeObjectURLMock;

    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    moveToStep3('maplibre');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));
    fireEvent.click(screen.getByTestId('codegen-export-download'));

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);

    clickMock.mockRestore();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('opens share panel flow from step 4', () => {
    const onOpenSharePanel = vi.fn();
    render(
      <CodeGenerator
        selectedStyleName="arcgis/navigation"
        parameters={{ language: 'en', worldview: '', places: 'none' }}
        viewport={{ center: [-3.7038, 40.4168], zoom: 9 }}
        onOpenSharePanel={onOpenSharePanel}
      />
    );

    moveToStep3('maplibre');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));
    fireEvent.click(screen.getByTestId('codegen-share-copy'));

    expect(onOpenSharePanel).toHaveBeenCalledTimes(1);
  });

  it('disables share action when no style is selected', () => {
    render(<CodeGenerator selectedStyleName="" parameters={DEFAULT_PARAMETERS} />);

    moveToStep3('maplibre');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));
    fireEvent.click(screen.getByTestId('codegen-step-next'));

    expect(screen.getByTestId('codegen-share-copy')).toHaveAttribute('disabled');
    expect(screen.getByText('Select a style before creating a share link.')).toBeInTheDocument();
  });

  it('preserves entered state across unmount and remount', () => {
    const { unmount } = render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    moveToStep3('maplibre');
    fireEvent.input(screen.getByTestId('codegen-token-input'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByLabelText('I confirm I read and understood the API key security warning'));

    unmount();
    render(<CodeGenerator selectedStyleName="arcgis/navigation" parameters={DEFAULT_PARAMETERS} />);

    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
    expect(screen.getByTestId('codegen-token-input')).toHaveValue('abc123');
    expect(screen.getByLabelText('I confirm I read and understood the API key security warning')).toBeChecked();
  });

  it('starts on step 3 when shared preset includes library but excludes API key', () => {
    render(
      <CodeGenerator
        selectedStyleName="arcgis/navigation"
        parameters={DEFAULT_PARAMETERS}
        sharedPreset={{
          selectedLibrary: 'leaflet',
          hasLibrarySelection: true,
          exportOptions: {
            style: true,
            language: true,
            worldview: true,
            places: true,
            location: true,
          },
          currentStep: 3,
        }}
      />
    );

    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('codegen-step-back'));
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(screen.getByDisplayValue('leaflet')).toBeChecked();
    fireEvent.click(screen.getByTestId('codegen-step-next'));
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
    expect(screen.getByTestId('codegen-token-input')).toHaveValue('');
  });

  it('forces download when shared preset requests it and export is ready', () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const createObjectURLMock = vi.fn(() => 'blob:test');
    const revokeObjectURLMock = vi.fn();
    const clickMock = vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    URL.createObjectURL = createObjectURLMock;
    URL.revokeObjectURL = revokeObjectURLMock;

    render(
      <CodeGenerator
        selectedStyleName="arcgis/navigation"
        parameters={DEFAULT_PARAMETERS}
        sharedPreset={{
          selectedLibrary: 'maplibre',
          hasLibrarySelection: true,
          token: 'abc123',
          hasAcceptedTokenWarning: true,
          currentStep: 4,
          forceDownload: true,
        }}
      />
    );

    expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);

    clickMock.mockRestore();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });
});
