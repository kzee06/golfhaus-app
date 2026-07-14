import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon, ChevronLeft, Sparkle } from '../Icon';
import {
  Activity,
  ACTIVITY_GLYPH,
  ACTIVITY_TYPE_LABEL,
  EQUIPMENT_LABEL,
  LOCATION_LABEL,
} from '../content';
import { difficultyLabel } from '../components/ActivityCard';

const chip = {
  fontFamily: fonts.displaySemi, fontSize: 11, letterSpacing: 0.4,
  paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, overflow: 'hidden' as const,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink50, marginBottom: 14 }}>{children}</Text>;
}

function Callout({ title, children, tone = 'coach' }: { title: string; children: React.ReactNode; tone?: 'coach' | 'warn' }) {
  return (
    <View style={{ padding: 18, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18, marginBottom: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
          {tone === 'coach' ? <Sparkle size={14} color={colors.white} /> : <Icon name="help" size={15} color={colors.white} sw={2} />}
        </View>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function ActivityDetail({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const a = activity;
  const equip = a.equipmentRequired.filter((e) => e !== 'none').map((e) => EQUIPMENT_LABEL[e]);
  const optional = (a.equipmentOptional || []).filter((e) => e !== 'none').map((e) => EQUIPMENT_LABEL[e]);
  const where = a.locations.map((l) => LOCATION_LABEL[l]);
  const success = a.scoring
    ? `${a.scoring.prompt} Target: ${a.scoring.target} ${a.scoring.unit}.`
    : a.completionCriteria || `Complete the ${a.durationMin}-minute session with good form.`;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.canvas }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* hero */}
        <View style={{ height: 260, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {a.thumbnail ? (
            <>
              <Image source={a.thumbnail} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,15,15,0.3)' }} />
            </>
          ) : (
            <Icon name={ACTIVITY_GLYPH[a.type]} size={92} color="rgba(255,255,255,0.9)" sw={1.4} />
          )}
          <Pressable onPress={onClose} style={[{ position: 'absolute', top: 60, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }, shadow.cardSoft]}>
            <ChevronLeft size={20} color={colors.ink} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Text style={[chip, { color: colors.ink, backgroundColor: colors.fill10 }]}>{ACTIVITY_TYPE_LABEL[a.type]}</Text>
            <Text style={[chip, { color: 'rgba(20,20,20,0.7)', backgroundColor: colors.fill06 }]}>{a.category}</Text>
            {a.premium && <Text style={[chip, { color: colors.white, backgroundColor: colors.ink }]}>PREMIUM</Text>}
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: -0.7, color: colors.ink, marginBottom: 8 }}>{a.title}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 22, color: colors.ink55, marginBottom: 16 }}>{a.summary}</Text>

          {/* golf benefit — always shown, always in a golf context */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22, paddingVertical: 13, paddingHorizontal: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18, borderRadius: 16 }}>
            <Icon name="trendUp" size={22} color={colors.ink} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.ink50, marginBottom: 2 }}>Improves your golf</Text>
              <Text style={{ fontFamily: fonts.bodyMed, fontSize: 15.5, color: colors.ink, lineHeight: 21 }}>{a.golfBenefit}</Text>
            </View>
          </View>

          {/* stat strip */}
          <View style={[{ flexDirection: 'row', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 4, marginBottom: 24 }, shadow.cardSoft]}>
            <Stat label="Level" value={difficultyLabel(a)} border />
            <Stat label="Time" value={`${a.durationMin} min`} border />
            <Stat label="Where" value={where[0] || 'Anywhere'} />
          </View>

          <Callout title="What it improves">
            <Text style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 24, color: 'rgba(20,20,20,0.85)' }}>{a.problem}</Text>
          </Callout>

          {/* what you need */}
          <SectionLabel>What you need</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {equip.length === 0 && <Text style={[chip, { color: colors.ink, backgroundColor: colors.fill10, fontSize: 12.5 }]}>No equipment</Text>}
            {equip.map((e) => <Text key={e} style={[chip, { color: colors.ink, backgroundColor: colors.fill10, fontSize: 12.5 }]}>{e}</Text>)}
            {optional.map((e) => <Text key={e} style={[chip, { color: 'rgba(20,20,20,0.6)', backgroundColor: colors.fill05, fontSize: 12.5 }]}>{e} (optional)</Text>)}
          </View>

          {/* setup */}
          <SectionLabel>Setup</SectionLabel>
          <Text style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 23, color: colors.ink, marginBottom: 24 }}>{a.setup}</Text>

          {/* steps */}
          <SectionLabel>How to do it</SectionLabel>
          <View style={{ gap: 14, marginBottom: 24 }}>
            {a.steps.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: colors.fill10, borderWidth: 1, borderColor: 'rgba(20,20,20,0.22)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 14, color: colors.ink }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15.5, lineHeight: 22, color: colors.ink, marginTop: 2 }}>{s}</Text>
              </View>
            ))}
          </View>

          {/* cues */}
          <SectionLabel>Coaching cues</SectionLabel>
          <View style={{ gap: 9, marginBottom: 24 }}>
            {a.cues.map((c, i) => (
              <View key={i} style={[{ flexDirection: 'row', gap: 11, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14 }, shadow.cardSoft]}>
                <Text style={{ color: colors.ink, fontSize: 15 }}>✓</Text>
                <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, color: 'rgba(20,20,20,0.9)' }}>{c}</Text>
              </View>
            ))}
          </View>

          {/* what to feel */}
          <Callout title="What you should feel">
            <Text style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 24, color: 'rgba(20,20,20,0.85)' }}>{a.feel}</Text>
          </Callout>

          {/* common mistakes */}
          <SectionLabel>Common mistakes</SectionLabel>
          <View style={{ gap: 9, marginBottom: 24 }}>
            {a.mistakes.map((m, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 11, alignItems: 'flex-start' }}>
                <Text style={{ color: colors.ink40, fontSize: 15, marginTop: 1 }}>✕</Text>
                <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.ink55 }}>{m}</Text>
              </View>
            ))}
          </View>

          {/* success */}
          <View style={{ flexDirection: 'row', gap: 13, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18, borderRadius: 18, marginBottom: 24 }}>
            <Icon name="target" size={24} color={colors.ink} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.ink, marginBottom: 3 }}>How to measure success</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 15.5, color: colors.ink, lineHeight: 21 }}>{success}</Text>
            </View>
          </View>

          {/* easier / harder */}
          {(a.easier || a.harder) && (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {a.easier && <Variation label="Make it easier" text={a.easier} />}
              {a.harder && <Variation label="Make it harder" text={a.harder} />}
            </View>
          )}

          {/* frequency */}
          {a.frequency && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Icon name="clock" size={18} color={colors.ink50} />
              <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink }}>
                <Text style={{ fontFamily: fonts.bodySemi }}>Recommended: </Text>{a.frequency}
              </Text>
            </View>
          )}

          {/* safety */}
          {a.safety && (
            <View style={{ padding: 16, borderRadius: 16, backgroundColor: colors.fill06, borderWidth: 1, borderColor: colors.border12 }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.ink50, marginBottom: 5 }}>Safety</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.ink55 }}>{a.safety}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRightWidth: border ? 1 : 0, borderRightColor: colors.border }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.ink45 }}>{label}</Text>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 14, color: colors.ink, marginTop: 3 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function Variation({ label, text }: { label: string; text: string }) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14 }, shadow.cardSoft]}>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.ink50, marginBottom: 6 }}>{label}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.ink }}>{text}</Text>
    </View>
  );
}
