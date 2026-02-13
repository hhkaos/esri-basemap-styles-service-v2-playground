# ArcGIS Basemap Styles Service v2 Playground - Specification

## 1. Executive Summary

### 1.1 Purpose
An interactive browser-based playground for developers to explore and experiment with the **ArcGIS Location Platform Basemap Styles Service v2**. The tool enables users to:

- Browse and filter available basemap styles (ArcGIS and Open families) organized by thematic groups
- Configure style parameters (`language`, `worldview`, `places`) and see results in real-time
- Generate ready-to-use code snippets for multiple mapping libraries
- Export working examples to CodePen or download as standalone HTML files |~I will provide some code initial samples for each library, you need to templatize/improve it~|
- Understand usage models (tile-based vs session-based) |~But this is not a priority or will be addressed in the initial phases; I mean not in the playground, but the standalone samples be configured depending on this~|

### 1.2 Key Principles
- **Dynamic, not hardcoded**: Style catalog fetched from `/self` endpoint to always reflect latest available styles
- **Educational focus**: Teach developers how to use the service through interactive exploration |~But each parameter will have a way to get links to existing documentation, code samples, API reference, to dive deeper~|
- **Multi-library support**: Generate code for different mapping libraries via pluggable template system |~Should we specify versions of the libraries in the template and a call for contributions/requests?~|
- **Developer-friendly**: Transparent code generation, clear documentation, easy to use UX

### 1.3 Out of Scope
This playground focuses exclusively on **ArcGIS Location Platform** basemap styles. It does NOT cover:
- ArcGIS Online basemaps (different service, different access patterns)
- 3D map styles (may be added in future)
- Backend services or authentication flows |~Add this as a future enhancement, to allow users to use their user identity to log in, get available API keys and pick one~|
- Custom style editing (separate tool: Vector Tile Style Editor) |~We will consider this for the future~|

---

## 2. Technical Architecture

