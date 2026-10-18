// App-wide state: the golfer, their rounds, and the course cache. Hydrated from
// local storage on launch and persisted on every change. Screens read from here
// and never touch storage directly.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Course, Golfer, Round, EMPTY_GOLFER } from '../domain/types';
import { coursesRepo, golferRepo, roundsRepo, clearAll } from './store';

type State = {
  hydrated: boolean;
  golfer: Golfer;
  rounds: Round[];
  courses: Record<string, Course>;
  favourites: string[];
  recents: string[];
};

type Actions = {
  setGolfer: (g: Golfer | ((g: Golfer) => Golfer)) => void;
  upsertRound: (r: Round) => void;
  deleteRound: (id: string) => void;
  upsertCourse: (c: Course) => void;
  toggleFavourite: (id: string) => void;
  touchRecent: (id: string) => void;
  reset: () => Promise<void>;
};

const Ctx = createContext<(State & Actions) | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [golfer, setGolferState] = useState<Golfer>(EMPTY_GOLFER);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [favourites, setFavourites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const ready = useRef(false);

  useEffect(() => {
    (async () => {
      const [g, r, c, f, rc] = await Promise.all([
        golferRepo.load(), roundsRepo.load(), coursesRepo.load(), coursesRepo.loadFavourites(), coursesRepo.loadRecents(),
      ]);
      setGolferState(g); setRounds(r); setCourses(c); setFavourites(f); setRecents(rc);
      ready.current = true;
      setHydrated(true);
    })();
  }, []);

  useEffect(() => { if (ready.current) golferRepo.save(golfer); }, [golfer]);
  useEffect(() => { if (ready.current) roundsRepo.save(rounds); }, [rounds]);
  useEffect(() => { if (ready.current) coursesRepo.save(courses); }, [courses]);
  useEffect(() => { if (ready.current) coursesRepo.saveFavourites(favourites); }, [favourites]);
  useEffect(() => { if (ready.current) coursesRepo.saveRecents(recents); }, [recents]);

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

  const deleteRound = useCallback((id: string) => setRounds((prev) => prev.filter((r) => r.id !== id)), []);

  const upsertCourse = useCallback((c: Course) => setCourses((prev) => ({ ...prev, [c.id]: c })), []);

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }, []);

  const touchRecent = useCallback((id: string) => {
    setRecents((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 12));
  }, []);

  const reset = useCallback(async () => {
    await clearAll();
    setGolferState(EMPTY_GOLFER); setRounds([]); setCourses({}); setFavourites([]); setRecents([]);
  }, []);

  const value = useMemo(
    () => ({ hydrated, golfer, rounds, courses, favourites, recents, setGolfer, upsertRound, deleteRound, upsertCourse, toggleFavourite, touchRecent, reset }),
    [hydrated, golfer, rounds, courses, favourites, recents, setGolfer, upsertRound, deleteRound, upsertCourse, toggleFavourite, touchRecent, reset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): State & Actions {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppStateProvider');
  return v;
}

export const activeRound = (rounds: Round[]): Round | undefined => rounds.find((r) => r.status === 'active');
