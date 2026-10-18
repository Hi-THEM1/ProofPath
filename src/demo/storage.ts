import type { DemoState } from './types';
import { createInitialDemoState } from './seed';

export const DEMO_STORAGE_KEY = 'proofpath-demo-v1';
export const DEMO_SCHEMA_VERSION = 1;

interface StoredPayload {
  version: number;
  timestamp: string;
  state: DemoState;
}

// In-memory fallback if localStorage is disabled or throws quota errors
let memoryStore: DemoState | null = null;

export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__proofpath_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadStoredState(): DemoState {
  if (!isLocalStorageAvailable()) {
    if (!memoryStore) {
      memoryStore = createInitialDemoState();
    }
    return memoryStore;
  }

  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialDemoState();
      saveStoredState(initial);
      return initial;
    }

    const parsed: StoredPayload = JSON.parse(raw);
    if (!parsed || parsed.version !== DEMO_SCHEMA_VERSION || !parsed.state) {
      console.warn('[ProofPath Demo] Outdated or invalid schema version. Resetting to initial seed.');
      const initial = createInitialDemoState();
      saveStoredState(initial);
      return initial;
    }

    // Sanity check critical arrays exist
    const state = parsed.state;
    if (
      !Array.isArray(state.companies) ||
      !Array.isArray(state.opportunities) ||
      !Array.isArray(state.candidates) ||
      !Array.isArray(state.evidence) ||
      !Array.isArray(state.applications)
    ) {
      console.warn('[ProofPath Demo] Corrupt state payload detected. Resetting to seed data.');
      const initial = createInitialDemoState();
      saveStoredState(initial);
      return initial;
    }

    return state;
  } catch (err) {
    console.error('[ProofPath Demo] Error reading localStorage, falling back to seed:', err);
    const initial = createInitialDemoState();
    return initial;
  }
}

export function saveStoredState(state: DemoState): void {
  memoryStore = state;
  if (!isLocalStorageAvailable()) return;

  try {
    const payload: StoredPayload = {
      version: DEMO_SCHEMA_VERSION,
      timestamp: new Date().toISOString(),
      state,
    };
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[ProofPath Demo] Failed to write to localStorage:', err);
  }
}

export function clearStoredState(): DemoState {
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch (err) {
      console.error('[ProofPath Demo] Error removing item from localStorage:', err);
    }
  }
  const fresh = createInitialDemoState();
  memoryStore = fresh;
  saveStoredState(fresh);
  return fresh;
}
