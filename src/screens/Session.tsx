import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { colors, fonts, shadow } from '../theme';
import { Drill, drills } from '../data';
import { Icon, ChevronLeft, PlayIcon, PauseIcon } from '../Icon';
import { PrimaryButton } from '../ui';
import { TimerRing } from '../Charts';

type Props = {
  drill: Drill;
  mode: 'timing' | 'logging';
  running: boolean;
  elapsed: number;
  logMade: number | null;
  logFeel: string | null;
  onClose: () => void;
  onToggleRun: () => void;
  onOpenLog: () => void;
  onPickMade: (n: number) => void;
  onPickFeel: (f: string) => void;
  onSubmit: () => void;
};

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const feelOpts = [
  { key: 'tough', ico: 'faceTough', label: 'Tough' },
  { key: 'right', ico: 'faceRight', label: 'Just right' },
  { key: 'easy', ico: 'faceEasy', label: 'Too easy' },
];

export default function Session(p: Props) {
  const pos = drills.findIndex((d) => d.id === p.drill.id);
  const sessionPos = `${(pos < 0 ? 0 : pos) + 1} of ${drills.length}`;
  const progress = p.elapsed / p.drill.durationSec;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.canvas }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={p.onClose} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <ChevronLeft size={20} color={colors.ink55} />
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55 }}>End</Text>
        </Pressable>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, letterSpacing: 0.5, color: colors.ink50 }}>DRILL {sessionPos}</Text>
      </View>

      {p.mode === 'timing' ? (
        <>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 11, letterSpacing: 0.5, color: colors.ink, backgroundColor: colors.fill10, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>{p.drill.skill}</Text>
            <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink, marginBottom: 36, textAlign: 'center', letterSpacing: -0.4 }}>{p.drill.name}</Text>
            <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ position: 'absolute' }}>
                <TimerRing progress={progress} />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 52, color: colors.ink, letterSpacing: -1, fontVariant: ['tabular-nums'] }}>{fmt(p.elapsed)}</Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink50, marginTop: 2 }}>of {p.drill.duration}</Text>
              </View>
            </View>
            <View style={{ marginTop: 40 }}>
              <Pressable onPress={p.onToggleRun} style={[{ width: 74, height: 74, borderRadius: 37, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }, shadow.button]}>
                {p.running ? <PauseIcon size={26} color={colors.white} /> : <PlayIcon size={26} color={colors.white} />}
              </Pressable>
            </View>
          </View>
          <View style={{ paddingHorizontal: 24, paddingBottom: 44 }}>
            <Pressable onPress={p.onOpenLog} style={[{ height: 56, borderWidth: 1, borderColor: 'rgba(20,20,20,0.16)', borderRadius: 28, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, shadow.cardSoft]}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink }}>Finish & log it</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginTop: 18, marginBottom: 6, letterSpacing: -0.5 }}>How'd it go?</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 28 }}>Quick one — just so your coach can tune tomorrow.</Text>

          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink, marginBottom: 6 }}>{p.drill.logQ}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink50, marginBottom: 18 }}>Target was {p.drill.metricShort}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {Array.from({ length: 11 }, (_, n) => {
              const sel = p.logMade === n;
              return (
                <Pressable key={n} onPress={() => p.onPickMade(n)} style={{ width: 52, height: 52, borderRadius: 15, borderWidth: 1, borderColor: sel ? colors.ink : colors.border12, backgroundColor: sel ? colors.ink : colors.white, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 17, color: sel ? colors.white : colors.ink }}>{n}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink, marginBottom: 14 }}>How did it feel?</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 36 }}>
            {feelOpts.map((f) => {
              const sel = p.logFeel === f.key;
              return (
                <Pressable key={f.key} onPress={() => p.onPickFeel(f.key)} style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 6, borderRadius: 18, borderWidth: 1, borderColor: sel ? colors.ink : colors.border08, backgroundColor: sel ? colors.fill10 : colors.white, alignItems: 'center', gap: 6 }}>
                  <View style={{ height: 26, justifyContent: 'center' }}>
                    <Icon name={f.ico} size={26} color={sel ? colors.ink : colors.ink50} sw={1.8} />
                  </View>
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: sel ? colors.ink : colors.ink55 }}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton label="Save & finish" onPress={p.onSubmit} disabled={p.logMade === null || !p.logFeel} />
        </ScrollView>
      )}
    </View>
  );
}
