# ArcGIS Basemap Styles Service v2 Playground - Specification

## 1. Executive Summary

### 1.1 Purpose
An interactive browser-based playground for developers to explore and experiment with the **ArcGIS Location Platform Basemap Styles Service v2**. The tool enables users to:

- Browse and filter available basemap styles (ArcGIS, Open, and deprecated OSM families) organized by thematic groups
- Configure style parameters (`language`, `worldview`, `places`) and see results in real-time
- Generate ready-to-use code snippets for multiple mapping libraries
- Export working examples to CodePen or download as standalone HTML files
- Share configurations via URL with encoded parameters

> **Note**: User will provide initial code samples for each library to be templatized/improved.

### 1.2 Key Principles
- **Dynamic, not hardcoded**: Style catalog fetched from `/self` endpoint to always reflect latest available styles
- **Educational focus**: Teach developers how to use the service through interactive exploration
  - Each parameter links to existing documentation, code samples, API reference for deeper learning
- **Multi-library support**: Generate code for different mapping libraries via pluggable template system
  - Templates specify library versions and include call for community contributions/requests
- **Developer-friendly**: Transparent code generation, clear documentation, accessible UX

### 1.3 Out of Scope
This playground focuses exclusively on **ArcGIS Location Platform** basemap styles. It does NOT cover:
- ArcGIS Online basemaps (different service, different access patterns)
- 3D map styles (may be added in future)
- Backend services or authentication flows (future: allow users to log in with ArcGIS identity, see available API keys, and select one)
- Custom style editing via Vector Tile Style Editor (future consideration)
- Session-based usage model in playground UI (educational code examples only)
  - Note: Templates will support session model configuration in generated code

---

## 2. Technical Architecture

