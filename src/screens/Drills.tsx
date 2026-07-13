import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { allDrills, Drill } from '../data';
import { ChevronRight } from '../Icon';
import { Wordmark } from '../ui';

const GROUP_ORDER = ['Short Game', 'Putting', 'Driving', 'Irons', 'Setup & Tempo'];
const CHIPS = ['All', 'Short Game', 'Putting', 'Driving', 'Setup'];

export default function Drills({ onOpen }: { onOpen: (id: string) => void }) {
  const all = allDrills();
  const groups = GROUP_ORDER.map((skill) => ({
    skill,
    items: all.filter((d) => d.skill === skill),
  })).filter((g) => g.items.length);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 58, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 16 }}>
          <Wordmark height={26} />
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 2 }}>{all.length} drills, built for you</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink }}>Drill Library</Text>
      </View>

      {/* filter chips (visual) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4 }}>
        {CHIPS.map((label, i) => (
          <View key={label} style={{ paddingVertical: 9, paddingHorizontal: 15, borderRadius: 14, backgroundColor: i === 0 ? colors.ink : colors.white, borderWidth: 1, borderColor: i === 0 ? colors.ink : colors.border12 }}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: i === 0 ? colors.white : colors.ink55 }}>{label}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 26 }}>
        {groups.map((g) => (
          <View key={g.skill}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 4, marginBottom: 13 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.ink }}>{g.skill}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border08 }} />
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink40 }}>{g.items.length}{g.items.length === 1 ? ' drill' : ' drills'}</Text>
            </View>
            <View style={{ gap: 11 }}>
              {g.items.map((d) => (
                <DrillRow key={d.id} d={d} onPress={() => onOpen(d.id)} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function DrillRow({ d, onPress }: { d: Drill; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 11, flexDirection: 'row', gap: 13, alignItems: 'center' }, shadow.cardSoft]}>
      <View style={{ width: 72, height: 72, borderRadius: 15, overflow: 'hidden', backgroundColor: colors.ink }}>
        <Image source={d.img} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: colors.ink }}>{d.name}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: colors.ink50, marginTop: 3 }}>{d.sub}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 9 }}>
          <Text style={pillTag}>{d.duration}</Text>
          <Text style={pillTag}>{d.difficulty}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.ink30} />
    </Pressable>
  );
}

const pillTag = {
  fontFamily: fonts.displaySemi,
  fontSize: 11,
  color: 'rgba(20,20,20,0.6)',
  backgroundColor: colors.fill05,
  paddingVertical: 3,
  paddingHorizontal: 8,
  borderRadius: 7,
  overflow: 'hidden' as const,
};
