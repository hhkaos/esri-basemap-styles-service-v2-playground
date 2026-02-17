export const styleUseCases = {
  defaultDescription:
    'Use this style when you need dependable geographic context while testing your app. Check whether roads, labels, and background detail support your workflow without overpowering your operational data.',
  styles: {
    'arcgis/streets-relief': {
      description:
        'Use this style when you need street-level context with additional terrain/relief cues, such as route planning in hilly areas or outdoor wayfinding apps.',
      documentationUrl: 'https://developers.arcgis.com/rest/basemap-styles/arcgis-streetsrelief-style-get/',
      sampleApps: [
        {
          label: 'ArcGIS Basemap Styles samples',
          url: 'https://developers.arcgis.com/maplibre-gl-js/',
        },
      ],
    },
  },
  categories: {
    Streets: {
      description:
        'Streets styles are optimized for everyday navigation tasks. Cartographers emphasize road hierarchy, intersections, place labels, and wayfinding cues so users can quickly understand how to move through an area.',
      sampleApps: [
        {
          label: 'Navigation-focused web map examples',
          url: 'https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/arcgis-styles/',
        },
      ],
    },
    Topography: {
      description:
        'Topography styles are built for terrain-aware exploration. They increase visibility of elevation, landforms, trails, vegetation, and water features, which helps users plan routes in outdoor or rugged environments.',
    },
    Satellite: {
      description:
        'Satellite styles prioritize real-world imagery detail. They are useful when users must verify actual ground conditions such as construction activity, land cover, parcel context, or environmental change.',
    },
    Reference: {
      description:
        'Reference styles intentionally reduce visual noise. They are designed to keep your thematic layers, analytics, and operational data in focus while still providing enough geographic context for orientation.',
    },
    Creative: {
      description:
        'Creative styles emphasize visual personality and narrative tone. They are useful for storytelling and branded experiences where mood and readability for a specific audience matter more than neutral cartography.',
    },
  },
};
