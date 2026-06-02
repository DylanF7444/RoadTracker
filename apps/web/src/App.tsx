import {
  BrowserRoadLogStorage,
  addSample,
  buildRegionProgress,
  calculateRegionStats,
  calculateCompletionStats,
  createInitialState,
  demoRoute,
  findRegionForZoom,
  regionLevelForZoom,
  seedNamedRoads,
  seedRegions,
  seedRoadSegments,
  selectRegion,
  sessionToGpx,
  startSession,
  stopSession,
  toggleTrackedRegion,
  type Region,
  type RoadLogState
} from "@roadlog/core";
import { Activity, Download, Eraser, Filter, MapPinned, Play, ShieldCheck, Square } from "lucide-react";
import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

const RoadMap = lazy(() => import("./MapView").then((module) => ({ default: module.MapView })));

const storage = new BrowserRoadLogStorage();

function meters(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
  return `${Math.round(value)} m`;
}

function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function regionLevelLabel(level: Region["level"]): string {
  const labels: Record<Region["level"], string> = {
    country: "Country",
    state: "State",
    county: "County",
    city: "City",
    town: "Town",
    district: "District",
    custom: "Other"
  };
  return labels[level];
}

class MapErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <div className="map-fallback">Map unavailable</div>;
    }
    return this.props.children;
  }
}

