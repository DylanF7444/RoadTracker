import {
  findRegionForZoom,
  seedRegions,
  seedRoadSegments,
  type Region,
  type RegionLevel,
  type RegionProgress,
  type RoadLogState,
  type TrackingSession
} from "@roadlog/core";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polygon, Polyline, TileLayer, Tooltip, useMapEvents } from "react-leaflet";

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

function makeRegionLabelIcon(region: Region, selected: boolean, tracked: boolean) {
  return L.divIcon({
    className: `region-label ${selected ? "selected" : ""} ${tracked ? "tracked" : ""}`,
    html: `<span>${region.name}</span>`,
    iconSize: [120, 28],
    iconAnchor: [60, 14]
  });
}

function MapRegionController({
  onMapRegionChange,
  onZoomChange,
  selectedRegionId
}: {
  onMapRegionChange: (regionId: string) => void;
  onZoomChange: (zoom: number) => void;
  selectedRegionId?: string;
}) {
  const lastRegionIdRef = useRef<string | undefined>(selectedRegionId);
  const lastZoomRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    lastRegionIdRef.current = selectedRegionId;
  }, [selectedRegionId]);

  const handleMapPositionChange = useCallback(
    (map: L.Map) => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (lastZoomRef.current !== zoom) {
        lastZoomRef.current = zoom;
        onZoomChange(zoom);
      }

      const region = findRegionForZoom(seedRegions, zoom, {
        latitude: center.lat,
        longitude: center.lng
      });
      if (region && region.id !== lastRegionIdRef.current) {
        lastRegionIdRef.current = region.id;
        onMapRegionChange(region.id);
      }
    },
    [onMapRegionChange, onZoomChange]
  );

  useMapEvents({
    moveend(event) {
      handleMapPositionChange(event.target);
    },
    zoomend(event) {
      handleMapPositionChange(event.target);
    }
  });

  return null;
}

export function MapView({
  activeRegionLevel,
  onMapRegionChange,
  onZoomChange,
  regionProgress,
  selectedRegion,
  selectedSession,
  state
}: {
  activeRegionLevel: RegionLevel;
  onMapRegionChange: (regionId: string) => void;
  onZoomChange: (zoom: number) => void;
  regionProgress: RegionProgress[];
  selectedRegion?: Region;
  selectedSession?: TrackingSession;
  state: RoadLogState;
}) {
  const visitedRoadIds = useMemo(() => new Set(state.visitedRoads.map((road) => road.roadId)), [state.visitedRoads]);
  const matchedSegmentIds = useMemo(
    () => new Set(state.matchedSegments.map((segment) => segment.segmentId)),
    [state.matchedSegments]
  );
  const visibleLabelRegionIds = useMemo(
    () =>
      new Set(
        seedRegions
          .filter(
            (region) =>
              region.level === activeRegionLevel ||
              region.id === selectedRegion?.id ||
              state.trackedRegionIds.includes(region.id)
          )
          .map((region) => region.id)
      ),
    [activeRegionLevel, selectedRegion?.id, state.trackedRegionIds]
  );

  return (
    <MapContainer center={[41.8827, -87.6359]} zoom={16} scrollWheelZoom className="map">
      <MapRegionController
        selectedRegionId={state.selectedRegionId}
        onMapRegionChange={onMapRegionChange}
        onZoomChange={onZoomChange}
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {seedRegions.map((region) => {
        const progress = regionProgress.find((item) => item.region.id === region.id);
        const selected = region.id === selectedRegion?.id;
        const tracked = Boolean(progress?.tracked);
        return (
          <Polygon
            key={region.id}
            positions={region.polygon.map((point) => [point.latitude, point.longitude])}
            pathOptions={{
              color: selected ? "#c83b35" : tracked ? "#11875d" : "#265f8f",
              dashArray: selected ? undefined : "5 7",
              fillColor: selected ? "#c83b35" : tracked ? "#11875d" : "#265f8f",
              fillOpacity: selected ? 0.12 : tracked ? 0.09 : 0.035,
              opacity: selected || tracked ? 0.9 : 0.42,
              weight: selected ? 3 : tracked ? 2 : 1
            }}
            eventHandlers={{
              click: () => onMapRegionChange(region.id)
            }}
          >
            <Tooltip sticky>
              {region.name} · {regionLevelLabel(region.level)} · {progress?.stats.percentComplete ?? 0}%
            </Tooltip>
          </Polygon>
        );
      })}
      {seedRegions
        .filter((region) => visibleLabelRegionIds.has(region.id))
        .map((region) => {
          const selected = region.id === selectedRegion?.id;
          const tracked = state.trackedRegionIds.includes(region.id);
          return (
            <Marker
              key={`${region.id}-label`}
              position={[region.labelPoint.latitude, region.labelPoint.longitude]}
              icon={makeRegionLabelIcon(region, selected, tracked)}
              eventHandlers={{
                click: () => onMapRegionChange(region.id)
              }}
            />
          );
        })}
      {seedRoadSegments.map((segment) => {
        const completedRoad = visitedRoadIds.has(segment.roadId);
        const visitedSegment = matchedSegmentIds.has(segment.id);
        return (
          <Polyline
            key={segment.id}
            positions={segment.geometry.map((point) => [point.latitude, point.longitude])}
            pathOptions={{
              color: completedRoad ? "#11875d" : visitedSegment ? "#d97706" : "#69717d",
              weight: completedRoad ? 8 : visitedSegment ? 7 : 5,
              opacity: completedRoad || visitedSegment ? 0.95 : 0.45
            }}
          >
            <Tooltip sticky>
              {segment.name}
              {completedRoad ? " complete" : visitedSegment ? " segment visited" : ""}
            </Tooltip>
          </Polyline>
        );
      })}
      {selectedSession ? (
        <Polyline
          positions={selectedSession.route.map((point) => [point.latitude, point.longitude])}
          pathOptions={{ color: "#d97706", weight: 4, dashArray: "8 8" }}
        />
      ) : null}
    </MapContainer>
  );
}
