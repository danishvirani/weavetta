import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// Local-first persistence. Two stores:
//  - apiKeys:  BYOK provider keys, never leave the browser.
//  - history:  diff-based undo entries (RFC-6902 patch + inverse), byte-budgeted.
// v0.0 defines the schema only; reads/writes land in feat(api-keys) and feat(undo).

export interface ApiKeyRecord {
  provider: string; // "openai" | "anthropic" | "openrouter"
  key: string;
}

export interface HistoryEntry {
  id?: number;
  ts: number;
  bytes: number; // serialized size, for the byte budget
  forward: unknown; // RFC-6902 patch prev -> next
  inverse: unknown; // RFC-6902 patch next -> prev
}

interface WeavettaDB extends DBSchema {
  apiKeys: {
    key: string; // provider
    value: ApiKeyRecord;
  };
  history: {
    key: number; // autoincrement
    value: HistoryEntry;
  };
}

const DB_NAME = "weavetta";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<WeavettaDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<WeavettaDB>> {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB unavailable (server context)");
  }
  if (!dbPromise) {
    dbPromise = openDB<WeavettaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("apiKeys")) {
          db.createObjectStore("apiKeys", { keyPath: "provider" });
        }
        if (!db.objectStoreNames.contains("history")) {
          db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}
