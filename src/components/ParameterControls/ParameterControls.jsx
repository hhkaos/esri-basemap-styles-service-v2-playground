import { useMemo } from 'react';
import {
  CalciteLabel,
  CalciteLink,
  CalciteRadioButton,
  CalciteRadioButtonGroup,
  CalciteTooltip,
} from '@esri/calcite-components-react';
import { getPreferredLanguageFlags, getPreferredWorldviewFlag } from '../../config/languageFlagConfig';
import { supportsLanguage, supportsPlaces, supportsWorldview } from '../../utils/styleCapabilities';
import './ParameterControls.css';

const FALLBACK_LANGUAGES = [
  { code: 'global', name: 'Global' },
  { code: 'local', name: 'Local' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
];

const FALLBACK_WORLDVIEWS = [
  { code: 'argentina', name: 'Argentina' },
  { code: 'china', name: 'China' },
  { code: 'india', name: 'India' },
  { code: 'israel', name: 'Israel' },
  { code: 'pakistan', name: 'Pakistan' },
];

const FALLBACK_PLACES = [
  { code: 'all', name: 'All' },
  { code: 'attributed', name: 'Attributed' },
  { code: 'none', name: 'None' },
];

const PARAMETER_DOCS = {
  language: 'https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#language',
  worldview: 'https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#worldview',
  places:
    'https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/basemap-places/',
};

function getLanguageIcon(option) {
  if (option.value === 'global') {
    return { kind: 'emoji', value: '🌐', flags: [] };
  }

  if (option.value === 'local') {
    return { kind: 'emoji', value: '📍', flags: [] };
  }

  const normalized = String(option.value || '').toLowerCase();
  const split = normalized.split(/[-_]/);
  const regionCode = split.length > 1 && split[1].length === 2 ? split[1].toLowerCase() : '';

  if (regionCode) {
    return { kind: 'flag', value: regionCode, flags: [regionCode] };
  }

  const preferredFlags = getPreferredLanguageFlags(split[0]);

  if (preferredFlags.length > 0) {
    return { kind: 'flag', value: preferredFlags[0], flags: preferredFlags };
  }

  return { kind: 'emoji', value: '🏳️', flags: [] };
}

function renderLanguageLabel(option) {
  const icon = getLanguageIcon(option);

  if (icon.kind === 'flag') {
    return (
      <>
        <span className="parameter-flag-group" aria-hidden="true">
          {icon.flags.map((flagCode) => (
            <span key={`${option.value}-${flagCode}`} className={`fi fi-${flagCode}`} />
          ))}
        </span>
        <span>{option.label}</span>
      </>
    );
  }

  return (
    <>
      <span aria-hidden="true">{icon.value}</span>
      <span>{option.label}</span>
    </>
  );
}

function renderWorldviewLabel(option) {
  if (!option.value) {
    return (
      <>
        <span aria-hidden="true">🌐</span>
        <span>{option.label}</span>
      </>
    );
  }

  const worldviewFlag = getPreferredWorldviewFlag(option.value);

  if (worldviewFlag) {
    return (
      <>
        <span className={`fi fi-${worldviewFlag}`} aria-hidden="true" />
        <span>{option.label}</span>
      </>
    );
  }

  return (
    <>
      <span aria-hidden="true">🗺️</span>
      <span>{option.label}</span>
    </>
  );
}

/**
 * @param {Object} props
 * @param {Object} [props.selectedStyle]
 * @param {string} [props.selectedStyleName]
 * @param {boolean} [props.styleCatalogLoaded]
 * @param {{language:string,worldview:string,places:string}} props.parameters
 * @param {(next: {language:string,worldview:string,places:string}) => void} props.onChange
 * @param {{languages?: Array, worldviews?: Array, places?: Array}} [props.capabilities]
 * @param {'all'|'language'|'worldview'|'places'} [props.section='all']
 */
export function ParameterControls({
  selectedStyle,
  selectedStyleName = '',
  styleCatalogLoaded = true,
  parameters,
  onChange,
  capabilities,
  section = 'all',
}) {
  const awaitingStyleMetadata = Boolean(selectedStyleName) && !selectedStyle && !styleCatalogLoaded;
  const languageEnabled = !awaitingStyleMetadata && supportsLanguage(selectedStyle);
  const worldviewEnabled = !awaitingStyleMetadata && supportsWorldview(selectedStyle);
  const placesEnabled = !awaitingStyleMetadata && supportsPlaces(selectedStyle);

  const languageOptions = useMemo(() => {
    const items = capabilities?.languages?.length > 0 ? capabilities.languages : FALLBACK_LANGUAGES;
    return items.map((item) => ({ value: item.code, label: item.name }));
  }, [capabilities]);

  const worldviewOptions = useMemo(() => {
    const items = capabilities?.worldviews?.length > 0 ? capabilities.worldviews : FALLBACK_WORLDVIEWS;
    return [{ value: '', label: 'Global (default)' }, ...items.map((item) => ({ value: item.code, label: item.name }))];
  }, [capabilities]);

  const placesOptions = useMemo(() => {
    const items = capabilities?.places?.length > 0 ? capabilities.places : FALLBACK_PLACES;
    return items.map((item) => ({ value: item.code, label: item.name }));
  }, [capabilities]);

  function handleParamChange(key, event) {
    const value = event?.target?.value ?? event?.target?.selectedItem?.value ?? '';
    onChange({ ...parameters, [key]: value });
  }

  function renderLanguageControl() {
    const languageTooltip = awaitingStyleMetadata
      ? 'Loading style capabilities for selected style.'
      : !languageEnabled
      ? 'This style does not support language changes.'
      : 'Choose label language.';

    return (
      <div className="parameter-control-row">
        <h4 id="language-parameter-label" className="parameter-heading">
          Language {!awaitingStyleMetadata && !languageEnabled ? <span className="parameter-warning-icon">⚠</span> : null}
        </h4>
        <p className="parameter-description">
          Controls how map labels are displayed (global, local, or a specific language code).{' '}
          <CalciteLink href={PARAMETER_DOCS.language} target="_blank" rel="noreferrer">
            Learn more
          </CalciteLink>
        </p>
        <CalciteRadioButtonGroup
          id="language-parameter-group"
          name="language-parameter-group"
          value={parameters.language}
          onCalciteRadioButtonGroupChange={(event) => handleParamChange('language', event)}
          disabled={!languageEnabled || undefined}
          layout="vertical"
          scale="s"
          className="parameter-radio-group"
        >
          {languageOptions.map((option) => (
            <CalciteLabel key={option.value} layout="inline" className="parameter-radio-option">
              <CalciteRadioButton value={option.value} checked={parameters.language === option.value} />
              {renderLanguageLabel(option)}
            </CalciteLabel>
          ))}
        </CalciteRadioButtonGroup>
        <CalciteTooltip referenceElement="language-parameter-label">
          {awaitingStyleMetadata ? 'Loading capability support for this style.' : 'Choose label language for supported styles.'}
        </CalciteTooltip>
        <CalciteTooltip referenceElement="language-parameter-group">{languageTooltip}</CalciteTooltip>
      </div>
    );
  }

  function renderWorldviewControl() {
    const worldviewTooltip = awaitingStyleMetadata
      ? 'Loading style capabilities for selected style.'
      : !worldviewEnabled
      ? 'This style does not support worldview capability.'
      : 'Controls boundaries and labels in disputed areas. Does not reflect Esri\'s official position.';

    return (
      <div className="parameter-control-row">
        <h4 id="worldview-parameter-label" className="parameter-heading">
          Worldview {!awaitingStyleMetadata && !worldviewEnabled ? <span className="parameter-warning-icon">⚠</span> : null}
        </h4>
        <p className="parameter-description">
          Controls boundaries and labels in disputed areas. Does not reflect Esri&apos;s official position.{' '}
          <CalciteLink href={PARAMETER_DOCS.worldview} target="_blank" rel="noreferrer">
            Learn more
          </CalciteLink>
        </p>
        <CalciteRadioButtonGroup
          id="worldview-parameter-group"
          name="worldview-parameter-group"
          value={parameters.worldview}
          onCalciteRadioButtonGroupChange={(event) => handleParamChange('worldview', event)}
          disabled={!worldviewEnabled || undefined}
          layout="vertical"
          scale="s"
          className="parameter-radio-group"
        >
          {worldviewOptions.map((option) => (
            <CalciteLabel key={option.value || 'default'} layout="inline" className="parameter-radio-option">
              <CalciteRadioButton value={option.value} checked={parameters.worldview === option.value} />
              {renderWorldviewLabel(option)}
            </CalciteLabel>
          ))}
        </CalciteRadioButtonGroup>
        <CalciteTooltip referenceElement="worldview-parameter-label">
          {awaitingStyleMetadata ? 'Loading capability support for this style.' : 'Adjust disputed-boundary labeling when available.'}
        </CalciteTooltip>
        <CalciteTooltip referenceElement="worldview-parameter-group">{worldviewTooltip}</CalciteTooltip>
      </div>
    );
  }

  function renderPlacesControl() {
    const placesTooltip = awaitingStyleMetadata
      ? 'Loading style capabilities for selected style.'
      : !placesEnabled
      ? 'This style does not support places capability.'
      : 'Choose places display mode.';

    return (
      <div className="parameter-control-row">
        <h4 id="places-parameter-label" className="parameter-heading">
          Places {!awaitingStyleMetadata && !placesEnabled ? <span className="parameter-warning-icon">⚠</span> : null}
        </h4>
        <p className="parameter-description">
          Controls point-of-interest visibility. All shows all available POIs, while Attributed shows only POIs with
          attribution fields (like esri_place_id and name) for Places API workflows.{' '}
          <CalciteLink href={PARAMETER_DOCS.places} target="_blank" rel="noreferrer">
            Learn more
          </CalciteLink>
        </p>
        <CalciteRadioButtonGroup
          id="places-parameter-group"
          name="places-parameter-group"
          value={parameters.places}
          onCalciteRadioButtonGroupChange={(event) => handleParamChange('places', event)}
          disabled={!placesEnabled || undefined}
          layout="vertical"
          scale="s"
          className="parameter-radio-group"
        >
          {placesOptions.map((option) => (
            <CalciteLabel key={option.value} layout="inline" className="parameter-radio-option">
              <CalciteRadioButton value={option.value} checked={parameters.places === option.value} />
              <span>{option.label}</span>
            </CalciteLabel>
          ))}
        </CalciteRadioButtonGroup>
        <CalciteTooltip referenceElement="places-parameter-label">
          {awaitingStyleMetadata ? 'Loading capability support for this style.' : 'Toggle places display when supported by this style.'}
        </CalciteTooltip>
        <CalciteTooltip referenceElement="places-parameter-group">{placesTooltip}</CalciteTooltip>
      </div>
    );
  }

  return (
    <div className="parameter-controls">
      {(section === 'all' || section === 'language') && renderLanguageControl()}
      {(section === 'all' || section === 'worldview') && renderWorldviewControl()}
      {(section === 'all' || section === 'places') && renderPlacesControl()}
    </div>
  );
}
