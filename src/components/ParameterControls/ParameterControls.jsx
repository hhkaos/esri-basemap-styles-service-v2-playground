import { useMemo } from 'react';
import { CalciteLabel, CalciteOption, CalciteSelect } from '@esri/calcite-components-react';
import {
  supportsLanguage,
  supportsPlaces,
  supportsWorldview,
} from '../../utils/styleCapabilities';
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

/**
 * @param {Object} props
 * @param {Object} [props.selectedStyle]
 * @param {{language:string,worldview:string,places:string}} props.parameters
 * @param {(next: {language:string,worldview:string,places:string}) => void} props.onChange
 * @param {{languages?: Array, worldviews?: Array, places?: Array}} [props.capabilities]
 */
export function ParameterControls({ selectedStyle, parameters, onChange, capabilities }) {
  const languageEnabled = supportsLanguage(selectedStyle);
  const worldviewEnabled = supportsWorldview(selectedStyle);
  const placesEnabled = supportsPlaces(selectedStyle);

  const languageOptions = useMemo(() => {
    const items = capabilities?.languages?.length > 0 ? capabilities.languages : FALLBACK_LANGUAGES;
    return items.map((item) => ({ value: item.code, label: item.name }));
  }, [capabilities]);

  const worldviewOptions = useMemo(() => {
    const items = capabilities?.worldviews?.length > 0 ? capabilities.worldviews : FALLBACK_WORLDVIEWS;
    return [
      { value: '', label: 'Global (default)' },
      ...items.map((item) => ({ value: item.code, label: item.name })),
    ];
  }, [capabilities]);

  const placesOptions = useMemo(() => {
    const items = capabilities?.places?.length > 0 ? capabilities.places : FALLBACK_PLACES;
    return items.map((item) => ({ value: item.code, label: item.name }));
  }, [capabilities]);

  function handleParamChange(key, event) {
    const value = event?.target?.value ?? '';
    onChange({ ...parameters, [key]: value });
  }

  return (
    <div className="parameter-controls-grid">
      <CalciteLabel layout="inline">
        Language
        <CalciteSelect
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

      <CalciteLabel layout="inline">
        Worldview
        <CalciteSelect
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

      <CalciteLabel layout="inline">
        Places
        <CalciteSelect
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
    </div>
  );
}
