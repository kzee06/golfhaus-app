// Profile → Account: guest status, sync state, and the email code flow that
// turns a guest into a permanent account (or signs into an existing one).

import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Card, Button, Chip, Muted } from '../ui';
import { confirmAction } from '../ui/dialog';
import { EmailIntent, useAuth } from '../data/auth';
import { useCloudSync } from '../data/CloudSync';
import { useApp } from '../data/AppState';
import { fonts, useTheme } from '../theme';

type Step = 'idle' | 'email' | 'code';

export function AccountCard() {
  const t = useTheme();
  const auth = useAuth();
  const sync = useCloudSync();
  const { reset } = useApp();
  const [step, setStep] = useState<Step>('idle');
  const [intent, setIntent] = useState<EmailIntent>('save');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const input = { height: 48, borderWidth: 1, borderColor: t.border12, borderRadius: 14, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 16, color: t.text, backgroundColor: t.canvas } as const;
  const link = (label: string, onPress: () => void) => (
    <Pressable onPress={onPress} hitSlop={8}><Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: t.text2 }}>{label}</Text></Pressable>
  );

  const syncLine =
    sync.state === 'syncing' ? 'Syncing your rounds…'
    : sync.state === 'error' ? `Sync paused — will retry. ${sync.pending} change${sync.pending === 1 ? '' : 's'} waiting.`
    : sync.lastSyncedAt ? `Rounds backed up · last sync ${new Date(sync.lastSyncedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
    : 'Rounds back up automatically.';

  const start = (i: EmailIntent) => { setIntent(i); setStep('email'); setErr(null); setCode(''); };

  const send = async () => {
    setBusy(true); setErr(null);
    try { await auth.sendCode(email, intent); setStep('code'); }
    catch (e: any) { setErr(e?.message ?? 'Could not send the code.'); }
    finally { setBusy(false); }
  };

  const verify = async () => {
    setBusy(true); setErr(null);
    try { await auth.verifyCode(email, code, intent); setStep('idle'); setCode(''); }
    catch (e: any) { setErr(e?.message ?? 'Could not verify the code.'); }
    finally { setBusy(false); }
  };

  const signOut = () => confirmAction({
    title: 'Sign out?',
    message: 'Your rounds are backed up and will come back when you sign in again. They will be removed from this phone.',
    confirmLabel: 'Sign out', destructive: true,
    onConfirm: async () => { await reset(); await auth.signOut(); },
  });

  if (auth.status !== 'signedIn') {
    return (
      <Card soft>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: t.text }}>
          {auth.status === 'disabled' ? 'On this device only' : auth.status === 'loading' ? 'Connecting…' : 'Offline'}
        </Text>
        <Muted style={{ marginTop: 4 }}>
          {auth.status === 'disabled' ? 'Cloud sync is not configured for this build.' : 'Your rounds are saved on this device and will sync when you are back online.'}
        </Muted>
      </Card>
    );
  }

  return (
    <Card soft>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: t.text }} numberOfLines={1}>
        {auth.isGuest ? 'Guest account' : auth.email ?? 'Signed in'}
      </Text>
      <Muted style={{ marginTop: 4 }}>{syncLine}</Muted>

      {auth.isGuest && step === 'idle' && (
        <View style={{ marginTop: 14, gap: 12 }}>
          <Muted>Your rounds are only backed up for this phone. Add your email to keep them if you change phones.</Muted>
          <Button label="Save my rounds" size="md" onPress={() => start('save')} />
          {link('Already have an account? Sign in', () => start('signin'))}
        </View>
      )}

      {auth.isGuest && step === 'email' && (
        <View style={{ marginTop: 14, gap: 10 }}>
          <Muted>{intent === 'save' ? 'We’ll email you a 6-digit code to confirm it’s you.' : 'We’ll email a 6-digit code to sign you in.'}</Muted>
          <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={t.text4} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" style={input} />
          <Button label={busy ? 'Sending…' : 'Send code'} size="md" disabled={busy || !/.+@.+\..+/.test(email.trim())} onPress={send} />
          {link('Cancel', () => { setStep('idle'); setErr(null); })}
        </View>
      )}

      {auth.isGuest && step === 'code' && (
        <View style={{ marginTop: 14, gap: 10 }}>
          <Muted>Enter the 6-digit code we sent to {email.trim()}.</Muted>
          <TextInput value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="123456" placeholderTextColor={t.text4} keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} style={[input, { letterSpacing: 6, fontFamily: fonts.displayMed, fontSize: 20 }]} />
          <Button label={busy ? 'Checking…' : 'Verify'} size="md" disabled={busy || code.length !== 6} onPress={verify} />
          <View style={{ flexDirection: 'row', gap: 18 }}>
            {link('Resend code', send)}
            {link('Use a different email', () => { setStep('email'); setErr(null); setCode(''); })}
          </View>
        </View>
      )}

      {err && <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: t.text, marginTop: 10 }}>{err}</Text>}

      {(!auth.isGuest || step === 'idle') && sync.state !== 'syncing' && (
        <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
          <Chip label="Sync now" onPress={sync.syncNow} />
          {!auth.isGuest && <Chip label="Sign out" onPress={signOut} />}
        </View>
      )}
    </Card>
  );
}
