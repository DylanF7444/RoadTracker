# RoadLog Product Checklist

Working title: RoadLog

Core concept: Track every named road the user has traveled, match traveled paths against OpenStreetMap road data, and show completion stats at town, metro, country, and world scales.

## 1. Product Foundation

- [x] Confirm final app name.
- [x] Define target launch platforms.
  - [x] iOS.
  - [x] Android.
  - [x] Cross-platform release order.
- [x] Choose app architecture.
  - [x] React Native.
  - [ ] Native Swift/Kotlin.
  - [ ] Hybrid approach, if needed.
- [ ] Define minimum supported OS versions.
- [x] Define first-release geography.
  - [ ] Single city.
  - [ ] Single country.
  - [x] Local downloaded/demo region first.
  - [ ] Global OSM-backed launch.
- [x] Define MVP feature set.
- [x] Define post-MVP feature set.
- [ ] Define success metrics.
  - [ ] Daily active users.
  - [ ] Tracking sessions per user.
  - [ ] Roads visited per user.
  - [ ] Retention after first completed session.
  - [ ] Opt-in leaderboard participation.

## 2. Tracking Mode

- [x] Add prominent Start Tracking control.
- [x] Add prominent Stop Tracking control.
- [x] Design the tracking control as a record-style toggle.
- [x] Show active tracking state clearly in the app.
- [x] Record continuous GPS path while tracking is active.
- [x] Store raw GPS samples locally.
- [x] Store processed route geometry locally.
- [x] Capture timestamp for each GPS sample.
- [x] Capture speed for each GPS sample when available.
- [x] Capture heading for each GPS sample when available.
- [x] Capture horizontal accuracy for each GPS sample.
- [x] Ignore or down-weight low-accuracy GPS samples.
- [x] Match GPS traces to OSM road segments in near real time.
- [x] Mark matched road segments as visited.
- [x] Mark matched named roads as visited when segment criteria are met.
- [x] Persist visited road state in local storage.
- [ ] Resume tracking state safely after app backgrounding.
- [ ] Resume tracking state safely after app foregrounding.
- [ ] Handle app termination while tracking.
- [ ] Handle device reboot during active tracking.
- [ ] Show current session duration.
- [x] Show current session distance.
- [x] Show number of new roads discovered during current session.
- [ ] Show current GPS quality or tracking confidence.
- [ ] Add pause/resume support, if desired.

## 3. Battery-Efficient Tracking

- [ ] Define GPS polling strategy while moving.
- [ ] Define lower-power polling strategy while slow or stationary.
- [ ] Detect stationary state from speed and movement threshold.
- [ ] Detect walking, cycling, and driving modes, if relevant.
- [ ] Avoid excessive OSM map-matching work when stationary.
- [ ] Batch location updates when appropriate.
- [ ] Add background tracking permission flow.
- [ ] Add clear explanation for background location usage.
- [ ] Add low-battery behavior.
- [ ] Add tracking warning when GPS quality is poor.
- [ ] Test battery drain during short sessions.
- [ ] Test battery drain during multi-hour sessions.
- [ ] Test tracking through tunnels, dense cities, and rural roads.

## 4. Lock Screen And Quick Controls

- [ ] Research iOS Lock Screen widget or Live Activity support.
- [ ] Research Android lock screen or notification controls.
- [ ] Add start tracking shortcut.
- [ ] Add stop tracking shortcut.
- [ ] Add active session status.
- [ ] Add elapsed time.
- [ ] Add distance.
- [ ] Add new roads count.
- [ ] Ensure controls work while app is backgrounded.
- [ ] Ensure controls respect privacy and permission settings.

## 5. Map View

- [x] Add OpenStreetMap-based map.
- [x] Render all roads in neutral color.
- [x] Render visited roads in distinct highlight color.
- [x] Choose visited-road highlight palette.
  - [ ] Green option.
  - [ ] Gold option.
  - [ ] Colorblind-safe option.
