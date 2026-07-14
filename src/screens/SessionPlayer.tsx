import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon, ChevronLeft, PlayIcon, PauseIcon, CheckIcon, ArrowRight } from '../Icon';
import { PrimaryButton } from '../ui';
import { TimerRing } from '../Charts';
import { Activity, ACTIVITY_TYPE_LABEL } from '../content';
import { PlanSession } from '../plan';

export type SessionSummary = { completed: number; total: number; totalMin: number; feel: string | null };

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

type Stage = 'active' | 'reflect' | 'done';

export default function SessionPlayer({
  session,
  name,
  streak,
  onExit,
  onFinish,
}: {
  session: PlanSession;
  name: string;
  streak: number;
  onExit: () => void;
  onFinish: (summary: SessionSummary) => void;
}) {
  const acts = session.activities;
  const [stage, setStage] = useState<Stage>('active');
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [feel, setFeel] = useState<string | null>(null);

  const current: Activity | undefined = acts[index];
  const durationSec = current ? Math.max(1, current.durationMin * 60) : 1;

  // Per-activity count-up timer. Stops at the activity's duration.
  useEffect(() => {
    if (stage !== 'active' || !running) return;
    const id = setInterval(() => setElapsed((e) => Math.min(e + 1, durationSec)), 1000);
    return () => clearInterval(id);
  }, [stage, running, durationSec]);

  const advance = () => {
    if (index + 1 < acts.length) {
      setIndex((i) => i + 1);
      setElapsed(0);
      setRunning(true);
    } else {
      setStage('reflect');
    }
  };

  const finish = () => {
    setStage('done');
    onFinish({ completed: acts.length, total: acts.length, totalMin: session.totalMin, feel });
  };

  if (stage === 'done') {
    return <DoneView name={name} streak={streak} feel={feel} onBack={onExit} />;
  }

  if (stage === 'reflect') {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.canvas }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => { setStage('active'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <ChevronLeft size={20} color={colors.ink55} />
            <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55 }}>Back</Text>
          </Pressable>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={{ fontFamily: fonts.display, fontSize: 27, color: colors.ink, marginBottom: 8, letterSpacing: -0.6 }}>How'd the session feel?</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink55, marginBottom: 30 }}>One tap — it's how your coach tunes tomorrow's plan.</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 36 }}>
            {feelOpts.map((f) => {
              const sel = feel === f.key;
              return (
                <Pressable key={f.key} onPress={() => setFeel(f.key)} style={{ flex: 1, paddingVertical: 18, paddingHorizontal: 6, borderRadius: 18, borderWidth: 1, borderColor: sel ? colors.ink : colors.border08, backgroundColor: sel ? colors.fill10 : colors.white, alignItems: 'center', gap: 8 }}>
                  <Icon name={f.ico} size={28} color={sel ? colors.ink : colors.ink50} sw={1.8} />
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: sel ? colors.ink : colors.ink55 }}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton label="Finish session" onPress={finish} disabled={!feel} />
        </ScrollView>
      </View>
    );
  }

  // stage === 'active'
  if (!current) {
    // No activities to play — shouldn't happen (Start is hidden for empty plans).
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, textAlign: 'center', marginBottom: 20 }}>This plan has no activities yet.</Text>
        <PrimaryButton label="Back to home" onPress={onExit} style={{ width: '100%', maxWidth: 300 }} />
      </View>
    );
  }

  const progress = elapsed / durationSec;
  const isLast = index + 1 >= acts.length;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.canvas }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Pressable onPress={onExit} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <ChevronLeft size={20} color={colors.ink55} />
            <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55 }}>End</Text>
          </Pressable>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, letterSpacing: 0.5, color: colors.ink50 }}>{index + 1} OF {acts.length}</Text>
        </View>
        {/* segmented progress across the whole session */}
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {acts.map((_, i) => (
            <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i < index ? colors.ink : i === index ? colors.ink40 : colors.fill10 }} />
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', paddingTop: 24, paddingHorizontal: 30 }}>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 11, letterSpacing: 0.5, color: colors.ink, backgroundColor: colors.fill10, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>{ACTIVITY_TYPE_LABEL[current.type]}</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink, marginBottom: 4, textAlign: 'center', letterSpacing: -0.4 }}>{current.title}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.ink55, textAlign: 'center', marginBottom: 26 }}>{current.golfBenefit}</Text>

          <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'absolute' }}>
              <TimerRing progress={progress} />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 52, color: colors.ink, letterSpacing: -1, fontVariant: ['tabular-nums'] }}>{fmt(elapsed)}</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink50, marginTop: 2 }}>of {current.durationMin} min</Text>
            </View>
          </View>

          <Pressable onPress={() => setRunning((r) => !r)} style={[{ width: 74, height: 74, borderRadius: 37, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginTop: 30 }, shadow.button]}>
            {running ? <PauseIcon size={26} color={colors.white} /> : <PlayIcon size={26} color={colors.white} />}
          </Pressable>
        </View>

        {/* coaching detail for the current activity */}
        <View style={{ paddingHorizontal: 24, paddingTop: 34 }}>
          <SectionLabel>Setup</SectionLabel>
          <Text style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 23, color: colors.ink, marginBottom: 24 }}>{current.setup}</Text>

          <SectionLabel>How to do it</SectionLabel>
          <View style={{ gap: 14, marginBottom: 24 }}>
            {current.steps.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: colors.fill10, borderWidth: 1, borderColor: 'rgba(20,20,20,0.22)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 14, color: colors.ink }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15.5, lineHeight: 22, color: colors.ink, marginTop: 2 }}>{s}</Text>
              </View>
            ))}
          </View>

          {current.cues.length > 0 && (
            <>
              <SectionLabel>Coaching cues</SectionLabel>
              <View style={{ gap: 9 }}>
                {current.cues.map((c, i) => (
                  <View key={i} style={[{ flexDirection: 'row', gap: 11, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14 }, shadow.cardSoft]}>
                    <Text style={{ color: colors.ink, fontSize: 15 }}>✓</Text>
                    <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, color: 'rgba(20,20,20,0.9)' }}>{c}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* sticky advance bar */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, backgroundColor: colors.canvas, borderTopWidth: 1, borderTopColor: colors.border08 }}>
        <PrimaryButton label={isLast ? 'Finish session' : 'Next activity'} onPress={advance} right={isLast ? undefined : <ArrowRight size={20} color={colors.white} />} />
      </View>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink50, marginBottom: 14 }}>{children}</Text>;
}

