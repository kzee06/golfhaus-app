import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Svg, { Polyline, Line, Circle } from 'react-native-svg';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon } from '../Icon';
import { Wordmark } from '../ui';
import { SkillRadar, RadarAxis } from '../Charts';
import {
  SessionRecord, FEEL_LABEL, relativeDay, recentSessions, sessionsThisWeek,
  totalSessions, totalMinutes, skillTrends, hasScores, SkillTrend,
} from '../progress';
import { PlanSession } from '../plan';

// Normalise a raw drill score into a 0..1 strength for the radar. Hitting the
// target reads as ~0.8 of the web, with headroom above for beating it.
function strength(value: number, target: number, better: 'higher' | 'lower'): number {
  const t = target || 1;
  const s = better === 'lower' ? (t / Math.max(value, 0.5)) * 0.8 : (value / t) * 0.8;
  return Math.max(0.08, Math.min(1, s));
}

// Short axis labels so they don't clip at the edges of the radar.
const SKILL_SHORT: Record<string, string> = {
  'Iron play': 'Irons', Chipping: 'Chip', Putting: 'Putt', Driving: 'Drive',
  'Bunker play': 'Bunker', 'Setup & Tempo': 'Setup', Pitching: 'Pitch', 'Shot shaping': 'Shape',
};

// Build radar axes (now = latest, then = first attempt) from the skill trends.
function radarAxes(trends: SkillTrend[]): RadarAxis[] {
  return trends.map((t) => ({
    label: SKILL_SHORT[t.category] ?? t.category,
    now: strength(t.latest, t.target, t.better),
    then: strength(t.points[0].value, t.target, t.better),
  }));
}

const KIND_ICON: Record<PlanSession['kind'], string> = { balanced: 'target', quick: 'zap', body: 'dumbbell' };
const KIND_LABEL: Record<PlanSession['kind'], string> = { balanced: 'Balanced', quick: 'Quick', body: 'Golf body' };

export default function Progress({ streak, sessions }: { streak: number; sessions: SessionRecord[] }) {
  const now = new Date();
  const thisWeek = sessionsThisWeek(sessions, now);
  const total = totalSessions(sessions);
  const minutes = totalMinutes(sessions);
  const recent = recentSessions(sessions, 8);
  const trends = skillTrends(sessions);
  const axes = radarAxes(trends);
  const showRadar = axes.length >= 3;
  const anyImproved = trends.some((t) => t.delta !== null && (t.better === 'lower' ? t.delta < 0 : t.delta > 0));
  const hasData = total > 0;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 58, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 16 }}>
          <Wordmark height={34} />
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

          {/* game-by-area radar — the "spider web", driven by real scores */}
          {showRadar && (
            <View style={[{ marginHorizontal: 20, marginTop: 22, paddingTop: 18, paddingHorizontal: 16, paddingBottom: 14, borderRadius: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }, shadow.card]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingBottom: 4 }}>
                <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink }}>Your game, by area</Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink45 }}>{axes.length} skills</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <SkillRadar axes={axes} size={300} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, paddingTop: 6 }}>
                <Legend swatch={<View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: colors.ink }} />} label="Now" />
                <Legend swatch={<View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: 'rgba(20,20,20,0.35)' }} />} label="First attempt" />
              </View>
            </View>
          )}

          {/* radar teaser — visible before there are enough scores to plot it */}
          {!showRadar && (
            <View style={[{ marginHorizontal: 20, marginTop: 22, padding: 20, borderRadius: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }, shadow.card]}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink, alignSelf: 'flex-start', marginBottom: 14 }}>Your game, by area</Text>
              <View style={{ opacity: 0.35, marginBottom: 12 }}>
                <SkillRadar axes={[{ label: 'Putt', now: 0.55, then: 0.3 }, { label: 'Irons', now: 0.7, then: 0.45 }, { label: 'Chip', now: 0.5, then: 0.35 }, { label: 'Drive', now: 0.62, then: 0.4 }]} size={220} />
              </View>
              <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.ink55, textAlign: 'center', maxWidth: 300 }}>
                Log a score on <Text style={{ fontFamily: fonts.bodySemi, color: colors.ink }}>3 different skills</Text> to build your strength web. {axes.length} of 3 so far — you'll get the option to log results when you finish a drill in a session.
              </Text>
            </View>
          )}

          {/* skill scores — real per-drill trends from logged results */}
          {hasScores(sessions) && (
            <>
              <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
                <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: colors.ink50, letterSpacing: 0.6, textTransform: 'uppercase' }}>Skill scores</Text>
              </View>
              <View style={{ paddingHorizontal: 20, gap: 12 }}>
                {trends.map((t) => <SkillCard key={t.category} t={t} />)}
              </View>
            </>
          )}

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