### 2.1 Technology Stack
- **Framework**: React (chosen for robust ecosystem and state management)
- **UI Components**: Calcite Design System (Esri's official components / design system)
- **Mapping Library**: MapLibre GL JS v5.x for the playground viewer
- **Node version**: Ensure Node 25 from .nvmrc
- **Build Tool**: Vite (minimal modern bundler with HMR)
- **Styling**: CSS Modules or Calcite's styling approach
- **State Management**: React Context or simple prop drilling (avoid over-engineering)
- **Deployment**: GitHub Pages (static hosting)

### 2.2 Project Structure (Recommended)
```
src/
├── components/
│   ├── StyleBrowser/        # Style grid, filters, badges
│   ├── MapViewer/           # MapLibre map instance
│   ├── ParameterControls/   # Language, worldview, places inputs
│   ├── CodeGenerator/       # Code snippet display and export
│   ├── TokenInput/          # API key input with security warnings
│   └── ShowcaseLocations/   # Preset location buttons
├── templates/ |~Consider if we should version the templates and if they should be HTML or a document with a frontmatter specifying tecnologies and versions, etc ~|
│   ├── maplibre.js          # MapLibre template
│   ├── leaflet.js           # Leaflet template
│   └── arcgis-js.js         # ArcGIS Maps SDK template (future)
├── services/
│   ├── styleService.js      # Fetch from /self, cache management
│   ├── codepenService.js    # CodePen POST integration
│   └── analytics.js         # Usage telemetry (optional)
├── config/ |~create the structure as a boileplate and I will fill it, but also allow me to configure ig I want to show this o not, per style or as a whole~|
│   └── showcaseLocations.js # Hardcoded location presets per style
└── utils/
    ├── urlGenerator.js      # Build style URLs with parameters
    └── storage.js           # localStorage helpers with TTL
```

### 2.3 Build and Development
- **Development**: `npm run dev` (Vite dev server with HMR)
- **Build**: `npm run build` (optimized static assets for GitHub Pages)
- **Preview**: `npm run preview` (test production build locally)
- **Deployment**: GitHub Actions workflow to build and deploy to `gh-pages` branch

---

## 3. Basemap Styles Service Overview

### 3.1 Service Endpoint Structure
```
https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/{style_response}/{style_family}/{style_name}?{parameters}&token=<TOKEN>
```

**Path Parameters:**
- **style_response**: `styles` (returns Mapbox Style JSON v8) or `webmaps` (returns ArcGIS web map) |~this is a capability that will be used internally, it is to help libraries that espect to receibe the style as a Mapbox Style JSON~|
- **style_family**: `arcgis` or `open`
- **style_name**: e.g., `navigation`, `light-gray/labels`, etc.

### 3.2 Style Families

| Family | Data Source | Supported Parameters | Notes |
|--------|-------------|---------------------|-------|
| **arcgis** | Esri and authoritative providers | `language`, `worldview`, `places` (varies by style) | More features, richer metadata |
| **open** | Overture Maps, OpenStreetMap | `language` only | Community data, support fewer options than styles from the *arcgis* family |

### 3.3 Style Groups (Categories)
Styles are organized into thematic groups:

1. **Streets** - Navigation and routing (e.g., `navigation`, `streets`, `community` and more)
2. **Topography** - Terrain and natural features (e.g., `outdoor`, `terrain`, `oceans` and mode)
3. **Satellite** - Imagery-based (e.g., `imagery`, `imagery/labels`)
4. **Reference** - Neutral backgrounds for data overlay (e.g., `light-gray`, `dark-gray`)
5. **Creative** - Artistic styles (e.g., `nova`, `modern-antique`, `newspaper`)

**Special Case: Label Styles**
- Styles ending in `/labels` (e.g., `light-gray/labels`, `oceans/labels`)
- Should appear at the END of each group
- |~Also include the `/base` ones, or Hillshage, that not normally found on other mapping providers and can not be clear what they are for~|
- Badge/description: **"Use as overlay on custom base layers"** |~This doesnt' apply just to custom styles or label this badges and description should be included for all styles~|
- These are transparent reference layers, not standalone basemaps |~correct, several of them, but not all. Base por example can be used if you want to reduce clutter (or I believe so, or add your on labels)~|

---

## 4. Query Parameters

### 4.1 language
- **Type**: String (ISO 639 code or special keywords)
- **Values**: `global` (English everywhere), `local` (native names in local regions, English elsewhere), or ISO codes like `es`, `fr`, `ja`, `zh-CN`, etc.
- **Support**: Most styles support this parameter
- **UI**: Dropdown with language name and code (e.g., "Español - es") |~Use English an the code language Spanish - es~|
- **Behavior Examples**:
  - `global`: "Tokyo" everywhere on the map
  - `local`: "東京" when viewing Japan, "Tokyo" when viewing other regions
  - `es`: "Tokio" everywhere on the map

### 4.2 worldview
- **Type**: String (country identifier)
- **Values**: `china`, `india`, `israel`, `japan`, `morocco`, `pakistan`, `southKorea`, `unitedArabEmirates`, `unitedStatesOfAmerica`, `vietnam`
- **Support**: Only certain ArcGIS family styles (e.g., `navigation`, `streets`, `community`)
- **Purpose**: Controls boundary lines and labels in disputed territories
- **UI**:
  - Dropdown, only enabled when style supports it
  - Disabled state: grayed out with warning icon + tooltip explaining "This style does not support worldview capability"
  - Tooltip on enabled state (subtle): "Controls boundaries and labels in disputed areas. Does not reflect Esri's geopolitical position."

### 4.3 places
- **Type**: String (enum)
- **Values**:
  - `none` - Hide all POIs
  - `all` - Show all available POIs
  - `attributed` - Show only POIs with `esri_place_id` and `name` attributes (can be queried via Places API)
- **Support**: Only certain ArcGIS styles (e.g., `navigation`, `streets`, `imagery`)
- **UI**:
  - Radio buttons or select dropdown
  - Disabled when style doesn't support places |~Same behaviour as worldview or any other disabled paramenter: grayed out with warning icon + tooltip~|
  - When enabled, show helper text about zoom-dependent visibility |~And consider (if enable) to highgligth the showcase locations. I might include some specific to highlight how places looks differently~|

### 4.4 token
- **Type**: String (API key or session token)
- **Required**: Yes (must have `premium:user:basemaps` privilege) |~If token fails provide a modal with tutorials, documentation, possible issues, videos, etc. I can help you with that, if you struggle finding them~|
- **UI**:
  - Password-style input (type="password") with optional show/hide toggle
  - Clear security warnings about not sharing keys |~In basemaps keys are normally exposed, the important thing is to properly scope them and rotate them~|
  - Include warnings that keys will be visible in generated CodePen examples
- **Usage Models** (see Section 5)

### 4.5 echoToken
- **Type**: Boolean
- **Default**: `true`
- **Purpose**: Controls whether token is included in style response
- **Playground Use**: Ignore for MVP (internal optimization parameter)

### 4.6 f
- **Type**: String
- **Values**: `json` or `pjson`
- **Playground Use**: Default to `json`, hide from UI |~not relevant for the purpose of this playground~|

---

## 5. Usage Models

### 5.1 Tile-Based Model
- **Mechanism**: Each tile request counts as one basemap transaction
- **Token**: Standard API key
- **Use Case**: Low-traffic apps, testing, prototyping |~also for organizations that require more predictable costs, smaller screens, low interaction, etc.~|
- **Implementation**: Add `?token=<API_KEY>` to style URL

### 5.2 Session-Based Model
- **Mechanism**: Create a session via `/sessions/start`, unlimited tiles within session duration (up to 12 hours)
- **Billing**: One transaction per session started, regardless of tile count
- **Use Case**: High-traffic apps, many concurrent users
- **Playground Approach**: **Educational only**
  - Do NOT actively manage sessions in the playground
  - Generate code snippets showing HOW to create and use sessions
  - Include comments explaining the model and when to use it
  - Link to documentation for implementation details
- |~Keep in mind that current versions of the ArcGIS Maps SDK for JavaScript (<5.0) do not support session tokens, but they will in v5.0. So do not try to create a template now. Version 5.0 will be available by the end of February 2026~|

**Rationale**: Session creation charges users and requires token refresh logic. Keep playground simple and non-transactional.

---

## 6. Dynamic Style Discovery

### 6.1 The `/self` Endpoint
- **URL**: `https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/self?token=<TOKEN>`
- **Returns**: Array of style objects with metadata:
  ```json
  {
    "styles": [
      {
        "name": "arcgis/navigation",
        "provider": "Esri",
        "category": "Streets",
        "thumbnail": "https://...",
        "supportedLanguages": ["global", "local", "ar", "es", ...],
        "supportedWorldviews": ["china", "india", ...],
        "supportsPlaces": true,
        "dataType": "vector"
      },
      ...
    ]
  }
  ```

### 6.2 Caching Strategy
- **Method**: localStorage with simple TTL (Time-To-Live)
- **Cache Duration**: 24 hours (configurable)
- **Flow**:
  1. On app load, check localStorage for cached styles and timestamp
  2. If cache is fresh (within TTL), use cached data
  3. If cache is stale or missing, fetch from `/self`
  4. Store fetched data with current timestamp
  5. If fetch fails and cache exists, use stale cache with warning banner

### 6.3 Error Handling
- **Primary Strategy**: Show error message with retry button
- **UI**:
  - Block app initialization until `/self` succeeds OR user dismisses error
  - Clear error message: "Unable to load basemap styles catalog. Please check your network connection or API key." |~This should be a message on the console, the user can not fix this in the playground~|
  - Keep trying every few seconds
  - |~If retry fails multiple times, display a message on the screen with a link to https://status.location.arcgis.com/ and inform the user something by be unestable~|

---

## 7. User Interface Design

### 7.1 Overall Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo, Title, Token Input (collapsed)            │
├───────────────┬─────────────────────────────────────────┤
│               │                      Showcase locations │
│  Left Sidebar │         Map Viewer                      │
│  (collapsible)│      (MapLibre instance)                │
│  - Family     │                                         │
│    toggle     │                                         │
│  - Style Grid │                                         │
│  - Filter     │                                         │
│    chips      │                                         │
│               │                                         │
│  - Parameter  │                                         │
│    Controls   │                                         │
│    • Language │                                         │
│    • Worldview│                                         │
│    • Places   │                                         │
│               ├─────────────────────────────────────────┤
│               │  Code Generator Panel (collapsible)     │
│               │  - Library tabs                         │
│               │  - Code snippet display                 │
│               │  - CodePen button / Download button     │
└───────────────┴─────────────────────────────────────────┘
```

### 7.2 Style Browser (Left Sidebar)

#### Family Toggle
- **Design**: Toggle or tab component (Calcite)
- **Options**: `ArcGIS` | `Open`
- **Behavior**: Switching families resets parameters to defaults and updates style grid |~it should keep the parameters (when possible) ~|

#### Style Grid
- **Layout**: Grid of style cards, ALL visible (no accordion/tabs) |~There are many, so keep that in mind, maybe it should display a modal or a mechanishm to see them almost in full screen. Or a scroll by default with the possibility to display a "modal" to quickly check them~|
- **Grouping**: Visually grouped by category with subtle headers (Streets, Topography, etc.)
- **Card Design**:
  - **Thumbnail**: From `thumbnail` field in `/self` response
  - **Title**: Human-readable style name (e.g., "Navigation" not "arcgis/navigation")
  - **Capability Badges**: Small colored icons/chips on or near thumbnail
    - 🌐 Language support (always visible for most styles)
    - 🗺️ Worldview support (when `supportedWorldviews` exists)
    - 📍 Places support (when `supportsPlaces: true`)
    - 🏷️ Labels layer (when style ends in `/labels`) |~this should be in all styles that contain labels, not just the specific that only contain labels~|
    - |~Add another badge for "base" when the style include a base layer~|
    - |~Badges should be listed on any style when it supported, and hidden when not. But in the config you should be able to configure this; allowing to show the badge but grayed out~|
  - **Visual State**: Highlight selected style
  - **Labels Styles**: Positioned at end of each group with distinct "overlay" badge |~I like this idea, but maybe "/base" layers should behave similarly~|

#### Filter Chips (Above Grid)
- **Chips**: "Streets", "Topography", "Satellite", "Reference", "Creative"
- **Behavior**: Multi-select filter (can select multiple categories)
- **Active State**: Highlighted chip shows filtered styles

#### Capability Legend
- **Position**: Above or below filter chips
- **Content**: Small legend explaining badge icons (with tooltips)

### 7.3 Parameter Controls (Left Sidebar)

#### Language Dropdown
- **Options**: "Default (global)", "Local", then all supported ISO codes with names (e.g., "Español - es") |~I already made a note about keeping the language names in English (the app won't be localize in initial phases, but should be listed as a possible future enhancement)~|
- **Disabled State**: If style doesn't support language, gray out with tooltip
- **Tooltip**: "Choose label language. 'Global' shows English everywhere, 'Local' shows native names in local regions."

#### Worldview Dropdown
- **Options**: "Default (Global View)", then country identifiers (e.g., "China", "India", "Israel", etc.)
- **Disabled State**: Grayed out with warning icon when style doesn't support worldview
  - Tooltip: "This style does not support worldview selection. Only certain ArcGIS styles (like Navigation, Streets, Community) support disputed boundary views."
- **Enabled Tooltip** (subtle): "Controls boundaries in disputed territories. Does not reflect Esri's official position."

#### Places Control
- **Type**: Radio buttons or select
- **Options**: "None", "All POIs", "Attributed POIs"
- **Disabled State**: Grayed out when `supportsPlaces: false`
- **Helper Features** (when enabled and `attributed` selected):
  - **Zoom Threshold Indicator**: "Places visible at zoom level 12+" (dynamically calculated based on current zoom) |~I'm not sure if this is actyally the zoom level wheree they become visible. I would prefer to have this as a config parameter.~|
  - **Jump to Example Button**: "Show Places Example" - jumps to preset location with visible places |~Use a button if a single location, or a dropdown if I configure multiple~|
  - **Interactive Hover**: When hovering over place features on map, show popup with `esri_place_id`, `name`, `category`
  - |~Add the possibility to filter places by category~|

### 7.4 Showcase Locations (Left Sidebar)
- **Design**: List of preset location buttons
- **Content**: Hardcoded config mapping styles to demo locations
  - **Streets styles** → Dense urban areas (Tokyo, NYC, London, Paris)
  - **Topography styles** → Natural landmarks (Grand Canyon, Swiss Alps, Himalayas)
  - **Outdoor styles** → Parks, trails (Yosemite, Lake District, New Zealand)
  - **Satellite styles** → Recognizable landmarks (Great Barrier Reef, Dubai Palm Islands)
  - **Creative styles** → Visually interesting cities (Venice, Amsterdam, San Francisco)
- **Behavior**: Click button to pan/zoom map to preset location
- **UI**: Small chip-style buttons with location names |~I think this will be better as a dropdown and "onchange" move to the selected location~|

### 7.5 Map Viewer (Center Panel)
- **Library**: MapLibre GL JS (v5.x)
- **Initial State**: |~This should be configurable in the config file~|
  - Random style from default configurations OR `arcgis/navigation`
  - Center: `[0, 30]`, Zoom: `2`
  - Language: `global`
  - Places: `none`
  - |~Leave placeholders in the config file for all supported parameters in case I want to change it~|
- **Interactions**:
  - Standard pan/zoom controls
  - Current zoom level displayed between +/- buttons
  - When `places=attributed`: hover popup showing place details
- **Behavior**: Updates immediately when parameters change via `map.setStyle()`

### 7.6 Code Generator Panel (Bottom)
- **Collapsible**: Can be hidden/shown with toggle |~Initial state = hidden~|
- **Library Tabs**: MapLibre GL JS, Leaflet (Phase 1), additional libraries later
- **Code Display**: |~there is no need to display code in the playground the export buttons are enough~|
- **Export Buttons**:
  - **"Open in CodePen"**:
    - POST code to CodePen with token included |~The token included by the user, not the playground token~|
    - Show prominent warning modal before opening: "Your API key will be visible in the CodePen. Use for testing only. Learn about API keys best practices: https://developers.arcgis.com/documentation/security-and-authentication/security-best-practices/#api-key-authentication"
  - **"Download HTML"**:
    - Download self-contained HTML file
    - CDN-linked libraries (lightweight)
    - Includes user's current map state and token
    - Comments with customization guidance |~and links to documentation pages~|

---

## 8. Code Generation - Pluggable Template System

### 8.1 Architecture |~Reconsider as I said before if it should use a front matter with library versions, HTML, CSS, etc~|
- **Location**: Templates stored as JavaScript modules in `src/templates/` 
- **Structure**: Each template exports a function that receives context and returns code string
- **Context Object**:
  ```javascript
  {
    styleUrl: "https://basemapstyles-api.arcgis.com/...",
    token: "user's API key",
    center: [lng, lat],
    zoom: 12,
    styleName: "arcgis/navigation",
    language: "es",
    worldview: "spain",
    places: "attributed",
    libraryVersion: "2.1.9" // from template config
  }
  ```

### 8.2 Template Example (MapLibre) |~This code sample is not accurate, in this case it should use MapLibreGL JS. Add this to the requirements and also for Leaflet, it should use Esri Leaflet plugin to load the basemaps~|
```javascript
// src/templates/maplibre.js
export const maplibreTemplate = (context) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ArcGIS Basemap - ${context.styleName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- MapLibre GL JS -->
  <script src="https://unpkg.com/maplibre-gl@${context.libraryVersion}/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl@${context.libraryVersion}/dist/maplibre-gl.css" rel="stylesheet">

  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    // Initialize map with ArcGIS basemap style
    // For production, use environment variables for API keys
    // Learn more: https://developers.arcgis.com/documentation/security/

    const map = new maplibregl.Map({
      container: 'map',
      style: '${context.styleUrl}',
      center: [${context.center[0]}, ${context.center[1]}],
      zoom: ${context.zoom},
      attributionControl: true
      |~Consider if we should include all parameters, commented, for developer reference~|
    });

    // Add Esri attribution (required by Terms of Service)
    map.on('load', () => {
      console.log('Map loaded successfully');
      // Add your custom layers or interactions here
    });
  </script>
</body>
</html>`;
};

export const config = {
  name: "MapLibre GL JS",
  version: "2.1.9", |~I guess this should match context.libraryVersion~|
  docs: "https://maplibre.org/maplibre-gl-js-docs/",
  icon: "maplibre-icon.svg"
};
```

### 8.3 Template Registry |~remember, we want to be able to community maintain this in the long run, so supporting version is required~|
```javascript
// src/templates/index.js
import { maplibreTemplate, config as maplibreConfig } from './maplibre';
import { leafletTemplate, config as leafletConfig } from './leaflet';

export const templates = {
  maplibre: { generate: maplibreTemplate, ...maplibreConfig },
  leaflet: { generate: leafletTemplate, ...leafletConfig },
  // Future: arcgis-js, cesium, openlayers
};
```

### 8.4 Template Requirements
Each template MUST:
1. Generate a fully functional standalone HTML file
2. Include proper library CDN links with specific versions
3. Show the exact map state from the playground (style, center, zoom)|~and any other supported and parameter set in the playground~|
4. Include Esri attribution as per Terms of Service |~Some libraries do that by default, other need to add it manually, but with the samples I will provide you should be OK~|
5. Add security comments about API key management |~Importance of scoping and rotate them frequently. You could include a link to a page in the repo with more information, link to docs, an issue for questions, etc~|
6. Add helpful comments for customization
7. Reference examples from `developers.arcgis.com` in comments |~Or any other developer resources like tutorials or documentations pages~|
8. |~There should be a mechanism or easy way to debug the templates locally, meaning the used HTML should probably be imported in the build process byt would allow me do easily to manual changes if needed~|

### 8.5 Adding New Templates (Future) |~Reevaluate based on my previous annotations~|
Process for contributors:
1. Create new file in `src/templates/[library-name].js`
2. Export `template` function and `config` object
3. Follow template requirements above
4. Add to registry in `src/templates/index.js`
5. Test with multiple styles and parameter combinations
6. Submit PR with example output

---

## 9. Token Management and Security

### 9.1 Token Input
- **Location**: Collapsible section in header or settings panel |~This should be  in the code generator panel. It's not been used by the playground by the the generated code ~|
- **Input Type**: `type="password"` with optional show/hide toggle
- **Placeholder**: "Paste your API key (required)"
- **Validation**:
  - |~It shouldn't validate in the playground, only make sure it was introduced to be able to generate the code sample, otherwise not enable the button to generate the code~|
- **Storage**: NOT persisted (session memory only for security)

### 9.2 Security Warnings |~Reevaluate this warning and focus on setting referrers and rotate frequently~|
- **Before CodePen**: Modal with prominent warning:
  ```
  ⚠️ Security Warning

  Your API key will be visible in the generated CodePen URL and to anyone who views the pen.

  For testing only. For production:
  - Use environment variables
  - Implement a proxy server
  - Use OAuth 2.0 for user authentication

  Learn more: [link to security docs]

  [Cancel] [I Understand, Open CodePen]
  ```
- **In Generated Code**: Comments warning about token exposure and linking to security best practices

### 9.3 Download Option (Safer Alternative)
- Generates same code but downloaded as local HTML file
- User can test locally without exposing token in a public URL
- Recommended in UI as safer option for experimentation

---

## 10. Analytics and Telemetry

### 10.1 Metrics to Track
- Page views and session duration
- Style selection frequency (which styles are most explored)
- Parameter usage (how often worldview/places are used)
- Library preferences in code generation
- CodePen vs Download button usage
- Error rates (failed /self calls, invalid tokens) |~Consider if using something like rollerbar to receive error warning would be easy, or add it to the future improvements~|
- |~The app should have a call to action to create an account when needing to set an API key (in case the user do not have an account). Track clicks here too~|
- |~Add a cookie consent notice for visitors from laws regarding to it, like Europeans~|


### 10.2 Implementation
- Use Google Analytics
- No PII collection
- Respect Do Not Track headers
- Clear privacy policy link in footer |~I don't personally have one. This will live on my personal repo, so include a markdown file with a template and include a TODO list for me or placeholders to fill it.~|

### 10.3 Purpose
- Understand developer behavior to improve playground
- Identify popular styles for prioritization
- Track/identify issues to be able to solve them (high error rates, confusing UX)

---

## 11. Phase 1 MVP - Feature Prioritization |~Reevaluate based on all my previous annotations~|

### 11.1 Phase 1 Scope (MVP)
**Goal**: Core exploration and code generation with 1 or 2 libraries

**Included**:
- ✅ Dynamic style loading from `/self` with simple TTL cache
- ✅ Family toggle (ArcGIS / Open)
- ✅ Style browser with grid layout, filters, and capability badges
- ✅ Parameter controls (language, worldview, places) with proper disabled states
- ✅ MapLibre map viewer with real-time updates
- ✅ Showcase location presets (hardcoded config)
- ✅ Places interaction (hover popup with id/name/category when `attributed`)
- ✅ Code generation for **MapLibre GL JS** and **Leaflet**
- ✅ CodePen export with security warnings
- ✅ HTML download option
- ✅ Token input (password-style, non-persistent)
- ✅ Responsive layout (desktop + tablet)
- ✅ Basic error handling (/self failures, invalid tokens)
- ✅ Calcite Design System components
- ✅ Tooltips and help text for all parameters

**Excluded** (Future Phases):
- ❌ Session-based model active management (educational code examples only)
- ❌ Custom style itemId search
- ❌ Multi-view (simultaneous maps at different zooms)
- ❌ Additional libraries (ArcGIS Maps SDK, Cesium, OpenLayers)
- ❌ 3D map styles
- ❌ Tile usage counter
- ❌ Advanced caching (versioning, migrations)
- ❌ UI internationalization (English only for MVP)
- ❌ Mobile-optimized layout (tablet+ only)

### 11.2 Phase 2 (Enhanced)
- Multi-view option (2 synchronized maps)
- ArcGIS Maps SDK for JavaScript template
- Custom style search by itemId
- Mobile responsive refinements
- Session model educational examples with step-by-step guide
- Improved analytics dashboard

### 11.3 Phase 3 (Advanced)
- CesiumJS and OpenLayers templates
- 3D map styles support
- Tile usage visualization (educational mock counter)
- UI internationalization
- Community template contributions (external fetch)
- Advanced showcase mode (multiple preset views per style)

---

## 12. Accessibility and Best Practices |~Reevaluate based on all my previous annotations. I think basemaps is not a great technology for blind people, so simplify this if needed, but keep accesibility for other issues~|

### 12.1 Accessibility (WCAG 2.1 AA Compliance)
- ✅ Keyboard navigation for all interactive elements
- ✅ Proper focus indicators (visible outlines)
- ✅ ARIA labels for icon buttons and controls
- ✅ Semantic HTML (headings, landmarks, lists)
- ✅ Color contrast ratios minimum 4.5:1
- ✅ Screen reader announcements for map updates
- ✅ Alt text for style thumbnails
- ✅ Form labels associated with inputs

### 12.2 Performance
- Lazy load style thumbnails (intersection observer)
- Debounce map updates on parameter changes
- Minimize re-renders (React.memo, useMemo where appropriate)
- Code splitting by route if multi-page (not needed for MVP)
- Compress images and assets

### 12.3 Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features (no IE11 support)
- WebGL required (MapLibre dependency)

### 12.4 Mobile Responsiveness
- Phase 1: Desktop and tablet (768px+)
- Phase 2: Mobile optimization (< 768px)
- Touch-friendly controls (minimum 44x44px tap targets)

---

## 13. Testing Strategy |~I basically want to be sure that while we make progress, we don't break things that previously worked. So I want to have tests that can be runned frequently to identify introduced bugs and fix them before doing any commits ~|

### 13.1 Unit Tests
- URL generation with various parameter combinations
- Cache TTL logic
- Template generation for each library
- Error handling edge cases

### 13.2 Integration Tests
- `/self` endpoint fetch and parsing
- Map initialization with different styles
- Parameter changes triggering style reload
- CodePen POST integration

### 13.3 E2E Tests (Optional)
- Full user flow: select style → configure params → generate code → export
- Error scenarios (network failures, invalid tokens)

### 13.4 Manual Testing Checklist
- [ ] All styles load correctly in both families
- [ ] Parameter controls enable/disable appropriately per style
- [ ] Map updates on parameter change
- [ ] Code snippets match current selections
- [ ] CodePen export opens with correct code
- [ ] Download generates working HTML file
- [ ] Showcase locations navigate correctly
- [ ] Places hover/popup works at appropriate zoom
- [ ] Error messages clear and actionable
- [ ] Accessible via keyboard only
- [ ] Responsive on tablet

---

## 14. Documentation and Help

### 14.1 In-App Help
- **Tooltips**: On all controls explaining purpose and behavior
- **Info Icons**: Link to relevant documentation sections
- **Contextual Help**: "Learn More" links near complex features
- **Welcome Modal** (optional): First-time user tutorial |~I'm OK with this, but it should be pretty usable with the previous elements. But I'm OK adding a optional icon in the interface (where they use to be in case anyone needs more guided instructions), but not a first time  modal displayed by default~|

### 14.2 External Documentation
- README.md with:
  - What is the playground
  - How to use it
  - How to contribute templates
  - Deployment instructions
- CONTRIBUTING.md for developers wanting to add templates |~Or suggest improvements, report bugs, etc. Consider adding issue templates at some point.~|
- Link to official Esri docs: https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/ and https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/

### 14.3 Example Links to Include
- [Introduction to Basemap Styles Service](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/introduction-basemap-styles-service/)
- [ArcGIS Styles Reference](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/arcgis-styles/)
- [Open Styles Reference](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/open-styles/)
- [Language Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#language)
- [Worldview Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#worldview)
- [Basemap Places Overview](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/basemap-places/)
- [Usage Models Comparison](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/basemap-usage-styles/)
- [API Key Security Best Practices](https://developers.arcgis.com/documentation/security/)

---

## 15. Known Considerations and Design Decisions

### 15.1 Why React + Calcite?
- **React**: Robust state management, component reusability, large ecosystem
- **Calcite**: Official Esri design system, pre-built accessible components, consistent branding

### 15.2 Why Not Active Session Management?
- Complex lifecycle management (expiration, renewal)
- Playground should be exploratory, not transactional
- Educational approach (show code) achieves learning goal

### 15.3 Why Pluggable Templates in Codebase (Not External)?
- Simpler architecture for MVP
- Templates versioned with app (no version mismatch issues)
- Easier testing and quality control
- Can evolve to external fetching in Phase 2/3

### 15.4 Why Skip Custom Styles in MVP?
- Adds complexity (unknown schema, validation)
- Core value is exploring public catalog
- Can add later once core flows are solid

### 15.5 Why Simple TTL Cache (Not Sophisticated)?
- MVP needs to ship quickly
- Service catalog doesn't change frequently
- 24-hour TTL is reasonable balance
- Can enhance with versioning/migrations later

### 15.6 Why Password Input for Token?
- Signals sensitivity to users
- Prevents accidental screenshots with visible keys
- Standard pattern for sensitive inputs

---

## 16. Future Enhancements (Beyond Phase 3)

### 16.1 Potential Features
- **Dark Mode**: UI theme toggle
- **Save/Share Configurations**: Generate shareable URLs with encoded parameters |~Add this to the MVP. It should be rocket science, right?~|
- **Comparison Mode**: Side-by-side view of two different styles
- **Layer Overlay**: Allow users to add GeoJSON for testing data visualization on various basemaps |~I don't personally think this make too much sense, it should allow to use the MapViewer instead, but it is true that I think some basemap parameters like enable/disable places is not in the Map Viewer Interface. Any ArcGIS Location Platform user have access to it~| 
- **Style Customization Preview**: Light integration with Vector Tile Style Editor
- **Community Showcase**: Gallery of user-created examples |~with beautifully designed maps experiences~|
- **Embed Code**: iframe embed snippets for documentation sites
- |~Add specific locations per style to highlight specific features, like how outdoors styles highlight specific features like water bodies, green areas or trails. With some markers drawing user attention to them and labels with popovers with explanations. That will help understand the user what's the difference between styles and why some are a better fit for some applications than others~|
- |~Be able to enable a split view with a "swipe bar" that allows the user to visually compare the different between styles dragging and dropping~|

### 16.2 API Enhancements (Requires Esri Action)
- Include showcase locations in `/self` response metadata
- Provide zoom threshold data for places visibility
- Versioning for style catalog (for smarter cache invalidation)

---

## 17. Success Metrics |~I don't think this is too relevant for the AI model to build this, right? consider removing this~|

### 17.1 Developer Adoption
- Number of unique visitors
- Code generation events (CodePen opens, downloads)
- Return visitor rate

### 17.2 Educational Impact
- Reduction in support questions about basemap styles
- Increase in diverse style usage (beyond just `navigation`)
- Positive feedback from developer community

### 17.3 Technical Health
- Error rate < 1% for `/self` fetches
- Map load time < 2 seconds on average
- Accessibility audit score > 90

---

## 18. Appendix: Style URL Examples |~This is incomplete, I'm not sure what's the purpose of having this here when we have the link to "/self"~|

### 18.1 Basic Navigation Style
```
https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/navigation?token=YOUR_API_KEY
```

### 18.2 Spanish Labels with China Worldview
```
https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/streets?language=es&worldview=china&token=YOUR_API_KEY
```

### 18.3 Imagery with Attributed Places
```
https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/imagery?language=global&places=attributed&token=YOUR_API_KEY
```

### 18.4 Open Style (Fewer Parameters)
```
https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/open/navigation?language=fr&token=YOUR_API_KEY
```

---

## 19. Glossary

- **Basemap**: Background map providing geographic context for data visualization
- **Style**: Visual design specification (colors, symbols, labels) for rendering map data
- **Vector Tiles**: Map data delivered as geometric vectors (vs raster images), allowing client-side styling
- **Mapbox Style Specification**: JSON format for defining map styles (v8)
- **POI**: Point of Interest (restaurant, landmark, business, etc.)
- **Worldview**: Political/territorial boundary perspective for disputed areas
- **Attribution**: Legal requirement to credit data providers
- **API Key**: Token authorizing access to Esri services |~This one also expire, but the user can set them to last for 1 year~|
- **Session Token**: Temporary token for unlimited tile access within time window
- **TTL**: Time-To-Live (cache expiration duration)

---

## 20. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-02-13 | [Author] | Complete rewrite merging original SPEC.md and SPEC2.md with stakeholder interview decisions. Moved to React architecture with phased delivery approach. |
| 1.0 | [Previous] | [Author] | Initial specification for single-page HTML implementation |

---

**End of Specification**

For questions or clarifications, contact: [developers@esri.com](mailto:developers@esri.com)