- [x] Add current user position marker.
- [x] Add current session trace overlay.
- [x] Add completed road overlay.
- [x] Add unvisited road overlay.
- [ ] Add map legend.
- [ ] Add layer controls.
- [ ] Add road-category filters.
- [ ] Add selected-road detail panel.
- [ ] Add road name labels where useful.
- [ ] Ensure smooth zooming from street level to regional view.
- [ ] Ensure map remains readable at city/metro scale.
- [ ] Ensure map remains readable at country/world scale.
- [ ] Optimize map performance with many visited roads.

## 6. Map Scale Layers

- [x] Implement town or municipality layer.
- [x] Implement city or metro layer.
- [x] Implement county layer.
- [x] Implement country layer.
- [ ] Implement world layer.
- [x] Define zoom thresholds for each layer.
- [ ] Simplify road geometry at lower zoom levels.
- [x] Aggregate stats by visible geography.
- [x] Show completion summary for current viewport.
- [ ] Show district-level breakdown in metro view.
- [ ] Show country-level completion in world view.
- [ ] Add smooth transitions between map scales.

## 7. Fog Of War Mode

- [ ] Decide whether Fog of War is MVP or post-MVP.
- [ ] Add Fog of War toggle.
- [ ] Darken unvisited areas.
- [ ] Keep visited roads and areas visually clear.
- [ ] Define how much area around a traveled path is revealed.
- [ ] Define whether visited roads reveal nearby blocks.
- [ ] Optimize fog rendering at city scale.
- [ ] Optimize fog rendering at country/world scale.
- [ ] Add accessibility-safe contrast.

## 8. Stats Hierarchy: Town / Municipality

- [ ] Define town and municipality boundary source.
- [x] Calculate total named roads per municipality.
- [x] Calculate visited named roads per municipality.
- [x] Calculate percent of named roads driven.
- [x] Calculate roads remaining count.
- [ ] Identify longest unvisited road nearby.
- [ ] Show nearest unvisited named roads.
- [ ] Show completion progress over time.
- [ ] Show recently completed roads.
- [ ] Support filters in town-level stats.
  - [ ] Exclude highways.
  - [ ] Exclude unpaved roads.
  - [ ] Exclude private roads.
  - [ ] Exclude service roads, if desired.

## 9. Stats Hierarchy: City / Metro

- [ ] Define city and metro boundary source.
- [ ] Define district boundary source.
- [ ] Calculate city/metro road completion.
- [ ] Calculate district-by-district completion.
- [ ] Add completion heatmap.
- [ ] Add district list sorted by completion.
- [ ] Add district list sorted by roads remaining.
- [ ] Add district list sorted by longest unvisited road.
- [ ] Add metro-level progress over time.
- [x] Add ability to tap a region and select it.
- [ ] Support category filters in city/metro stats.

## 10. Stats Hierarchy: Country / World

- [x] Define country boundary source.
- [x] Calculate road network coverage per country.
- [x] Calculate visited road length per country.
- [x] Calculate named-road completion per country.
- [ ] Add country-level completion map.
- [ ] Add country list sorted by completion.
- [ ] Add country list sorted by visited distance.
- [ ] Add first-road-in-country milestone.
- [ ] Add world-level completion summary.
- [ ] Add continent completion rings.
- [ ] Define continent grouping source.
- [ ] Support country/world stats with filters.

## 11. Road Database

- [ ] Use OpenStreetMap as primary road data source.
- [ ] Define OSM import/update strategy.
- [ ] Define whether road data is downloaded on demand or prepackaged.
- [ ] Define local cache strategy for road tiles or extracts.
- [ ] Define road segment schema.
- [ ] Define named road schema.
- [ ] Define relationship between OSM ways and app road records.
- [ ] Handle roads split across multiple OSM ways.
- [ ] Handle roads with identical names in different places.
- [ ] Handle unnamed roads.
- [ ] Handle alternate names.
- [ ] Handle road name changes over time.
- [ ] Handle OSM edits and deleted ways.
- [ ] Store road category.
  - [ ] Motorway/highway.
  - [ ] Arterial.
  - [ ] Residential street.
  - [ ] Service road.
  - [ ] Dirt or unpaved road.
  - [ ] Private road.
  - [ ] Path/trail, if included.
