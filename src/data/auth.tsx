// Auth: every golfer gets a backend identity without a signup screen. On first
// launch we sign in anonymously (a "guest"); the session persists on device.
// Email sign-in to restore across devices builds on this later.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from './supabase';

export type AuthStatus = 'disabled' | 'loading' | 'signedIn' | 'error';

type AuthState = {
  status: AuthStatus;
  userId: string | null;
  isGuest: boolean;
  email: string | null;
  error: string | null;
};

const Ctx = createContext<AuthState>({ status: 'disabled', userId: null, isGuest: true, email: null, error: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: isSupabaseConfigured ? 'loading' : 'disabled', userId: null, isGuest: true, email: null, error: null,
  });

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const apply = (user: { id: string; is_anonymous?: boolean; email?: string | null } | null | undefined) => {
      if (!alive) return;
      if (user) setState({ status: 'signedIn', userId: user.id, isGuest: user.is_anonymous ?? !user.email, email: user.email ?? null, error: null });
    };
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) { apply(data.session.user); return; }
        const { data: signIn, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        apply(signIn.user);
      } catch (e: any) {
        // Offline on first launch, or auth unavailable: the app keeps working
        // locally and sync simply waits for a later launch.
        if (alive) setState((s) => ({ ...s, status: 'error', error: e?.message ?? 'Sign-in failed' }));
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useAuth = (): AuthState => useContext(Ctx);
