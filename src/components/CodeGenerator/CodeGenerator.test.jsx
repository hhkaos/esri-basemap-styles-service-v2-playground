import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
    CalciteRadioButton: (props) => <input type="radio" {...props} />,
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
});
