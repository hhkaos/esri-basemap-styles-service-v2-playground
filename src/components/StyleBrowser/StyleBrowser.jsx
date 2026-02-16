import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalciteBlock,
  CalciteButton,
  CalciteChip,
  CalciteDialog,
  CalciteInputText,
  CalciteLabel,
  CalciteLoader,
  CalciteNotice,
} from '@esri/calcite-components-react';
import { getCapabilities } from '../../services/capabilitiesService';
import { getStyleCatalog } from '../../services/styleService';
import './StyleBrowser.css';

const DEFAULT_PLAYGROUND_TOKEN = (import.meta.env.VITE_DEFAULT_PLAYGROUND_API_KEY || '').trim();
const THUMBNAIL_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23dde6ef'/%3E%3Ctext x='160' y='95' text-anchor='middle' fill='%235f6368' font-size='16' font-family='Arial'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";

function getInputValue(event) {
  return event?.target?.value ?? event?.detail?.value ?? '';
}

function getStyleId(style) {
  return style?.path || style?.id || style?.name || '';
}

function getStyleLabel(style) {
  return style?.name || style?.path || style?.id || 'Unnamed style';
}

function getStyleThumbnail(style) {
  return style?.thumbnailUrl || style?.thumbnail || THUMBNAIL_FALLBACK;
}

/**
 * @param {Object} props
 * @param {string} [props.selectedStyleName]
 * @param {(styleName: string) => void} [props.onStyleSelect]
 * @param {(style: Object) => void} [props.onStyleMetaChange]
 * @param {(capabilities: Object) => void} [props.onCapabilitiesLoad]
 */
export function StyleBrowser({ selectedStyleName, onStyleSelect, onStyleMetaChange, onCapabilitiesLoad }) {
  const [filter, setFilter] = useState('');
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const autoLoadedRef = useRef(false);

  const filteredStyles = useMemo(() => {
    if (!filter.trim()) {
      return styles;
    }

    const query = filter.trim().toLowerCase();
    return styles.filter((style) => {
      const haystack = [style?.name, style?.provider, style?.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [styles, filter]);

  const selectStyle = useCallback(
    (style) => {
      const styleName = getStyleId(style);
      if (!styleName) {
        return;
      }
      onStyleSelect?.(styleName);
      onStyleMetaChange?.(style);
    },
    [onStyleSelect, onStyleMetaChange]
  );

  const loadStyles = useCallback(
    async ({ forceRefresh = false } = {}) => {
      if (!DEFAULT_PLAYGROUND_TOKEN) {
        setError('Missing VITE_DEFAULT_PLAYGROUND_API_KEY. Add it to .env for playground preview.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [styleResult, capabilitiesResult] = await Promise.all([
          getStyleCatalog({ token: DEFAULT_PLAYGROUND_TOKEN, forceRefresh }),
          getCapabilities({ token: DEFAULT_PLAYGROUND_TOKEN, forceRefresh }).catch((err) => {
            console.warn('Failed to load capabilities:', err.message);
            return null;
          }),
        ]);

        const nextStyles = Array.isArray(styleResult.styles) ? styleResult.styles : [];
        setStyles(nextStyles);
        console.info('Style catalog source:', styleResult.source);

        if (capabilitiesResult) {
          console.info('Capabilities source:', capabilitiesResult.source);
          onCapabilitiesLoad?.(capabilitiesResult);
        }

        if (!selectedStyleName && nextStyles.length > 0) {
          selectStyle(nextStyles[0]);
        }
      } catch (err) {
        setError(`Unable to load styles: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [selectedStyleName, selectStyle, onCapabilitiesLoad]
  );

  useEffect(() => {
    if (autoLoadedRef.current) {
      return;
    }

    autoLoadedRef.current = true;
    loadStyles();
  }, [loadStyles]);

  function renderStyleItems({ inDialog = false } = {}) {
    return filteredStyles.map((style, index) => {
      const styleId = getStyleId(style);
      const styleLabel = getStyleLabel(style);
      const selected = styleId === selectedStyleName;

      return (
        <button
          key={styleId || `style-${index}`}
          type="button"
          className={`style-browser-item ${selected ? 'style-browser-item-selected' : ''}`}
          onClick={() => selectStyle(style)}
        >
          <img
            className={`style-browser-thumbnail ${inDialog ? 'style-browser-thumbnail-large' : ''}`}
            src={getStyleThumbnail(style)}
            alt={`${styleLabel} thumbnail`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = THUMBNAIL_FALLBACK;
            }}
          />
          <h3>{styleLabel}</h3>
          <div className="style-browser-meta">
            {style?.provider ? <CalciteChip scale="s">{style.provider}</CalciteChip> : null}
            {style?.category ? (
              <CalciteChip scale="s" appearance="outline">
                {style.category}
              </CalciteChip>
            ) : null}
            {style?.dataType ? (
              <CalciteChip scale="s" appearance="outline-fill">
                {style.dataType}
              </CalciteChip>
            ) : null}
          </div>
        </button>
      );
    });
  }

  return (
    <div className="style-browser-panel">
      <CalciteBlock heading="Controls" expanded>
        <div className="style-browser-controls">
          <CalciteLabel className="style-browser-inline-label" layout="inline">
            Filter
            <CalciteInputText
              id="filter-input"
              name="filter-input"
              placeholder="Filter by name, provider, or category"
              value={filter}
              onCalciteInputTextInput={(event) => setFilter(getInputValue(event))}
            />
          </CalciteLabel>
          <div className="style-browser-actions">
            <CalciteButton onClick={() => loadStyles()} disabled={loading} scale="s">
              Load Styles
            </CalciteButton>
            {error ? (
              <CalciteButton
                appearance="outline"
                onClick={() => loadStyles({ forceRefresh: true })}
                disabled={loading}
                scale="s"
              >
                Refresh
              </CalciteButton>
            ) : null}
          </div>
        </div>
      </CalciteBlock>

      {loading ? (
        <div className="style-browser-loading" aria-live="polite">
          <CalciteLoader inline />
          <span>Loading styles...</span>
        </div>
      ) : null}

      {error ? (
        <CalciteNotice open kind="danger" icon>
          <div slot="title">Style loading issue</div>
          <div slot="message">{error}</div>
        </CalciteNotice>
      ) : null}

      <CalciteBlock heading="Styles" expanded className="style-browser-grid-block">
        <div className="style-browser-summary-row">
          <div className="style-browser-summary">
            <strong>{filteredStyles.length}</strong> style{filteredStyles.length === 1 ? '' : 's'}
          </div>
          <CalciteButton appearance="transparent" scale="s" onClick={() => setExpanded(true)}>
            Expand View
          </CalciteButton>
        </div>

        <div className="style-browser-list-container">
          <div className="style-browser-list">{renderStyleItems()}</div>
          {!loading && !filteredStyles.length ? (
            <p className="style-browser-empty">No styles to display. Load styles and adjust filters.</p>
          ) : null}
        </div>
      </CalciteBlock>

      <CalciteDialog heading="All Styles" open={expanded} onCalciteDialogClose={() => setExpanded(false)}>
        <div className="style-browser-dialog-grid">{renderStyleItems({ inDialog: true })}</div>
        <CalciteButton slot="footer-end" onClick={() => setExpanded(false)}>
          Close
        </CalciteButton>
      </CalciteDialog>
    </div>
  );
}
