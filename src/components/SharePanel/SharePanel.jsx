import { useEffect, useMemo, useRef, useState } from 'react';
import { CalciteButton } from '@esri/calcite-components-react';
import { generateAndCopySelectiveShareUrl } from '../../services/shareService';
import './SharePanel.css';

const DEFAULT_OPEN_PANEL = 'style-selection';

const OPEN_PANEL_OPTIONS = [
  { value: 'style-selection', label: 'Style Selection' },
  { value: 'language', label: 'Language' },
  { value: 'worldview', label: 'Worldview' },
  { value: 'places', label: 'Places' },
  { value: 'code-generator', label: 'Code Generator' },
  { value: 'share', label: 'Share' },
  { value: 'contact', label: 'Contact' },
];

function createInitialSharePanelMemory() {
  return {
    shareOptions: {
      includeStyle: true,
      includeLanguage: true,
      includeWorldview: true,
      includePlaces: true,
      includeDefaultPanel: true,
    },
    defaultPanel: DEFAULT_OPEN_PANEL,
    codeGeneratorShareOptions: {
      includeExportOptions: true,
      includeLibrary: true,
      includeApiKey: false,
      forceDownload: false,
    },
  };
}

let sharePanelMemory = createInitialSharePanelMemory();

function normalizeOpenPanel(value) {
  return OPEN_PANEL_OPTIONS.some((option) => option.value === value) ? value : DEFAULT_OPEN_PANEL;
}

/**
 * @param {Object} props
 * @param {string} [props.selectedStyleName]
 * @param {{language:string,worldview:string,places:string}} props.parameters
 * @param {{center:[number,number],zoom:number}} props.viewport
 * @param {{
 *  selectedLibrary?:string,
 *  hasLibrarySelection?:boolean,
 *  token?:string,
 *  exportOptions?:Object
 * } | null} [props.codeGeneratorState]
 * @param {{includeDefaultPanel?:boolean,defaultPanel?:string} | null} [props.panelPreset]
 * @param {() => void} [props.onPanelPresetConsumed]
 */
