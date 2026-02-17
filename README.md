# esri-basemap-styles-service-v2-playground

Interactive playground for exploring and testing the [ArcGIS Basemap Styles Service v2](https://developers.arcgis.com/rest/basemap-styles/), including style browsing, live map updates, and parameter controls for `language`, `worldview`, and `places`.

[Live demo](https://rauljimenez.info/esri-basemap-styles-service-v2-playground)

## Features

- Dynamic style discovery from `/self` with cache + fallback behavior.
- Style Browser with family toggle, category tabs, grouped sections, and style info modal.
- Live MapLibre map updates from selected style and parameters.
- Dedicated parameter panels for Language, Worldview, and Places using `calcite-radio-button-group`.
- Parameter help text and direct links to official ArcGIS docs.
- Configurable language/worldview flag icons with sensitivity-safe fallback behavior.

## Tech Stack

- React + Vite
- Calcite Design System
- MapLibre GL JS
- Vitest + React Testing Library

## Local Development

### Requirements

- Node 25 (see `.nvmrc`)

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Test and Lint

```bash
npm test
npm run lint
```

### Build

```bash
npm run build
npm run preview
```

## Environment

- Optional default playground key: set `VITE_DEFAULT_PLAYGROUND_API_KEY` in `.env.local`.
- This key is used for in-app preview requests and is separate from the user-provided export key workflow.

Example:

```bash
VITE_DEFAULT_PLAYGROUND_API_KEY=your_key_here
```

## Configurable Flags

Language and worldview icons are configurable in `src/config/languageFlagConfig.js`.

- `languageFlagPreferences`: preferred flag(s) for language codes without an explicit region.
- `worldviewFlagPreferences`: flag icon mapping for worldview options.

If no explicit region or preference is available, the UI falls back to neutral icons.