function Sparkline({ t, width, height }: { t: SkillTrend; width: number; height: number }) {
  const vals = t.points.map((p) => p.value);
  // Frame the chart around the data and the target so the target line is visible.
  const lo = Math.min(...vals, t.target);
  const hi = Math.max(...vals, t.target);
  const span = hi - lo || 1;
  const pad = 6;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const x = (i: number) => (t.points.length <= 1 ? pad + w / 2 : pad + (i / (t.points.length - 1)) * w);
  // Higher-is-better → larger value sits higher (smaller y).
  const y = (v: number) => {
    const frac = (v - lo) / span; // 0..1 low..high
    const up = t.better === 'lower' ? 1 - frac : frac;
    return pad + (1 - up) * h;
  };
  const ty = y(t.target);
  const pts = t.points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
  const last = t.points[t.points.length - 1];

  return (
    <Svg width={width} height={height}>
      {/* target line */}
      <Line x1={pad} y1={ty} x2={width - pad} y2={ty} stroke="rgba(20,20,20,0.28)" strokeWidth={1} strokeDasharray="3 3" />
      {t.points.length > 1 && <Polyline points={pts} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
      {t.points.map((p, i) => (
        <Circle key={i} cx={x(i)} cy={y(p.value)} r={i === t.points.length - 1 ? 3.5 : 2} fill={colors.ink} />
      ))}
      {/* emphasise the latest point */}
      <Circle cx={x(t.points.length - 1)} cy={y(last.value)} r={5} fill="none" stroke={colors.ink} strokeWidth={1.5} />
    </Svg>
  );
}

function SkillCard({ t }: { t: SkillTrend }) {
  const attempts = t.points.length;
  const deltaTxt =
    t.delta === null || t.delta === 0
      ? null
      : `${t.delta > 0 ? '+' : ''}${t.delta} vs last`;
  const improving = t.delta !== null && (t.better === 'lower' ? t.delta < 0 : t.delta > 0);

  return (
    <View style={[{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 16 }, shadow.cardSoft]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: colors.ink }} numberOfLines={1}>{t.category}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50, marginTop: 1 }} numberOfLines={1}>{t.activityTitle}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.ink, letterSpacing: -0.5 }}>
            {t.latest}<Text style={{ fontFamily: fonts.bodyMed, fontSize: 14, color: colors.ink45 }}> / {t.target}</Text>
          </Text>
          {t.hitTarget && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Icon name="target" size={13} color={colors.ink} />
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: colors.ink }}>On target</Text>
            </View>
          )}
        </View>
      </View>

      <Sparkline t={t} width={280} height={56} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.ink50 }}>{attempts} {attempts === 1 ? 'attempt' : 'attempts'}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.ink50 }}>Best {t.best}</Text>
        {deltaTxt && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <Icon name={improving ? 'trendUp' : 'trendDown'} size={14} color={colors.ink} />
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.ink }}>{deltaTxt}</Text>
          </View>
        )}
      </View>
    </View>
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
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink50, marginBottom: 6 }} numberOfLines={1}>{label}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink }}>
        {value} <Text style={{ fontFamily: fonts.bodyMed, fontSize: 15, color: colors.ink50 }}>{unit}</Text>
      </Text>
    </View>
  );
}
