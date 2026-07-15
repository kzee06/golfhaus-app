import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon, ChevronLeft, CheckIcon, PlayIcon } from '../Icon';
import { Profile } from '../profile';
import { SessionRecord, FEEL_LABEL } from '../progress';
import { weeklyPlan, WeekDay, DayKind, KIND_LABEL } from '../plan';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const KIND_ICON: Record<DayKind, string> = { balanced: 'target', quick: 'zap', body: 'dumbbell', rest: 'heart' };

export default function WeeklyPlan({
  profile,
  history,
  onClose,
  onStartToday,
}: {
  profile: Profile;
  history: SessionRecord[];
  onClose: () => void;
  onStartToday: () => void;
}) {
  const days = useMemo(() => weeklyPlan(profile, history, new Date()), [profile, history]);
  const trainingDays = days.filter((d) => d.kind !== 'rest');
  const doneCount = days.filter((d) => d.done).length;
  const plannedCount = trainingDays.length;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.canvas }}>
      <View style={{ paddingTop: 58, paddingHorizontal: 24, paddingBottom: 8 }}>
        <Pressable onPress={onClose} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <ChevronLeft size={20} color={colors.ink55} />
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55 }}>Today</Text>
        </Pressable>
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 2 }}>
          {plannedCount} sessions planned · {doneCount} done
        </Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink }}>This week</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60, gap: 10 }} showsVerticalScrollIndicator={false}>
        {days.map((d) => (
          <DayRow key={d.dateKey} d={d} onStartToday={onStartToday} />
        ))}

        <Text style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.ink45, textAlign: 'center', paddingHorizontal: 24, paddingTop: 16 }}>
          Your week is shaped around how often you practise, mixing skill work, golf-body days and rest. It adapts as you train.
        </Text>
      </ScrollView>
    </View>
  );
}

function DayRow({ d, onStartToday }: { d: WeekDay; onStartToday: () => void }) {
  const isRest = d.kind === 'rest';
  const missed = d.isPast && !d.done && !isRest;
  const canStart = d.isToday && !d.done && !isRest;

  const badgeInk = d.isToday;
  const dim = (isRest || missed) && !d.done;

  return (
    <Pressable
      onPress={canStart ? onStartToday : undefined}
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: d.isToday ? colors.ink : colors.border, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 15 },
        d.isToday ? shadow.card : shadow.cardSoft,
        dim ? { opacity: 0.72 } : null,
      ]}
    >
      {/* date badge */}
      <View style={{ width: 50, height: 58, borderRadius: 15, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: badgeInk ? colors.ink : colors.fill06, borderWidth: 1, borderColor: badgeInk ? colors.ink : colors.border08 }}>
        <Text style={{ fontSize: 11, fontFamily: fonts.displaySemi, letterSpacing: 0.3, color: badgeInk ? 'rgba(255,255,255,0.7)' : colors.ink45 }}>{DOW[d.weekday]}</Text>
        <Text style={{ fontSize: 18, fontFamily: fonts.display, color: badgeInk ? colors.white : colors.ink }}>{d.dateNum}</Text>
      </View>

      {/* content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <Icon name={d.done ? 'flame' : KIND_ICON[d.kind]} size={14} color={dim ? colors.ink40 : colors.ink} />
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 11.5, letterSpacing: 0.4, textTransform: 'uppercase', color: dim ? colors.ink45 : colors.ink55 }}>
            {d.done ? 'Completed' : missed ? 'Missed' : KIND_LABEL[d.kind]}{d.isToday && !d.done ? ' · Today' : ''}
          </Text>
        </View>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: colors.ink }} numberOfLines={1}>
          {d.done ? d.doneFocus : d.focus}
        </Text>
        {!isRest && (
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50, marginTop: 2 }}>
            {d.done && d.doneFeel ? `Felt ${FEEL_LABEL[d.doneFeel].toLowerCase()}` : `${d.activityCount} ${d.activityCount === 1 ? 'activity' : 'activities'} · ${d.totalMin} min`}
          </Text>
        )}
      </View>

      {/* right affordance */}
      {d.done ? (
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon size={15} color={colors.white} />
        </View>
      ) : canStart ? (
        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.ink, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 14 }, shadow.button]}>
          <PlayIcon size={13} color={colors.white} />
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13.5, color: colors.white }}>Start</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
