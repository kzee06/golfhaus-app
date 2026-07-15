// Local-first persistence via AsyncStorage. Keeps the app backend-free while
// making the profile (and, later, plans / session logs / progress) survive
// relaunches. Versioned keys let us migrate shapes safely.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, EMPTY_PROFILE } from './profile';
import { ProgressState, EMPTY_PROGRESS } from './progress';

const PROFILE_KEY = 'golfhaus/profile/v1';
const PROGRESS_KEY = 'golfhaus/progress/v1';

// Load the saved profile, merged onto defaults so new fields added later
// don't break older saved data. Returns EMPTY_PROFILE if nothing/invalid.
export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return EMPTY_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_PROFILE, ...parsed };
  } catch {
    return EMPTY_PROFILE;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Non-fatal: persistence is best-effort. The in-memory profile still works.
  }
}

export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
}

// ─── Progress (append-only session log) ──────────────────────────────────────

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw);
    const sessions = Array.isArray(parsed.sessions)
      ? parsed.sessions.map((s: any) => ({ ...s, scores: Array.isArray(s.scores) ? s.scores : [] }))
      : [];
    return { ...EMPTY_PROGRESS, ...parsed, sessions };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export async function saveProgress(progress: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // best-effort
  }
}

export async function clearProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROGRESS_KEY);
  } catch {
    // ignore
  }
}
