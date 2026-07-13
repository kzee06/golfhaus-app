import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, Pressable, ScrollView, Text, TextInput, View, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts, radius, shadow } from '../theme';
import { ASSETS, levelData, goalData, accessData, goalIco, accessIco, buildLines } from '../data';
import { Icon, ChevronLeft, ArrowRight, CheckIcon } from '../Icon';
import { PrimaryButton, Kicker, styles as ui } from '../ui';

type Props = {
  step: number;
  level: string | null;
  goal: string | null;
  access: string[];
  hcp: string;
  start: () => void;
  back: () => void;
  next: () => void;
  pickLevel: (k: string) => void;
  pickGoal: (k: string) => void;
  toggleAccess: (k: string) => void;
  setHcp: (v: string) => void;
  buildPlan: () => void;
  canBuild: boolean;
};

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
  const showProgress = p.step >= 1 && p.step <= 4;
  const pct = (Math.min(p.step, 3) / 3) * 100;

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
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, color: colors.ink45, letterSpacing: 0.5, minWidth: 28 }}>{Math.min(p.step, 3)}/3</Text>
        </View>
      )}

      {p.step === 1 && <Level {...p} />}
      {p.step === 2 && <Goal {...p} />}
      {(p.step === 3 || p.step === 4) && <Access {...p} />}
      {p.step === 5 && <Building />}
    </View>
  );
}

function Welcome({ start }: { start: () => void }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.white }}>
      {/* hero */}
      <View style={{ height: 368, overflow: 'hidden', backgroundColor: colors.ink }}>
        <Image source={ASSETS.hero} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,8,8,0.28)' }} />
        <View style={{ position: 'absolute', top: 104, left: 0, right: 0, alignItems: 'center', gap: 15 }}>
          <Image source={ASSETS.wordmarkWhite} resizeMode="contain" style={{ width: 224, height: 38 }} />
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11.5, letterSpacing: 3.4, color: 'rgba(255,255,255,0.74)', textTransform: 'uppercase' }}>AI Golf Coaching</Text>
        </View>
        <View style={{ position: 'absolute', bottom: 42, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 30 }}>
            <Text style={{ fontSize: 12, letterSpacing: 1.5, color: '#fff' }}>★★★★★</Text>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12.5, color: 'rgba(255,255,255,0.92)' }}>4.9 · 12,000+ golfers</Text>
          </View>
        </View>
      </View>
      {/* sheet */}
      <ScrollView style={{ flex: 1, marginTop: -26 }} contentContainerStyle={{ borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, backgroundColor: colors.white, padding: 26, paddingTop: 30, paddingBottom: 34, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: fonts.displayExtra, fontSize: 30, lineHeight: 31, letterSpacing: -1, color: colors.ink, marginBottom: 24 }}>Lower scores,{'\n'}one session at a time.</Text>
        <View style={{ gap: 19, marginBottom: 'auto' as any }}>
          <ValueRow icon="sparkle" title="A fresh plan every session" sub="AI reads your game and picks the drills that save you the most shots." />
          <ValueRow icon="target" title="Built around your goal" sub="From breaking 100 to dialing in your wedges — your plan, your pace." />
          <ValueRow icon="trendUp" title="Watch your game improve" sub="Log every round and see your handicap trend in the right direction." />
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
  const { Sparkle } = require('../Icon');
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

function Level(p: Props) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 26, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Kicker>First up</Kicker>
      <Text style={ui.h2}>How's your golf right now?</Text>
      <Text style={[ui.sub, { marginBottom: 26 }]}>No wrong answer — it just helps us pitch things right.</Text>
      <View style={{ gap: 12 }}>
        {levelData.map((o) => {
          const sel = p.level === o.key;
          return (
            <Pressable key={o.key} onPress={() => p.pickLevel(o.key)} style={[{ padding: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border08, backgroundColor: colors.white }, shadow.cardSoft]}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 17, color: colors.ink }}>{o.label}</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink55, marginTop: 3 }}>{o.desc}</Text>
              {sel && <><SelectedRing br={20} /><CheckBadge /></>}
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton label="Continue" onPress={p.next} disabled={!p.level} height={58} br={29} style={{ marginTop: 30 }} />
    </ScrollView>
  );
}

function Goal(p: Props) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 26, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Kicker>Your goal</Kicker>
      <Text style={ui.h2}>What's bugging you most?</Text>
      <Text style={[ui.sub, { marginBottom: 26 }]}>Pick the one that sounds like you. We'll build everything around it.</Text>
      <View style={{ gap: 11 }}>
        {goalData.map((o) => {
          const sel = p.goal === o.key;
          return (
            <Pressable key={o.key} onPress={() => p.pickGoal(o.key)} style={[{ paddingVertical: 17, paddingHorizontal: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border08, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 14 }, shadow.cardSoft]}>
              <View style={{ width: 26, alignItems: 'center' }}>
                <Icon name={goalIco[o.key]} size={21} color={colors.ink} />
              </View>
              <Text style={{ flex: 1, fontFamily: fonts.bodyMed, fontSize: 16, color: colors.ink, lineHeight: 21 }}>{o.label}</Text>
              {sel && <SelectedRing br={18} />}
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton label="Continue" onPress={p.next} disabled={!p.goal} height={58} br={29} style={{ marginTop: 26 }} />
    </ScrollView>
  );
}

function Access(p: Props) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 26, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Kicker>Where you play</Kicker>
      <Text style={ui.h2}>What can you get to?</Text>
      <Text style={[ui.sub, { marginBottom: 24 }]}>Tick everything you've got. We'll only set drills you can actually do.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 11 }}>
        {accessData.map((o) => {
          const sel = p.access.includes(o.key);
          return (
            <Pressable key={o.key} onPress={() => p.toggleAccess(o.key)} style={[{ width: '47%', flexGrow: 1, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border08, backgroundColor: colors.white, minHeight: 96, justifyContent: 'space-between' }, shadow.cardSoft]}>
              <View style={{ height: 24, justifyContent: 'center' }}>
                <Icon name={accessIco[o.key]} size={22} color={colors.ink} />
              </View>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink }}>{o.label}</Text>
              {sel && <><SelectedRing br={18} /><CheckBadge size={20} top={12} right={12} /></>}
            </Pressable>
          );
        })}
      </View>

      <View style={[{ marginTop: 26, padding: 18, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border08 }, shadow.cardSoft]}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink }}>Know your handicap?</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink50, marginTop: 3, marginBottom: 14 }}>Totally optional — skip if you're not sure.</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TextInput
            value={p.hcp}
            onChangeText={p.setHcp}
            placeholder="e.g. 24"
            placeholderTextColor={colors.ink40}
            keyboardType="decimal-pad"
            style={{ flex: 1, height: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border12, backgroundColor: colors.canvas, color: colors.ink, fontFamily: fonts.displaySemi, fontSize: 17, paddingHorizontal: 16 }}
          />
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink40 }}>or leave blank</Text>
        </View>
      </View>

      <PrimaryButton label="Build my plan" onPress={p.buildPlan} disabled={!p.canBuild} height={60} br={30} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

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
