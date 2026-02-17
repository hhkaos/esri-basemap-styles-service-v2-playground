# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Changed
- Simplified style browser controls by removing block wrappers and keeping refresh action error-only
- Updated sidebar panel layout to use fixed-height grid sections and inline parameter labels for tighter spacing
- Refined sidebar and viewer layout sizing in Calcite Shell to improve panel stretching and overflow behavior
- Updated style selection and filtering to use resolved style identifiers from `/self` metadata including `styleUrl` fallbacks
- Added category tabs to the expanded style dialog and synchronized dialog/sidebar tab state
- Exposed OSM as a distinct style family option instead of merging it into Open filtering
- Refactored tools sidebar into a `panel-start` docked action-rail workflow with separate panels for style selection, language, worldview, and places
- Wrapped active tools panel bodies in `calcite-block` for consistent Calcite panel content structure
- Updated style-selection panel body to use a constrained container instead of `calcite-block` so the style browser can own a single inner scroll region
- Expanded project guidance in `AGENTS.md`, `CLAUDE.md`, and `CONTRIBUTING.md` with Calcite layout/scrolling guardrails

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

### Security

---

**Guidelines**:
- Add changes to [Unreleased] as you work
- Use `/ship` to commit changes (keeps them in Unreleased)
- Use `/release` to move Unreleased changes to a versioned release
- Categories: Added, Changed, Deprecated, Removed, Fixed, Security
