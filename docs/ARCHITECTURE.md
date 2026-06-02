# RoadLog MVP Architecture

## Product shape

RoadLog is split into shared domain logic plus platform-specific apps:

- `packages/core`: pure TypeScript models, tracking reducers, map matching, stats, export logic, and seed data.
- `apps/mobile`: Expo React Native shell for iOS and Android tracking.
- `apps/web`: Vite React website for viewing sessions, visited roads, stats, and exports.

The MVP is local-first. Mobile devices collect location samples and mark roads visited on-device. The website currently uses browser storage and demo data, with room for optional sync later.

## MVP decisions

- App name: RoadLog.
- Launch platforms: iOS and Android for tracking; web for viewing.
- Architecture: shared TypeScript domain package, Expo React Native mobile app, React web viewer.
- First-release geography: local downloaded regions. The MVP uses a bundled demo road region until real OSM extracts are wired in.
- Privacy: local-only by default, no server upload, no leaderboard, no cloud sync.
- Map matching: on-device/local nearest-segment matching with confidence metadata.
- Completion: traveled segments are tracked individually, and a named road is counted complete only after every segment for that road has been confidently matched.
- Default filters: highways, private roads, service roads, and unpaved roads are excluded from default completion stats for now.
- Import: GPX/KML import is post-MVP. GPX export is included in MVP.
- Regions: country, state, county, city, town, district, and custom/other regions share one boundary model. Zoom level chooses the active region type, while direct polygon or label clicks override the current selection. Users can track chosen regions locally.

## Future sync boundary

The durable sync unit should be:

- user settings without precise traces by default
- visited segment IDs
- visited road IDs
- summarized session metadata
- optional encrypted raw GPS traces only after explicit opt-in

That boundary keeps Android/iOS tracking useful offline and lets the website become a viewer without requiring precise location uploads.
