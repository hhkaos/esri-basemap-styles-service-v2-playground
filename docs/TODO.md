# TODO

## Current Sprint

### In Progress

- [ ] Add token failure handling modal (troubleshooting steps, tutorial links, docs)

### Up Next

- [ ] Add lazy-loaded thumbnails with Intersection Observer
- [ ] Re-enable CesiumJS export when static basemap tiles are fully supported by the playground

## Backlog

### High Priority (Phase 1 - MVP)

#### Style Browser

- [ ] Add lazy-loaded thumbnails with Intersection Observer

#### Sidebar


#### Parameter Controls


#### Showcase Locations

- [ ] Create showcase location dropdown (top-right of map, tag-based filtering per style)
- [ ] Create `config/showcaseLocations.js` with global location list, style tags, descriptions

#### Map Viewer

- [ ] Add zoom level display between +/- buttons
- [ ] Add places hover popup (esri_place_id, name, category when `places=attributed`)
- [ ] Add debouncing for rapid parameter changes (300ms)

#### Code Generator Panel

- [x] Add empty state CTA card ("Need an API key?", "Create Free Account", tutorial video link, API key documentation link)
- [x] Add library tabs (MapLibre GL JS, Leaflet)

#### Templates

- [x] Implement template system (MapLibre + Leaflet HTML templates with `{{placeholders}}`)
- [ ] Create template config JSON files (`src/templates/config/maplibre.json`, `leaflet.json`)
- [ ] Create template generator registry (`src/templates/index.js`)
- [ ] Add security comments in generated code (API key scoping, rotation, repo link)
- [ ] Ensure Esri attribution in all templates (Leaflet requires Esri Leaflet plugin)

#### Share

- [x] Implement share configuration via URL (base64-encoded JSON, clipboard copy, toast notification)

#### Analytics & Privacy

- [ ] Add cookie consent banner (accept button, localStorage persistence)
- [ ] Set up Google Analytics with consent gating
- [ ] Respect browser Do Not Track (DNT) headers
- [ ] Track analytics events: style selection, parameter usage, library preferences, export usage, share clicks, error rates, CTA clicks
- [ ] Create `PRIVACY_TEMPLATE.md` with placeholders

#### Accessibility (WCAG 2.1 AA)

- [ ] Ensure keyboard navigation for all interactive elements (tab order, enter/space)
- [ ] Add proper focus indicators (visible outlines, high contrast)
- [ ] Add ARIA labels for icon buttons and controls
- [ ] Use semantic HTML (headings, landmarks, lists)
- [ ] Verify color contrast ratios minimum 4.5:1 for text
- [ ] Add screen reader announcements for parameter changes
- [ ] Ensure alt text for all style thumbnails
- [ ] Associate form labels with inputs

#### Performance

- [ ] Add virtual scrolling for style grid (if many styles)
- [ ] Apply React.memo / useMemo optimizations where needed

#### Responsiveness

- [ ] Ensure responsive layout at desktop + tablet (768px+)

#### Error Handling

- [ ] Add auto-retry on `/self` failure with configurable interval and background retry
- [ ] Show on-screen error with status page link after multiple failures

#### Testing

- [ ] Add unit tests for template generation (placeholder replacement per library)
- [x] Add integration tests for CodePen POST
- [ ] Add integration tests for cookie consent flow
- [ ] Add pre-push hooks (build + tests)

#### Documentation

- [x] Write CONTRIBUTING.md (add templates, suggest improvements, report bugs, PR process)

#### Deployment

- [x] Set up GitHub Actions workflow (build and deploy to `gh-pages` branch)

### Medium Priority (Phase 2)

- [ ] Add places category filtering (multi-select dropdown with autocomplete)
- [ ] Create template dev mode with file watcher, mock data, hot reload
- [ ] Implement mobile responsive layout (<768px) with modal/drawer sidebar
- [ ] Add touch-friendly controls (minimum 44x44px tap targets)
- [ ] Add multi-view option (2 synchronized maps)
- [ ] Add custom style search by itemId
- [ ] Add session model educational examples with step-by-step guide
- [ ] Add badge visibility config (show grayed vs hide unsupported)
- [ ] Improve analytics dashboard
- [ ] Create issue templates for contributions
- [ ] Add E2E tests (Playwright or Cypress)
- [ ] Add optional help icon ("?") in header with guided tour modal

