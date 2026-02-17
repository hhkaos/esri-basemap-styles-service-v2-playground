import { useMemo } from 'react';
import { CalciteLabel, CalciteOption, CalciteSelect, CalciteTooltip } from '@esri/calcite-components-react';
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

/**
 * @param {Object} props
 * @param {Object} [props.selectedStyle]
 * @param {{language:string,worldview:string,places:string}} props.parameters
 * @param {(next: {language:string,worldview:string,places:string}) => void} props.onChange
 * @param {{languages?: Array, worldviews?: Array, places?: Array}} [props.capabilities]
 * @param {'all'|'language'|'worldview'|'places'} [props.section='all']
 */
export function ParameterControls({ selectedStyle, parameters, onChange, capabilities, section = 'all' }) {
  const languageEnabled = supportsLanguage(selectedStyle);
  const worldviewEnabled = supportsWorldview(selectedStyle);
  const placesEnabled = supportsPlaces(selectedStyle);

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
    const value = event?.target?.value ?? '';
    onChange({ ...parameters, [key]: value });
  }

  function renderLanguageControl() {
    const languageTooltip = !languageEnabled
      ? 'This style does not support language changes.'
      : 'Choose label language.';

    return (
      <div className="parameter-control-row">
        <CalciteLabel layout="inline" className="parameter-control-label">
          <span id="language-parameter-label">
            Language {!languageEnabled ? <span className="parameter-warning-icon">⚠</span> : null}
          </span>
          <CalciteSelect
            id="language-parameter-select"
            label="Language"
            value={parameters.language}
            onCalciteSelectChange={(event) => handleParamChange('language', event)}
            disabled={!languageEnabled || undefined}
            scale="s"
          >
            {languageOptions.map((option) => (
              <CalciteOption key={option.value} value={option.value} label={option.label} />
            ))}
          </CalciteSelect>
        </CalciteLabel>
        <CalciteTooltip referenceElement="language-parameter-label">
          Choose label language for supported styles.
        </CalciteTooltip>
        <CalciteTooltip referenceElement="language-parameter-select">{languageTooltip}</CalciteTooltip>
        <p className="parameter-help">
          Label language settings for this style.
          <a className="parameter-help-link" href={PARAMETER_DOCS.language} target="_blank" rel="noreferrer">
            ℹ Learn more
          </a>
        </p>
      </div>
    );
  }

  function renderWorldviewControl() {
    const worldviewTooltip = !worldviewEnabled
      ? 'This style does not support worldview capability.'
      : 'Controls boundaries and labels in disputed areas.';

    return (
      <div className="parameter-control-row">
        <CalciteLabel layout="inline" className="parameter-control-label">
          <span id="worldview-parameter-label">
            Worldview {!worldviewEnabled ? <span className="parameter-warning-icon">⚠</span> : null}
          </span>
          <CalciteSelect
            id="worldview-parameter-select"
            label="Worldview"
            value={parameters.worldview}
            onCalciteSelectChange={(event) => handleParamChange('worldview', event)}
            disabled={!worldviewEnabled || undefined}
            scale="s"
          >
            {worldviewOptions.map((option) => (
              <CalciteOption key={option.value || 'default'} value={option.value} label={option.label} />
            ))}
          </CalciteSelect>
        </CalciteLabel>
        <CalciteTooltip referenceElement="worldview-parameter-label">
          Adjust disputed-boundary labeling when available.
        </CalciteTooltip>
        <CalciteTooltip referenceElement="worldview-parameter-select">{worldviewTooltip}</CalciteTooltip>
        <p className="parameter-help">
          Boundary and disputed-area labeling behavior.
          <a className="parameter-help-link" href={PARAMETER_DOCS.worldview} target="_blank" rel="noreferrer">
            ℹ Learn more
          </a>
        </p>
      </div>
    );
  }

  function renderPlacesControl() {
    const placesTooltip = !placesEnabled
      ? 'This style does not support places capability.'
      : 'Choose places display mode.';

    return (
      <div className="parameter-control-row">
        <CalciteLabel layout="inline" className="parameter-control-label">
          <span id="places-parameter-label">
            Places {!placesEnabled ? <span className="parameter-warning-icon">⚠</span> : null}
          </span>
          <CalciteSelect
            id="places-parameter-select"
            label="Places"
            value={parameters.places}
            onCalciteSelectChange={(event) => handleParamChange('places', event)}
            disabled={!placesEnabled || undefined}
            scale="s"
          >
            {placesOptions.map((option) => (
              <CalciteOption key={option.value} value={option.value} label={option.label} />
            ))}
          </CalciteSelect>
        </CalciteLabel>
        <CalciteTooltip referenceElement="places-parameter-label">
          Toggle places display when supported by this style.
        </CalciteTooltip>
        <CalciteTooltip referenceElement="places-parameter-select">{placesTooltip}</CalciteTooltip>
        <p className="parameter-help">
          POI rendering controls for supported styles.
          <a className="parameter-help-link" href={PARAMETER_DOCS.places} target="_blank" rel="noreferrer">
            ℹ Learn more
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="parameter-controls-grid">
      {(section === 'all' || section === 'language') && renderLanguageControl()}
      {(section === 'all' || section === 'worldview') && renderWorldviewControl()}
      {(section === 'all' || section === 'places') && renderPlacesControl()}
    </div>
  );
}
