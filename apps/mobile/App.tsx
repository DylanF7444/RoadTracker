import {
  addSample,
  calculateCompletionStats,
  createInitialState,
  seedNamedRoads,
  seedRoadSegments,
  startSession,
  stopSession,
  type RoadLogState
} from "@roadlog/core";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import {
  startBackgroundLocationUpdates,
  stopBackgroundLocationUpdates
} from "./src/backgroundLocation";
import { SQLiteRoadLogStorage } from "./src/sqliteStorage";

const storage = new SQLiteRoadLogStorage();

function meters(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
  return `${Math.round(value)} m`;
}

export default function App() {
  const [state, setState] = useState<RoadLogState>(() => createInitialState());
  const [activeSessionId, setActiveSessionId] = useState<string>();
  const [permissionState, setPermissionState] = useState("unknown");
  const subscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    void storage.load().then(setState);
    return () => {
      subscription.current?.remove();
    };
  }, []);

  useEffect(() => {
    void storage.save(state);
  }, [state]);

  const activeSession = state.sessions.find((session) => session.id === activeSessionId);
  const currentSession = activeSession ?? state.sessions[0];
  const stats = useMemo(
    () => calculateCompletionStats(seedNamedRoads, state.visitedRoads, state.roadFilter),
    [state.roadFilter, state.visitedRoads]
  );
  const visitedRoadIds = new Set(state.visitedRoads.map((road) => road.roadId));
  const matchedSegmentIds = new Set(state.matchedSegments.map((segment) => segment.segmentId));

  function commit(next: RoadLogState) {
    setState(structuredClone(next));
  }

  async function requestTrackingPermissions() {
    const foreground = await Location.requestForegroundPermissionsAsync();
    setPermissionState(foreground.status);

    if (foreground.status !== "granted") {
      Alert.alert("Location required", "RoadLog needs location permission before tracking.");
      return false;
    }

    await Location.requestBackgroundPermissionsAsync();
    return true;
  }

  async function startTracking() {
    if (activeSessionId) return;
    const allowed = await requestTrackingPermissions();
    if (!allowed) return;

    const next = structuredClone(state);
    const session = startSession(next);
    commit(next);
    setActiveSessionId(session.id);
    await startBackgroundLocationUpdates();

    subscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 8,
        timeInterval: 3000,
        mayShowUserSettingsDialog: true
      },
      (location) => {
        setState((current) => {
          const updated = structuredClone(current);
          addSample(
            updated,
            {
              id: `${session.id}-${location.timestamp}`,
              sessionId: session.id,
              capturedAt: new Date(location.timestamp).toISOString(),
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              horizontalAccuracyMeters: location.coords.accuracy ?? undefined,
              headingDegrees: location.coords.heading ?? undefined,
              speedMetersPerSecond: location.coords.speed ?? undefined
            },
            seedRoadSegments,
            seedNamedRoads
          );
          return updated;
        });
      }
    );
  }

  async function stopTracking() {
    if (!activeSessionId) return;
    subscription.current?.remove();
    subscription.current = null;
    await stopBackgroundLocationUpdates();
    const next = structuredClone(state);
    stopSession(next, activeSessionId);
    commit(next);
    setActiveSessionId(undefined);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerIcon}>RL</Text>
        <View>
          <Text style={styles.title}>RoadLog</Text>
          <Text style={styles.subtitle}>Local-only road tracker</Text>
        </View>
      </View>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: 41.8827,
          longitude: -87.6359,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
        showsUserLocation
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        {seedRoadSegments.map((segment) => {
          const completedRoad = visitedRoadIds.has(segment.roadId);
          const visitedSegment = matchedSegmentIds.has(segment.id);
          return (
            <Polyline
              key={segment.id}
              coordinates={segment.geometry}
              strokeColor={completedRoad ? "#11875d" : visitedSegment ? "#d97706" : "#69717d"}
              strokeWidth={completedRoad ? 7 : visitedSegment ? 6 : 4}
            />
          );
        })}
        {currentSession ? (
          <Polyline coordinates={currentSession.route} strokeColor="#d97706" strokeWidth={4} />
        ) : null}
      </MapView>
      <Text style={styles.osmAttribution}>© OpenStreetMap contributors</Text>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.status}>
              <View style={[styles.statusDot, activeSessionId ? styles.statusDotActive : null]} />
              <Text style={styles.statusText}>
                {activeSessionId ? "Tracking active" : `Permission: ${permissionState}`}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start tracking"
              style={[styles.button, styles.primaryButton, activeSessionId ? styles.disabled : null]}
              onPress={startTracking}
              disabled={Boolean(activeSessionId)}
            >
              <Text style={styles.primaryButtonText}>Start</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Stop tracking"
              style={[styles.button, !activeSessionId ? styles.disabled : null]}
              onPress={stopTracking}
              disabled={!activeSessionId}
            >
              <Text style={styles.buttonText}>Stop</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Distance</Text>
            <Text style={styles.metricValue}>{meters(currentSession?.distanceMeters ?? 0)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>New roads</Text>
            <Text style={styles.metricValue}>{currentSession?.newRoadIds.length ?? 0}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Complete</Text>
            <Text style={styles.metricValue}>{stats.percentComplete}%</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {state.sessions.length === 0 ? (
            <Text style={styles.muted}>No sessions yet.</Text>
          ) : (
            state.sessions.slice(0, 5).map((session) => (
              <View key={session.id} style={styles.sessionRow}>
                <Text style={styles.sessionText}>{new Date(session.startedAt).toLocaleString()}</Text>
                <Text style={styles.sessionDistance}>{meters(session.distanceMeters)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.privacy}>
          <Text style={styles.privacyBadge}>Local</Text>
          <Text style={styles.muted}>
            Local-only mode is on. No precise trace is uploaded by this MVP.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#f4f0e8",
    flex: 1
  },
  header: {
    alignItems: "center",
    backgroundColor: "#fbfaf7",
    borderBottomColor: "#ded7ca",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14
  },
  title: {
    color: "#182026",
    fontSize: 22,
    fontWeight: "800"
  },
  subtitle: {
    color: "#65717a",
    fontSize: 13
  },
  headerIcon: {
    backgroundColor: "#11875d",
    borderRadius: 8,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 7
  },
  map: {
    flex: 1,
    minHeight: 320
  },
  osmAttribution: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    color: "#65717a",
    fontSize: 11,
    marginTop: -22,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  content: {
    backgroundColor: "#f4f0e8",
    maxHeight: 390
  },
  contentInner: {
    gap: 12,
    padding: 12
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#ded7ca",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  status: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  statusDot: {
    backgroundColor: "#11875d",
    borderRadius: 5,
    height: 10,
    width: 10
  },
  statusDotActive: {
    backgroundColor: "#c83b35"
  },
  statusText: {
    color: "#182026",
    fontWeight: "700"
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#cfd5d8",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48
  },
  primaryButton: {
    backgroundColor: "#c83b35",
    borderColor: "#c83b35"
  },
  buttonText: {
    color: "#182026",
    fontWeight: "800"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800"
  },
  disabled: {
    opacity: 0.5
  },
  metrics: {
    flexDirection: "row",
    gap: 10
  },
  metric: {
    backgroundColor: "#ffffff",
    borderColor: "#ded7ca",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12
  },
  metricLabel: {
    color: "#65717a",
    fontSize: 12
  },
  metricValue: {
    color: "#182026",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4
  },
  sectionTitle: {
    color: "#182026",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8
  },
  muted: {
    color: "#65717a"
  },
  sessionRow: {
    borderTopColor: "#ebe5db",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 42,
    paddingTop: 12
  },
  sessionText: {
    color: "#182026",
    flex: 1
  },
  sessionDistance: {
    color: "#11875d",
    fontWeight: "800"
  },
  privacy: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 6
  },
  privacyBadge: {
    backgroundColor: "#dbeee6",
    borderRadius: 6,
    color: "#0f6849",
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4
  }
});
