// App-wide state: the golfer, their rounds, and the course cache. Hydrated from
// local storage on launch and persisted on every change. Screens read from here
// and never touch storage directly.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Course, Golfer, Round, EMPTY_GOLFER } from '../domain/types';
import type { PushResult } from './sync';
import { mergeRound } from './sync';
import { coursesRepo, golferRepo, roundsRepo, clearAll } from './store';

type State = {
  hydrated: boolean;
  golfer: Golfer;
  rounds: Round[];
  courses: Record<string, Course>;
  favourites: string[];
  recents: string[];
  pendingDeletes: string[];
  syncUserId: string | null;
};

type Actions = {
  setGolfer: (g: Golfer | ((g: Golfer) => Golfer)) => void;
  upsertRound: (r: Round) => void;
  deleteRound: (id: string) => void;
  upsertCourse: (c: Course) => void;
  toggleFavourite: (id: string) => void;
  touchRecent: (id: string) => void;
  reset: () => Promise<void>;
  // cloud sync
  markSynced: (r: PushResult) => void;
  mergeRemoteRounds: (remote: Round[]) => void;
  clearPendingDelete: (remoteId: string) => void;
  setSyncUserId: (id: string | null) => void;
  adoptLocalRounds: () => void;
};

const Ctx = createContext<(State & Actions) | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [golfer, setGolferState] = useState<Golfer>(EMPTY_GOLFER);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [favourites, setFavourites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const [syncUserId, setSyncUserId] = useState<string | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    (async () => {
      const [g, r, c, f, rc, pd, su] = await Promise.all([
        golferRepo.load(), roundsRepo.load(), coursesRepo.load(), coursesRepo.loadFavourites(), coursesRepo.loadRecents(), roundsRepo.loadPendingDeletes(), roundsRepo.loadSyncUser(),
      ]);
      setGolferState(g); setRounds(r); setCourses(c); setFavourites(f); setRecents(rc); setPendingDeletes(pd); setSyncUserId(su);
      ready.current = true;
      setHydrated(true);
    })();
  }, []);

  useEffect(() => { if (ready.current) golferRepo.save(golfer); }, [golfer]);
  useEffect(() => { if (ready.current) roundsRepo.save(rounds); }, [rounds]);
  useEffect(() => { if (ready.current) coursesRepo.save(courses); }, [courses]);
  useEffect(() => { if (ready.current) coursesRepo.saveFavourites(favourites); }, [favourites]);
  useEffect(() => { if (ready.current) coursesRepo.saveRecents(recents); }, [recents]);
  useEffect(() => { if (ready.current) roundsRepo.savePendingDeletes(pendingDeletes); }, [pendingDeletes]);
  useEffect(() => { if (ready.current) roundsRepo.saveSyncUser(syncUserId); }, [syncUserId]);

  const setGolfer = useCallback((g: Golfer | ((g: Golfer) => Golfer)) => {
    setGolferState((prev) => (typeof g === 'function' ? g(prev) : g));
  }, []);

  const upsertRound = useCallback((r: Round) => {
    setRounds((prev) => {
      const i = prev.findIndex((x) => x.id === r.id);
      if (i < 0) return [r, ...prev];
      const next = prev.slice(); next[i] = r; return next;
    });
  }, []);

  const deleteRound = useCallback((id: string) => {
    setRounds((prev) => {
      const gone = prev.find((r) => r.id === id);
      if (gone?.remoteId) setPendingDeletes((q) => (q.includes(gone.remoteId!) ? q : [...q, gone.remoteId!]));
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  // Apply a push result to the *current* round, so edits made while the push
  // was in flight are kept (they still have updatedAt > syncedAt).
  const markSynced = useCallback((res: PushResult) => {
    setRounds((prev) => prev.map((r) => (r.id !== res.roundId ? r : {
      ...r,
      remoteId: res.remoteId,
      syncedAt: res.syncedAt,
      players: r.players.map((p) => ({ ...p, remoteId: p.remoteId ?? res.playerRemoteIds[p.id] })),
    })));
  }, []);

  const mergeRemoteRounds = useCallback((remote: Round[]) => {
    setRounds((prev) => {
      const next = prev.slice();
      for (const rr of remote) {
        const i = next.findIndex((r) => r.remoteId === rr.remoteId || r.id === rr.id);
        if (i < 0) next.push(rr); else next[i] = mergeRound(next[i], rr);
      }
      return next.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    });
  }, []);

  const clearPendingDelete = useCallback((remoteId: string) => setPendingDeletes((q) => q.filter((x) => x !== remoteId)), []);

  // The signed-in account changed (e.g. a guest signed into an existing
  // account): local rounds belonged to the old identity, so forget their server
  // ids and they re-upload as new rows owned by the new account.
  const adoptLocalRounds = useCallback(() => {
    setRounds((prev) => prev.map((r) => ({
      ...r, remoteId: undefined, syncedAt: undefined,
      players: r.players.map((p) => ({ ...p, remoteId: undefined })),
    })));
    setPendingDeletes([]);
  }, []);

  const upsertCourse = useCallback((c: Course) => setCourses((prev) => ({ ...prev, [c.id]: c })), []);

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }, []);

  const touchRecent = useCallback((id: string) => {
    setRecents((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 12));
  }, []);

  const reset = useCallback(async () => {
    await clearAll();
    setGolferState(EMPTY_GOLFER); setRounds([]); setCourses({}); setFavourites([]); setRecents([]); setPendingDeletes([]); setSyncUserId(null);
  }, []);

  const value = useMemo(
    () => ({ hydrated, golfer, rounds, courses, favourites, recents, pendingDeletes, syncUserId, setGolfer, upsertRound, deleteRound, upsertCourse, toggleFavourite, touchRecent, reset, markSynced, mergeRemoteRounds, clearPendingDelete, setSyncUserId, adoptLocalRounds }),
    [hydrated, golfer, rounds, courses, favourites, recents, pendingDeletes, syncUserId, setGolfer, upsertRound, deleteRound, upsertCourse, toggleFavourite, touchRecent, reset, markSynced, mergeRemoteRounds, clearPendingDelete, setSyncUserId, adoptLocalRounds],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): State & Actions {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppStateProvider');
  return v;
}

export const activeRound = (rounds: Round[]): Round | undefined => rounds.find((r) => r.status === 'active');
