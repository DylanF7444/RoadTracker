import {
  addSample,
  seedNamedRoads,
  seedRoadSegments,
  type RoadLogState
} from "@roadlog/core";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { SQLiteRoadLogStorage } from "./sqliteStorage";

export const backgroundLocationTaskName = "roadlog-background-location";

const storage = new SQLiteRoadLogStorage();

TaskManager.defineTask(
  backgroundLocationTaskName,
  async ({
    data,
    error
  }: TaskManager.TaskManagerTaskBody<{ locations?: Location.LocationObject[] }>) => {
    if (error) {
      return;
    }

    const locations = data?.locations ?? [];
    if (locations.length === 0) {
      return;
    }

    const state = await storage.load();
    const activeSession = findActiveSession(state);
    if (!activeSession) {
      return;
    }

    for (const location of locations) {
      addSample(
        state,
        {
          id: `${activeSession.id}-bg-${location.timestamp}`,
          sessionId: activeSession.id,
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
    }

    await storage.save(state);
  }
);

function findActiveSession(state: RoadLogState) {
  return state.sessions.find((session) => !session.endedAt);
}

export async function startBackgroundLocationUpdates() {
  const started = await Location.hasStartedLocationUpdatesAsync(backgroundLocationTaskName);
  if (started) {
    return;
  }

  await Location.startLocationUpdatesAsync(backgroundLocationTaskName, {
    accuracy: Location.Accuracy.BestForNavigation,
    activityType: Location.ActivityType.AutomotiveNavigation,
    deferredUpdatesDistance: 25,
    deferredUpdatesInterval: 15000,
    distanceInterval: 8,
    foregroundService: {
      notificationTitle: "RoadLog tracking active",
      notificationBody: "RoadLog is recording road segments for your current session."
    },
    pausesUpdatesAutomatically: true,
    showsBackgroundLocationIndicator: true,
    timeInterval: 3000
  });
}

export async function stopBackgroundLocationUpdates() {
  const started = await Location.hasStartedLocationUpdatesAsync(backgroundLocationTaskName);
  if (started) {
    await Location.stopLocationUpdatesAsync(backgroundLocationTaskName);
  }
}
