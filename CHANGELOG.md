# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Config-driven language flag preferences with optional multi-flag rendering via `flag-icons`
- Config-driven worldview flag preferences with icon rendering fallback behavior
- Expanded README with feature overview, setup steps, environment configuration, and flag-icon configuration guidance
- Unit tests for language-flag config mappings and case normalization behavior

### Changed
- Reworked Language, Worldview, and Places parameter panels to use vertical radio-button groups instead of dropdowns
- Added short per-panel explanatory copy with documentation links for Language, Worldview, and Places
- Updated worldview panel messaging to: "Controls boundaries and labels in disputed areas. Does not reflect Esri's official position."
- Expanded Places panel help text to explain the difference between `All` and `Attributed`
- Added `VITE_BASE_PATH` build-time override in Vite config to support custom-domain deployments while preserving GitHub Pages default path
- Updated style-info modal capabilities section to show only supported capabilities under a single heading
- Added dynamic map panel heading/description to show selected style and active parameter values

### Deprecated

### Removed

### Fixed
- Parameter panel scrolling/overflow behavior in docked tools panels by constraining `calcite-block` content regions
- Language flag mapping support for Catalan (`ca` → `es-ct`) and Greek (`el` → `gr`) plus hyphenated flag-icon validation

### Security

## [2.0.0] - 2026-02-17

### Added
- Initial project setup with vibe coding structure
- Comprehensive specification document (docs/SPEC.md)
- Custom skills: /ship, /release, /review-spec
- Documentation: CLAUDE.md, TODO.md, CONTRIBUTING.md
- Git aliases for AI vs human commits
- GitHub Actions workflows for CI/CD
- MapLibre GL JS v5 map viewer with live style selection and viewport preservation
- Parameter controls (language, worldview, places) with capability-based disabling
- Capabilities service fetching dynamic options from `/v2/self` API with caching
- Style capabilities utility for per-style parameter support detection
- Calcite Shell layout with Navigation header and Shell Panel sidebar
- Scrollable style grid with 3-column thumbnails and expand view
- Compact sidebar UI with error-only refresh
- Style family toggle (ArcGIS/Open), category tabs, grouped style sections, and capability legend badges
- Style metadata normalization utilities and tests for family/category/path extraction and grouping behavior
- Parameter help content with disabled-state warnings and direct documentation links
- Code Generator entry in the docked tools action bar with placeholder panel content
- Style card info overlay button and "When to use this style" modal with configurable style/category guidance, docs links, and sample app links
- Style info resolution utility with generated guidance and documentation URL fallbacks for uncovered styles

### Changed
- Simplified style browser controls by removing block wrappers and keeping refresh action error-only
- Updated sidebar panel layout to use fixed-height grid sections and inline parameter labels for tighter spacing
- Refined sidebar and viewer layout sizing in Calcite Shell to improve panel stretching and overflow behavior
- Updated style selection and filtering to use resolved style identifiers from `/self` metadata including `styleUrl` fallbacks
- Added category tabs to the expanded style dialog and synchronized dialog/sidebar tab state
- Exposed OSM as a distinct style family option instead of merging it into Open filtering
- Refactored tools sidebar into a `panel-start` docked action-rail workflow with separate panels for style selection, language, worldview, and places
- Wrapped active tools panel bodies in `calcite-block` for consistent Calcite panel content structure
- Wrapped the style-selection panel body in `calcite-block` and preserved a dedicated inner scroll container for style browsing
- Expanded project guidance in `AGENTS.md`, `CLAUDE.md`, and `CONTRIBUTING.md` with Calcite layout/scrolling guardrails
- Updated style browser cards to hide capability chips in the sidebar while keeping capability chips visible in the expanded modal
- Moved style card titles onto thumbnail overlays using translucent white backgrounds for compact sidebar presentation
- Replaced native `title` attributes in parameter controls and style cards with `calcite-tooltip` for consistent Calcite UX
- Wrapped the main map viewer in a loading-enabled `calcite-panel` and wired style-load progress from `MapViewer`
- Restyled style browser filtering with a full-width icon search input and toggleable capability chips in the legend
- Updated style list ordering to rank higher capability support first while preserving `/base` and `/labels` tie-break placement
- Refined thumbnail info overlay interaction to use a dedicated icon button with a circular, icon-only background treatment
- Updated active legend capability icon visuals to use brand-blue icon background while active

### Deprecated
- Marked OSM style family as deprecated in the family selector while retaining support for legacy styles

### Removed

### Fixed
- Map display regressions caused by missing `path` in style records by resolving IDs from `styleUrl`
- Zero-height/zero-width map panel rendering issues by correcting viewer panel content sizing and shell panel width behavior
- Category tab filtering mismatches by normalizing category metadata with exact/fuzzy/path-based fallbacks
- Horizontal overflow from category tabs and sidebar sizing conflicts that hid main map/code content
- Incorrect family mixing where OSM styles appeared under ArcGIS/Open due to ambiguous family resolution
- Action bar label visibility on first load by explicitly syncing action text visibility with expanded state
- Map viewer vertical sizing by replacing the main viewer `calcite-panel` wrapper with a full-height flex container
- Style browser scrolling regression caused by overriding Calcite panel host layout behavior and unconstrained scroll ancestry
- Style card thumbnail/title spacing by eliminating inline-image baseline gaps and removing residual whitespace under thumbnail overlays
- Inconsistent style ordering between grouped and All views by applying shared capability-aware sorting across both
- Style-browser icon styling leakage by scoping overlay icon styles to the thumbnail info control instead of shared Calcite icon parts

### Security

---

**Guidelines**:
- Add changes to [Unreleased] as you work
- Use `/ship` to commit changes (keeps them in Unreleased)
- Use `/release` to move Unreleased changes to a versioned release
- Categories: Added, Changed, Deprecated, Removed, Fixed, Security