- [ ] Store road surface when available.
- [ ] Store access restrictions when available.
- [ ] Store one-way metadata when available.
- [ ] Store bridge/tunnel metadata when available.
- [ ] Store admin boundaries for stats.
- [ ] Store geometry simplification levels.

## 12. Map Matching

- [x] Choose map-matching approach.
  - [x] Local map matching.
  - [ ] Server-assisted map matching.
  - [ ] Hybrid strategy.
- [x] Define matching confidence score.
- [x] Match GPS samples to candidate OSM road segments.
- [ ] Resolve ambiguity between parallel roads.
- [ ] Resolve ambiguity near highways and frontage roads.
- [ ] Resolve ambiguity at intersections.
- [ ] Handle GPS drift.
- [ ] Handle sparse GPS points.
- [ ] Handle U-turns and loops.
- [ ] Handle roads traveled in either direction.
- [x] Define minimum segment coverage needed to mark a segment visited.
- [x] Define minimum named-road coverage needed to count a road as visited.
- [ ] Prevent false positives from nearby roads.
- [ ] Allow correction or deletion of incorrect visited roads.
- [ ] Record matching metadata for debugging.
- [ ] Add tests using known routes.

## 13. Local Storage

- [x] Use SQLite for local app database.
- [ ] Define database migrations.
- [x] Store tracking sessions.
- [x] Store GPS samples.
- [x] Store matched segments.
- [x] Store visited roads.
- [ ] Store road metadata cache.
- [ ] Store stats cache.
- [x] Store app settings.
- [x] Store privacy preferences.
- [ ] Store badge progress.
- [ ] Store streak progress.
- [ ] Store export history.
- [ ] Add data compaction strategy.
- [ ] Add local backup strategy.
- [ ] Add database corruption recovery path.

## 14. History And Sessions

- [x] Save each tracking session.
- [x] Store session date.
- [x] Store session start time.
- [x] Store session end time.
- [ ] Store session duration.
- [x] Store session distance.
- [x] Store new roads discovered.
- [x] Store route geometry.
- [x] Store matched road list.
- [x] Add session history list.
- [ ] Add session detail view.
- [ ] Add replay mode.
- [ ] Animate route during replay.
- [ ] Show speed or time scrubber during replay.
- [ ] Show newly discovered roads during replay.
- [ ] Allow deleting a session.
- [ ] Decide whether deleting a session removes visited roads.
- [ ] Recalculate visited roads after deletion, if needed.

## 15. Export

- [x] Export session as GPX.
- [ ] Export session as KML.
- [ ] Export all visited roads as GPX or KML, if desired.
- [ ] Export raw GPS trace, if desired.
- [ ] Export matched route, if desired.
- [ ] Add share sheet integration.
- [ ] Add file save integration.
- [ ] Include privacy warning before export.
- [ ] Test exports with common map tools.

## 16. Discovery Features

- [ ] Add nearby unexplored roads list.
- [ ] Add nearby unexplored roads map overlay.
- [ ] Rank nearby roads by distance.
- [ ] Rank nearby roads by length.
- [ ] Rank nearby roads by rarity score.
- [ ] Rank nearby roads by contribution to completion percentage.
- [ ] Add route suggestion concept, if desired.
- [ ] Add search for named roads.
- [ ] Add saved exploration targets.
- [ ] Add reminders or prompts for nearby unvisited roads, if desired.

## 17. Gamification

- [ ] Track streak of days with at least one new road driven.
- [ ] Define streak reset rules.
- [ ] Define streak grace period, if any.
- [ ] Add badge system.
- [ ] Add badge inventory.
- [ ] Add badge unlock notifications.
- [ ] Add badge detail view.
- [ ] Add "First road in [country]" badge.
- [ ] Add "Completed downtown [city]" badge.
- [ ] Add municipality completion badge.
- [ ] Add district completion badge.
- [ ] Add country milestone badge.
- [ ] Add distance milestone badges.
- [ ] Add rare road badges.
- [ ] Add road rarity score.
- [ ] Define rarity score source.
- [ ] Ensure rarity scoring respects privacy.

