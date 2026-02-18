# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Project Overview

An interactive browser-based playground for developers to explore and experiment with the **ArcGIS Location Platform Basemap Styles Service v2**. The tool enables users to browse and filter basemap styles, configure parameters, generate code snippets for multiple mapping libraries, and share configurations.

**Tech Stack**:
- Language: JavaScript (ES2020+)
- Framework: React 18+ (latest stable version)
- UI Components: Calcite Design System (Esri's official design system with React components)
- Mapping Library: MapLibre GL JS v5.x for the playground viewer
- Build Tool: Vite (modern bundler with HMR)
- Styling: CSS Modules or Calcite's styling approach
- State Management: React Context or simple prop drilling
- Testing: Vitest + React Testing Library + pre-commit hooks
- Node Version: Node 25 (enforced via `.nvmrc`)
- Analytics: Google Analytics with cookie consent
- Deployment: GitHub Pages (static hosting)

## Commands

```bash
# Installation
npm install

# Development
npm run dev          # Starts dev server on http://localhost:5173

# Tests
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode

# Lint
npm run lint

# Build
npm run build        # Output to dist/
npm run preview      # Preview production build locally
```

## Architecture

### Project Structure
```
src/
├── components/
│   ├── StyleBrowser/            # Style grid, filters, badges, expand modal
│   ├── MapViewer/               # MapLibre map instance
│   ├── ParameterControls/       # Language, worldview, places inputs
│   ├── CodeGenerator/           # Export buttons, token input, CTA
│   ├── ShowcaseLocations/       # Dropdown with location presets
│   └── CookieConsent/           # Simple GDPR banner
├── templates/
│   ├── html/                    # HTML templates (real code, not placeholders)
│   ├── config/                  # Template metadata (library versions, CDN URLs, etc)
│   └── index.js                 # Template registry and generator functions
├── services/
│   ├── styleService.js          # Fetch /self, cache management with localStorage fallback
│   ├── codepenService.js        # CodePen POST integration
│   ├── shareService.js          # Generate/parse shareable URLs
│   └── analytics.js             # Google Analytics with consent tracking
├── config/
│   ├── showcaseLocations.js     # Global list with style tags, configurable visibility
│   └── appDefaults.js           # Default map state
└── utils/
    ├── urlGenerator.js          # Build style URLs with parameters
    ├── storage.js               # localStorage helpers with TTL
    └── urlEncoder.js            # Encode/decode config for share URLs
```

### Data Flow

```
User Input → Parameter Controls → Map Viewer (MapLibre) →
Style Service (/self API) → Cache (localStorage) → UI Update
```

## Git Conventions

**Conventional Commits**:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process, dependencies, etc.

**AI vs. Human Commits**:
- AI commits: `git cai "message"` (prefixes "AI: ", sets AI author)
- Human commits: `git ch "message"`

**Custom Skills**:
- `/ship` - Run tests, update CHANGELOG.md and TODO.md, stage changes, commit, and push
- `/release` - Create versioned release with changelog, git tag, and GitHub Release
- `/review-spec` - Review and refine project specification

**Documentation Maintenance**:
- When shipping, update CHANGELOG.md under [Unreleased]
- After every codebase change, update docs/TODO.md to reflect what changed (status, done items, and next steps)
- For every new feature, update docs/SPEC.md to keep the specification aligned with implementation
- After every new feature, explicitly tell the user what checks/tests they should run (or confirm which checks/tests were already run and passed)

**Security Rules**:
- Never commit: `*.pem`, `.env`, `*.key`, private keys, API tokens, real user data
- Staging policy: Stage files by name - never `git add -A` or `git add .`

## Code Style

**General Principles**:
- Prefer functional programming patterns
- Write self-documenting code
- Add comments only for complex logic
- Use React hooks and functional components
- Keep components small and focused
- Separate presentation from logic
- Treat user manual HTML/CSS edits as protected: do not overwrite broad markup/style changes; if broader HTML/CSS edits are needed, ask the user first and only patch the exact requested lines.

**Component Guidelines**:
- Use Calcite Design System components where possible
- Follow Calcite naming conventions and patterns
- Ensure accessibility (WCAG 2.1 AA compliance)
- Implement keyboard navigation for all interactive elements
- Provide proper ARIA labels and semantic HTML

**Template System**:
- HTML templates use standard placeholders like `{{variableName}}`
- Real, working HTML code (not JS template literals)
- Template will include Esri attribution (required for CesiumJS and OpenLayers), the others should include it by default
- Include security comments about API key scoping and rotation
- Link to documentation and examples
- For generated exports, inject the API key from the Code Generator input (never leave `YOUR_ACCESS_TOKEN` placeholders in CodePen/download output)
- Include full live playground state in generated templates: selected style, language, worldview, places, center, and zoom
- Validate library-specific API usage against official docs before implementing template code
- Apply cross-library zoom conversion when exporting from MapLibre viewport state (library scales may differ)

**Testing Strategy**:
- Unit tests for utilities and services (URL generation, cache logic, template generation)
- Integration tests for API endpoints and component interactions
- React Testing Library for component tests
- Aim for 80%+ coverage on critical paths
- Pre-commit hooks block commits if tests fail

## Known Mistakes

Document known pitfalls or bugs to prevent Codex from repeating them:

- **Session Tokens**: ArcGIS Maps SDK for JavaScript versions <5.0 do NOT support session tokens. Do not create templates for ArcGIS Maps SDK until v5.0 is released (expected February 2026).
- **Leaflet Integration**: Must use Esri Leaflet plugin for loading basemaps correctly, not vanilla Leaflet tile layers.
- **Token Storage**: Never persist API tokens to localStorage - session memory only.
- **Cache Fallback**: Always provide localStorage fallback when `/self` endpoint fails.
- **Parameter Preservation**: When switching style families, preserve compatible parameters (e.g., language) but reset incompatible ones (e.g., worldview when switching to Open family).

## Lessons Learned (2026-02-13)

**CRITICAL: Always verify before proceeding**:
- **Run tests BEFORE adding features** - `npm test` must pass before moving to next phase
- **Verify each phase works** - Let user manually verify dev server, build, tests, and linting before proceeding
- **Update docs/TODO.md after completing each task** - Keep documentation in sync with actual progress
- **Don't implement multiple phases at once** - Wait for user approval between phases

**Calcite Components v5 Integration**:
- **CSS Import**: Use `@esri/calcite-components/main.css` (exported in package.json), NOT `@esri/calcite-components/dist/calcite/calcite.css` or `dist/cdn/main.css`
- **Asset Path**: Use CDN for assets: `https://cdn.jsdelivr.net/npm/@esri/calcite-components@5.0.1/dist/components/assets` (works in both dev and production), NOT local node_modules path
- **Latest Version**: Always use latest stable version (5.0.1 as of Feb 2026), check npm for updates
- **Host Layout Rules**: Do NOT override `calcite-panel`/`calcite-block` host `display` behavior (for example `display: block` on a panel host). This breaks Calcite's internal flex sizing and causes scroll containers to expand to content height.
- **Scrollable Regions**: Keep one dedicated inner scroll container (`overflow-y: auto`) and ensure every ancestor in the chain has `min-height: 0` with constrained height (grid/flex `1fr` patterns). Validate in DevTools by confirming `scrollHeight > clientHeight` on the intended container.

**Vite Configuration**:
- **Base Path**: Must be conditional for dev vs production to prevent WebSocket HMR errors:
  ```javascript
  base: command === 'build' ? '/esri-basemap-styles-service-v2-playground/' : '/'
  ```
- **Dev server**: Use `base: '/'` in development
- **Production**: Use GitHub Pages path in production builds

**Testing Setup**:
- **Mock localStorage**: Must implement actual storage functionality in tests, not just return null:
  ```javascript
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  })();
  ```

**ESLint Configuration**:
- **Missing Globals**: Add browser APIs to globals: `btoa`, `atob`, `URLSearchParams`
- **Unused Variables**: Remove unused catch parameters or use underscore prefix
- **Library Versions**: Always verify latest stable versions before adding dependencies

## Lessons Learned (2026-02-17) - Template Export Pitfalls

- **Leaflet API choice matters**: Use `L.esri.Vector.vectorBasemapLayer(styleId, options)` for Basemap Styles integration (with `version: 2` and style params in options), not ad-hoc URL plumbing unless docs explicitly require it.
- **Attribution behavior differs by library**: Do not force manual attribution in Leaflet Esri Vector templates when plugin attribution is already handled automatically.
- **Do not hardcode template runtime values**: Avoid fixed center/zoom defaults in exports once live map state is available; propagate viewport from `MapViewer` to `CodeGenerator`.
- **Token injection must be end-to-end**: Ensure exported HTML/CodePen payload includes the user-entered token value and never stores it in localStorage.
- **Parameter parity is required**: Exported code must reflect active `language`, `worldview`, and `places`; template output should match playground behavior.
- **Protect zoom parity across libraries**: Convert MapLibre zoom to target-library zoom when exporting (Leaflet currently requires offset handling).

## Workflow Automation

**Pre-commit Hooks** (using Husky):
```bash
# Runs on commit
npm run lint
npm test
```

**Pre-push Hooks**:
```bash
# Runs before push
npm run build
npm test
```

## Key Technical Decisions

### Why React + Calcite?
- React: Robust state management, component reusability, large ecosystem, excellent testing support
- Calcite: Official Esri design system, pre-built accessible components, consistent branding

### Why Not Active Session Management?
- Complex lifecycle management (expiration, renewal)
- Playground should be exploratory, not transactional
- Educational approach (show code) achieves learning goal without billing users

### Why Separate HTML Templates from JS?
- Better developer experience (syntax highlighting, IDE support)
- Easier for community to contribute templates
- Simpler to review changes in PRs
- Can preview/test templates without building entire app

### Why Simple TTL Cache with localStorage Fallback?
- MVP needs to ship quickly
- Service catalog doesn't change frequently (24hr TTL is safe)
- Fallback ensures app works even when API is down
- Can enhance with versioning/migrations later

## Phase-Based Delivery

**Phase 1 (MVP)**:
- Dynamic style loading from `/self` with TTL cache
- Style browser with filters and badges
- MapLibre GL JS v5.x viewer
- Code generation for MapLibre and Leaflet
- CodePen export and HTML download
- Share configuration via URL
- Cookie consent and Google Analytics

**Phase 2**:
- Places category filtering
- Template dev mode
- Mobile responsive refinements
- ArcGIS Maps SDK template (v5.0+)
- Multi-view option

**Phase 3+**:
- Additional library templates (CesiumJS, OpenLayers)
- 3D map styles
- UI internationalization
- Community contributions

See docs/SPEC.md for full specification and implementation details.
