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

### Changed
- Simplified style browser controls by removing block wrappers and keeping refresh action error-only
- Updated sidebar panel layout to use fixed-height grid sections and inline parameter labels for tighter spacing

### Deprecated

### Removed

### Fixed

### Security

---

**Guidelines**:
- Add changes to [Unreleased] as you work
- Use `/ship` to commit changes (keeps them in Unreleased)
- Use `/release` to move Unreleased changes to a versioned release
- Categories: Added, Changed, Deprecated, Removed, Fixed, Security