### Low Priority / Nice to Have (Phase 3+)

- [ ] 3D map styles support
- [ ] UI internationalization (Spanish, French, etc.)
- [ ] Dark mode toggle
- [ ] Advanced caching with versioning and migrations
- [ ] Tile usage visualization (educational mock counter)
- [ ] Community template contributions (external hosting)
- [ ] Advanced showcase mode (multiple preset views per style)
- [ ] Template versioning and community PR process

## Future Ideas

- [ ] Split-view swipe comparison
- [ ] Educational location markers with popovers
- [ ] Comparison mode (side-by-side two different styles)
- [ ] Style customization preview (Vector Tile Style Editor integration)
- [ ] Static basemap tiles for lightweight previews and non-interactive embeds
- [ ] Consider adding generate code for Native SDKs (Flutter, Android, Kotlin, etc)
- [ ] Code snippet preview (simple viewer showing key lines)
- [ ] Community showcase gallery
- [ ] iframe embed code generation
- [ ] User authentication with ArcGIS identity
- [ ] Rollbar error monitoring

## Done

- [x] Add explicit agent rules in `AGENTS.md` and `CLAUDE.md` to protect manual HTML/CSS edits and require user confirmation before broader style/markup changes - 2026-02-17
- [x] Add clearer Share panel purpose text and remove redundant parameter `h4` headings in single-panel Language/Worldview/Places actions - 2026-02-17
- [x] Remove default client-library preselection in Code Generator step 2 so no option is selected until user explicitly chooses one - 2026-02-17
- [x] Update Code Generator step-4 `Copy Share Link` action to open the `Share` panel and preselect `Open this panel by default: Code Generator`; style the action button with green Calcite background token - 2026-02-17
- [x] Replace ArcGIS JS template `map-components-note` UI block with inline JS guidance comment for `places = none`, including ArcGIS Map Components tutorial link - 2026-02-17
- [x] Temporarily disable CesiumJS selection in Code Generator and show a "coming soon" tooltip until static basemap tiles are fully supported by the playground - 2026-02-17
- [x] Add OpenLayers export template with `olms.apply(...)`, style parameter URL wiring (language/worldview/places), explicit Esri attribution injection, Code Generator integration, and tests - 2026-02-17
- [x] Add ArcGIS Maps SDK for JavaScript export template with basemap-style autocasting, codegen wiring, share-library support, and tests - 2026-02-17
- [x] Reprioritize template roadmap: move ArcGIS Maps SDK for JavaScript, OpenLayers, and CesiumJS templates into Current Sprint Up Next - 2026-02-17
- [x] Add Code Generator library tabs (MapLibre GL JS, Leaflet) and API-key empty-state CTA resources - 2026-02-17
- [x] Add CodePen export interaction test coverage in `CodeGenerator.test.jsx` - 2026-02-17
- [x] Add CONTRIBUTING.md contributor documentation - 2026-02-17
- [x] Set up GitHub Actions workflows for test and deploy (`.github/workflows/test.yml`, `.github/workflows/deploy.yml`) - 2026-02-17
- [x] Keep `StyleBrowser` mounted while inactive so shared links that open on non-style panels still hydrate style metadata/capabilities and correctly load Language/Worldview/Places selections - 2026-02-17
- [x] Add App-level shared-link hydration regression test asserting real parameter radio selections (`ca`, `china`, `all`) after opening on Code Generator panel - 2026-02-17
- [x] Fix parameter radio hydration UI by explicitly binding `checked` on Language/Worldview/Places `calcite-radio-button` options and add unit test coverage - 2026-02-17
- [x] Prevent transient "not supported" parameter warnings during shared-link hydration by deferring unsupported state until style catalog metadata load completes - 2026-02-17
- [x] Add icons and ordering updates to Code Generator Step 3 CTA buttons; rename labels to `Create and configure an API key tutorial"` and `Intro to API key documentation` with video button second - 2026-02-17
- [x] Update Code Generator Step 3 API key `Learn More` link to API key auth docs and add `Watch API Key Tutorial` button linking to YouTube setup video - 2026-02-17
- [x] Show `Default (<value>)` in Code Generator step-4 summary for parameters excluded in step 1 - 2026-02-17
- [x] Keep Step 2 selected client library visibly checked after navigating forward/back in Code Generator wizard - 2026-02-17
- [x] Persist Code Generator in-memory wizard state across panel unmount/remount (library choice, step, API key, warning acknowledgment, export toggles) without localStorage token persistence - 2026-02-17
- [x] Add MapLibre tiles-consumption HTML template (`src/templates/html/maplibre-tiles.html`) and wire Code Generator MapLibre export to placeholder-based template rendering with ArcGIS MapLibre plugin (`BasemapStyle.applyStyle`) - 2026-02-17
- [x] Add zoom conversion from MapLibre viewport to export library scale (Leaflet offset) and apply live viewport center/zoom to both Leaflet and MapLibre generated templates - 2026-02-17
- [x] Harden zoom conversion helper with target library profiles, optional strict/fallback handling, dedicated unit tests, and remove Leaflet export `minZoom` clamp that could override converted zoom parity - 2026-02-17
- [x] Align Leaflet template with Esri Leaflet Vector Basemap API (`vectorBasemapLayer` + options) and remove ad-hoc vectorTileLayer URL construction - 2026-02-17
- [x] Include full playground state in Leaflet export template: API key, language/worldview/places, and live map center/zoom via MapViewer viewport callback - 2026-02-17
- [x] Add Leaflet tiles-consumption HTML template (`src/templates/html/leaflet-tiles.html`) and wire Code Generator Leaflet export to placeholder-based template rendering - 2026-02-17
- [x] Project initialization with /init skill - 2026-02-13
- [x] Create comprehensive specification (docs/SPEC.md) - 2026-02-13
- [x] Set up React + Vite project with Node 25 - 2026-02-13
- [x] Create basic project structure (src/, components/, services/, etc.) - 2026-02-13
- [x] Configure Vitest + React Testing Library - 2026-02-13
- [x] Set up pre-commit hooks (Husky) - 2026-02-13
- [x] Configure ESLint and Prettier - 2026-02-13
- [x] Fix Calcite Components v5 integration (CSS import, asset path) - 2026-02-13
- [x] Fix Vite base path for dev/production - 2026-02-13
- [x] Create utility functions with tests (urlGenerator, storage, urlEncoder) - 2026-02-13
- [x] Verify Phase 1 foundation is working (build, tests, linting) - 2026-02-16
- [x] Fix Husky v9 deprecation warning in pre-commit hook - 2026-02-16
- [x] Fix ESLint no-unused-vars error in storage catch block - 2026-02-16
- [x] Implement `/self` fetch with caching (TTL + stale localStorage fallback) - 2026-02-16
- [x] Build style browser with Calcite components and live `/self` loading/filtering - 2026-02-16
- [x] Fix runtime console errors (Calcite custom element registration, asset-path 404s, and form label issues) - 2026-02-16
- [x] Add default playground API key support via env var (`VITE_DEFAULT_PLAYGROUND_API_KEY`) - 2026-02-16
- [x] Integrate MapLibre GL JS viewer with live style selection from Style Browser - 2026-02-16
- [x] Add parameter controls (language, worldview, places) with capability-based disabling - 2026-02-16
- [x] Preserve viewport/camera when style or parameter changes update map style - 2026-02-16
- [x] Implement scrollable style grid + expand view and constrain app layout to viewport height - 2026-02-16
- [x] Compact sidebar/header UI, remove sidebar token input, and add 3-column thumbnail style grid with error-only refresh - 2026-02-16
- [x] Refactor app layout to Calcite Shell + Shell Panel for cleaner structure and height management - 2026-02-16
- [x] Replace app header with Calcite Navigation and wrap viewer in Calcite Panel with codegen placeholder footer - 2026-02-16
- [x] Simplify style browser controls (remove block headings/load button) and enforce fixed-filter + full-height scroll grid layout - 2026-02-16
- [x] Fix Calcite structure (proper shell slots, CalciteSelect, design tokens, remove CSS overrides) - 2026-02-16
- [x] Fetch global capabilities from `/v2/self` (languages, worldviews, places) with cache - 2026-02-16
- [x] Replace hardcoded parameter options with dynamic data from `/v2/self` API - 2026-02-16
- [x] Create Codex `ship` skill from template in `~/.codex/skills/ship/SKILL.md` - 2026-02-16
- [x] Add style family toggle (ArcGIS/Open), category grouping tabs, and grouped style sections in Style Browser - 2026-02-16
- [x] Add style capability legend/badges and sort `/base` + `/labels` styles to end of each category - 2026-02-16
- [x] Add sidebar collapse/expand toggle in header with session storage persistence - 2026-02-16
- [x] Add parameter control tooltips, disabled warnings, and "Learn more" documentation links - 2026-02-16
- [x] Fix horizontal scrollbar on `app-shell-side` by constraining shell panel overflow sizing - 2026-02-16
- [x] Fix sidebar panel stretch: use `widthScale` for shell width and force child `calcite-panel` to `inline-size: 100%` - 2026-02-16
- [x] Prevent category `calcite-tabs` from outgrowing sidebar panel via min-width constraints and local x-overflow containment - 2026-02-16
- [x] Fix category tabs returning zero styles by normalizing `/self` category metadata (exact, fuzzy, fallback fields, and path-based fallback) - 2026-02-16
- [x] Fix map display regression by resolving style ids from `/self` `styleUrl` when `path` is missing and using that id for selection/filtering - 2026-02-16
- [x] Fix map panel zero-height behavior by forcing `app-viewer-panel` content part to full height and adding `ResizeObserver`-based `map.resize()` handling - 2026-02-16
- [x] Fix map viewer render area sizing (`flex: 1`, `height: 100%`, min-height) and remove stray debug text that interfered with viewer layout - 2026-02-16
- [x] Fix viewer panel width collapse: remove `inline-size: 100%` from `.app-shell-side` so map/code area renders beside sidebar - 2026-02-16
- [x] Keep deprecated OSM as a separate style family in selector and prevent mixing with Open family filtering - 2026-02-17
- [x] Refactor controls into docked `panel-end` tools layout with `calcite-action-bar` and separate panels for style selection, language, worldview, and places - 2026-02-17
- [x] Render only the active tools `calcite-panel` (instead of `hidden`) to prevent inactive panel controls from remaining exposed - 2026-02-17
- [x] Move docked tools to `panel-start` and wrap each tool panel body in `calcite-block` - 2026-02-17
- [x] Move Code Generator placeholder into the docked tools action bar and remove viewer footer placeholder for full-height map canvas - 2026-02-17
- [x] Fix map height regression by replacing main viewer `calcite-panel` wrapper with a flex container so `.map-viewer` fills all available vertical space - 2026-02-17
- [x] Control `calcite-action-bar` `expanded` via state and re-trigger after mount to ensure labels render on initial load - 2026-02-17
- [x] Ensure action labels render on first load by explicitly binding `textEnabled` on each `calcite-action` to action bar expanded state - 2026-02-17
- [x] Fix style browser scroll regression by preserving Calcite panel host flex behavior (no custom `display` override) and validating inner scroll container constraints in DevTools - 2026-02-17
- [x] Refactor style browser list items from buttons to compact `calcite-card` with single-line ellipsis titles + tooltip and icon-only capability chips - 2026-02-17
- [x] Remove style family prefixes (`ArcGIS`, `Open`, `OSM`) from style card titles so cards show concise names - 2026-02-17
- [x] Fix missing labels-layer capability chip icon by switching `calcite-chip` icon token from `annotation` to `layer-annotation` - 2026-02-17
- [x] Replace native `title` tooltips with `calcite-tooltip` in Style Browser and Parameter Controls - 2026-02-17
- [x] Wrap style selection panel content in `calcite-block` while preserving style browser scrolling - 2026-02-17
- [x] Hide capability chips in sidebar style cards and keep chips visible in expanded modal cards - 2026-02-17
- [x] Overlay style titles on thumbnails with translucent white background and remove thumbnail/title gap - 2026-02-17
- [x] Wrap map viewer in `calcite-panel` and show panel loading state while style changes are loading - 2026-02-17
- [x] Restyle style browser filter control as a full-width search bar with left filter icon and placeholder-only labeling - 2026-02-17
- [x] Make capability legend chips toggleable filters that exclude styles missing active capabilities (default off) - 2026-02-17
- [x] Order style lists by capability support so higher-support styles appear first (with `/base` and `/labels` tie-break ordering preserved) - 2026-02-17
- [x] Add style-card info icon overlay with use-case modal, configurable style/category descriptions, optional docs link, and optional sample-app links - 2026-02-17
- [x] Ensure every style has guidance + docs URL via generated style descriptions and documentation fallback links - 2026-02-17
- [x] Scope style-card info icon styling to thumbnail overlay control and preserve legend icon behavior - 2026-02-17
- [x] Set active legend capability icon background to brand blue - 2026-02-17
- [x] Replace parameter dropdown controls with vertical radio-button groups for Language, Worldview, and Places panels - 2026-02-17
- [x] Add per-panel explanatory copy and documentation links for Language, Worldview, and Places - 2026-02-17
- [x] Add configurable language/worldview flag-icon preferences with sensitivity-safe fallback behavior - 2026-02-17
- [x] Clarify worldview disclaimer copy and Places `All` vs `Attributed` behavior in parameter panel help text - 2026-02-17
- [x] Write README.md (quick start, live demo link, contribute templates, deployment) - 2026-02-17
- [x] Add repository fallback preview API key so deployed app works without env configuration - 2026-02-17
- [x] Add `Contact` action in tools rail with friendly support/help panel and repo/direct contact links - 2026-02-17
- [x] Extend `Contact` panel with unreviewed-description disclaimer and links to `docs/SPEC.md` + `docs/TODO.md` roadmap - 2026-02-17
- [x] Show supported and not supported capabilities in per-style info modal - 2026-02-17
- [x] Simplify style-info modal capabilities to show only supported capabilities under one heading - 2026-02-17
- [x] Add map viewer panel heading + parameter summary description (language, places, worldview) - 2026-02-17
- [x] Improve map viewer panel parameter summary design with Calcite icons, bold labels, and capability-resolved display names (full language names when available) - 2026-02-17
- [x] Fix parameter panel scrolling in docked tools layout by constraining block content overflow - 2026-02-17
- [x] Add Catalan/Greek language flag mappings and hyphenated flag-code validation with unit tests - 2026-02-17
- [x] Build Code Generator panel UI foundation (tabs, token input show/hide, CTA card, export actions scaffold) - 2026-02-17
- [x] Implement Code Generator export actions (CodePen POST + HTML download), align token toggle control, and switch toggle to visibility icons - 2026-02-17
- [x] Add MapLibre and Leaflet icons to Code Generator library tab buttons - 2026-02-17
- [x] Refactor Code Generator into a 4-step wizard (parameter inclusion toggles, library selection, API key step, and export step) including optional style/map-location export defaults - 2026-02-17
- [x] Polish Code Generator wizard flow: enforce required step selections, add per-library tutorial CTA in step 4, and tighten panel spacing/overflow behavior - 2026-02-17
- [x] Require API key security-warning acknowledgment checkbox in Step 3 before enabling Next - 2026-02-17
- [x] Implement share configuration via URL end-to-end: generate/copy share link from Code Generator, restore style/parameters/viewport from `?config=`, and add share service tests - 2026-02-17
- [x] Add dedicated `Share` tools action/panel with selective payload options, code-generator share presets (library/export toggles/API key opt-in), default open-panel dropdown, and step-aware restore/force-download behavior - 2026-02-17

---

**Notes**:

**Calcite Layout Debugging Checklist**:
- Do not override host `display` for Calcite layout components (`calcite-panel`, `calcite-block`, `calcite-shell-panel`).
- Keep a single intended scroll container (`overflow-y: auto`) inside the panel body.
- Ensure each ancestor in the scroll chain has constrained height and `min-height: 0`.
- Prefer grid/flex `1fr` patterns to create bounded scroll regions instead of viewport hardcoding.
- Validate with DevTools: target container must have `scrollHeight > clientHeight`.

- Move completed tasks to Done section with completion date
- Use `/ship` to automatically update this file when committing
- Review and reprioritize weekly