export function App() {
  const [state, setState] = useState<RoadLogState>(() => createInitialState());
  const [activeSessionId, setActiveSessionId] = useState<string>();
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [mapZoom, setMapZoom] = useState(16);

  useEffect(() => {
    void storage.load().then((loaded) => {
      setState(loaded);
      setSelectedSessionId(loaded.sessions[0]?.id);
    });
  }, []);

  useEffect(() => {
    void storage.save(state);
  }, [state]);

  const stats = useMemo(
    () => calculateCompletionStats(seedNamedRoads, state.visitedRoads, state.roadFilter),
    [state.roadFilter, state.visitedRoads]
  );

  const regionProgress = useMemo(
    () =>
      buildRegionProgress(
        seedRegions,
        seedNamedRoads,
        state.visitedRoads,
        state.roadFilter,
        state.trackedRegionIds
      ),
    [state.roadFilter, state.trackedRegionIds, state.visitedRoads]
  );

  const selectedSession = state.sessions.find((session) => session.id === selectedSessionId);
  const activeSession = state.sessions.find((session) => session.id === activeSessionId);
  const selectedRegion =
    seedRegions.find((region) => region.id === state.selectedRegionId) ??
    findRegionForZoom(seedRegions, mapZoom, { latitude: 41.8827, longitude: -87.6359 });
  const selectedRegionStats = selectedRegion
    ? calculateRegionStats(selectedRegion, seedNamedRoads, state.visitedRoads, state.roadFilter)
    : stats;
  const activeRegionLevel = regionLevelForZoom(mapZoom);
  const trackedRegions = regionProgress.filter((progress) => progress.tracked);

  const updateMapZoom = useCallback((zoom: number) => {
    setMapZoom((current) => (current === zoom ? current : zoom));
  }, []);

  function commit(next: RoadLogState) {
    setState(structuredClone(next));
  }

  function startDemoTracking() {
    const next = structuredClone(state);
    const session = startSession(next);
    demoRoute.forEach((point, index) => {
      addSample(
        next,
        {
          id: `${session.id}-sample-${index}`,
          sessionId: session.id,
          capturedAt: new Date(Date.now() + index * 1000).toISOString(),
          latitude: point.latitude,
          longitude: point.longitude,
          horizontalAccuracyMeters: 9,
          speedMetersPerSecond: 8
        },
        seedRoadSegments,
        seedNamedRoads
      );
    });
    setActiveSessionId(session.id);
    setSelectedSessionId(session.id);
    commit(next);
  }

  function stopTracking() {
    if (!activeSessionId) return;
    const next = structuredClone(state);
    stopSession(next, activeSessionId);
    setActiveSessionId(undefined);
    commit(next);
  }

  function toggleFilter(key: keyof RoadLogState["roadFilter"]) {
    commit({
      ...state,
      roadFilter: {
        ...state.roadFilter,
        [key]: !state.roadFilter[key]
      }
    });
  }

  const chooseRegion = useCallback((regionId: string) => {
    setState((current) => {
      if (current.selectedRegionId === regionId) return current;
      return { ...current, selectedRegionId: regionId };
    });
  }, []);

  function toggleRegionTracking(regionId: string) {
    const next = structuredClone(state);
    toggleTrackedRegion(next, regionId);
    selectRegion(next, regionId);
    commit(next);
  }

  async function resetLocalData() {
    await storage.clear();
    setActiveSessionId(undefined);
    setSelectedSessionId(undefined);
    setState(createInitialState());
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <MapPinned aria-hidden="true" />
          <div>
            <h1>RoadLog</h1>
            <p>Local road completion tracker</p>
          </div>
        </div>

        <section className="panel tracking-panel" aria-label="Tracking controls">
          <div className="tracking-state">
            <Activity aria-hidden="true" />
            <span>{activeSession ? "Tracking active" : "Ready to track"}</span>
          </div>
          <div className="tracking-actions">
            <button className="primary" onClick={startDemoTracking} disabled={Boolean(activeSessionId)}>
              <Play aria-hidden="true" />
              Start
            </button>
            <button onClick={stopTracking} disabled={!activeSessionId}>
              <Square aria-hidden="true" />
              Stop
            </button>
          </div>
          <dl className="session-metrics">
            <div>
              <dt>Distance</dt>
              <dd>{meters(activeSession?.distanceMeters ?? selectedSession?.distanceMeters ?? 0)}</dd>
            </div>
            <div>
              <dt>New roads</dt>
              <dd>{activeSession?.newRoadIds.length ?? selectedSession?.newRoadIds.length ?? 0}</dd>
            </div>
            <div>
              <dt>Samples</dt>
              <dd>{activeSession?.sampleCount ?? selectedSession?.sampleCount ?? 0}</dd>
            </div>
          </dl>
        </section>

        <section className="panel" aria-label="Completion summary">
          <div className="section-title">
            <h2>Completion</h2>
            <strong>{stats.percentComplete}%</strong>
          </div>
          <div className="progress" aria-label={`${stats.percentComplete}% complete`}>
            <span style={{ width: `${stats.percentComplete}%` }} />
          </div>
          <dl className="stat-grid">
            <div>
              <dt>Visited</dt>
              <dd>{stats.visitedRoads}</dd>
            </div>
            <div>
              <dt>Remaining</dt>
              <dd>{stats.remainingRoads}</dd>
            </div>
            <div>
              <dt>Roads</dt>
              <dd>{stats.totalRoads}</dd>
            </div>
            <div>
              <dt>Length</dt>
              <dd>{meters(stats.visitedLengthMeters)}</dd>
            </div>
          </dl>
        </section>

        <section className="panel" aria-label="Selected region">
          <div className="section-title">
            <h2>Selected Region</h2>
            <strong>{selectedRegionStats.percentComplete}%</strong>
          </div>
          {selectedRegion ? (
            <>
              <div className="selected-region-name">
                <span>{selectedRegion.name}</span>
                <small>{regionLevelLabel(selectedRegion.level)}</small>
              </div>
              <div className="progress" aria-label={`${selectedRegion.name} ${selectedRegionStats.percentComplete}% complete`}>
                <span style={{ width: `${selectedRegionStats.percentComplete}%` }} />
              </div>
              <dl className="stat-grid">
                <div>
                  <dt>Visited</dt>
                  <dd>{selectedRegionStats.visitedRoads}</dd>
                </div>
                <div>
                  <dt>Remaining</dt>
                  <dd>{selectedRegionStats.remainingRoads}</dd>
                </div>
              </dl>
              <button className="full-width" onClick={() => toggleRegionTracking(selectedRegion.id)}>
                {state.trackedRegionIds.includes(selectedRegion.id) ? "Untrack Region" : "Track Region"}
              </button>
            </>
          ) : null}
        </section>

        <section className="panel" aria-label="Road filters">
          <div className="section-title">
            <h2>Filters</h2>
            <Filter aria-hidden="true" />
          </div>
          <label>
            <input
              type="checkbox"
              checked={state.roadFilter.includeHighways}
              onChange={() => toggleFilter("includeHighways")}
            />
            Highways
          </label>
          <label>
            <input
              type="checkbox"
              checked={state.roadFilter.includeService}
              onChange={() => toggleFilter("includeService")}
            />
            Service roads
          </label>
          <label>
            <input
              type="checkbox"
              checked={state.roadFilter.includeUnpaved}
              onChange={() => toggleFilter("includeUnpaved")}
            />
            Unpaved roads
          </label>
          <label>
            <input
              type="checkbox"
              checked={state.roadFilter.includePrivate}
              onChange={() => toggleFilter("includePrivate")}
            />
            Private roads
          </label>
        </section>

        <section className="panel privacy-panel" aria-label="Privacy mode">
          <ShieldCheck aria-hidden="true" />
          <div>
            <h2>Local-only mode</h2>
            <p>Sessions and visited roads stay in this browser unless exported or cleared.</p>
          </div>
        </section>
      </aside>

      <section className="map-stage" aria-label="Map and road history">
        <MapErrorBoundary>
          <Suspense fallback={<div className="map-fallback">Loading map</div>}>
            <RoadMap
              activeRegionLevel={activeRegionLevel}
              onMapRegionChange={chooseRegion}
              onZoomChange={updateMapZoom}
              regionProgress={regionProgress}
              selectedRegion={selectedRegion}
              selectedSession={selectedSession}
              state={state}
            />
          </Suspense>
        </MapErrorBoundary>

        <div className="bottom-drawer">
          <section className="history" aria-label="Session history">
            <div className="section-title">
              <h2>Sessions</h2>
              <button
                onClick={() => selectedSession && downloadText(`${selectedSession.id}.gpx`, sessionToGpx(selectedSession))}
                disabled={!selectedSession}
                title="Export selected session as GPX"
              >
                <Download aria-hidden="true" />
              </button>
            </div>
            <div className="session-list">
              {state.sessions.length === 0 ? (
                <p className="empty">Start a demo session to create local tracking history.</p>
              ) : (
                state.sessions.map((session) => (
                  <button
                    key={session.id}
                    className={session.id === selectedSessionId ? "selected" : ""}
                    onClick={() => setSelectedSessionId(session.id)}
                  >
                    <span>{new Date(session.startedAt).toLocaleString()}</span>
                    <strong>{meters(session.distanceMeters)}</strong>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="road-list" aria-label="Municipality stats">
            <div className="section-title">
              <h2>Regions</h2>
              <strong>{regionLevelLabel(activeRegionLevel)}</strong>
            </div>
            <div className="region-list">
              {regionProgress
                .filter((progress) => progress.region.level === activeRegionLevel)
                .map((progress) => (
                  <button
                    key={progress.region.id}
                    className={progress.region.id === selectedRegion?.id ? "region-row selected" : "region-row"}
                    onClick={() => chooseRegion(progress.region.id)}
                  >
                    <span>{progress.region.name}</span>
                    <strong>{progress.stats.percentComplete}%</strong>
                  </button>
                ))}
            </div>
          </section>

          <section className="road-list" aria-label="Tracked regions">
            <div className="section-title">
              <h2>Tracked Regions</h2>
              <strong>{trackedRegions.length}</strong>
            </div>
            {trackedRegions.length === 0 ? (
              <p className="empty">Select a region and track it to follow progress here.</p>
            ) : (
              trackedRegions.map((progress) => (
                <button
                  key={progress.region.id}
                  className="region-row"
                  onClick={() => chooseRegion(progress.region.id)}
                >
                  <span>{progress.region.name}</span>
                  <strong>{progress.stats.percentComplete}%</strong>
                </button>
              ))
            )}
          </section>

          <section className="road-list" aria-label="Visited roads">
            <div className="section-title">
              <h2>Visited Roads</h2>
              <button onClick={resetLocalData} title="Clear local data">
                <Eraser aria-hidden="true" />
              </button>
            </div>
            {state.visitedRoads.length === 0 ? (
              <p className="empty">No visited roads yet.</p>
            ) : (
              state.visitedRoads.map((visit) => {
                const road = seedNamedRoads.find((item) => item.id === visit.roadId);
                return (
                  <div className="visited-road" key={visit.roadId}>
                    <span>{road?.name ?? visit.roadId}</span>
                    <small>{new Date(visit.firstVisitedAt).toLocaleTimeString()}</small>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
