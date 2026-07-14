import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, Pressable, ScrollView, Text, View, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts, radius, shadow } from '../theme';
import { ASSETS, buildLines } from '../data';
import { Icon, ChevronLeft, ArrowRight, CheckIcon, Sparkle } from '../Icon';
import { PrimaryButton, Kicker, styles as ui } from '../ui';
import { Profile, STEPS, StepConfig } from '../profile';

type Props = {
  step: number; // 0 = welcome, 1..N = STEPS, N+1 = building
  profile: Profile;
  start: () => void;
  back: () => void;
  next: () => void;
  setSingle: (field: any, key: string) => void;
  toggleMulti: (field: any, key: string) => void;
  buildPlan: () => void;
};

const N = STEPS.length;

// selected-card ring overlay
function SelectedRing({ br }: { br: number }) {
  return (
    <View style={{ position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: br + 4, borderWidth: 4, borderColor: colors.fill06, pointerEvents: 'none' }}>
      <View style={{ position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, borderRadius: br, borderWidth: 1.5, borderColor: colors.ink }} />
    </View>
  );
}

function CheckBadge({ size = 22, top = 16, right = 16 }: { size?: number; top?: number; right?: number }) {
  return (
    <View style={{ position: 'absolute', top, right, width: size, height: size, borderRadius: size / 2, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
      <CheckIcon size={size * 0.55} />
    </View>
  );
}

export default function Onboarding(p: Props) {
  const showProgress = p.step >= 1 && p.step <= N;
  const pct = (Math.min(p.step, N) / N) * 100;
  const config = showProgress ? STEPS[p.step - 1] : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {p.step === 0 && <Welcome start={p.start} />}

      {showProgress && (
        <View style={{ paddingTop: 64, paddingHorizontal: 26, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={p.back} hitSlop={10}>
            <ChevronLeft size={22} color={colors.ink55} />
          </Pressable>
          <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.fill10, overflow: 'hidden' }}>
            <View style={{ height: '100%', borderRadius: 3, backgroundColor: colors.ink, width: `${pct}%` }} />
          </View>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, color: colors.ink45, letterSpacing: 0.5, minWidth: 28 }}>{Math.min(p.step, N)}/{N}</Text>
        </View>
      )}

      {config && (
        <StepScreen
          config={config}
          profile={p.profile}
          isLast={p.step === N}
          setSingle={p.setSingle}
          toggleMulti={p.toggleMulti}
          onContinue={p.step === N ? p.buildPlan : p.next}
        />
      )}

      {p.step === N + 1 && <Building />}
    </View>
  );
}

// ─── Generic step ───────────────────────────────────────────────────────────

function StepScreen({ config, profile, isLast, setSingle, toggleMulti, onContinue }: {
  config: StepConfig; profile: Profile; isLast: boolean;
  setSingle: (f: any, k: string) => void; toggleMulti: (f: any, k: string) => void; onContinue: () => void;
}) {
  const value = (profile as any)[config.field];
  const isSelected = (key: string) => (config.mode === 'single' ? value === key : (value as string[]).includes(key));
  const canContinue = config.mode === 'single' ? value != null : config.optional || (value as string[]).length >= 1;
  const grid = config.columns === 2;
  const showDesc = config.mode === 'single' && !grid && config.options.some((o) => o.desc);

  const onPick = (key: string) => (config.mode === 'single' ? setSingle(config.field, key) : toggleMulti(config.field, key));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 26, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Kicker>{config.kicker}</Kicker>
      <Text style={ui.h2}>{config.title}</Text>
      {!!config.subtitle && <Text style={[ui.sub, { marginBottom: 24 }]}>{config.subtitle}</Text>}

      <View style={grid ? { flexDirection: 'row', flexWrap: 'wrap', gap: 11 } : { gap: showDesc ? 12 : 11 }}>
        {config.options.map((o) => {
          const sel = isSelected(o.key);
          if (grid) {
            return (
              <Pressable key={o.key} onPress={() => onPick(o.key)} style={[{ width: '47%', flexGrow: 1, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border08, backgroundColor: colors.white, minHeight: 64, justifyContent: 'center' }, shadow.cardSoft]}>
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink }}>{o.label}</Text>
                {sel && <><SelectedRing br={18} /><CheckBadge size={20} top={10} right={10} /></>}
              </Pressable>
            );
          }
          if (showDesc) {
            return (
              <Pressable key={o.key} onPress={() => onPick(o.key)} style={[{ padding: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border08, backgroundColor: colors.white }, shadow.cardSoft]}>
                <Text style={{ fontFamily: fonts.displaySemi, fontSize: 17, color: colors.ink }}>{o.label}</Text>
                {!!o.desc && <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink55, marginTop: 3 }}>{o.desc}</Text>}
                {sel && <><SelectedRing br={20} /><CheckBadge /></>}
              </Pressable>
            );
          }
          // single-column row (no desc) — used for goals/exclusions multi and simple singles
          return (
            <Pressable key={o.key} onPress={() => onPick(o.key)} style={[{ paddingVertical: 17, paddingHorizontal: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border08, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.cardSoft]}>
              <Text style={{ flex: 1, fontFamily: fonts.bodyMed, fontSize: 16, color: colors.ink }}>{o.label}</Text>
              {sel && (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
                  <CheckIcon size={12} />
                </View>
              )}
              {sel && <SelectedRing br={18} />}
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton label={isLast ? 'Build my plan' : 'Continue'} onPress={onContinue} disabled={!canContinue} height={isLast ? 60 : 58} br={isLast ? 30 : 29} style={{ marginTop: 26 }} />
    </ScrollView>
  );
}

