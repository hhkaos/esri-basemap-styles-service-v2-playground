import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalciteButton,
  CalciteChip,
  CalciteDialog,
  CalciteInputText,
  CalciteLabel,
  CalciteLoader,
  CalciteNotice,
  CalciteTab,
  CalciteTabNav,
  CalciteTabs,
  CalciteTabTitle,
} from '@esri/calcite-components-react';
import { getCapabilities } from '../../services/capabilitiesService';
import { getStyleCatalog } from '../../services/styleService';
import {
  STYLE_CATEGORY_ORDER,
  getStyleBadges,
  getStyleCategory,
  getStyleFamily,
  getStylePath,
  groupStylesByCategory,
} from '../../utils/styleBrowser';
import './StyleBrowser.css';

const DEFAULT_PLAYGROUND_TOKEN = (import.meta.env.VITE_DEFAULT_PLAYGROUND_API_KEY || '').trim();
const THUMBNAIL_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23dde6ef'/%3E%3Ctext x='160' y='95' text-anchor='middle' fill='%235f6368' font-size='16' font-family='Arial'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
const PRIMARY_STYLE_CATEGORIES = STYLE_CATEGORY_ORDER.slice(0, 5);
const STYLE_CATEGORY_TABS = [
  { value: 'all', label: 'All' },
  ...PRIMARY_STYLE_CATEGORIES.map((category) => ({ value: category, label: category })),
];

function getInputValue(event) {
  return event?.target?.value ?? event?.detail?.value ?? '';
}

