import { createInitialState, normalizeState, type RoadLogState, type RoadLogStorage } from "@roadlog/core";
import * as SQLite from "expo-sqlite";

const databaseName = "roadlog.db";
const stateKey = "roadlog.state.v1";

export class SQLiteRoadLogStorage implements RoadLogStorage {
  private dbPromise = SQLite.openDatabaseAsync(databaseName);

  private async ensureSchema() {
    const db = await this.dbPromise;
    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);"
    );
    return db;
  }

  async load(): Promise<RoadLogState> {
    const db = await this.ensureSchema();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_state WHERE key = ?",
      stateKey
    );
    return row?.value ? normalizeState(JSON.parse(row.value) as Partial<RoadLogState>) : createInitialState();
  }

  async save(state: RoadLogState): Promise<void> {
    const db = await this.ensureSchema();
    await db.runAsync(
      "INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)",
      stateKey,
      JSON.stringify(state)
    );
  }

  async clear(): Promise<void> {
    const db = await this.ensureSchema();
    await db.runAsync("DELETE FROM app_state WHERE key = ?", stateKey);
  }
}