### 2.1 Technology Stack
- **Framework**: React (robust ecosystem and state management)
- **UI Components**: Calcite Design System (Esri's official design system with React components)
- **Mapping Library**: MapLibre GL JS v5.x for the playground viewer
- **Node Version**: Node 25 (enforced via `.nvmrc`)
- **Build Tool**: Vite (modern bundler with HMR)
- **Styling**: CSS Modules or Calcite's styling approach
- **State Management**: React Context or simple prop drilling (avoid over-engineering for MVP)
- **Testing**: Vitest + React Testing Library + pre-commit hooks
- **Analytics**: Google Analytics with cookie consent
- **Deployment**: GitHub Pages (static hosting)

### 2.2 Project Structure
```
.nvmrc                           # Node 25
src/
├── components/
│   ├── StyleBrowser/            # Style grid, filters, badges, expand modal
│   ├── MapViewer/               # MapLibre map instance
│   ├── ParameterControls/       # Language, worldview, places inputs
│   ├── CodeGenerator/           # Export buttons, token input, CTA
│   ├── ShowcaseLocations/       # Dropdown with location presets
│   └── CookieConsent/           # Simple GDPR banner
├── templates/
│   ├── html/                    # Actual HTML templates (real code, not placeholders)
│   │   ├── maplibre.html
│   │   ├── leaflet.html
│   │   └── ...
│   ├── config/                  # Template metadata (library versions, CDN URLs, etc)
│   │   ├── maplibre.json
│   │   ├── leaflet.json
│   │   └── ...
│   └── index.js                 # Template registry and generator functions
├── services/
│   ├── styleService.js          # Fetch /self, cache management with localStorage fallback
│   ├── codepenService.js        # CodePen POST integration
│   ├── shareService.js          # Generate/parse shareable URLs
│   └── analytics.js             # Google Analytics with consent tracking
├── config/
│   ├── showcaseLocations.js     # Global list with style tags, configurable visibility
│   └── appDefaults.js           # Default map state (style, center, zoom, language, places, etc)
└── utils/
    ├── urlGenerator.js          # Build style URLs with parameters
    ├── storage.js               # localStorage helpers with TTL
    └── urlEncoder.js            # Encode/decode config for share URLs
```

### 2.3 Template System Architecture
**Goal**: Separate HTML from JS to improve DX, while keeping everything bundled.

**Structure**:
- **HTML files** (`/templates/html/`): Pure HTML with standard placeholders like `{{styleUrl}}`, `{{center}}`, `{{zoom}}`, etc.
  - Real, working HTML code (not JS template literals)
  - Syntax highlighting in IDE
  - Easy to preview and test
- **Config files** (`/templates/config/`): JSON with library metadata
  ```json
  {
    "name": "MapLibre GL JS",
    "version": "5.0.0",
    "cdnJS": "https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.js",
    "cdnCSS": "https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.css",
    "docs": "https://maplibre.org/maplibre-gl-js-docs/",
    "attribution": "auto"
  }
  ```
- **Generator** (`/templates/index.js`): Imports HTML as raw strings, replaces placeholders with runtime values

**Template Dev Mode** (Phase 2): Separate dev server with file watcher to preview template changes without playground export step. If too complex for MVP, defer.

### 2.4 Build and Development
- **Development**: `npm run dev` (Vite dev server with HMR)
- **Testing**: `npm run test` (Vitest + React Testing Library)
- **Pre-commit**: Husky hook runs tests + linting (blocks commits if failures)
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
- **style_response**: `styles` (returns Mapbox Style JSON v8) or `webmaps` (returns ArcGIS web map)
  - **Playground use**: Use `styles` for compatibility with libraries expecting Mapbox Style Spec
- **style_family**: `arcgis`, `open`, or `osm`
- **style_name**: e.g., `navigation`, `light-gray/labels`, etc.

### 3.2 Style Families

| Family | Data Source | Supported Parameters | Notes |
|--------|-------------|---------------------|-------|
| **arcgis** | Esri and authoritative providers | `language`, `worldview`, `places` (varies by style) | More features, richer metadata |
| **open** | Overture Maps, OpenStreetMap | `language` only | Community data, supports fewer options than ArcGIS family |
| **osm** | OpenStreetMap legacy styles | `language` only | Deprecated family shown separately in UI for backwards compatibility |

### 3.3 Style Groups (Categories)
Styles are organized into thematic groups:

1. **Streets** - Navigation and routing (e.g., `navigation`, `streets`, `community`, and more)
2. **Topography** - Terrain and natural features (e.g., `outdoor`, `terrain`, `oceans`, and more)
3. **Satellite** - Imagery-based (e.g., `imagery`, `imagery/labels`)
4. **Reference** - Neutral backgrounds for data overlay (e.g., `light-gray`, `dark-gray`)
5. **Creative** - Artistic styles (e.g., `nova`, `modern-antique`, `newspaper`)

### 3.4 Special Layer Types

#### Label Styles (`/labels`)
- Styles ending in `/labels` (e.g., `light-gray/labels`, `oceans/labels`)
- **Purpose**: Transparent reference layers for overlaying on custom base layers
- **UI Treatment**:
  - Position at END of each group
  - Show "Labels Layer" badge
  - Description: "Use as overlay on custom base layers"
- **Note**: These are NOT standalone basemaps

#### Base Styles (`/base`)
- Styles ending in `/base` (e.g., `light-gray/base`, `terrain/base`)
- **Purpose**: Base layers without labels, allowing users to add custom labels or reduce clutter
- **UI Treatment**:
  - Position at END of each group (before or with `/labels` styles)
  - Show "Base Layer" badge
  - Description: "Base layer without labels"
- **Includes**: Hillshade styles and other specialty layers not commonly found in other mapping providers

#### Styles with Embedded Labels
- Styles that contain labels but aren't exclusively labels (e.g., `navigation`, `streets`)
- Show "Labels" badge to indicate label support
- Distinguish from label-only styles

---

## 4. Query Parameters

### 4.1 language
- **Type**: String (ISO 639 code or special keywords)
- **Values**: `global` (English everywhere), `local` (native names in local regions, English elsewhere), or ISO codes like `es`, `fr`, `ja`, `zh-CN`, etc.
- **Support**: Most styles support this parameter
- **UI**: Dropdown with language name in English + code (e.g., "Spanish - es")
  - **Note**: App UI remains in English for MVP (UI internationalization is future enhancement)
- **Behavior Examples**:
  - `global`: "Tokyo" everywhere on the map
  - `local`: "東京" when viewing Japan, "Tokyo" when viewing other regions
  - `es`: "Tokio" everywhere on the map
- **Documentation Links**: Near parameter control, link to [Language Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#language)

### 4.2 worldview
- **Type**: String (country identifier)
- **Values**: `china`, `india`, `israel`, `japan`, `morocco`, `pakistan`, `southKorea`, `unitedArabEmirates`, `unitedStatesOfAmerica`, `vietnam`
- **Support**: Only certain ArcGIS family styles (e.g., `navigation`, `streets`, `community`)
- **Purpose**: Controls boundary lines and labels in disputed territories
- **UI**:
  - Dropdown, only enabled when style supports it
  - **Disabled state**: Grayed out with warning icon + tooltip: "This style does not support worldview capability"
  - **Enabled tooltip** (subtle): "Controls boundaries and labels in disputed areas. Does not reflect Esri's geopolitical position."
- **Documentation Links**: Link to [Worldview Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#worldview)

### 4.3 places
- **Type**: String (enum)
- **Values**:
  - `none` - Hide all POIs
  - `all` - Show all available POIs
  - `attributed` - Show only POIs with `esri_place_id` and `name` attributes (can be queried via Places API)
- **Support**: Only certain ArcGIS styles (e.g., `navigation`, `streets`, `imagery`)
- **UI**:
  - Radio buttons or select dropdown
  - **Disabled state**: Grayed out with warning icon + tooltip (same behavior as worldview)
  - **When enabled**: Show helper text about zoom-dependent visibility
  - **When `attributed` selected**:
    - Highlight showcase locations in dropdown (if configured for places)
    - Display interactive hover popup on map showing `esri_place_id`, `name`, `category`
- **Places Category Filtering** (Phase 2): Dropdown with multi-select, autocomplete search, "Select All" and "None" options
- **Documentation Links**: Link to [Basemap Places Overview](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/basemap-places/)

### 4.4 token
- **Type**: String (API key or session token)
- **Required**: Yes (must have `premium:user:basemaps` privilege)
- **UI Location**: Code generator panel (NOT header) - token is for generated code, not playground
- **Input Type**: `type="password"` with optional show/hide toggle
- **Placeholder**: "Paste your API key"
- **Validation**:
  - Only validate presence (not empty) to enable export buttons
  - Do NOT validate against API in playground
  - If export attempted without token, block and show prompt
- **Empty State**: Before token entered, show prominent card:
  ```
  Need an API key?
  Create a free ArcGIS Location Platform account to get started.
  [Sign Up] [Learn More]
  ```
  - Track CTA clicks in analytics
- **Failure Handling**: If user reports issues, show modal with:
  - Link to [Get API Key tutorial](https://developers.arcgis.com/documentation/security-and-authentication/)
  - Common troubleshooting (wrong privileges, expired key, etc.)
  - Link to documentation
  - Videos (user can provide these)
- **Security Notes**:
  - Basemap API keys are typically exposed in client-side code (unlike database credentials)
  - Important: Properly scope keys to specific referrers and rotate frequently
  - Link to security best practices repo page
- **Storage**: NOT persisted (session memory only)

**API Key Expiration Note**: API keys can be set to expire, but users can configure them to last up to 1 year.

### 4.5 echoToken
- **Type**: Boolean
- **Default**: `true`
- **Purpose**: Controls whether token is included in style response
- **Playground Use**: Ignore completely (not relevant for playground purpose)

### 4.6 f
- **Type**: String
- **Values**: `json` or `pjson`
- **Playground Use**: Default to `json`, hide from UI (not relevant)

---

## 5. Usage Models

### 5.1 Tile-Based Model
- **Mechanism**: Each tile request counts as one basemap transaction
- **Token**: Standard API key
- **Use Cases**:
  - Low-traffic apps, testing, prototyping
  - Organizations requiring predictable costs
  - Applications on smaller screens with low interaction
  - Scenarios where tile count is naturally limited
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
- **Important Limitation**: ArcGIS Maps SDK for JavaScript versions <5.0 do NOT support session tokens
  - Version 5.0 will be available by end of February 2026
  - Do not create ArcGIS Maps SDK template until v5.0 is released

**Rationale**: Session creation charges users and requires token refresh logic. Keep playground simple and non-transactional. Generated code can demonstrate session patterns.

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
  5. **If fetch fails**: Use stale localStorage cache as fallback with warning banner

### 6.3 Error Handling
- **Primary Strategy**: Auto-retry with console logging
- **Flow**:
  1. On `/self` failure, log error to console (user cannot fix in playground)
  2. Retry every few seconds (configurable interval)
  3. If cache exists, use it immediately while retrying in background
  4. After multiple failures, show on-screen message:
     ```
     Unable to connect to basemap styles service.
     Service may be experiencing issues.

     [Check Status Page]
     ```
     Link to: https://status.location.arcgis.com/
  5. Continue retrying in background
- **No blocking**: Don't prevent app usage if cache is available
- **Implementation Status (2026-02-16)**:
  - Added `src/services/styleService.js` with `/self` URL builder, network fetch, TTL cache reads/writes, and stale-cache fallback on fetch failure
  - Added `src/services/styleService.test.js` coverage for cache-hit, network fetch/cache write, stale fallback, and hard failure behavior

---

## 7. User Interface Design

### 7.1 Overall Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo, Title, [Collapse Sidebar Button]          │
├───────────────────────────────────────┬─────────────────┤
│                                       │ Left Docked     │
│                                       │ Tools Panel     │
│          Map Viewer                   │ [Action Bar +   │
│        (MapLibre v5.x)                │ panel content]  │
│               │                                         │
│                                       │ - Style         │
│                                       │   Selection     │
│                                       │ - Language      │
│                                       │ - Worldview     │
│                                       │ - Places        │
│                                       │ - Code          │
│                                       │   Generator     │
│                                       │ - Contact       │
└─────────────────────────────────────────────────────────┘
│ Cookie Consent Banner (if not accepted)                 │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Style Browser (Docked Tools Panel)

#### Tools Panel Collapsibility
- **Toggle button** in header to collapse/expand entire docked tools panel
- **Purpose**: Maximize map view for focused exploration
- **Behavior**: Smooth animation, persists state in session storage

#### Family Toggle
- **Design**: Toggle or tab component (Calcite)
- **Options**: `ArcGIS` | `Open`
- **Behavior**: Switching families updates style grid and **preserves parameter values when possible**
  - Example: `language=es` remains if new family supports it
  - Reset only incompatible parameters (e.g., `worldview` when switching to Open)

#### Category Tabs (Above Grid)
- **Tabs**: "All", "Streets", "Topography", "Satellite", "Reference", "Creative"
- **Behavior**: Single-select filter via `calcite-tabs`
- **Active State**: Active tab shows filtered styles
- **Default**: `All` selected (show all styles)

#### Capability Legend
- **Position**: Above or below category tabs
- **Content**: Small legend explaining badge icons with tooltips
- **Badges**:
  - 🌐 **Language** - Supports language parameter
  - 🗺️ **Worldview** - Supports worldview parameter
  - 📍 **Places** - Supports places parameter
  - 🏷️ **Labels** - Style contains labels (not just label-only styles)
  - 📄 **Base** - Base layer without labels (pattern: `/base` in name)

#### Style Grid
- **Layout**: Scrollable grid of style cards, ALL visible (no accordion/tabs)
- **Scroll**: Vertical scroll within sidebar with virtual scrolling for performance
- **Expand Button**: At top or bottom of grid, opens modal showing all styles in large format
  - **Modal**: Full-screen or large modal with grid of styles, easier browsing
  - **Use Case**: Quick scanning of all available styles without sidebar constraints
- **Grouping**: Visually grouped by category with subtle headers (Streets, Topography, etc.)
  - **Card Design**:
  - **Thumbnail**: From `thumbnail` field in `/self` response (lazy loaded)
  - **Title**: Human-readable style name (e.g., "Navigation" not "arcgis/navigation")
  - **Info Icon Overlay**: Show an info icon over the thumbnail in the top-right corner of each style card
    - **Interaction**: Click opens a modal with "When to use this style" guidance and practical use cases
    - **Content Source**: Use editable app config so text is easy to customize without changing component logic (for example, `src/config/styleUseCases.js`)
    - **Content Model**:
      - Style-specific description keyed by full style id (for example, `arcgis/navigation`, `open/osm-style`)
      - Category description keyed by category name (for example, `Streets`, `Topography`, `Satellite`, `Reference`, `Creative`)
      - Optional sample app links per style and/or category for "real app" inspiration
      - Style documentation link per full style id, with fallback to ArcGIS basemap styles docs when a style-specific URL is not configured
    - **Modal Content Order**:
      1. Style-specific description (configured per-style when available, otherwise generated from style id/category to ensure guidance always exists)
      2. Category description (when available for the selected style category)
      3. Style documentation link section (always shown via configured URL or fallback)
      4. Optional "Sample apps" links section (only when links exist)
    - **Fallback**: If a style-specific entry is missing, generate practical developer guidance from style id/category and include docs fallback URL
  - **Capability Badges**: Small colored icons/chips on or near thumbnail
    - **MVP**: Hide unsupported badges (only show applicable ones)
    - **Config**: Allow future toggle to "show all grayed out" for visual consistency
  - **Visual State**: Highlight selected style with border/background
  - **Special Positioning**:
    - `/labels` styles at END of each group with "Labels Layer" badge
    - `/base` styles at END of each group (similar treatment as labels) with "Base Layer" badge
- **Implementation Status (2026-02-16)**:
  - Added a first Style Browser UI in `src/components/StyleBrowser/StyleBrowser.jsx` using Calcite components
  - Supports load/refresh actions, client-side text filtering, and style metadata chips
  - Wired to `getStyleCatalog()` for cache-aware `/self` loading with source logging in console
  - Added internal scrollable style-grid container and an "Expand View" dialog for full-grid browsing
  - Updated layout CSS so app content stays within viewport height with internal panel scrolling and denser thumbnail cards

### 7.3 Parameter Controls (Panel-Based)

#### Language Dropdown
- **Options**: "Default (global)", "Local", then all supported ISO codes with names
  - Format: "Spanish - es", "French - fr" (language names in English)
- **Disabled State**: If style doesn't support language, gray out with tooltip
- **Tooltip**: "Choose label language. 'Global' shows English everywhere, 'Local' shows native names in local regions."
- **Learn More**: Icon linking to [Language Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#language)

#### Worldview Dropdown
- **Options**: "Default (Global View)", then country identifiers (e.g., "China", "India", "Israel", etc.)
- **Disabled State**: Grayed out with warning icon when style doesn't support worldview
  - **Tooltip**: "This style does not support worldview capability. Only certain ArcGIS styles (like Navigation, Streets, Community) support disputed boundary views."
- **Enabled Tooltip** (subtle): "Controls boundaries and labels in disputed areas. Does not reflect Esri's official position."
- **Learn More**: Icon linking to [Worldview Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#worldview)

#### Places Control
- **Type**: Radio buttons or select dropdown
- **Options**: "None", "All POIs", "Attributed POIs"
- **Disabled State**: Grayed out with warning icon + tooltip when `supportsPlaces: false`
- **Helper Text** (when enabled): "Places visibility depends on zoom level"
- **Learn More**: Icon linking to [Basemap Places Overview](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/basemap-places/)
- **Implementation Status (2026-02-16)**:
  - Added `src/components/ParameterControls/ParameterControls.jsx` with language, worldview, and places controls
  - Controls are capability-aware (disabled when unsupported by selected style)
  - Parameter values are sanitized on style changes and applied to MapLibre style URL updates
  - Refactored to support single-section rendering so each control can live in its own docked `calcite-panel`
  - Docked tools rail is mounted in `calcite-shell-panel` `slot="panel-start"` with action-driven panel switching
  - Tool panel content is wrapped in `calcite-block` for consistent Calcite panel-body structure
  - Added a `Code Generator` action in the same tools rail with a placeholder `calcite-panel`
  - Added a `Contact` action with friendly contribution/support copy, links to the GitHub repo and direct contact page, plus reference links to `docs/SPEC.md` and `docs/TODO.md`
  - Contact copy clarifies that some generated style descriptions may still be pending manual review

**Phase 2: Places Category Filter**
- Dropdown with multi-select and autocomplete
- Options: "Select All", "None", individual categories (restaurants, hotels, parks, etc.)
- Filters visible POIs on map by category

### 7.4 Showcase Locations

#### UI Component
- **Type**: Dropdown selector (not buttons)
- **Position**: Top-right of map viewer
- **Behavior**: On selection change, pan/zoom map to location

#### Configuration
- **Format**: Global list with style tags
  ```javascript
  // config/showcaseLocations.js
  export const showcaseLocations = [
    {
      name: "Tokyo (Dense Urban)",
      lat: 35.6762,
      lng: 139.6503,
      zoom: 12,
      tags: ["arcgis/navigation", "arcgis/streets", "Streets"], // specific styles + category
      description: "Dense urban area showcasing street detail"
    },
    {
      name: "Grand Canyon (Terrain)",
      lat: 36.0544,
      lng: -112.1401,
      zoom: 11,
      tags: ["Topography", "arcgis/outdoor", "arcgis/terrain"],
      description: "Natural landmark highlighting topographic relief"
    },
    // ... more locations
  ];
  ```
- **Filtering**: Show locations matching current style or category
- **Visibility Toggle**: Config option to enable/disable per style or globally
- **Dropdown Contents**:
  - Show location name
  - Optionally show description on hover
  - If no matching locations for current style, show generic world view option

#### Suggested Locations (User will populate)
- **Streets styles** → Tokyo, NYC, London, Paris
- **Topography styles** → Grand Canyon, Swiss Alps, Himalayas
- **Outdoor styles** → Yosemite, Lake District, New Zealand
- **Satellite styles** → Great Barrier Reef, Dubai Palm Islands
- **Creative styles** → Venice, Amsterdam, San Francisco

### 7.5 Map Viewer (Center Panel)

#### Map Instance
- **Library**: MapLibre GL JS v5.x
- **Initial State**: Configurable in `config/appDefaults.js`
  ```javascript
  export const defaultMapState = {
    style: "arcgis/navigation", // or random from list
    center: [0, 30],
    zoom: 2,
    language: "global",
    places: "none",
    worldview: "", // empty = global
    // Placeholders for all supported parameters
  };
  ```

#### Map Controls
- Standard pan/zoom controls
- **Zoom display**: Current zoom level shown between +/- buttons
- **Attribution**: MapLibre default attribution control

#### Interactions
- **Standard**: Pan, zoom, rotate (with keyboard shortcuts)
- **Places Hover** (when `places=attributed`):
  - Cursor becomes pointer over place features
  - Popup shows: `esri_place_id`, `name`, `category`
  - Popup follows cursor

#### Updates
- **Behavior**: Map updates immediately when parameters change via `map.setStyle()`
- **Debouncing**: Debounce rapid parameter changes to avoid excessive re-renders
- **Implementation Status (2026-02-16)**:
  - Added `src/components/MapViewer/MapViewer.jsx` using MapLibre GL JS v5 with navigation controls
  - Wired style selection from Style Browser into map updates via `map.setStyle()`
  - Map initializes only when both style and token are available, with inline error display

### 7.6 Code Generator Panel (Bottom)

#### Visibility
- **Default**: Hidden (collapsed)
- **Toggle**: Button to show/hide panel
- **Position**: Docked at bottom of viewport, above cookie banner if present

#### Code Display
- **MVP**: NO code viewer (removed completely)
  - Just export buttons and token input
  - **Future Enhancement**: Add optional simple code snippet preview

#### Token Input Section
- **Location**: Within code generator panel (not header)
- **Empty State** (no token entered):
  ```
  🔑 API Key Required

  To generate code samples, you need an ArcGIS Location Platform API key.

  [Create Free Account] [Learn More]

  Already have a key?
  [Enter API Key]
  ```
  - Track "Create Account" clicks in analytics
  - "Learn More" links to [Get API Key tutorial](https://developers.arcgis.com/documentation/security-and-authentication/)

- **With Token**:
  - Password-style input with show/hide toggle
  - Placeholder: "Paste your API key"
  - Helper text: "Your key is used only in generated code, not by the playground"
  - Security note icon with tooltip about scoping and rotation

#### Library Tabs
- **Phase 1**: MapLibre GL JS, Leaflet
- **Phase 2+**: ArcGIS Maps SDK for JavaScript (v5.0+), CesiumJS, OpenLayers
- **Tab Content**: Just library name and icon (no code display in MVP)

#### Export Buttons
- **"Open in CodePen"**:
  - **Enabled**: Only when token is present
  - **Click**: Show security warning modal first
    ```
    ⚠️ Security Notice

    Your API key will be visible in the CodePen URL and to anyone who views the pen.

    This is normal for basemap keys. To keep your key secure:
    • Set HTTP referrer restrictions in your dashboard
    • Rotate keys frequently

    Learn more: https://developers.arcgis.com/documentation/security-and-authentication/security-best-practices/#api-key-authentication

    [Cancel] [I Understand, Continue]
    ```
  - **On Confirm**: POST to CodePen with generated code, open in new tab
  - **Generated Code**: Uses user's token (not playground token)

- **"Download HTML"**:
  - **Enabled**: Only when token is present
  - **Click**: Download self-contained HTML file
  - **Filename**: `{library}-{styleName}-{timestamp}.html`
  - **Contents**:
    - CDN-linked libraries (lightweight, no inline scripts)
    - User's current map state (style, center, zoom, all parameters)
    - User's API key
    - Comments with:
      - Customization guidance
      - Links to documentation pages
      - Security best practices (scoping, rotation)
      - Link to playground repo for questions

#### Share Button
**Phase 1 MVP**: Share configuration via URL
- **Location**: Near export buttons or in header
- **Click**: Generate shareable URL with encoded parameters
- **Encoded Parameters**:
  - Selected style
  - All parameter values (language, worldview, places)
  - Map viewport (center, zoom)
  - Selected library for code generation
- **URL Format**: `?config=<base64-encoded-json>`
- **Behavior**:
  - Copy URL to clipboard
  - Show toast: "Configuration URL copied to clipboard"
  - URL loads playground with exact state
- **Analytics**: Track share button usage

---

## 8. Code Generation - Template System

### 8.1 Architecture Overview
- **Goal**: Separate HTML from JavaScript for better developer experience
- **Challenge**: Keep templates easy to edit while supporting dynamic values

### 8.2 File Structure
```
src/templates/
├── html/
│   ├── maplibre.html      # Pure HTML with {{placeholders}}
│   ├── leaflet.html       # Pure HTML with {{placeholders}}
│   └── ...
├── config/
│   ├── maplibre.json      # Library metadata
│   ├── leaflet.json
│   └── ...
└── index.js               # Template registry and generator
```

### 8.3 Template Format

#### HTML Files (`/html/`)
- **Format**: Standard HTML with mustache-style placeholders
- **Placeholders**: `{{variableName}}` replaced at generation time
- **Example** (`maplibre.html`):
  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>{{styleName}} - MapLibre GL JS</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <script src="{{cdnJS}}"></script>
    <link href="{{cdnCSS}}" rel="stylesheet">

    <style>
      body { margin: 0; padding: 0; }
      #map { position: absolute; top: 0; bottom: 0; width: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script>
      // SECURITY: For production, use environment variables or a proxy
      // Scope your API key to specific referrers: https://developers.arcgis.com/documentation/security-and-authentication/security-best-practices/#api-key-authentication
      // Rotate keys frequently

      const map = new maplibregl.Map({
        container: 'map',
        style: '{{styleUrl}}',
        center: [{{lng}}, {{lat}}],
        zoom: {{zoom}},
        attributionControl: true
      });

      map.on('load', () => {
        console.log('Map loaded successfully');
        // Add your custom layers or interactions here
        // Examples: https://developers.arcgis.com/maplibre-gl-js/
      });
    </script>
  </body>
  </html>
  ```

#### Config Files (`/config/`)
- **Format**: JSON with library metadata
- **Example** (`maplibre.json`):
  ```json
  {
    "name": "MapLibre GL JS",
    "version": "5.0.0",
    "cdnJS": "https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.js",
    "cdnCSS": "https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.css",
    "docs": "https://maplibre.org/maplibre-gl-js-docs/",
    "examples": "https://developers.arcgis.com/maplibre-gl-js/",
    "attribution": "auto",
    "supportsSessionTokens": true
  }
  ```

#### Generator (`index.js`)
```javascript
import maplibreHTML from './html/maplibre.html?raw';
import maplibreConfig from './config/maplibre.json';
import leafletHTML from './html/leaflet.html?raw';
import leafletConfig from './config/leaflet.json';

// Template replacement function
function generateCode(template, context) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}

export const templates = {
  maplibre: {
    config: maplibreConfig,
    generate: (context) => generateCode(maplibreHTML, {
      ...maplibreConfig,
      ...context,
      styleUrl: context.styleUrl,
      styleName: context.styleName,
      lng: context.center[0],
      lat: context.center[1],
      zoom: context.zoom
    })
  },
  leaflet: {
    config: leafletConfig,
    generate: (context) => generateCode(leafletHTML, {
      ...leafletConfig,
      ...context,
      // Leaflet-specific context transformations
    })
  }
};
```

### 8.4 Context Object
When generating code, pass runtime values:
```javascript
const context = {
  styleUrl: "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/navigation?language=es&token=...",
  token: "user's API key",
  center: [-122.4194, 37.7749], // [lng, lat]
  zoom: 12,
  styleName: "arcgis/navigation",
  language: "es",
  worldview: "", // empty or specific country
  places: "attributed"
};
```

### 8.5 Template Requirements
Each template MUST:
1. Generate a fully functional standalone HTML file
2. Include proper library CDN links with specific versions from config
3. Show the exact map state from playground (style, center, zoom, and ALL set parameters)
4. Include Esri attribution (MapLibre does this automatically, Leaflet requires Esri Leaflet plugin)
5. Add security comments about:
   - API key scoping to referrers
   - Frequent rotation
   - Link to repo page with more info and issue tracker for questions
6. Add helpful comments for customization
7. Reference examples from `developers.arcgis.com` or other developer resources

**Important**:
- **MapLibre templates**: Use standard MapLibre GL JS syntax
- **Leaflet templates**: MUST use Esri Leaflet plugin to load basemaps correctly
  - CDN: `https://unpkg.com/esri-leaflet@3.x/dist/esri-leaflet.js`
  - Example: User will provide accurate sample code to templatize

### 8.6 Template Debugging (Phase 2)
**Goal**: Preview template changes without playground export step

**Approach**: Separate dev mode with file watcher
- Command: `npm run template-dev`
- Watches `/templates/html/` for changes
- Serves templates on localhost with mock data
- Hot reload on save
- **If too complex for MVP**: Defer to Phase 2

**Fallback**: Test generated HTML by exporting and opening in browser

### 8.7 Template Versioning
- **Library versions**: Explicitly specified in `config/*.json`
- **Version updates**: Community can submit PRs to update library versions
- **Call for Contributions**: README includes section:
  ```markdown
  ## Contributing Templates

  We welcome community contributions for:
  - New library templates (OpenLayers, CesiumJS, etc.)
  - Library version updates
  - Template improvements

  See CONTRIBUTING.md for guidelines.
  ```

### 8.8 Adding New Templates
Process for contributors:
1. Create new HTML file in `src/templates/html/[library-name].html`
2. Create new config file in `src/templates/config/[library-name].json`
3. Add to registry in `src/templates/index.js`
4. Test with multiple styles and parameter combinations
5. Ensure all template requirements are met (Section 8.5)
6. Submit PR with:
   - Example output HTML
   - Screenshot of generated code working
   - Note on library version tested

---

## 9. Token Management and Security

### 9.1 Token Input Location
- **Where**: Code Generator Panel (NOT header)
- **Why**: Keep export token handling near export actions and security messaging
- **Playground Preview Key** (implementation note):
  - The playground uses a repository-defined default preview key for runtime preview requests (for example `/self` style discovery)
  - `VITE_DEFAULT_PLAYGROUND_API_KEY` can override that default at build time
  - Style Browser does not expose a token input and does not override the preview key
  - This preview key is separate from the user-provided export key used in generated code

### 9.2 Token Validation
- **No validation in playground**: Don't test token against API
- **Only requirement**: Token must be present (not empty) to enable export buttons
- **On export without token**: Block action and show prompt to enter key

### 9.3 Security Messaging

#### Near Input
- Helper text: "Your API key is used only in generated code"
- Security icon with tooltip:
  ```
  API Key Security Best Practices:
  • Basemap keys are typically exposed in client code
  • Set HTTP referrer restrictions in your dashboard
  • Rotate keys frequently (every few months)
  • Monitor usage for unexpected activity

  Learn more: [link to security docs]
  ```

#### Before CodePen Export
- Modal warning (see Section 7.6 for full text)
- **Focus on**: Referrer scoping and rotation (not hiding the key)

#### In Generated Code
- Comments at top of script section:
  ```javascript
  // SECURITY NOTICE
  // API keys for basemaps are exposed in client-side code.
  // This is expected behavior. To keep your key secure:
  //
  // 1. Set HTTP referrer restrictions in your ArcGIS dashboard
  //    Only allow requests from your domain(s)
  //
  // 2. Rotate keys frequently (every 3-6 months)
  //    Create new keys and retire old ones regularly
  //
  // 3. Monitor usage in your dashboard
  //    Watch for unexpected spikes or unauthorized domains
  //
  // Learn more: https://developers.arcgis.com/documentation/security-and-authentication/security-best-practices/#api-key-authentication
  // Questions? https://github.com/[your-repo]/issues
  ```

### 9.4 Storage
- **Session memory only**: Never persist to localStorage
- **Clear on page reload**: User must re-enter token each session

---

## 10. Analytics and Telemetry

### 10.1 Implementation
- **Service**: Google Analytics
- **Privacy**: No PII collection
- **Do Not Track**: Respect browser DNT headers
- **Cookie Consent**: Required (see Section 10.3)

### 10.2 Metrics to Track
- Page views and session duration
- Style selection frequency (which styles are most explored)
- Parameter usage (how often worldview/places are used)
- Library preferences in code generation
- CodePen vs Download button usage
- Share button usage
- Error rates (failed `/self` calls)
- Empty state CTA clicks (account creation link)
- **Future Enhancement**: Consider Rollbar or similar for error monitoring

### 10.3 Cookie Consent
**Requirement**: GDPR compliance for European visitors

**Implementation**: Simple consent banner
- **Position**: Fixed at bottom of viewport
- **Content**:
  ```
  🍪 This site uses cookies to analyze usage and improve your experience.

  [Accept] [Learn More]
  ```
- **Behavior**:
  - Show on first visit
  - "Accept" sets consent cookie and enables analytics
  - "Learn More" links to privacy policy
  - Banner dismissed on accept, doesn't reappear
  - If not accepted, analytics remain disabled
- **Storage**: Consent choice stored in localStorage

### 10.4 Privacy Policy
**Challenge**: User doesn't have a personal privacy policy

**Solution**: Include template markdown file
- **File**: `PRIVACY_TEMPLATE.md` in repo
- **Content**:
  ```markdown
  # Privacy Policy - ArcGIS Basemap Styles Playground

  ## TODO: Personalize
  - [ ] Replace [YOUR NAME] with your name
  - [ ] Replace [YOUR EMAIL] with your contact email
  - [ ] Replace [EFFECTIVE DATE] with current date
  - [ ] Review and adjust as needed

  ## Analytics
  This playground uses Google Analytics to understand how developers use the tool...

  ## Data Collection
  We collect:
  - Page views and usage patterns
  - No personally identifiable information
  - No API keys (stored in session memory only)

  ## Contact
  Questions? Email [YOUR EMAIL] or open an issue on GitHub.
  ```
- **Link**: Footer includes "Privacy Policy" link

---

## 11. Phase-Based Roadmap

### 11.1 Phase 1: Core MVP (Aggressive Scope)
**Goal**: Functional playground with essential features only

**Included**:
- ✅ Dynamic style loading from `/self` with TTL cache + localStorage fallback
- ✅ Family toggle (ArcGIS / Open) with parameter preservation
- ✅ Style browser with grid layout, scroll, expand modal
- ✅ Style card info icon overlay (top-right thumbnail) opening a use-case modal with configurable style-id + category descriptions, optional style docs link, and optional sample-app links
- ✅ Category tabs (single-select + all)
- ✅ Capability badges (hide unsupported)
- ✅ Parameter controls (language, worldview, places) with disabled states
- ✅ MapLibre GL JS v5.x map viewer with real-time updates
- ✅ Collapsible left sidebar
- ✅ Showcase location dropdown (global list with style tags)
- ✅ Places hover popup (id/name/category when `attributed`)
- ✅ Code generation for **MapLibre GL JS** and **Leaflet** (HTML templates with separate configs)
- ✅ CodePen export with security warning modal
- ✅ HTML download option
- ✅ Token input in code panel with empty state CTA
- ✅ Share configuration via URL (all parameters + viewport)
- ✅ Responsive layout (desktop + tablet, 768px+)
- ✅ Basic error handling (console + retry + status link)
- ✅ Calcite Design System components
- ✅ Tooltips and "Learn More" links for all parameters
- ✅ Cookie consent banner (simple accept button)
- ✅ Google Analytics with consent gating
- ✅ Privacy policy template
- ✅ Vitest + React Testing Library + pre-commit hooks
- ✅ Node 25, MapLibre v5.x

**Excluded** (Deferred):
- ❌ Places category filtering → Phase 2
- ❌ Template dev mode with file watcher → Phase 2
- ❌ Split-view swipe comparison → Future
- ❌ Educational markers/popovers on locations → Future
- ❌ Custom style itemId search → Phase 2
- ❌ Session-based model UI (code examples only in MVP)
- ❌ Multi-view (simultaneous maps) → Phase 2
- ❌ ArcGIS Maps SDK template (wait for v5.0 - Feb 2026) → Phase 2
- ❌ CesiumJS, OpenLayers templates → Phase 3
- ❌ 3D map styles → Phase 3
- ❌ Code viewer in playground (removed completely, future: snippet preview) → Future
- ❌ Tile usage counter → Phase 3
- ❌ Advanced caching (versioning, migrations) → Phase 3
- ❌ UI internationalization → Phase 3
- ❌ Mobile-optimized layout (<768px) → Phase 2
- ❌ Dark mode → Future
- ❌ Rollbar error monitoring → Future
- ❌ Issue templates → Future
- ❌ MapViewer integration → Future
- ❌ Community showcase gallery → Future
- ❌ iframe embed code → Future

### 11.2 Phase 2: Enhanced Experience
**Goal**: Add deferred features that improve usability

- Places category filtering (multi-select dropdown with autocomplete)
- Template dev mode with file watcher
- Custom style search by itemId
- Mobile responsive refinements (<768px)
- ArcGIS Maps SDK for JavaScript template (v5.0+)
- Session model educational examples with step-by-step guide
- Multi-view option (2 synchronized maps)
- Badge visibility config (show grayed vs hide)
- Improved analytics dashboard
- Issue templates for contributions

### 11.3 Phase 3: Advanced Features
**Goal**: Community-driven enhancements

- CesiumJS and OpenLayers templates
- 3D map styles support
- Tile usage visualization (educational mock counter)
- UI internationalization (Spanish, French, etc.)
- Advanced caching (versioning, migrations)
- Community template contributions (external hosting)
- Advanced showcase mode (multiple preset views per style)

### 11.4 Future Enhancements (Beyond Phase 3)
- **Dark mode**: UI theme toggle
- **Split-view swipe comparison**: Drag slider to compare two styles side-by-side
- **Educational location markers**: Popovers explaining style features (water bodies, trails, etc.)
- **Comparison Mode**: Side-by-side view of two different styles
- **MapViewer integration**: Link to ArcGIS Map Viewer with current style/params
- **Style Customization Preview**: Light integration with Vector Tile Style Editor
- **Static basemap tiles**: Optional static map tile/image support for lightweight previews and non-interactive embeds
- **Community Showcase**: Gallery of beautifully designed map experiences
- **Embed Code**: iframe embed snippets for documentation sites
- **User authentication**: Log in with ArcGIS identity, see/select available API keys
- **Rollbar error monitoring**: Proactive error detection
- **Code snippet preview**: Simple viewer showing key lines (future, removed from MVP)

---

## 12. Accessibility and Best Practices

### 12.1 Accessibility (WCAG 2.1 AA Compliance)
**Note**: Basemaps are inherently visual. Prioritize accessibility for UI controls over map content.

**Focus Areas**:
- ✅ Keyboard navigation for all interactive elements (tab order, enter/space activation)
- ✅ Proper focus indicators (visible outlines, high contrast)
- ✅ ARIA labels for icon buttons and controls
- ✅ Semantic HTML (headings, landmarks, lists)
- ✅ Color contrast ratios minimum 4.5:1 for text
- ✅ Screen reader announcements for parameter changes (e.g., "Language changed to Spanish")
- ✅ Alt text for style thumbnails
- ✅ Form labels associated with inputs
- ⚠️ Skip complex screen reader support for map canvas (inherent limitation)

### 12.2 Performance
- Lazy load style thumbnails (Intersection Observer)
- Virtual scrolling for style grid (if many styles)
- Debounce map updates on parameter changes (300ms)
- Minimize re-renders (React.memo, useMemo where appropriate)
- Compress images and assets
- Code splitting (Vite handles automatically)

### 12.3 Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features (no IE11 support)
- WebGL required (MapLibre dependency)
- Node 25 for development (enforced via `.nvmrc`)

### 12.4 Mobile Responsiveness
- **Phase 1**: Desktop and tablet (768px+)
- **Phase 2**: Mobile optimization (<768px)
  - Collapsible sidebar becomes modal/drawer on mobile
  - Touch-friendly controls (minimum 44x44px tap targets)
  - Simplified layout for small screens

---

## 13. Testing Strategy

### 13.1 Goal
Prevent regressions by running tests frequently before commits.

### 13.2 Testing Stack
- **Unit/Integration**: Vitest + React Testing Library
- **Pre-commit Hook**: Husky runs tests + linting
  - Blocks commits if tests fail
  - Ensures code quality before changes enter repo
- **CI**: GitHub Actions runs tests on PR (future enhancement)

### 13.3 Unit Tests
- URL generation with various parameter combinations
- Cache TTL logic and localStorage fallback
- Template generation for each library (placeholder replacement)
- Error handling edge cases
- Share URL encoding/decoding

### 13.4 Integration Tests
- `/self` endpoint fetch and parsing
- Map initialization with different styles
- Parameter changes triggering style reload
- CodePen POST integration
- Cookie consent flow

### 13.5 E2E Tests (Optional, Phase 2)
- Playwright or Cypress for browser automation
- Full user flow: select style → configure params → generate code → export
- Error scenarios (network failures, invalid tokens)

### 13.6 Manual Testing Checklist
Before each release:
- [ ] All styles load correctly in both families
- [ ] Parameter controls enable/disable appropriately per style
- [ ] Map updates on parameter change
- [ ] Family toggle preserves compatible parameters
- [ ] Share URL correctly encodes/restores state
- [ ] CodePen export opens with correct code
- [ ] Download generates working HTML file
- [ ] Showcase locations navigate correctly
- [ ] Places hover/popup works at appropriate zoom
- [ ] Error messages clear and actionable
- [ ] Sidebar collapse/expand works smoothly
- [ ] Cookie consent banner appears and persists choice
- [ ] Accessible via keyboard only
- [ ] Responsive on tablet (768px+)

---

## 14. Documentation and Help

### 14.1 In-App Help
- **Tooltips**: On all controls explaining purpose and behavior
- **Info Icons**: "Learn More" links near each parameter to relevant docs:
  - Language → [Language Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#language)
  - Worldview → [Worldview Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#worldview)
  - Places → [Basemap Places Overview](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/basemap-places/)
- **Contextual Help**: Security tooltips, empty state guidance, error explanations
- **Help Icon** (Optional): Small "?" icon in header opening help modal with guided tour
  - **NOT** a forced first-time modal
  - Available for users who want guided instructions

### 14.2 External Documentation

#### README.md
- What is the playground
- Live demo link
- How to use it (quick start)
- How to contribute templates
- Deployment instructions
- Link to official Esri docs

#### CONTRIBUTING.md
- How to add templates
- How to suggest improvements
- How to report bugs
- Code style guidelines
- PR process
- **Future**: Issue templates for bugs, features, template requests

#### PRIVACY_TEMPLATE.md
- Template with TODOs for user to personalize
- Placeholder for name, email, effective date
- Standard privacy policy structure

### 14.3 Links to Official Documentation
Include these throughout the UI:
- [Introduction to Basemap Styles Service](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/introduction-basemap-styles-service/)
- [ArcGIS Styles Reference](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/arcgis-styles/)
- [Open Styles Reference](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/open-styles/)
- [Language Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#language)
- [Worldview Parameter Details](https://developers.arcgis.com/rest/basemap-styles/arcgis-navigation-style-get/#worldview)
- [Basemap Places Overview](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/basemap-places/)
- [Usage Models Comparison](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/basemap-usage-styles/)
- [API Key Security Best Practices](https://developers.arcgis.com/documentation/security-and-authentication/security-best-practices/#api-key-authentication)

---

## 15. Known Considerations and Design Decisions

### 15.1 Why React + Calcite?
- **React**: Robust state management, component reusability, large ecosystem, excellent testing support
- **Calcite**: Official Esri design system, pre-built accessible components, consistent branding with other Esri dev tools

### 15.2 Why Not Active Session Management?
- Complex lifecycle management (expiration, renewal)
- Playground should be exploratory, not transactional
- Educational approach (show code) achieves learning goal without billing users

### 15.3 Why Separate HTML Templates from JS?
- Better developer experience (syntax highlighting, IDE support)
- Easier for community to contribute templates
- Simpler to review changes in PRs
- Can preview/test templates without building entire app (Phase 2)

### 15.4 Why Skip Custom Styles in MVP?
- Adds complexity (unknown schema, validation, error handling)
- Core value is exploring public catalog
- Can add later once core flows are solid (Phase 2)

### 15.5 Why Simple TTL Cache with localStorage Fallback?
- MVP needs to ship quickly
- Service catalog doesn't change frequently (24hr TTL is safe)
- Fallback ensures app works even when API is down
- Can enhance with versioning/migrations later (Phase 3)

### 15.6 Why Password Input for Token?
- Signals sensitivity to users (even though basemap keys are typically exposed)
- Prevents accidental screenshots with visible keys
- Standard pattern for sensitive inputs

### 15.7 Why Remove Code Display from MVP?
- Simplifies UI (less visual clutter)
- Export buttons serve primary use case (test in CodePen or download)
- Can add back as optional preview in future enhancement

### 15.8 Why Aggressive MVP Scope?
- Many features added complexity (places filtering, template dev mode, etc.)
- Ship faster with core features, iterate based on user feedback
- Deferred features can be prioritized by actual usage patterns

---

## 16. Glossary

- **Basemap**: Background map providing geographic context for data visualization
- **Style**: Visual design specification (colors, symbols, labels) for rendering map data
- **Vector Tiles**: Map data delivered as geometric vectors (vs raster images), allowing client-side styling
- **Mapbox Style Specification**: JSON format for defining map styles (v8)
- **POI**: Point of Interest (restaurant, landmark, business, etc.)
- **Worldview**: Political/territorial boundary perspective for disputed areas
- **Attribution**: Legal requirement to credit data providers
- **API Key**: Token authorizing access to Esri services (can expire, but users can set up to 1 year)
- **Session Token**: Temporary token for unlimited tile access within time window (up to 12 hours)
- **TTL**: Time-To-Live (cache expiration duration)
- **HMR**: Hot Module Replacement (instant updates during development)
- **GDPR**: General Data Protection Regulation (European privacy law requiring cookie consent)

---

## 17. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.17 | 2026-02-17 | Codex + User | Added optional style-specific documentation links to the Phase 1 style-info modal content model and modal display order. |
| 3.16 | 2026-02-17 | Codex + User | Refined Phase 1 style-info modal requirements: full style-id keyed descriptions, category descriptions, ordered modal content (style then category), fallback behavior, and optional sample-app links. |
| 3.15 | 2026-02-17 | Codex + User | Added Phase 1 requirement for per-style info icon overlay on thumbnails that opens a use-case modal with configurable text and fallback behavior. |
| 3.14 | 2026-02-17 | Codex + User | Moved main map wrapper from `calcite-panel` to a flex container to ensure the MapLibre viewer consumes full available vertical space in the shell content area. |
| 3.13 | 2026-02-17 | Codex + User | Moved docked tools shell panel to `panel-start` and wrapped each active tool panel body in `calcite-block` for consistent Calcite panel content structure. |
| 3.12 | 2026-02-17 | Codex + User | Refactored layout to a docked `panel-end` tools area with `calcite-action-bar` navigation and separate panels for style selection, language, worldview, and places. |
| 3.11 | 2026-02-16 | Codex + User | Replaced category filter chips with `calcite-tabs` (`All` + primary categories) in the Style Browser. |
| 3.10 | 2026-02-16 | Codex + User | Enhanced UI/UX with sidebar collapse persistence, ArcGIS/Open family toggle, category chips, grouped style sections, capability legend/badges, and improved parameter help/warning affordances. |
| 3.9 | 2026-02-16 | Codex + User | Replaced app header with `calcite-navigation`, removed map viewer internal header, and wrapped viewer area in `calcite-panel` with footer placeholder for future collapsible code generation section. |
| 3.8 | 2026-02-16 | Codex + User | Refactored main app layout to use `calcite-shell` and `calcite-shell-panel`, simplifying sidebar/main structure and viewport height handling. |
| 3.7 | 2026-02-16 | Codex + User | Refined vertical-space layout: compact header, inline labels, sidebar token input removal, thumbnail-first 3-column style grid, and error-only refresh visibility. |
| 3.6 | 2026-02-16 | Codex + User | Implemented scrollable Style Browser grid with expand dialog and viewport-constrained app layout to avoid height overflow. |
| 3.5 | 2026-02-16 | Codex + User | Added parameter controls (`language`, `worldview`, `places`) with capability-aware disabling and live MapLibre URL updates via shared app state. |
| 3.4 | 2026-02-16 | Codex + User | Integrated MapLibre viewer (`src/components/MapViewer/MapViewer.jsx`) and connected live style selection from Style Browser to map style updates. |
| 3.3 | 2026-02-16 | Codex + User | Added default playground API key support via `VITE_DEFAULT_PLAYGROUND_API_KEY` for runtime preview requests while keeping export token workflow separate. |
| 3.2 | 2026-02-16 | Codex + User | Implemented initial Style Browser UI (`src/components/StyleBrowser/StyleBrowser.jsx`) with Calcite controls and integration with the `/self` cache-aware style service. |
| 3.1 | 2026-02-16 | Codex + User | Implemented `/self` style catalog service (`src/services/styleService.js`) with localStorage TTL caching and stale fallback, plus unit tests in `src/services/styleService.test.js`. |
| 3.0 | 2026-02-13 | Claude + User | Major revision incorporating user annotations. Key changes: HTML templates separated from JS, code display removed, aggressive MVP scope, MapLibre v5, Node 25, share URLs added to MVP, collapsible sidebar, places filter deferred, template dev mode deferred, cookie consent added, testing strategy refined. |
| 2.0 | 2026-02-13 | Claude | Complete rewrite merging original SPEC.md and SPEC2.md with stakeholder interview decisions. Moved to React architecture with phased delivery approach. |
| 1.0 | [Previous] | Original Author | Initial specification for single-page HTML implementation |

---

**End of Specification**

**Next Steps**:
1. Set up React + Vite project with Node 25
2. Create basic project structure and install dependencies
3. Create template system with MapLibre and Leaflet examples
4. Implement export functionality
5. Add testing framework
6. Deploy to GitHub Pages

For questions or clarifications, contact: [developers@esri.com](mailto:developers@esri.com) or open an issue on GitHub.