function getStyleId(style) {
  return getStylePath(style) || style?.path || style?.id || style?.name || '';
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
  const [selectedFamily, setSelectedFamily] = useState('arcgis');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const autoLoadedRef = useRef(false);

  const filteredStyles = useMemo(() => {
    const query = filter.trim().toLowerCase();

    return styles.filter((style) => {
      const styleId = getStyleId(style);
      const styleFamily = getStyleFamily(styleId, style?.styleUrl || '');
      const category = getStyleCategory(style);
      const matchesCategory = selectedCategory === 'all' ? true : category === selectedCategory;

      if ((styleFamily !== 'unknown' && styleFamily !== selectedFamily) || !matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [style?.name, style?.provider, style?.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [styles, filter, selectedFamily, selectedCategory]);

  const groupedStyles = useMemo(() => groupStylesByCategory(filteredStyles), [filteredStyles]);

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
          const initialStyle = nextStyles.find((style) => Boolean(getStyleId(style))) || nextStyles[0];
          selectStyle(initialStyle);
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

  useEffect(() => {
    if (!styles.length) {
      return;
    }

    const hasSelectedFamily = styles.some(
      (style) => getStyleFamily(getStyleId(style), style?.styleUrl || '') === selectedFamily
    );
    if (!hasSelectedFamily) {
      if (styles.some((style) => getStyleFamily(getStyleId(style), style?.styleUrl || '') === 'arcgis')) {
        setSelectedFamily('arcgis');
      } else if (styles.some((style) => getStyleFamily(getStyleId(style), style?.styleUrl || '') === 'open')) {
        setSelectedFamily('open');
      } else if (styles.some((style) => getStyleFamily(getStyleId(style), style?.styleUrl || '') === 'osm')) {
        setSelectedFamily('osm');
      }
    }
  }, [selectedFamily, styles]);

  function renderStyleItem(style, index, { inDialog = false } = {}) {
    const styleId = getStyleId(style);
    const styleLabel = getStyleLabel(style);
    const selected = styleId === selectedStyleName;
    const badges = getStyleBadges(style);

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
          {badges.language ? <CalciteChip scale="s">Language</CalciteChip> : null}
          {badges.worldview ? <CalciteChip scale="s">Worldview</CalciteChip> : null}
          {badges.places ? <CalciteChip scale="s">Places</CalciteChip> : null}
          {badges.baseLayer ? (
            <CalciteChip scale="s" appearance="outline">
              Base Layer
            </CalciteChip>
          ) : null}
          {badges.labelLayer ? (
            <CalciteChip scale="s" appearance="outline">
              Labels Layer
            </CalciteChip>
          ) : null}
        </div>
      </button>
    );
  }

  function renderStyleItems({ inDialog = false } = {}) {
    return groupedStyles.map((group) => (
      <section key={group.category} className="style-browser-group" aria-label={`${group.category} styles`}>
        <div className={`style-browser-list ${inDialog ? 'style-browser-list-dialog' : ''}`}>
          {group.styles.map((style, index) => renderStyleItem(style, index, { inDialog }))}
        </div>
      </section>
    ));
  }

  function renderCategoryTabs(className = 'style-browser-category-tabs') {
    return (
      <CalciteTabs className={className} layout="inline" scale="s" aria-label="Category filters">
        <CalciteTabNav slot="title-group">
          {STYLE_CATEGORY_TABS.map((categoryTab) => (
            <CalciteTabTitle
              key={categoryTab.value}
              tab={categoryTab.value}
              selected={selectedCategory === categoryTab.value}
              onCalciteTabsActivate={() => setSelectedCategory(categoryTab.value)}
            >
              {categoryTab.label}
            </CalciteTabTitle>
          ))}
        </CalciteTabNav>
        {STYLE_CATEGORY_TABS.map((categoryTab) => (
          <CalciteTab key={categoryTab.value} tab={categoryTab.value} selected={selectedCategory === categoryTab.value} />
        ))}
      </CalciteTabs>
    );
  }

  return (
    <div className="style-browser-panel">
      <div className="style-browser-controls">
        <fieldset className="style-browser-family-toggle" aria-label="Style family">
          <legend className="style-browser-family-legend">Style family</legend>
          <label className="style-browser-family-option">
            <input
              type="radio"
              name="style-family"
              value="arcgis"
              checked={selectedFamily === 'arcgis'}
              onChange={(event) => setSelectedFamily(event.target.value)}
            />
            <span>ArcGIS</span>
          </label>
          <label className="style-browser-family-option">
            <input
              type="radio"
              name="style-family"
              value="open"
              checked={selectedFamily === 'open'}
              onChange={(event) => setSelectedFamily(event.target.value)}
            />
            <span>Open</span>
          </label>
          <label className="style-browser-family-option">
            <input
              type="radio"
              name="style-family"
              value="osm"
              checked={selectedFamily === 'osm'}
              onChange={(event) => setSelectedFamily(event.target.value)}
            />
            <span>OSM</span>
            <span className="style-browser-family-deprecated">(Deprecated)</span>
          </label>
        </fieldset>

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

        {renderCategoryTabs()}

        <div className="style-browser-legend" aria-label="Capability legend">
          <CalciteChip scale="s">Language</CalciteChip>
          <CalciteChip scale="s">Worldview</CalciteChip>
          <CalciteChip scale="s">Places</CalciteChip>
          <CalciteChip scale="s" appearance="outline">
            Base Layer
          </CalciteChip>
          <CalciteChip scale="s" appearance="outline">
            Labels Layer
          </CalciteChip>
        </div>

        {error ? (
          <div className="style-browser-actions">
            <CalciteButton
              appearance="outline"
              onClick={() => loadStyles({ forceRefresh: true })}
              disabled={loading}
              scale="s"
            >
              Refresh
            </CalciteButton>
          </div>
        ) : null}
      </div>

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

      <div className="style-browser-grid-block">
        <div className="style-browser-summary-row">
          <div className="style-browser-summary">
            <strong>{filteredStyles.length}</strong> style{filteredStyles.length === 1 ? '' : 's'}
          </div>
          <CalciteButton appearance="transparent" scale="s" onClick={() => setExpanded(true)}>
            Expand View
          </CalciteButton>
        </div>

        <div className="style-browser-list-container">
          <div className="style-browser-list-groups">{renderStyleItems()}</div>
          {!loading && !filteredStyles.length ? (
            <p className="style-browser-empty">No styles to display. Load styles and adjust filters.</p>
          ) : null}
        </div>
      </div>

      <CalciteDialog heading="All Styles" open={expanded} onCalciteDialogClose={() => setExpanded(false)}>
        {renderCategoryTabs('style-browser-dialog-tabs')}
        <div className="style-browser-dialog-grid">{renderStyleItems({ inDialog: true })}</div>
        <CalciteButton slot="footer-end" onClick={() => setExpanded(false)}>
          Close
        </CalciteButton>
      </CalciteDialog>
    </div>
  );
}