## 18. Leaderboards

- [ ] Decide whether leaderboards are MVP or post-MVP.
- [ ] Make leaderboards opt-in only.
- [ ] Add leaderboard consent flow.
- [ ] Add global leaderboard.
- [ ] Add country leaderboard.
- [ ] Add city/metro leaderboard.
- [ ] Add friends-only leaderboard, if desired.
- [ ] Define leaderboard metrics.
  - [ ] Roads completed.
  - [ ] Distance covered.
  - [ ] Completion percentage.
  - [ ] Rare road score.
  - [ ] Streak.
- [ ] Add anti-cheat strategy.
- [ ] Add data minimization for leaderboard submissions.
- [ ] Allow users to leave leaderboards.
- [ ] Allow users to delete leaderboard data.

## 19. Privacy

- [x] Store all data locally by default.
- [x] Add clear local-only mode.
- [ ] Add optional cloud sync only after explicit opt-in.
- [ ] Add optional leaderboard only after explicit opt-in.
- [x] Do not sell user data.
- [x] Do not share user data without consent.
- [ ] Write privacy policy.
- [ ] Add in-app privacy summary.
- [ ] Explain location data usage.
- [ ] Explain background tracking usage.
- [ ] Explain export risks.
- [ ] Allow users to delete all local data.
- [ ] Allow users to delete selected sessions.
- [ ] Allow users to disable tracking.
- [ ] Allow users to disable analytics, if analytics exist.
- [ ] Avoid collecting precise location on servers unless required.
- [ ] Avoid uploading raw traces for leaderboard participation.
- [ ] Define retention policy for any cloud data.

## 20. Optional Cloud Sync

- [ ] Decide whether cloud sync is MVP or post-MVP.
- [ ] Support iCloud sync, if targeting iOS.
- [ ] Support Google Drive sync, if targeting Android.
- [ ] Support cross-platform sync, if needed.
- [ ] Sync visited roads.
- [ ] Sync sessions.
- [ ] Sync app settings.
- [ ] Sync badges and streaks.
- [ ] Resolve sync conflicts.
- [ ] Encrypt sensitive synced data where appropriate.
- [ ] Allow disabling sync.
- [ ] Allow deleting synced data.

## 21. Permissions And Compliance

- [x] Add foreground location permission flow.
- [x] Add background location permission flow.
- [ ] Add motion/activity permission flow, if used.
- [ ] Add notification permission flow, if used.
- [ ] Add App Store background location justification.
- [ ] Add Play Store location disclosure.
- [ ] Add privacy nutrition labels for iOS.
- [ ] Add data safety disclosure for Android.
- [ ] Review OpenStreetMap tile usage policy.
- [ ] Confirm OSM attribution requirements.
- [x] Show OSM attribution in map UI.
- [ ] Confirm license implications for OSM-derived data.
- [ ] Confirm terms for any third-party map libraries.

## 22. Settings

- [x] Add tracking settings.
- [ ] Add battery mode settings.
- [ ] Add map display settings.
- [x] Add road category filters.
- [x] Add stats filter settings.
- [x] Add privacy settings.
- [ ] Add cloud sync settings.
- [ ] Add leaderboard settings.
- [ ] Add data export settings.
- [ ] Add delete data controls.
- [ ] Add app version/about screen.
- [ ] Add OSM attribution screen or link.

## 23. Accessibility

- [ ] Support dynamic type or font scaling.
- [ ] Support screen readers.
- [x] Add accessible labels for tracking controls.
- [ ] Add accessible labels for map controls.
- [ ] Add non-color indicators for visited roads.
- [ ] Use colorblind-safe palette options.
- [ ] Ensure sufficient contrast.
- [ ] Ensure touch targets are large enough.
- [ ] Ensure tracking state is clear without relying only on color.
- [ ] Test key flows with accessibility tools.

## 24. Performance

