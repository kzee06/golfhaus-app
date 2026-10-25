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

// 'save' turns the current guest into a permanent account (same user id, so
// all rounds stay). 'signin' signs into an existing account on this device.
export type EmailIntent = 'save' | 'signin';

type AuthActions = {
  sendCode: (email: string, intent: EmailIntent) => Promise<void>;
  verifyCode: (email: string, code: string, intent: EmailIntent) => Promise<void>;
  signOut: () => Promise<void>;
};

const noop = async () => {};
const Ctx = createContext<AuthState & AuthActions>({
  status: 'disabled', userId: null, isGuest: true, email: null, error: null,
  sendCode: noop, verifyCode: noop, signOut: noop,
});

// Supabase error messages, said plainly.
export function friendlyAuthError(e: any): string {
  const m = String(e?.message ?? e ?? '');
  if (/rate limit/i.test(m)) return 'Too many emails sent. Wait a few minutes and try again.';
  if (/not authorized|not allowed/i.test(m) && /email/i.test(m)) return "This app can't send email to that address yet (email setup pending).";
  if (/signups not allowed|user not found/i.test(m)) return 'No account with that email. Use “Save my rounds” instead.';
  if (/already (been )?registered|already exists/i.test(m)) return 'That email already has an account. Use “Sign in” instead.';
  if (/expired|invalid/i.test(m) && /token|otp|code/i.test(m)) return 'That code is wrong or has expired. Request a new one.';
  if (/invalid.*email|email.*invalid/i.test(m)) return 'That email address doesn’t look right.';
  return m || 'Something went wrong. Try again.';
}

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

  const sendCode = async (email: string, intent: EmailIntent) => {
    if (!supabase) throw new Error('Cloud accounts are not configured.');
    const addr = email.trim().toLowerCase();
    const { error } = intent === 'save'
      ? await supabase.auth.updateUser({ email: addr })
      : await supabase.auth.signInWithOtp({ email: addr, options: { shouldCreateUser: false } });
    if (error) throw new Error(friendlyAuthError(error));
  };

  const verifyCode = async (email: string, code: string, intent: EmailIntent) => {
    if (!supabase) throw new Error('Cloud accounts are not configured.');
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: intent === 'save' ? 'email_change' : 'email',
    });
    if (error) throw new Error(friendlyAuthError(error));
    if (data.user) setState({ status: 'signedIn', userId: data.user.id, isGuest: !!data.user.is_anonymous, email: data.user.email ?? null, error: null });
  };

  // Ends this account's session and starts a fresh guest one. The caller
  // clears local data first (rounds are safe in the cloud).
  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) { setState((s) => ({ ...s, status: 'error', userId: null, error: error.message })); return; }
    if (data.user) setState({ status: 'signedIn', userId: data.user.id, isGuest: true, email: null, error: null });
  };

  return <Ctx.Provider value={{ ...state, sendCode, verifyCode, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = (): AuthState & AuthActions => useContext(Ctx);
