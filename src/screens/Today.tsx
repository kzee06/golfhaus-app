import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { drills, rationale, Drill } from '../data';
import { Icon, ChevronRight, Sparkle } from '../Icon';
import { Wordmark, PrimaryButton, CoachLabel } from '../ui';

const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const practice = [1, 3, 6]; // Mon, Wed, Sat

function weekStrip() {
  const today = new Date();
  const out = [];
  for (let i = -2; i <= 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({ dow: dows[d.getDay()], date: String(d.getDate()), isToday: i === 0, hasP: practice.includes(d.getDay()) });
  }
  return out;
}

export default function Today({ greeting, streak, onOpen, onStart, onCoach }: { greeting: string; streak: number; onOpen: (id: string) => void; onStart: () => void; onCoach: () => void }) {
  const week = weekStrip();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 58, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Wordmark height={26} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.fill06, borderWidth: 1, borderColor: colors.border12, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14 }}>
            <Icon name="flame" size={16} color={colors.ink} />
            <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.ink }}>{streak}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 2 }}>{greeting}, KC</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink }}>Today's Practice</Text>
      </View>

      {/* ask-the-coach prompt */}
      <Pressable onPress={onCoach} style={[{ marginHorizontal: 20, marginTop: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.cardLg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }, shadow.card]}>
        <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Sparkle size={20} color={colors.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 16.5, color: colors.ink, letterSpacing: -0.2 }}>Ask your coach</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink55, lineHeight: 19, marginTop: 2 }}>Stuck on something? Tell me your game and I'll find the fix.</Text>
        </View>
        <ChevronRight size={20} color={colors.ink30} />
      </Pressable>

      {/* week strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 2 }}>
        {week.map((d, i) => (
          <View key={i} style={[{ width: 50, height: 68, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: d.isToday ? colors.ink : colors.white, borderWidth: 1, borderColor: d.isToday ? colors.ink : colors.border08 }, d.isToday ? shadow.card : shadow.cardSoft]}>
            <Text style={{ fontSize: 11, fontFamily: fonts.displaySemi, color: d.isToday ? 'rgba(255,255,255,0.65)' : colors.ink40, letterSpacing: 0.3 }}>{d.dow}</Text>
            <Text style={{ fontSize: 17, fontFamily: fonts.display, color: d.isToday ? colors.white : colors.ink }}>{d.date}</Text>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: d.hasP ? (d.isToday ? colors.white : colors.ink) : 'transparent' }} />
          </View>
        ))}
      </ScrollView>

      {/* coach rationale */}
      <View style={{ marginHorizontal: 20, marginTop: 20, padding: 18, borderRadius: radius.cardLg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18 }}>
        <CoachLabel text="YOUR COACH" />
        <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.ink }}>{rationale}</Text>
      </View>

      {/* session meta */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 14 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: colors.ink50, letterSpacing: 0.6, textTransform: 'uppercase' }}>Short game focus</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.fill10 }} />
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink50 }}>3 drills · 28 min</Text>
      </View>

      {/* drill cards */}
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        {drills.map((d) => (
          <TodayDrillCard key={d.id} d={d} onPress={() => onOpen(d.id)} />
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
        <PrimaryButton label="Start session · 28 min" onPress={onStart} play />
      </View>
    </ScrollView>
  );
}

function TodayDrillCard({ d, onPress }: { d: Drill; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.cardLg, padding: 13, flexDirection: 'row', gap: 14, alignItems: 'center' }, shadow.card]}>
      <View style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.ink }}>
        <Image source={d.img} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        <Text style={{ position: 'absolute', top: 5, left: 6, fontFamily: fonts.display, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{d.num}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 11, letterSpacing: 0.4, color: colors.ink, backgroundColor: colors.fill10, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 7, overflow: 'hidden' }}>{d.skill}</Text>
        </View>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 17, color: colors.ink }}>{d.name}</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 7, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={13} color={colors.ink50} />
            <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50 }}>{d.duration}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="pin" size={13} color={colors.ink50} />
            <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50 }}>{d.whereShort}</Text>
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50 }}>{d.difficulty}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.ink30} />
    </Pressable>
  );
}