export function SharePanel({
  selectedStyleName,
  parameters,
  viewport,
  codeGeneratorState,
  panelPreset,
  onPanelPresetConsumed,
}) {
  const [shareOptions, setShareOptions] = useState(() => sharePanelMemory.shareOptions);
  const [defaultPanel, setDefaultPanel] = useState(() => sharePanelMemory.defaultPanel);
  const [codeGeneratorShareOptions, setCodeGeneratorShareOptions] = useState(() => sharePanelMemory.codeGeneratorShareOptions);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareStatus, setShareStatus] = useState({ kind: '', message: '' });
  const shareToastTimeoutRef = useRef(0);

  const shouldShowCodeGeneratorFields = shareOptions.includeDefaultPanel && defaultPanel === 'code-generator';
  const hasExportedParameters = Boolean(codeGeneratorState?.exportOptions);
  const hasSelectedLibrary = Boolean(codeGeneratorState?.hasLibrarySelection && codeGeneratorState?.selectedLibrary);
  const hasApiKey = Boolean(codeGeneratorState?.token?.trim());

  const codeGeneratorHints = useMemo(() => {
    if (!codeGeneratorState) {
      return {
        library: 'None selected yet',
        hasToken: false,
      };
    }

    const selectedLibraryLabel =
      codeGeneratorState.hasLibrarySelection && codeGeneratorState.selectedLibrary
        ? codeGeneratorState.selectedLibrary === 'leaflet'
          ? 'Leaflet'
          : 'MapLibre GL JS'
        : 'None selected yet';

    return {
      library: selectedLibraryLabel,
      hasToken: Boolean(codeGeneratorState.token),
    };
  }, [codeGeneratorState]);

  function updateShareOption(key, checked) {
    setShareOptions((current) => ({
      ...current,
      [key]: checked,
    }));
  }

  function updateCodeGeneratorShareOption(key, checked) {
    setCodeGeneratorShareOptions((current) => ({
      ...current,
      [key]: checked,
    }));
  }

  function showShareStatus(kind, message) {
    if (shareToastTimeoutRef.current) {
      window.clearTimeout(shareToastTimeoutRef.current);
    }

    setShareStatus({ kind, message });
    shareToastTimeoutRef.current = window.setTimeout(() => {
      setShareStatus({ kind: '', message: '' });
      shareToastTimeoutRef.current = 0;
    }, 3200);
  }

  useEffect(() => {
    return () => {
      if (shareToastTimeoutRef.current) {
        window.clearTimeout(shareToastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    sharePanelMemory = {
      shareOptions,
      defaultPanel,
      codeGeneratorShareOptions,
    };
  }, [codeGeneratorShareOptions, defaultPanel, shareOptions]);

  useEffect(() => {
    if (!panelPreset) {
      return;
    }

    const hasIncludeDefaultPanel = typeof panelPreset.includeDefaultPanel === 'boolean';
    const hasDefaultPanel = typeof panelPreset.defaultPanel === 'string';

    if (hasIncludeDefaultPanel || hasDefaultPanel) {
      setShareOptions((current) => ({
        ...current,
        includeDefaultPanel: hasIncludeDefaultPanel ? panelPreset.includeDefaultPanel : true,
      }));
    }

    if (hasDefaultPanel) {
      setDefaultPanel(normalizeOpenPanel(panelPreset.defaultPanel));
    }

    onPanelPresetConsumed?.();
  }, [onPanelPresetConsumed, panelPreset]);

  useEffect(() => {
    if (hasExportedParameters && hasSelectedLibrary) {
      return;
    }

    setCodeGeneratorShareOptions((current) => {
      const next = { ...current };
      let changed = false;

      if (!hasExportedParameters && next.includeExportOptions) {
        next.includeExportOptions = false;
        changed = true;
      }

      if (!hasSelectedLibrary && next.includeLibrary) {
        next.includeLibrary = false;
        changed = true;
      }

      return changed ? next : current;
    });
  }, [hasExportedParameters, hasSelectedLibrary]);

  useEffect(() => {
    if (hasApiKey) {
      return;
    }

    setCodeGeneratorShareOptions((current) => {
      if (!current.includeApiKey && !current.forceDownload) {
        return current;
      }

      return {
        ...current,
        includeApiKey: false,
        forceDownload: false,
      };
    });
  }, [hasApiKey]);

  async function handleCopyShareLink() {
    if (shareBusy) {
      return;
    }

    setShareBusy(true);
    try {
      await generateAndCopySelectiveShareUrl({
        styleName: selectedStyleName,
        parameters,
        viewport,
        baseUrl: window.location.origin + window.location.pathname,
        shareOptions: {
          ...shareOptions,
          defaultPanel: shareOptions.includeDefaultPanel ? normalizeOpenPanel(defaultPanel) : '',
          codeGenerator: shouldShowCodeGeneratorFields ? codeGeneratorShareOptions : null,
        },
        codeGeneratorState,
      });
      showShareStatus('success', 'Share link copied to clipboard.');
    } catch (error) {
      showShareStatus('danger', error.message || 'Failed to create share link.');
    } finally {
      setShareBusy(false);
    }
  }

  return (
    <div className="share-panel" aria-live="polite">
      <p className="share-panel-intro">Create a link that reopens the playground with your selected style, settings, and panel state.</p>

      <div className="share-panel-options" role="group" aria-label="Share options">
        <label className="share-panel-option">
          <input
            type="checkbox"
            checked={shareOptions.includeStyle}
            onChange={(event) => updateShareOption('includeStyle', Boolean(event?.target?.checked))}
            aria-label="Include style"
          />
          <span>Style</span>
        </label>
        <label className="share-panel-option">
          <input
            type="checkbox"
            checked={shareOptions.includeLanguage}
            onChange={(event) => updateShareOption('includeLanguage', Boolean(event?.target?.checked))}
            aria-label="Include language"
          />
          <span>Language</span>
        </label>
        <label className="share-panel-option">
          <input
            type="checkbox"
            checked={shareOptions.includeWorldview}
            onChange={(event) => updateShareOption('includeWorldview', Boolean(event?.target?.checked))}
            aria-label="Include worldview"
          />
          <span>Worldview</span>
        </label>
        <label className="share-panel-option">
          <input
            type="checkbox"
            checked={shareOptions.includePlaces}
            onChange={(event) => updateShareOption('includePlaces', Boolean(event?.target?.checked))}
            aria-label="Include places"
          />
          <span>Places</span>
        </label>
        <label className="share-panel-option">
          <input
            type="checkbox"
            checked={shareOptions.includeDefaultPanel}
            onChange={(event) => updateShareOption('includeDefaultPanel', Boolean(event?.target?.checked))}
            aria-label="Include default action or menu"
          />
          <span>Default action/menu visible on open</span>
        </label>
      </div>

      {shareOptions.includeDefaultPanel ? (
        <div className="share-panel-dropdown-row">
          <label htmlFor="share-open-panel">Open this panel by default</label>
          <select
            id="share-open-panel"
            className="share-panel-dropdown"
            value={defaultPanel}
            onChange={(event) => setDefaultPanel(normalizeOpenPanel(event?.target?.value))}
          >
            {OPEN_PANEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {shouldShowCodeGeneratorFields ? (
        <div className="share-panel-code-generator">
          <p className="share-panel-code-generator-title">Code Generator Share Options</p>
          <label className="share-panel-option">
            <input
              type="checkbox"
              checked={codeGeneratorShareOptions.includeExportOptions}
              onChange={(event) =>
                updateCodeGeneratorShareOption('includeExportOptions', Boolean(event?.target?.checked))
              }
              aria-label="Include code generator exported parameters"
              disabled={!hasExportedParameters}
            />
            <span>Include exported parameters (step 1)</span>
          </label>
          <label className="share-panel-option">
            <input
              type="checkbox"
              checked={codeGeneratorShareOptions.includeLibrary}
              onChange={(event) => updateCodeGeneratorShareOption('includeLibrary', Boolean(event?.target?.checked))}
              aria-label="Include client library"
              disabled={!hasSelectedLibrary}
            />
            <span>Include selected client library (step 2)</span>
          </label>
          <p className="share-panel-note">Current library: {codeGeneratorHints.library}</p>
          <label className="share-panel-option">
            <input
              type="checkbox"
              checked={codeGeneratorShareOptions.includeApiKey}
              onChange={(event) => updateCodeGeneratorShareOption('includeApiKey', Boolean(event?.target?.checked))}
              aria-label="Include API key"
              disabled={!hasApiKey}
            />
            <span>Include API key (step 3, unchecked by default)</span>
          </label>
          <p className="share-panel-note">API key currently entered: {codeGeneratorHints.hasToken ? 'Yes' : 'No'}</p>
          <label className="share-panel-option">
            <input
              type="checkbox"
              checked={codeGeneratorShareOptions.forceDownload}
              onChange={(event) => updateCodeGeneratorShareOption('forceDownload', Boolean(event?.target?.checked))}
              aria-label="Force download"
              disabled={!hasApiKey}
            />
            <span>Force download when opening link</span>
          </label>
        </div>
      ) : null}

      <CalciteButton width="full" iconStart="share" disabled={shareBusy} onClick={handleCopyShareLink}>
        {shareBusy ? 'Copying Link...' : 'Copy Share Link'}
      </CalciteButton>

      {shareStatus.message ? (
        <div className={`share-panel-toast share-panel-toast-${shareStatus.kind}`} role="status" aria-live="polite">
          {shareStatus.message}
        </div>
      ) : null}
    </div>
  );
}
