import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon, ChevronRight, Sparkle } from '../Icon';
import { Wordmark, PrimaryButton, CoachLabel } from '../ui';
import { Profile } from '../profile';
import { Activity, ACTIVITY_GLYPH, ACTIVITY_TYPE_LABEL } from '../content';
import { PlanSession, todaysSession, shorterSession, bodySession, locationLabel } from '../plan';
import { dayKey } from '../progress';

const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function weekStrip(practicedKeys: string[]) {
  const done = new Set(practicedKeys);
  const today = new Date();
  const out = [];
  for (let i = -2; i <= 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({ dow: dows[d.getDay()], date: String(d.getDate()), isToday: i === 0, hasP: done.has(dayKey(d)) });
  }
  return out;
}

type Kind = PlanSession['kind'];
const KIND_META: { key: Kind; label: string }[] = [
  { key: 'balanced', label: 'Balanced' },
  { key: 'quick', label: 'Quick' },
  { key: 'body', label: 'Golf body' },
];

export default function Today({
  profile,
  greeting,
  name,
  streak,
  practicedDays,
  onOpenActivity,
  onStart,
  onCoach,
}: {
  profile: Profile;
  greeting: string;
  name: string;
  streak: number;
  practicedDays: string[];
  onOpenActivity: (id: string) => void;
  onStart: (session: PlanSession) => void;
  onCoach: () => void;
}) {
  // A seed that rotates once per day, so the plan varies without repeating.
  const seed = Math.floor(Date.now() / 86_400_000);

  const sessions = useMemo(
    () => ({
      balanced: todaysSession(profile, seed),
      quick: shorterSession(profile, seed),
      body: bodySession(profile, seed),
    }),
    [profile, seed],
  );

  const [kind, setKind] = useState<Kind>('balanced');
  const session = sessions[kind];
  const week = weekStrip(practicedDays);
  const displayName = name || 'golfer';

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
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 3 }}>{greeting}, {displayName}</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink }}>{session.focus}</Text>
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

      {/* why this — the coach's rationale for today's plan */}
      <View style={{ marginHorizontal: 20, marginTop: 20, padding: 18, borderRadius: radius.cardLg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18 }}>
        <CoachLabel text="WHY THIS PLAN" />
        <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.ink }}>{session.why}</Text>
      </View>

      {/* option chips — switch which plan is shown */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 18 }}>
        {KIND_META.map((k) => {
          const on = k.key === kind;
          const mins = sessions[k.key].totalMin;
          return (
            <Pressable key={k.key} onPress={() => setKind(k.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 14, backgroundColor: on ? colors.ink : colors.white, borderWidth: 1, borderColor: on ? colors.ink : colors.border12 }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13.5, color: on ? colors.white : colors.ink }}>{k.label}</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: on ? 'rgba(255,255,255,0.6)' : colors.ink45 }}>{mins} min</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* session meta */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 14 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: colors.ink50, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {session.activities.length} {session.activities.length === 1 ? 'activity' : 'activities'}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.fill10 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon name="pin" size={13} color={colors.ink50} />
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink50 }}>{locationLabel(session.location)}</Text>
        </View>
      </View>

      {/* activity list */}
      {session.activities.length === 0 ? (
        <View style={{ marginHorizontal: 20, padding: 22, borderRadius: radius.cardLg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink55 }}>
            No activities match your kit and locations yet. Add equipment or locations in your profile, or ask your coach for a plan you can do right now.
          </Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {session.activities.map((a, i) => (
            <PlanActivityCard key={a.id} activity={a} index={i + 1} onPress={() => onOpenActivity(a.id)} />
          ))}
        </View>
      )}

      {session.activities.length > 0 && (
        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <PrimaryButton label={`Start session · ${session.totalMin} min`} onPress={() => onStart(session)} play />
        </View>
      )}
    </ScrollView>
  );
}

function ActivityGlyph({ activity, size }: { activity: Activity; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 16, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={ACTIVITY_GLYPH[activity.type]} size={size * 0.42} color={colors.white} sw={1.8} />
    </View>
  );
}

function PlanActivityCard({ activity, index, onPress }: { activity: Activity; index: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.cardLg, padding: 13, flexDirection: 'row', gap: 14, alignItems: 'center' }, shadow.card]}>
      <View style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.ink }}>
        {activity.thumbnail ? (
          <Image source={activity.thumbnail} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        ) : (
          <ActivityGlyph activity={activity} size={64} />
        )}
        <View style={{ position: 'absolute', top: 5, left: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(20,20,20,0.55)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 10.5, color: colors.white }}>{index}</Text>
        </View>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 11, letterSpacing: 0.4, color: colors.ink, backgroundColor: colors.fill10, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 7, overflow: 'hidden' }}>{ACTIVITY_TYPE_LABEL[activity.type]}</Text>
        </View>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: colors.ink }} numberOfLines={1}>{activity.title}</Text>
        {/* Always golf context: how this improves the golfer's game. */}
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink55, marginTop: 3, lineHeight: 18 }} numberOfLines={2}>{activity.golfBenefit}</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 7, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={13} color={colors.ink50} />
            <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50 }}>{activity.durationMin} min</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={colors.ink30} />
    </Pressable>
  );
}
