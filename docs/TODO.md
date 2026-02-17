# TODO

## Current Sprint

### In Progress

- [ ] Implement template system (MapLibre + Leaflet)

### Up Next

- [ ] Build code generator panel UI (bottom-docked, collapsible)
- [ ] Add CodePen export with security warning modal
- [ ] Add HTML download option

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

- [ ] Build code generator panel UI (bottom-docked, hidden by default, toggle button)
- [ ] Add token input with password show/hide toggle
- [ ] Add empty state CTA card ("Need an API key?", "Create Free Account", "Learn More")
- [ ] Add token failure handling modal (troubleshooting steps, tutorial links, docs)
- [ ] Add library tabs (MapLibre GL JS, Leaflet)
- [ ] Add security warning modal before CodePen export

#### Templates

- [ ] Implement template system (MapLibre + Leaflet HTML templates with `{{placeholders}}`)
- [ ] Create template config JSON files (`src/templates/config/maplibre.json`, `leaflet.json`)
- [ ] Create template generator registry (`src/templates/index.js`)
- [ ] Add security comments in generated code (API key scoping, rotation, repo link)
- [ ] Ensure Esri attribution in all templates (Leaflet requires Esri Leaflet plugin)
- [ ] Add CodePen POST export functionality
- [ ] Add HTML download with filename convention (`{library}-{styleName}-{timestamp}.html`)

#### Share

- [ ] Implement share configuration via URL (base64-encoded JSON, clipboard copy, toast notification)

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
- [ ] Add integration tests for CodePen POST
- [ ] Add integration tests for cookie consent flow
- [ ] Add pre-push hooks (build + tests)

#### Documentation

- [ ] Write CONTRIBUTING.md (add templates, suggest improvements, report bugs, PR process)

#### Deployment

- [ ] Set up GitHub Actions workflow (build and deploy to `gh-pages` branch)

### Medium Priority (Phase 2)

- [ ] Add places category filtering (multi-select dropdown with autocomplete)
- [ ] Create template dev mode with file watcher, mock data, hot reload
- [ ] Implement mobile responsive layout (<768px) with modal/drawer sidebar
- [ ] Add touch-friendly controls (minimum 44x44px tap targets)
- [ ] Add ArcGIS Maps SDK for JavaScript template (v5.0+)
- [ ] Add multi-view option (2 synchronized maps)
- [ ] Add custom style search by itemId
- [ ] Add session model educational examples with step-by-step guide
- [ ] Add badge visibility config (show grayed vs hide unsupported)
- [ ] Improve analytics dashboard
- [ ] Create issue templates for contributions
- [ ] Add E2E tests (Playwright or Cypress)
- [ ] Add optional help icon ("?") in header with guided tour modal

### Low Priority / Nice to Have (Phase 3+)

- [ ] CesiumJS template
- [ ] OpenLayers template
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
- [ ] Code snippet preview (simple viewer showing key lines)
- [ ] Community showcase gallery
- [ ] iframe embed code generation
- [ ] User authentication with ArcGIS identity
- [ ] Rollbar error monitoring

## Blocked

- [ ] ArcGIS Maps SDK template - Blocked by: Waiting for v5.0 release (Feb 2026)

## Done

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
- [x] Fix parameter panel scrolling in docked tools layout by constraining block content overflow - 2026-02-17
- [x] Add Catalan/Greek language flag mappings and hyphenated flag-code validation with unit tests - 2026-02-17

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
