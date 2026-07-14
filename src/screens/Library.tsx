import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { Wordmark } from '../ui';
import ActivityCard from '../components/ActivityCard';
import {
  ACTIVITIES,
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABEL,
  ActivityType,
  isNoEquipment,
} from '../content';

type TypeFilter = ActivityType | 'all';

// Chip filter for activity type. "All" first, then each pillar type in order.
const TYPE_CHIPS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  ...ACTIVITY_TYPES.map((t) => ({ key: t as TypeFilter, label: ACTIVITY_TYPE_LABEL[t] })),
];

const QUICK = [
  { key: 'noEquip', label: 'No equipment' },
  { key: 'short', label: '≤ 10 min' },
  { key: 'beginner', label: 'Beginner friendly' },
  { key: 'preRound', label: 'Pre-round' },
] as const;
type QuickKey = (typeof QUICK)[number]['key'];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 9, paddingHorizontal: 15, borderRadius: 14, backgroundColor: active ? colors.ink : colors.white, borderWidth: 1, borderColor: active ? colors.ink : colors.border12 }}>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: active ? colors.white : colors.ink55 }}>{label}</Text>
    </Pressable>
  );
}

export default function Library({ onOpen }: { onOpen: (id: string) => void }) {
  const [type, setType] = useState<TypeFilter>('all');
  const [quick, setQuick] = useState<Record<QuickKey, boolean>>({ noEquip: false, short: false, beginner: false, preRound: false });
  const toggleQuick = (k: QuickKey) => setQuick((q) => ({ ...q, [k]: !q[k] }));

  let list = ACTIVITIES.slice();
  if (type !== 'all') list = list.filter((a) => a.type === type);
  if (quick.noEquip) list = list.filter(isNoEquipment);
  if (quick.short) list = list.filter((a) => a.durationMin <= 10);
  if (quick.beginner) list = list.filter((a) => a.skillLevel === 'beginner' || a.skillLevel === 'all');
  if (quick.preRound) list = list.filter((a) => a.tags.includes('pre-round') || a.type === 'warmup');

  // Group by type when showing everything; single group when a type is picked.
  const groups =
    type === 'all'
      ? ACTIVITY_TYPES.map((t) => ({ label: ACTIVITY_TYPE_LABEL[t], items: list.filter((a) => a.type === t) })).filter((g) => g.items.length)
      : [{ label: ACTIVITY_TYPE_LABEL[type], items: list }];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 58, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 16 }}>
          <Wordmark height={26} />
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 2 }}>{ACTIVITIES.length} activities for your golf</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink }}>Library</Text>
      </View>

      {/* type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4 }}>
        {TYPE_CHIPS.map((c) => <Chip key={c.key} label={c.label} active={type === c.key} onPress={() => setType(c.key)} />)}
      </ScrollView>

      {/* quick filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        {QUICK.map((q) => <Chip key={q.key} label={q.label} active={quick[q.key]} onPress={() => toggleQuick(q.key)} />)}
      </ScrollView>

      {/* results */}
      {list.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink50, textAlign: 'center' }}>No activities match those filters. Try clearing a filter.</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 26 }}>
          {groups.map((g) => (
            <View key={g.label}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 4, marginBottom: 13 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.ink }}>{g.label}</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border08 }} />
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink40 }}>{g.items.length}</Text>
              </View>
              <View style={{ gap: 11 }}>
                {g.items.map((a) => <ActivityCard key={a.id} activity={a} onPress={() => onOpen(a.id)} />)}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
