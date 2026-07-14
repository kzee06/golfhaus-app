import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, shadow } from '../theme';
import { CheckIcon } from '../Icon';
import { Wordmark } from '../ui';
import ActivityCard from '../components/ActivityCard';
import {
  ACTIVITIES,
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABEL,
  ActivityType,
  GOALS,
  GOAL_LABEL,
  isNoEquipment,
} from '../content';

type Opt = { key: string; label: string };

const TYPE_OPTS: Opt[] = [{ key: 'all', label: 'All types' }, ...ACTIVITY_TYPES.map((t) => ({ key: t, label: ACTIVITY_TYPE_LABEL[t] }))];
const FOCUS_OPTS: Opt[] = [{ key: 'all', label: 'All goals' }, ...GOALS.map((g) => ({ key: g, label: GOAL_LABEL[g] }))];
const DURATION_OPTS: Opt[] = [{ key: 'any', label: 'Any length' }, { key: '5', label: '5 min or less' }, { key: '10', label: '10 min or less' }, { key: '20', label: '20 min or less' }];
const EQUIP_OPTS: Opt[] = [{ key: 'any', label: 'Any equipment' }, { key: 'none', label: 'No equipment' }];

type FilterId = 'type' | 'focus' | 'duration' | 'equipment';
const FILTERS: { id: FilterId; label: string; sheetTitle: string; opts: Opt[]; defaultKey: string }[] = [
  { id: 'type', label: 'Type', sheetTitle: 'Filter by type', opts: TYPE_OPTS, defaultKey: 'all' },
  { id: 'focus', label: 'Focus', sheetTitle: 'Filter by golf goal', opts: FOCUS_OPTS, defaultKey: 'all' },
  { id: 'duration', label: 'Time', sheetTitle: 'Filter by length', opts: DURATION_OPTS, defaultKey: 'any' },
  { id: 'equipment', label: 'Kit', sheetTitle: 'Filter by equipment', opts: EQUIP_OPTS, defaultKey: 'any' },
];

function ChevronDown({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Dropdown trigger — a pill showing "Label  Value  ⌄". Ink-filled when a
// non-default value is chosen so active filters read at a glance.
function DropdownPill({ label, value, active, onPress }: { label: string; value: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 14, backgroundColor: active ? colors.ink : colors.white, borderWidth: 1, borderColor: active ? colors.ink : colors.border12 }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: active ? 'rgba(255,255,255,0.6)' : colors.ink45 }}>{label}</Text>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13.5, color: active ? colors.white : colors.ink }}>{value}</Text>
      <ChevronDown color={active ? 'rgba(255,255,255,0.7)' : colors.ink45} />
    </Pressable>
  );
}

export default function Library({ onOpen }: { onOpen: (id: string) => void }) {
  const [sel, setSel] = useState<Record<FilterId, string>>({ type: 'all', focus: 'all', duration: 'any', equipment: 'any' });
  const [openFilter, setOpenFilter] = useState<FilterId | null>(null);

  const active = FILTERS.find((f) => f.id === openFilter) || null;
  const valueLabel = (id: FilterId) => FILTERS.find((f) => f.id === id)!.opts.find((o) => o.key === sel[id])?.label ?? '';
  const isActive = (id: FilterId) => sel[id] !== FILTERS.find((f) => f.id === id)!.defaultKey;
  const anyActive = FILTERS.some((f) => isActive(f.id));

  let list = ACTIVITIES.slice();
  if (sel.type !== 'all') list = list.filter((a) => a.type === (sel.type as any));
  if (sel.focus !== 'all') list = list.filter((a) => a.goals.includes(sel.focus as any));
  if (sel.duration !== 'any') { const max = Number(sel.duration); list = list.filter((a) => a.durationMin <= max); }
  if (sel.equipment === 'none') list = list.filter(isNoEquipment);

  const groups =
    sel.type === 'all'
      ? ACTIVITY_TYPES.map((t) => ({ label: ACTIVITY_TYPE_LABEL[t], items: list.filter((a) => a.type === t) })).filter((g) => g.items.length)
      : [{ label: ACTIVITY_TYPE_LABEL[sel.type as ActivityType], items: list }];

  return (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 58, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ marginBottom: 16 }}>
            <Wordmark height={26} />
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 2 }}>{list.length} activities for your golf</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink }}>Library</Text>
        </View>

        {/* dropdown filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4 }}>
          {FILTERS.map((f) => (
            <DropdownPill key={f.id} label={f.label} value={valueLabel(f.id)} active={isActive(f.id)} onPress={() => setOpenFilter(f.id)} />
          ))}
        </ScrollView>

        {anyActive && (
          <Pressable onPress={() => setSel({ type: 'all', focus: 'all', duration: 'any', equipment: 'any' })} style={{ paddingHorizontal: 24, paddingTop: 10 }}>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.ink55 }}>Clear filters</Text>
          </Pressable>
        )}

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

      {/* option sheet (shared bottom-sheet menu for the active dropdown) */}
      <Modal visible={active != null} transparent animationType="slide" onRequestClose={() => setOpenFilter(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,20,20,0.35)', justifyContent: 'flex-end' }} onPress={() => setOpenFilter(null)}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.canvas, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingBottom: 34, maxHeight: '72%' }}>
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border12 }} />
            </View>
            {active && (
              <>
                <Text style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.4, color: colors.ink, paddingHorizontal: 24, marginBottom: 6 }}>{active.sheetTitle}</Text>
                <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  {active.opts.map((o) => {
                    const on = sel[active.id] === o.key;
                    return (
                      <Pressable key={o.key} onPress={() => { setSel((s) => ({ ...s, [active.id]: o.key })); setOpenFilter(null); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14, backgroundColor: on ? colors.fill06 : 'transparent' }}>
                        <Text style={{ flex: 1, fontFamily: on ? fonts.displaySemi : fonts.body, fontSize: 16, color: colors.ink }}>{o.label}</Text>
                        {on && (
                          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
                            <CheckIcon size={12} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