function DoneView({ name, streak, feel, onBack }: { name: string; streak: number; feel: string | null; onBack: () => void }) {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(pop, { toValue: 1, duration: 500, easing: Easing.bezier(0.34, 1.56, 0.64, 1), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [pop]);
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const who = name || 'golfer';
  const msg =
    feel === 'tough'
      ? "That was a real one. Your coach will keep the intensity here and build the reps up next time."
      : feel === 'easy'
      ? "Smooth — you've got more in the tank. Expect your coach to add a challenge tomorrow."
      : "Solid session. Your coach will keep you on this track and progress it from here.";

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
      <Animated.View style={[{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 28, opacity: pop, transform: [{ scale }] }, shadow.button]}>
        <CheckIcon size={46} color={colors.white} sw={3} />
      </Animated.View>
      <Text style={{ fontFamily: fonts.display, fontSize: 30, color: colors.ink, marginBottom: 12, textAlign: 'center', letterSpacing: -0.7 }}>Nice work, {who}.</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.ink55, textAlign: 'center', maxWidth: 300, marginBottom: 8 }}>{msg}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 38, backgroundColor: colors.fill10, borderWidth: 1, borderColor: 'rgba(20,20,20,0.22)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14 }}>
        <Icon name="flame" size={18} color={colors.ink} />
        <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.ink }}>{streak}-day streak</Text>
      </View>
      <PrimaryButton label="Back to home" onPress={onBack} style={{ width: '100%', maxWidth: 320 }} />
    </View>
  );
}
