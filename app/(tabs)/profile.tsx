// Profile — your golfing journey: stats, history, settings.
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Pad, Header, SectionLabel, StatTile, Card, Chip, Muted, Button, Empty } from '../../src/ui';
import { confirmAction } from '../../src/ui/dialog';
import { RoundCard } from '../../src/components';
import { AccountCard } from '../../src/components/AccountCard';
import { useApp } from '../../src/data/AppState';
import { careerStats, fmtToPar, RESULT_LABEL, HoleResult } from '../../src/scoring';
import { fonts, useTheme } from '../../src/theme';

const SHOWN: HoleResult[] = ['eagle', 'birdie', 'par', 'bogey', 'double'];

export default function Profile() {
  const router = useRouter();
  const t = useTheme();
  const { golfer, setGolfer, rounds, reset } = useApp();
  const stats = careerStats(rounds);
  const history = rounds.filter((r) => r.status === 'complete');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(golfer.name);

  const confirmReset = () => {
    confirmAction({ title: 'Reset all data?', message: 'This deletes your rounds, courses and profile on this device.', confirmLabel: 'Reset', destructive: true, onConfirm: () => { reset(); } });
  };

  return (
    <Screen>
      <Header eyebrow="Your golf" title={golfer.name || 'Profile'} right={
        <Pressable onPress={() => { setName(golfer.name); setEditing((e) => !e); }} hitSlop={10}><Text style={{ fontFamily: fonts.bodySemi, color: t.text3 }}>{editing ? 'Done' : 'Edit'}</Text></Pressable>
      } />

      {editing && (
        <Pad style={{ marginBottom: 6 }}>
          <Card>
            <Muted style={{ marginBottom: 6 }}>Name</Muted>
            <TextInput value={name} onChangeText={setName} onBlur={() => setGolfer((g) => ({ ...g, name: name.trim() || g.name }))} autoCapitalize="words" style={{ height: 46, borderWidth: 1, borderColor: t.border12, borderRadius: 12, paddingHorizontal: 12, fontFamily: fonts.body, fontSize: 16, color: t.text, backgroundColor: t.canvas }} />
            <Muted style={{ marginTop: 14, marginBottom: 8 }}>Distance units</Muted>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label="Metres" on={golfer.units === 'm'} onPress={() => setGolfer((g) => ({ ...g, units: 'm' }))} />
              <Chip label="Yards" on={golfer.units === 'yd'} onPress={() => setGolfer((g) => ({ ...g, units: 'yd' }))} />
            </View>
            <View style={{ marginTop: 18 }}><Button label="Reset all data" variant="ghost" size="md" onPress={confirmReset} /></View>
          </Card>
        </Pad>
      )}

      <SectionLabel>Account</SectionLabel>
      <Pad><AccountCard /></Pad>

      <SectionLabel>Appearance</SectionLabel>
      <Pad style={{ flexDirection: 'row', gap: 8 }}>
        {(['system', 'light', 'dark'] as const).map((m) => (
          <Chip key={m} label={m === 'system' ? 'System' : m === 'light' ? 'Light' : 'Dark'} on={(golfer.themeMode ?? 'system') === m} onPress={() => setGolfer((g) => ({ ...g, themeMode: m }))} />
        ))}
      </Pad>

      <SectionLabel>Overview</SectionLabel>
      <Pad style={{ flexDirection: 'row', gap: 12 }}>
        <StatTile label="Rounds" value={String(stats.rounds)} />
        <StatTile label="Avg score (18)" value={stats.avgScore18 != null ? String(stats.avgScore18) : '–'} />
      </Pad>
      <Pad style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <StatTile label="Best round" value={stats.best ? String(stats.best.strokes) : '–'} unit={stats.best ? fmtToPar(stats.best.toPar) : undefined} />
        <StatTile label="Avg putts / hole" value={stats.avgPutts != null ? String(stats.avgPutts) : '–'} />
      </Pad>

      {stats.rounds > 0 && (
        <>
          <SectionLabel>Scoring</SectionLabel>
          <Pad>
            <Card soft>
              {SHOWN.map((k, i) => {
                const n = stats.counts[k];
                const total = SHOWN.reduce((s, kk) => s + stats.counts[kk], 0) || 1;
                return (
                  <View key={k} style={{ marginTop: i ? 12 : 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: t.text }}>{RESULT_LABEL[k]}{k === 'double' ? ' +' : ''}</Text>
                      <Text style={{ fontFamily: fonts.display, fontSize: 14, color: t.text }}>{k === 'double' ? n + stats.counts['triple+'] : n}</Text>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: t.fill06, overflow: 'hidden' }}>
                      <View style={{ width: `${Math.round(((k === 'double' ? n + stats.counts['triple+'] : n) / total) * 100)}%`, height: 6, backgroundColor: t.ink }} />
                    </View>
                  </View>
                );
              })}
              {stats.mostPlayed && <Muted style={{ marginTop: 14 }}>Most played: {stats.mostPlayed.course} ({stats.mostPlayed.rounds})</Muted>}
            </Card>
          </Pad>
        </>
      )}

      <SectionLabel>History</SectionLabel>
      {history.length === 0 ? (
        <Empty title="No completed rounds" body="Finish a round and it's saved here for good." action={<Button label="Start a round" size="md" onPress={() => router.push('/round/new')} />} />
      ) : (
        <Pad style={{ gap: 10 }}>{history.map((r) => <RoundCard key={r.id} round={r} onPress={() => router.push(`/round/${r.id}/summary`)} />)}</Pad>
      )}
    </Screen>
  );
}
