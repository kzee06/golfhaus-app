import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon } from '../Icon';
import { Wordmark } from '../ui';
import {
  SessionRecord, FEEL_LABEL, relativeDay, recentSessions, sessionsThisWeek,
  totalSessions, totalMinutes,
} from '../progress';
import { PlanSession } from '../plan';

const KIND_ICON: Record<PlanSession['kind'], string> = { balanced: 'target', quick: 'zap', body: 'dumbbell' };
const KIND_LABEL: Record<PlanSession['kind'], string> = { balanced: 'Balanced', quick: 'Quick', body: 'Golf body' };

export default function Progress({ streak, sessions }: { streak: number; sessions: SessionRecord[] }) {
  const now = new Date();
  const thisWeek = sessionsThisWeek(sessions, now);
  const total = totalSessions(sessions);
  const minutes = totalMinutes(sessions);
  const recent = recentSessions(sessions, 8);
  const hasData = total > 0;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 58, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 16 }}>
          <Wordmark height={26} />
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 2 }}>
          {hasData ? `${total} ${total === 1 ? 'session' : 'sessions'} logged` : 'Every session counts'}
        </Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink }}>Your Progress</Text>
      </View>

      {!hasData ? (
        <View style={{ marginHorizontal: 20, marginTop: 22, padding: 26, borderRadius: radius.cardLg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.fill10, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icon name="trendUp" size={26} color={colors.ink} />
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginBottom: 8, textAlign: 'center', letterSpacing: -0.4 }}>No sessions yet</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink55, textAlign: 'center', maxWidth: 280 }}>
            Finish today's plan and it'll show up here — your streak, your minutes, and every session you complete.
          </Text>
        </View>
      ) : (
        <>
          {/* momentum callout — real streak */}
          <View style={{ marginHorizontal: 20, marginTop: 20, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border18, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
            <Icon name="flame" size={22} color={colors.ink} />
            <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.ink }}>
              {streak > 1
                ? <><Text style={{ fontFamily: fonts.bodyBold }}>{streak}-day streak.</Text> You're building a real habit — keep it rolling.</>
                : <><Text style={{ fontFamily: fonts.bodyBold }}>You're on the board.</Text> Come back tomorrow to start a streak.</>}
            </Text>
          </View>

          {/* stat grid */}
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 14 }}>
            <StatCard label="Current streak" value={String(streak)} unit={streak === 1 ? 'day' : 'days'} />
            <StatCard label="Sessions this week" value={String(thisWeek)} unit={thisWeek === 1 ? 'session' : 'sessions'} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12 }}>
            <StatCard label="Sessions all-time" value={String(total)} unit={total === 1 ? 'done' : 'done'} />
            <StatCard label="Minutes trained" value={String(minutes)} unit="min" />
          </View>

          {/* recent sessions */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: colors.ink50, letterSpacing: 0.6, textTransform: 'uppercase' }}>Recent sessions</Text>
          </View>
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {recent.map((r) => (
              <View key={r.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16 }, shadow.cardSoft]}>
                <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: colors.fill10, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={KIND_ICON[r.kind]} size={18} color={colors.ink} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink }} numberOfLines={1}>{r.focus}</Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50, marginTop: 1 }}>
                    {relativeDay(r.date, now)} · {r.activityCount} {r.activityCount === 1 ? 'activity' : 'activities'} · {r.totalMin} min
                  </Text>
                </View>
                {r.feel && (
                  <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.3, color: colors.ink, backgroundColor: colors.fill06, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 9, overflow: 'hidden' }}>{FEEL_LABEL[r.feel]}</Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 16 }, shadow.cardSoft]}>
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50, marginBottom: 6 }} numberOfLines={1}>{label}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink }}>
        {value} <Text style={{ fontFamily: fonts.bodyMed, fontSize: 15, color: colors.ink50 }}>{unit}</Text>
      </Text>
    </View>
  );
}