// ─── Welcome ────────────────────────────────────────────────────────────────

function Welcome({ start }: { start: () => void }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.white }}>
      <View style={{ height: 368, overflow: 'hidden', backgroundColor: colors.ink }}>
        <Image source={ASSETS.hero} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,8,8,0.28)' }} />
        <View style={{ position: 'absolute', top: 104, left: 0, right: 0, alignItems: 'center', gap: 15 }}>
          <Image source={ASSETS.wordmarkWhite} resizeMode="contain" style={{ width: 224, height: 38 }} />
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11.5, letterSpacing: 3.4, color: 'rgba(255,255,255,0.74)', textTransform: 'uppercase' }}>Your golf performance coach</Text>
        </View>
        <View style={{ position: 'absolute', bottom: 42, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 30 }}>
            <Text style={{ fontSize: 12, letterSpacing: 1.5, color: '#fff' }}>★★★★★</Text>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12.5, color: 'rgba(255,255,255,0.92)' }}>4.9 · 12,000+ golfers</Text>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1, marginTop: -26 }} contentContainerStyle={{ borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, backgroundColor: colors.white, padding: 26, paddingTop: 30, paddingBottom: 34, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: fonts.displayExtra, fontSize: 30, lineHeight: 31, letterSpacing: -1, color: colors.ink, marginBottom: 24 }}>Improve your golf{'\n'}and your golf body.</Text>
        <View style={{ gap: 19, marginBottom: 'auto' as any }}>
          <ValueRow icon="sparkle" title="A personalised daily plan" sub="Drills, mobility, strength and recovery picked for your game." />
          <ValueRow icon="target" title="Built around your goals" sub="Your goals, time, equipment and body — no endless searching." />
          <ValueRow icon="trendUp" title="Improve without the guesswork" sub="Just open the app and do the session that helps most today." />
        </View>
        <View style={{ marginTop: 30 }}>
          <PrimaryButton label="Get started" onPress={start} height={58} br={17} right={<ArrowRight />} />
          <Pressable onPress={start} style={{ marginTop: 15 }}>
            <Text style={{ textAlign: 'center', fontFamily: fonts.body, fontSize: 14.5, color: colors.ink50 }}>
              Already have an account? <Text style={{ color: colors.ink, fontFamily: fonts.bodyBold }}>Log in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function ValueRow({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        {icon === 'sparkle' ? <Sparkle size={22} color={colors.ink} /> : <Icon name={icon} size={22} color={colors.ink} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 16.5, color: colors.ink, letterSpacing: -0.2 }}>{title}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink55, lineHeight: 19, marginTop: 2 }}>{sub}</Text>
      </View>
    </View>
  );
}

// ─── Building ───────────────────────────────────────────────────────────────

function Building() {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: colors.canvas }}>
      <Animated.View style={{ width: 96, height: 96, marginBottom: 34, transform: [{ rotate }] }}>
        <Svg width={96} height={96} viewBox="0 0 96 96">
          <Circle cx={48} cy={48} r={42} stroke="rgba(20,20,20,0.1)" strokeWidth={6} fill="none" />
          <Circle cx={48} cy={48} r={42} stroke={colors.ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="80 184" />
        </Svg>
      </Animated.View>
      <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink, marginBottom: 22, textAlign: 'center', letterSpacing: -0.4 }}>Building your plan…</Text>
      <View style={{ gap: 13, width: '100%', maxWidth: 300 }}>
        {buildLines.map((t, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ width: 18, textAlign: 'center', color: colors.ink, fontSize: 12 }}>●</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink }}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
