import { create } from "zustand";
import { dbGetAllApiKeys, dbPutApiKey, dbDeleteApiKey } from "./db";
import type { LLMProvider } from "./types";

// BYOK key store. Keys are cached in memory for synchronous reads (cost preview,
// the runner) and persisted to IndexedDB. They never touch a network we control —
// the LLM runner calls the provider directly from the browser.
interface KeysState {
  keys: Partial<Record<LLMProvider, string>>;
  loaded: boolean;
  load: () => Promise<void>;
  setKey: (provider: LLMProvider, key: string) => Promise<void>;
  removeKey: (provider: LLMProvider) => Promise<void>;
}

export const useApiKeys = create<KeysState>((set, get) => ({
  keys: {},
  loaded: false,
  load: async () => {
    if (get().loaded || typeof indexedDB === "undefined") return;
    const records = await dbGetAllApiKeys();
    const keys: Partial<Record<LLMProvider, string>> = {};
    for (const r of records) keys[r.provider as LLMProvider] = r.key;
    set({ keys, loaded: true });
  },
  setKey: async (provider, key) => {
    const trimmed = key.trim();
    if (!trimmed) return get().removeKey(provider);
    await dbPutApiKey({ provider, key: trimmed });
    set({ keys: { ...get().keys, [provider]: trimmed } });
  },
  removeKey: async (provider) => {
    await dbDeleteApiKey(provider);
    const next = { ...get().keys };
    delete next[provider];
    set({ keys: next });
  },
}));