- [ ] Benchmark map rendering with many road segments.
- [ ] Benchmark local database reads.
- [ ] Benchmark local database writes during tracking.
- [ ] Benchmark map matching during active tracking.
- [ ] Cache expensive stats queries.
- [ ] Use geometry simplification for low zoom levels.
- [ ] Avoid blocking UI during tracking.
- [ ] Avoid blocking UI during OSM data loading.
- [ ] Handle limited storage.
- [ ] Handle large visited-road datasets.
- [ ] Handle global road-data scale.

## 25. Reliability And Edge Cases

- [ ] Handle no GPS signal.
- [ ] Handle poor GPS accuracy.
- [ ] Handle airplane mode.
- [ ] Handle no internet connection.
- [ ] Handle missing local OSM data.
- [ ] Handle crossing municipality boundaries.
- [ ] Handle crossing country borders.
- [ ] Handle ferries, bridges, and tunnels.
- [ ] Handle private roads.
- [ ] Handle roads closed or removed in OSM.
- [ ] Handle duplicate road names.
- [ ] Handle renamed roads.
- [ ] Handle roads split by admin boundaries.
- [ ] Handle very long roads crossing multiple regions.
- [ ] Handle app crash during tracking.
- [ ] Recover incomplete sessions.

## 26. Testing

- [x] Add unit tests for stats calculations.
- [x] Add unit tests for road filtering.
- [ ] Add unit tests for local database migrations.
- [ ] Add unit tests for streak logic.
- [ ] Add unit tests for badge logic.
- [x] Add integration tests for tracking sessions.
- [x] Add integration tests for map matching.
- [ ] Add integration tests for OSM data import.
- [ ] Add export tests for GPX.
- [ ] Add export tests for KML.
- [ ] Add offline-mode tests.
- [ ] Add privacy setting tests.
- [ ] Add manual field-test checklist.
- [ ] Test short neighborhood drive.
- [ ] Test long highway drive.
- [ ] Test dense downtown drive.
- [ ] Test rural roads.
- [ ] Test crossing city boundaries.
- [ ] Test crossing country boundaries, if feasible.

## 27. MVP Candidate

- [x] Mobile app shell.
- [x] OSM map view.
- [x] Start/stop tracking.
- [x] Background GPS logging.
- [x] Local SQLite storage.
- [x] Basic map matching.
- [x] Visited road highlighting.
- [x] Session history.
- [x] Town/municipality completion stats.
- [x] Road category filters.
- [x] GPX export.
- [x] Privacy-first local-only mode.
- [x] OSM attribution.

## 28. Post-MVP Candidate

- [ ] Lock screen widget.
- [ ] Fog of War mode.
- [ ] Metro heatmaps.
- [ ] Country/world stats.
- [ ] Continent completion rings.
- [ ] Badges.
- [ ] Streaks.
- [ ] Nearby unexplored roads.
- [ ] Road rarity score.
- [ ] Replay mode.
- [ ] KML export.
- [ ] Optional cloud sync.
- [ ] Opt-in leaderboards.

## 29. Open Questions

- [ ] Should the app count a named road as complete after any segment is driven, or only after a percentage of its total length is covered?
- [x] Should highways count toward default completion stats?
- [ ] Should unpaved roads count by default?
- [ ] Should private roads be excluded by default?
- [ ] Should unnamed roads appear on the map but stay out of completion stats?
- [x] Should completion be based on named roads, road length, OSM segments, or a blended score?
- [x] Should map matching happen entirely on-device for privacy?
- [ ] Should users be able to manually correct matched roads?
- [ ] Should the MVP support global road data or only downloaded local regions?
- [ ] Should "city/metro" be based on official boundaries, metro statistical areas, or custom app-defined regions?
- [ ] Should rarity score be global, regional, or friends-only?
- [ ] What exact data, if any, should be uploaded for leaderboard participation?
- [ ] Should deleting a session remove roads first discovered in that session?
- [x] Should users be able to import GPX/KML from past drives?
- [ ] Should walking and biking count, or only driving?
