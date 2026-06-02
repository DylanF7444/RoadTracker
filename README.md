# RoadLog

RoadLog is a privacy-first road completion tracker. It records local tracking sessions, matches GPS samples against road segments, marks named roads as complete only after all required segments have been confidently visited, and shows progress across map regions.

The project is currently an MVP with shared TypeScript domain logic, an Expo mobile app for tracking, and a Vite web app for viewing sessions, visited roads, regional completion, filters, and GPX exports.

## Features

- Local-only tracking state by default.
- Shared road matching, stats, filters, region progress, storage, and GPX export logic.
- Expo React Native mobile app with foreground/background location support and SQLite persistence.
- Vite React web viewer with Leaflet maps, browser storage, demo tracking, region selection, tracked regions, road filters, and GPX export.
- Demo road and region seed data while real OpenStreetMap extracts are still future work.

## Project Structure

```text
apps/
  mobile/      Expo React Native tracking app
  web/         Vite React web viewer
packages/
  core/        Shared TypeScript domain package
docs/
  ARCHITECTURE.md
```

## Requirements

- Node.js 20 or newer
- npm
- Expo-compatible mobile development environment for running the mobile app on iOS or Android

## Install

```bash
npm install
```

## Run The Web App

```bash
npm run dev:web
```

The web app runs Vite from `apps/web` and binds to `0.0.0.0`, so Vite will print the local URL to open in a browser.

## Run The Mobile App

```bash
npm --workspace @roadlog/mobile run start
```

Common Expo targets:

```bash
npm --workspace @roadlog/mobile run android
npm --workspace @roadlog/mobile run ios
npm --workspace @roadlog/mobile run web
```

The mobile app requests location permission before tracking. It stores RoadLog state locally through the app's SQLite storage adapter.

## Build And Test

Build the web app:

```bash
npm run build:web
```

Run core package tests:

```bash
npm test
```

Typecheck all workspaces:

```bash
npm run typecheck
```

## Workspace Scripts

Root scripts:

- `npm run dev:web` starts the Vite web app.
- `npm run build:web` typechecks and builds the web app.
- `npm test` runs the shared core test suite.
- `npm run typecheck` typechecks every workspace that defines a `typecheck` script.

Package scripts:

- `@roadlog/web`: `dev`, `build`, `typecheck`
- `@roadlog/mobile`: `start`, `android`, `ios`, `web`, `typecheck`
- `@roadlog/core`: `test`, `typecheck`

## MVP Notes

RoadLog is local-first. The mobile app collects location samples and marks roads visited on-device. The web app currently uses browser storage and demo data. Optional sync, real OpenStreetMap extract ingestion, GPX/KML import, broader map layers, and production-grade background recovery are planned beyond the current MVP.

Default completion stats exclude highways, service roads, private roads, and unpaved roads unless the user enables those filters.

For more detail, see `docs/ARCHITECTURE.md` and `ROADLOG_CHECKLIST.md`.
