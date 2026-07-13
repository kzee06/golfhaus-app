import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { Drill } from '../data';
import { Icon, ChevronLeft, PlayIcon } from '../Icon';
import { PrimaryButton } from '../ui';

export default function DrillDetail({ drill, onClose, onStart }: { drill: Drill; onClose: () => void; onStart: () => void }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.canvas }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* hero */}
        <View style={{ height: 286, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Image source={drill.img} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,15,15,0.4)' }} />
          <View style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' }}>
            <PlayIcon size={26} color={colors.ink} />
          </View>
          <Text style={{ position: 'absolute', bottom: 18, fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.4 }}>▶ Watch the 40-sec demo</Text>
          <Pressable onPress={onClose} style={[{ position: 'absolute', top: 60, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }, shadow.cardSoft]}>
            <ChevronLeft size={20} color={colors.ink} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Text style={[chip, { color: colors.ink, backgroundColor: colors.fill10 }]}>{drill.skill}</Text>
            <Text style={[chip, { color: 'rgba(20,20,20,0.7)', backgroundColor: colors.fill06 }]}>{drill.sub}</Text>
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: -0.7, color: colors.ink, marginBottom: 16 }}>{drill.name}</Text>

          {/* stat strip */}
          <View style={[{ flexDirection: 'row', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 4, marginBottom: 24 }, shadow.cardSoft]}>
            <StatCell label="Level" value={drill.level} border />
            <StatCell label="Time" value={drill.duration} border />
            <StatCell label="Where" value={drill.whereShort} />
          </View>

          {/* why */}
          <View style={{ padding: 18, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18, marginBottom: 26 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 11 }}>
              <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
                {(() => { const { Sparkle } = require('../Icon'); return <Sparkle size={14} color={colors.white} />; })()}
              </View>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink }}>Why this drill?</Text>
            </View>
            <Text style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 24, color: 'rgba(20,20,20,0.85)' }}>{drill.why}</Text>
          </View>

          {/* steps */}
          <SectionLabel>How to do it</SectionLabel>
          <View style={{ gap: 14, marginBottom: 26 }}>
            {drill.steps.map((t, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: colors.fill10, borderWidth: 1, borderColor: 'rgba(20,20,20,0.22)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 14, color: colors.ink }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15.5, lineHeight: 22, color: colors.ink, marginTop: 2 }}>{t}</Text>
              </View>
            ))}
          </View>

          {/* cues */}
          <SectionLabel>Coaching cues</SectionLabel>
          <View style={{ gap: 9, marginBottom: 24 }}>
            {drill.cues.map((c, i) => (
              <View key={i} style={[{ flexDirection: 'row', gap: 11, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14 }, shadow.cardSoft]}>
                <Text style={{ color: colors.ink, fontSize: 15 }}>✓</Text>
                <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, color: 'rgba(20,20,20,0.9)' }}>{c}</Text>
              </View>
            ))}
          </View>

          {/* metric */}
          <View style={{ flexDirection: 'row', gap: 13, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18, borderRadius: 18 }}>
            <Icon name="target" size={24} color={colors.ink} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.ink, marginBottom: 3 }}>Success looks like</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 15.5, color: colors.ink, lineHeight: 21 }}>{drill.metric}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* sticky start */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 30, backgroundColor: colors.canvas }}>
        <PrimaryButton label="Start this drill" onPress={onStart} play />
      </View>
    </View>
  );
}

function StatCell({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRightWidth: border ? 1 : 0, borderRightColor: colors.border }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.ink45 }}>{label}</Text>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 14, color: colors.ink, marginTop: 3 }}>{value}</Text>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink50, marginBottom: 14 }}>{children}</Text>;
}

const chip = {
  fontFamily: fonts.displaySemi,
  fontSize: 11,
  letterSpacing: 0.4,
  paddingVertical: 5,
  paddingHorizontal: 10,
  borderRadius: 8,
  overflow: 'hidden' as const,
};
