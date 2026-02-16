# TODO

## Current Sprint

### In Progress
- [ ] Integrate MapLibre GL JS v5.x viewer

### Up Next
- [ ] Create parameter controls (language, worldview, places)
- [ ] Implement template system (MapLibre + Leaflet)

## Backlog

### High Priority (Phase 1 - MVP)
- [ ] Create parameter controls (language, worldview, places)
- [ ] Implement template system (MapLibre + Leaflet)
- [ ] Add CodePen export functionality
- [ ] Add HTML download option
- [ ] Implement share configuration via URL
- [ ] Add cookie consent banner
- [ ] Set up Google Analytics with consent gating
- [ ] Deploy to GitHub Pages

### Medium Priority (Phase 2)
- [ ] Add places category filtering
- [ ] Create template dev mode with file watcher
- [ ] Implement mobile responsive layout (<768px)
- [ ] Add ArcGIS Maps SDK for JavaScript template (v5.0+)
- [ ] Add multi-view option (2 synchronized maps)

### Low Priority / Nice to Have (Phase 3+)
- [ ] CesiumJS template
- [ ] OpenLayers template
- [ ] 3D map styles support
- [ ] UI internationalization (Spanish, French, etc.)
- [ ] Dark mode toggle
- [ ] Advanced caching with versioning

## Future Ideas
- [ ] Split-view swipe comparison
- [ ] Educational location markers with popovers
- [ ] MapViewer integration
- [ ] Community showcase gallery
- [ ] iframe embed code generation
- [ ] User authentication with ArcGIS identity

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

---

**Notes**:
- Move completed tasks to Done section with completion date
- Use `/ship` to automatically update this file when committing
- Review and reprioritize weekly
