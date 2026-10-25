// Background cloud sync. Mounted once inside the app/auth providers. Pushes
// rounds whose updatedAt > syncedAt (debounced after edits), drains the offline
// delete queue, and pulls the golfer's rounds on launch and on foreground.
// Never blocks the UI: failures just schedule a retry with backoff.

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState as RNAppState } from 'react-native';
import { useApp } from './AppState';
import { useAuth } from './auth';
import { needsSync } from '../domain/types';
import { deleteRemoteRound, pullMyRounds, pushRound } from './sync';

export type SyncState = 'off' | 'idle' | 'syncing' | 'error';
type SyncStatus = { state: SyncState; lastSyncedAt: string | null; error: string | null; pending: number; syncNow: () => void };

const Ctx = createContext<SyncStatus>({ state: 'off', lastSyncedAt: null, error: null, pending: 0, syncNow: () => {} });

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, rounds, pendingDeletes, markSynced, mergeRemoteRounds, clearPendingDelete } = useApp();
  const { status: authStatus, userId } = useAuth();
  const [state, setState] = useState<SyncState>('off');
  const [lastSyncedAt, setLast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const pulled = useRef(false);
  const backoff = useRef(2000);
  const latest = useRef({ rounds, pendingDeletes });
  latest.current = { rounds, pendingDeletes };

  const enabled = hydrated && authStatus === 'signedIn' && !!userId;
  const pending = rounds.filter(needsSync).length + pendingDeletes.length;

  const run = useCallback(async () => {
    if (!enabled || running.current) return;
    running.current = true;
    setState('syncing');
    try {
      if (!pulled.current) {
        mergeRemoteRounds(await pullMyRounds(userId!));
        pulled.current = true;
      }
      for (const remoteId of latest.current.pendingDeletes) {
        await deleteRemoteRound(remoteId);
        clearPendingDelete(remoteId);
      }
      for (const r of latest.current.rounds.filter(needsSync)) {
        markSynced(await pushRound(r, userId!));
      }
      setLast(new Date().toISOString());
      setError(null);
      setState('idle');
      backoff.current = 2000;
    } catch (e: any) {
      if (__DEV__) console.warn('[sync] failed:', e?.message ?? e, e?.details ?? '', e?.hint ?? '', e?.code ?? '');
      setError(e?.message ?? 'Sync failed');
      setState('error');
      backoff.current = Math.min(backoff.current * 2, 60000);
    } finally {
      running.current = false;
    }
  }, [enabled, userId, mergeRemoteRounds, clearPendingDelete, markSynced]);

  // Debounced push whenever something needs syncing (or on first enable).
  useEffect(() => {
    if (!enabled) { setState('off'); return; }
    if (pending === 0 && pulled.current) return;
    const id = setTimeout(run, state === 'error' ? backoff.current : 1500);
    return () => clearTimeout(id);
  }, [enabled, pending, rounds, run, state]);

  // Pull again when the app comes back to the foreground.
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') { pulled.current = false; run(); }
    });
    return () => sub.remove();
  }, [run]);

  const syncNow = useCallback(() => { pulled.current = false; run(); }, [run]);

  return <Ctx.Provider value={{ state, lastSyncedAt, error, pending, syncNow }}>{children}</Ctx.Provider>;
}

export const useCloudSync = (): SyncStatus => useContext(Ctx);
