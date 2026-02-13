# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

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
- Mark completed items in docs/TODO.md
- Update docs/SPEC.md when requirements change

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

**Testing Strategy**:
- Unit tests for utilities and services (URL generation, cache logic, template generation)
- Integration tests for API endpoints and component interactions
- React Testing Library for component tests
- Aim for 80%+ coverage on critical paths
- Pre-commit hooks block commits if tests fail

## Known Mistakes

Document known pitfalls or bugs to prevent Claude from repeating them:

- **Session Tokens**: ArcGIS Maps SDK for JavaScript versions <5.0 do NOT support session tokens. Do not create templates for ArcGIS Maps SDK until v5.0 is released (expected February 2026).
- **Leaflet Integration**: Must use Esri Leaflet plugin for loading basemaps correctly, not vanilla Leaflet tile layers.
- **Token Storage**: Never persist API tokens to localStorage - session memory only.
- **Cache Fallback**: Always provide localStorage fallback when `/self` endpoint fails.
- **Parameter Preservation**: When switching style families, preserve compatible parameters (e.g., language) but reset incompatible ones (e.g., worldview when switching to Open family).

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
