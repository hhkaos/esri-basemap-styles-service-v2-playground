import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalciteButton,
  CalciteChip,
  CalciteInputText,
  CalciteLabel,
  CalciteLoader,
  CalciteNotice,
  CalcitePanel,
} from '@esri/calcite-components-react';
import { getStyleCatalog } from '../../services/styleService';
import './StyleBrowser.css';

const DEFAULT_PLAYGROUND_TOKEN = (import.meta.env.VITE_DEFAULT_PLAYGROUND_API_KEY || '').trim();

function getInputValue(event) {
  return event?.target?.value ?? event?.detail?.value ?? '';
}

function normalizeStyleName(style) {
  return style?.name || style?.id || 'Unnamed style';
}

export function StyleBrowser() {
  const [token, setToken] = useState(DEFAULT_PLAYGROUND_TOKEN);
  const [filter, setFilter] = useState('');
  const [styles, setStyles] = useState([]);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const autoLoadedRef = useRef(false);

  const filteredStyles = useMemo(() => {
    if (!filter.trim()) {
      return styles;
    }

    const query = filter.trim().toLowerCase();
    return styles.filter((style) => {
      const haystack = [style?.name, style?.provider, style?.category].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [styles, filter]);

  const loadStyles = useCallback(async ({ forceRefresh = false, tokenOverride } = {}) => {
    const effectiveToken = (tokenOverride ?? token).trim();

    if (!effectiveToken) {
      setError('Enter an API token to load styles from /self.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await getStyleCatalog({ token: effectiveToken, forceRefresh });
      const nextStyles = Array.isArray(result.styles) ? result.styles : [];
      setStyles(nextStyles);
      setSource(result.source);
    } catch (err) {
      setError(`Unable to load styles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!DEFAULT_PLAYGROUND_TOKEN || autoLoadedRef.current) {
      return;
    }

    autoLoadedRef.current = true;
    loadStyles({ tokenOverride: DEFAULT_PLAYGROUND_TOKEN });
  }, [loadStyles]);

  return (
    <CalcitePanel heading="Style Browser" className="style-browser-panel">
      <div className="style-browser-controls">
        <CalciteLabel className="style-browser-label">
          API Token
          <CalciteInputText
            id="token-input"
            name="token-input"
            placeholder="Paste ArcGIS API token"
            type="password"
            value={token}
            onCalciteInputTextInput={(event) => setToken(getInputValue(event))}
          />
        </CalciteLabel>
        {DEFAULT_PLAYGROUND_TOKEN ? (
          <p className="style-browser-key-note">
            Using default playground key from <code>VITE_DEFAULT_PLAYGROUND_API_KEY</code>. You can override it here.
          </p>
        ) : null}
        <div className="style-browser-actions">
          <CalciteButton onClick={() => loadStyles()} disabled={loading}>
            Load Styles
          </CalciteButton>
          <CalciteButton appearance="outline" onClick={() => loadStyles({ forceRefresh: true })} disabled={loading}>
            Refresh
          </CalciteButton>
        </div>
        <CalciteLabel className="style-browser-label">
          Filter
          <CalciteInputText
            id="filter-input"
            name="filter-input"
            placeholder="Filter by name, provider, or category"
            value={filter}
            onCalciteInputTextInput={(event) => setFilter(getInputValue(event))}
          />
        </CalciteLabel>
      </div>

      {loading ? (
        <div className="style-browser-loading" aria-live="polite">
          <CalciteLoader inline />
          <span>Loading styles...</span>
        </div>
      ) : null}

      {error ? (
        <CalciteNotice open kind="danger" icon>
          <div slot="title">Style loading failed</div>
          <div slot="message">{error}</div>
        </CalciteNotice>
      ) : null}

      <div className="style-browser-summary">
        <strong>{filteredStyles.length}</strong> style{filteredStyles.length === 1 ? '' : 's'}
        {source ? <span className="style-browser-source">Source: {source}</span> : null}
      </div>

      <div className="style-browser-list">
        {filteredStyles.map((style) => (
          <article key={normalizeStyleName(style)} className="style-browser-item">
            <h3>{normalizeStyleName(style)}</h3>
            <div className="style-browser-meta">
              {style?.provider ? <CalciteChip scale="s">{style.provider}</CalciteChip> : null}
              {style?.category ? <CalciteChip scale="s" appearance="outline">{style.category}</CalciteChip> : null}
              {style?.dataType ? <CalciteChip scale="s" appearance="outline-fill">{style.dataType}</CalciteChip> : null}
            </div>
          </article>
        ))}
        {!loading && !filteredStyles.length ? (
          <p className="style-browser-empty">No styles to display. Load styles and adjust filters.</p>
        ) : null}
      </div>
    </CalcitePanel>
  );
}
