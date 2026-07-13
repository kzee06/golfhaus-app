import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { recent, recentIco } from '../data';
import { Icon } from '../Icon';
import { Wordmark } from '../ui';
import { Radar, TrendChart } from '../Charts';

export default function Progress({ streak }: { streak: number }) {
  const { width } = useWindowDimensions();
  const frameW = Math.min(width, 402);
  const trendW = frameW - 40 - 36; // screen minus card margins(20*2) minus card padding(18*2)

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 58, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 16 }}>
          <Wordmark height={26} />
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 2 }}>The last 6 weeks</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink }}>Your Progress</Text>
      </View>

      {/* momentum callout */}
      <View style={{ marginHorizontal: 20, marginTop: 20, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <Icon name="trendUp" size={22} color={colors.ink} />
        <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.ink }}>
          <Text style={{ fontFamily: fonts.bodyBold }}>Short game up 14%</Text> this month. That's where it counts — keep it rolling.
        </Text>
      </View>

      {/* radar */}
      <View style={[{ marginHorizontal: 20, marginTop: 22, paddingTop: 20, paddingHorizontal: 16, paddingBottom: 14, borderRadius: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }, shadow.card]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingBottom: 8 }}>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink }}>Your game, by area</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink45 }}>vs. 4 weeks ago</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Radar />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, paddingTop: 6 }}>
          <Legend swatch={<View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: colors.ink }} />} label="Now" />
          <Legend swatch={<View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: 'rgba(20,20,20,0.35)' }} />} label="Then" />
        </View>
      </View>

      {/* stat row */}
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 14 }}>
        <StatCard label="Current streak" value={String(streak)} unit="days" />
        <StatCard label="Sessions this week" value="4" unit="/ 5" />
      </View>

      {/* handicap trend */}
      <View style={[{ marginHorizontal: 20, marginTop: 12, padding: 18, borderRadius: radius.card, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }, shadow.card]}>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50 }}>Handicap trend</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink, marginTop: 2 }}>
            24 <Text style={{ fontFamily: fonts.displaySemi, fontSize: 14, color: colors.ink }}>▾ 4 since May</Text>
          </Text>
        </View>
        <TrendChart width={trendW} />
      </View>

      {/* recent sessions */}
      <View style={{ paddingHorizontal: 24, paddingTop: 22, paddingBottom: 8 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: colors.ink50, letterSpacing: 0.6, textTransform: 'uppercase' }}>Recent sessions</Text>
      </View>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {recent.map((r, i) => (
          <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16 }, shadow.cardSoft]}>
            <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: colors.fill10, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={recentIco[i] || 'flag'} size={18} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink }}>{r.title}</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50, marginTop: 1 }}>{r.meta}</Text>
            </View>
            <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.ink }}>{r.score}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      {swatch}
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: 'rgba(20,20,20,0.6)' }}>{label}</Text>
    </View>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 16 }, shadow.cardSoft]}>
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50, marginBottom: 6 }}>{label}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink }}>
        {value} <Text style={{ fontFamily: fonts.bodyMed, fontSize: 15, color: colors.ink50 }}>{unit}</Text>
      </Text>
    </View>
  );
}
