import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, radius, shadow } from '../theme';
import { levelData, goalData } from '../data';
import { Icon } from '../Icon';
import { Wordmark } from '../ui';

export default function You({ level, goal, hcp, access, onRestart }: { level: string | null; goal: string | null; hcp: string; access: string[]; onRestart: () => void }) {
  const levelLabel = levelData.find((l) => l.key === level)?.label ?? 'Improver';
  const goalLabel = goalData.find((g) => g.key === goal)?.label ?? 'I want to break 100 / lower my score';
  const hcpDisplay = hcp || '24';
  const accessCount = access.length || 4;

  const rows = [
    { icon: 'target', label: 'Goal', value: 'Change' },
    { icon: 'flag', label: 'Equipment & access', value: `${accessCount} selected` },
    { icon: 'bell', label: 'Practice reminders', value: 'Mon, Wed, Sat' },
    { icon: 'ruler', label: 'Units', value: 'Metric' },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 58, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 16 }}>
          <Wordmark height={26} />
        </View>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink, marginBottom: 20 }}>You</Text>
      </View>

      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
        <View style={{ width: 62, height: 62, borderRadius: 20, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 24, color: '#fff' }}>K</Text>
        </View>
        <View>
          <Text style={{ fontFamily: fonts.display, fontSize: 21, color: colors.ink }}>KC Cheng</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink55 }}>{levelLabel} · Handicap {hcpDisplay}</Text>
        </View>
      </View>

      <View style={{ marginHorizontal: 20, marginTop: 24, padding: 18, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink, marginBottom: 7 }}>Your goal</Text>
        <Text style={{ fontFamily: fonts.bodyMed, fontSize: 18, color: colors.ink, lineHeight: 23 }}>{goalLabel}</Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 26, paddingBottom: 10 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: colors.ink50, letterSpacing: 0.6, textTransform: 'uppercase' }}>Settings</Text>
      </View>
      <View style={[{ marginHorizontal: 20, borderRadius: radius.card, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, shadow.cardSoft]}>
        {rows.map((s, i) => (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: 'rgba(20,20,20,0.06)' }}>
            <View style={{ width: 24, alignItems: 'center' }}>
              <Icon name={s.icon} size={19} color="rgba(20,20,20,0.6)" />
            </View>
            <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.ink }}>{s.label}</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink45 }}>{s.value}</Text>
            <Svg width={8} height={14} viewBox="0 0 8 14"><Path d="M1 1l6 6-6 6" stroke={colors.ink30} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Pressable onPress={onRestart} style={{ height: 54, borderWidth: 1, borderColor: 'rgba(20,20,20,0.16)', borderRadius: 27, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: 'rgba(20,20,20,0.7)' }}>Restart onboarding</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
