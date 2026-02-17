import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalciteButton,
  CalciteCard,
  CalciteChip,
  CalciteDialog,
  CalciteIcon,
  CalciteInputText,
  CalciteLoader,
  CalciteNotice,
  CalciteTab,
  CalciteTabNav,
  CalciteTabs,
  CalciteTabTitle,
  CalciteTooltip,
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
  sortStylesBySupport,
} from '../../utils/styleBrowser';
import { styleUseCases } from '../../config/styleInfoConfig';
import { DEFAULT_PLAYGROUND_TOKEN } from '../../config/playgroundToken';
import { resolveStyleInfoContent } from '../../utils/styleInfo';
import './StyleBrowser.css';

const THUMBNAIL_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23dde6ef'/%3E%3Ctext x='160' y='95' text-anchor='middle' fill='%235f6368' font-size='16' font-family='Arial'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
const PRIMARY_STYLE_CATEGORIES = STYLE_CATEGORY_ORDER.slice(0, 5);
const STYLE_CATEGORY_TABS = [
  { value: 'all', label: 'All' },
  ...PRIMARY_STYLE_CATEGORIES.map((category) => ({ value: category, label: category })),
];
const CAPABILITY_FILTERS = [
  { key: 'language', icon: 'language', label: 'Supports language', tooltipId: 'style-browser-legend-language' },
  { key: 'worldview', icon: 'globe', label: 'Supports worldview', tooltipId: 'style-browser-legend-worldview' },
  { key: 'places', icon: 'map-pin', label: 'Supports places', tooltipId: 'style-browser-legend-places' },
  {
    key: 'baseLayer',
    icon: 'layers',
    label: 'Supports base layer',
    appearance: 'outline',
    tooltipId: 'style-browser-legend-base-layer',
  },
  {
    key: 'labelLayer',
    icon: 'layer-annotation',
    label: 'Supports labels layer',
    appearance: 'outline',
    tooltipId: 'style-browser-legend-labels-layer',
  },
];

function getInputValue(event) {
  return event?.target?.value ?? event?.detail?.value ?? '';
}

function getStyleId(style) {
  return getStylePath(style) || style?.path || style?.id || style?.name || '';
}

function stripStylePrefix(label = '') {
  return label.replace(/^(ArcGIS|Open|OSM)\s+/i, '').trim();
}

function getStyleLabel(style) {
  const rawLabel = style?.name || style?.path || style?.id || 'Unnamed style';
  return stripStylePrefix(rawLabel);
}

function getStyleThumbnail(style) {
  return style?.thumbnailUrl || style?.thumbnail || THUMBNAIL_FALLBACK;
}

