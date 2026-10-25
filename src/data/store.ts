// Local-first persistence. Everything the golfer does is written here first;
// a sync layer (Phase 2) reconciles with the backend. Versioned keys allow safe
// migrations. All operations are best-effort and never throw to the UI.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, Golfer, Round, EMPTY_GOLFER } from '../domain/types';

const K = {
  golfer: 'gh2/golfer/v1',
  rounds: 'gh2/rounds/v1',
  courses: 'gh2/courses/v1', // cache: id -> Course
  favourites: 'gh2/favourites/v1', // course ids
  recents: 'gh2/recents/v1', // course ids, most recent first
  pendingDeletes: 'gh2/pending-deletes/v1', // remote round ids to delete when online
  syncUser: 'gh2/sync-user/v1', // auth user id this device last synced as
};

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort
  }
}

export const golferRepo = {
  load: () => getJSON<Golfer>(K.golfer, EMPTY_GOLFER).then((g) => ({ ...EMPTY_GOLFER, ...g })),
  save: (g: Golfer) => setJSON(K.golfer, g),
};

export const roundsRepo = {
  load: () => getJSON<Round[]>(K.rounds, []),
  save: (rounds: Round[]) => setJSON(K.rounds, rounds),
  loadPendingDeletes: () => getJSON<string[]>(K.pendingDeletes, []),
  savePendingDeletes: (ids: string[]) => setJSON(K.pendingDeletes, ids),
  loadSyncUser: () => getJSON<string | null>(K.syncUser, null),
  saveSyncUser: (id: string | null) => setJSON(K.syncUser, id),
};

export const coursesRepo = {
  load: () => getJSON<Record<string, Course>>(K.courses, {}),
  save: (map: Record<string, Course>) => setJSON(K.courses, map),
  loadFavourites: () => getJSON<string[]>(K.favourites, []),
  saveFavourites: (ids: string[]) => setJSON(K.favourites, ids),
  loadRecents: () => getJSON<string[]>(K.recents, []),
  saveRecents: (ids: string[]) => setJSON(K.recents, ids),
};

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(K));
  } catch {
    // ignore
  }
}