function toIdPart(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderCapabilityChip({
  show,
  icon,
  label,
  appearance = 'solid',
  tooltipId,
  chipKey,
  selected = false,
  onClick,
  tooltipLabel,
}) {
  if (!show) {
    return null;
  }

  return (
    <Fragment key={chipKey}>
      <CalciteChip
        id={tooltipId}
        scale="s"
        icon={icon}
        appearance={appearance}
        label={label}
        aria-label={label}
        selected={selected}
        onClick={onClick}
        className={`style-browser-capability-chip ${selected ? 'style-browser-capability-chip-active' : ''}`}
      />
      <CalciteTooltip referenceElement={tooltipId} placement="bottom">
        {tooltipLabel || label}
      </CalciteTooltip>
    </Fragment>
  );
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
  const [styleInfoOpen, setStyleInfoOpen] = useState(false);
  const [activeStyleInfoStyle, setActiveStyleInfoStyle] = useState(null);
  const [activeCapabilityFilters, setActiveCapabilityFilters] = useState({
    language: false,
    worldview: false,
    places: false,
    baseLayer: false,
    labelLayer: false,
  });
  const autoLoadedRef = useRef(false);

  const toggleCapabilityFilter = useCallback((filterKey) => {
    setActiveCapabilityFilters((previous) => ({
      ...previous,
      [filterKey]: !previous[filterKey],
    }));
  }, []);

  const filteredStyles = useMemo(() => {
    const query = filter.trim().toLowerCase();

    const matchingStyles = styles.filter((style) => {
      const styleId = getStyleId(style);
      const styleFamily = getStyleFamily(styleId, style?.styleUrl || '');
      const category = getStyleCategory(style);
      const matchesCategory = selectedCategory === 'all' ? true : category === selectedCategory;

      if ((styleFamily !== 'unknown' && styleFamily !== selectedFamily) || !matchesCategory) {
        return false;
      }

      const styleBadges = getStyleBadges(style);
      const matchesActiveCapabilityFilters = Object.entries(activeCapabilityFilters).every(
        ([capability, isActive]) => !isActive || Boolean(styleBadges[capability])
      );

      if (!matchesActiveCapabilityFilters) {
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

    return sortStylesBySupport(matchingStyles);
  }, [styles, filter, selectedFamily, selectedCategory, activeCapabilityFilters]);

  const groupedStyles = useMemo(() => groupStylesByCategory(filteredStyles), [filteredStyles]);

  const styleInfoContent = useMemo(
    () => resolveStyleInfoContent(activeStyleInfoStyle || {}, styleUseCases),
    [activeStyleInfoStyle]
  );

  const selectStyle = useCallback(
    (style) => {
      const styleName = getStyleId(style);
      if (!styleName) {
        return;
      }

      setStyleInfoOpen(false);
      onStyleSelect?.(styleName);
      onStyleMetaChange?.(style);
    },
    [onStyleSelect, onStyleMetaChange]
  );

  const openStyleInfo = useCallback((style) => {
    setActiveStyleInfoStyle(style);
    setStyleInfoOpen(true);
  }, []);

  const loadStyles = useCallback(
    async ({ forceRefresh = false } = {}) => {
      if (!DEFAULT_PLAYGROUND_TOKEN) {
        setError('Missing playground API key. Configure VITE_DEFAULT_PLAYGROUND_API_KEY or set src/config/playgroundToken.js.');
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
    const idBase = `${inDialog ? 'dialog' : 'grid'}-${toIdPart(styleId || `style-${index}`)}`;
    const titleId = `${idBase}-title`;
    const infoButtonId = `${idBase}-info`;

    const cardClasses = [
      'style-browser-item',
      selected ? 'style-browser-item-selected' : '',
      !inDialog ? 'style-browser-item-sidebar' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <CalciteCard
        key={styleId || `style-${index}`}
        className={cardClasses}
        role="button"
        tabIndex={0}
        aria-label={`Select ${styleLabel}`}
        onClick={() => selectStyle(style)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectStyle(style);
          }
        }}
      >
        <div slot="thumbnail" className="style-browser-thumbnail-wrap">
          <button
            id={infoButtonId}
            type="button"
            className="style-browser-info-button"
            aria-label={`Style information for ${styleLabel}`}
            onClick={(event) => {
              event.stopPropagation();
              openStyleInfo(style);
            }}
            onKeyDown={(event) => {
              event.stopPropagation();
            }}
          >
            <CalciteIcon icon="information" scale="s" className="style-browser-info-icon" />
          </button>
          <CalciteTooltip referenceElement={infoButtonId} placement="bottom">
            When to use this style
          </CalciteTooltip>
          <img
            className={`style-browser-thumbnail ${inDialog ? 'style-browser-thumbnail-large' : ''}`}
            src={getStyleThumbnail(style)}
            alt={`${styleLabel} thumbnail`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = THUMBNAIL_FALLBACK;
            }}
          />
          <h3 id={titleId} className="style-browser-item-title" aria-label={styleLabel}>
            {styleLabel}
          </h3>
        </div>
        {inDialog ? <CalciteTooltip referenceElement={titleId}>{styleLabel}</CalciteTooltip> : null}
        {inDialog ? (
          <div className="style-browser-meta" aria-label="Supported style features">
            {renderCapabilityChip({
              show: badges.language,
              icon: 'language',
              label: 'Supports language',
              tooltipId: `${idBase}-language`,
            })}
            {renderCapabilityChip({
              show: badges.worldview,
              icon: 'globe',
              label: 'Supports worldview',
              tooltipId: `${idBase}-worldview`,
            })}
            {renderCapabilityChip({
              show: badges.places,
              icon: 'map-pin',
              label: 'Supports places',
              tooltipId: `${idBase}-places`,
            })}
            {renderCapabilityChip({
              show: badges.baseLayer,
              icon: 'layers',
              label: 'Supports base layer',
              appearance: 'outline',
              tooltipId: `${idBase}-base-layer`,
            })}
            {renderCapabilityChip({
              show: badges.labelLayer,
              icon: 'layer-annotation',
              label: 'Supports labels layer',
              appearance: 'outline',
              tooltipId: `${idBase}-labels-layer`,
            })}
          </div>
        ) : null}
      </CalciteCard>
    );
  }

  function renderStyleItems({ inDialog = false } = {}) {
    if (selectedCategory === 'all') {
      return (
        <div className={`style-browser-list ${inDialog ? 'style-browser-list-dialog' : ''}`}>
          {filteredStyles.map((style, index) => renderStyleItem(style, index, { inDialog }))}
        </div>
      );
    }

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

        <div className="style-browser-searchbar">
          <CalciteInputText
            id="filter-input"
            name="filter-input"
            aria-label="Filter styles"
            icon="filter"
            placeholder="Filter by name, provider, or category"
            value={filter}
            onCalciteInputTextInput={(event) => setFilter(getInputValue(event))}
          />
        </div>

        {renderCategoryTabs()}

        <div className="style-browser-legend" aria-label="Capability legend">
          <span className="style-browser-legend-label">Filter:</span>
          {CAPABILITY_FILTERS.map((capabilityFilter) =>
            renderCapabilityChip({
              ...capabilityFilter,
              chipKey: capabilityFilter.key,
              show: true,
              selected: activeCapabilityFilters[capabilityFilter.key],
              onClick: () => toggleCapabilityFilter(capabilityFilter.key),
              tooltipLabel: `${capabilityFilter.label} filter (${activeCapabilityFilters[capabilityFilter.key] ? 'on' : 'off'})`,
            })
          )}
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

      <CalciteDialog
        heading={`When to use ${getStyleLabel(activeStyleInfoStyle || {})}`}
        open={styleInfoOpen}
        onCalciteDialogClose={() => setStyleInfoOpen(false)}
      >
        <div className="style-browser-info-dialog-content">
          {styleInfoContent.styleDescription ? (
            <section className="style-browser-info-section">
              <h4>About the style</h4>
              <p>{styleInfoContent.styleDescription}</p>
            </section>
          ) : null}

          {styleInfoContent.categoryDescription ? (
            <section className="style-browser-info-section">
              <h4>Category: {styleInfoContent.category + " styles"|| 'Other'}</h4>
              <p>{styleInfoContent.categoryDescription}</p>
            </section>
          ) : null}

          {styleInfoContent.shouldShowFallback ? (
            <section className="style-browser-info-section">
              <h4>Guidance</h4>
              <p>{styleInfoContent.fallbackDescription}</p>
            </section>
          ) : null}

          {styleInfoContent.documentationUrl ? (
            <section className="style-browser-info-section">
              <h4>Documentation</h4>
              <a href={styleInfoContent.documentationUrl} target="_blank" rel="noreferrer noopener">
                {`${getStyleLabel(activeStyleInfoStyle || {}) || 'Selected'} style API reference documentation`}
              </a>
            </section>
          ) : null}

          {styleInfoContent.sampleApps.length ? (
            <section className="style-browser-info-section">
              <h4>Sample apps</h4>
              <ul className="style-browser-info-links">
                {styleInfoContent.sampleApps.map((sampleApp) => (
                  <li key={sampleApp.url}>
                    <a href={sampleApp.url} target="_blank" rel="noreferrer noopener">
                      {sampleApp.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <CalciteButton slot="footer-end" onClick={() => setStyleInfoOpen(false)}>
          Close
        </CalciteButton>
      </CalciteDialog>
    </div>
  );
}
