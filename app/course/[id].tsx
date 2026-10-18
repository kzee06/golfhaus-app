// Course detail — holes, pars (editable), GPS availability, favourite, play.
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Pad, Button, Card, Muted, SectionLabel, Divider } from '../../src/ui';
import { useApp } from '../../src/data/AppState';
import { fetchCourse, bareCourse, hasGps } from '../../src/data/courses/overpass';
import { Course, CourseSummary } from '../../src/domain/types';
import { fmtDistance, unitLabel } from '../../src/gps/geo';
import { Icon, ChevronLeft } from '../../src/Icon';
import { fonts, useTheme, TAP } from '../../src/theme';

export default function CourseDetail() {
  const router = useRouter();
  const t = useTheme();
  const p = useLocalSearchParams<{ id: string; name?: string; lat?: string; lng?: string; city?: string; country?: string; externalId?: string; source?: string }>();
  const { courses, favourites, golfer, upsertCourse, toggleFavourite, touchRecent } = useApp();
  const cached = courses[p.id];
  const [course, setCourse] = useState<Course | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [err, setErr] = useState<string | null>(null);

  const summary: CourseSummary | null = useMemo(() => (p.name && p.lat && p.lng ? {
    id: p.id, name: p.name, location: { lat: Number(p.lat), lng: Number(p.lng) }, city: p.city || undefined, country: p.country || undefined,
    source: (p.source as CourseSummary['source']) || 'osm', externalId: p.externalId || undefined,
  } : null), [p.id, p.name, p.lat, p.lng, p.city, p.country, p.source, p.externalId]);

  useEffect(() => {
    if (cached) { setCourse(cached); setLoading(false); return; }
    if (!summary) { setLoading(false); setErr('Course not found.'); return; }
    let on = true;
    (async () => {
      try {
        const c = await fetchCourse(summary);
        if (!on) return;
        upsertCourse(c); setCourse(c);
      } catch {
        if (!on) return;
        const c = bareCourse(summary); upsertCourse(c); setCourse(c);
        setErr('Hole map unavailable right now — pars default to 4 until you edit them.');
      } finally { if (on) setLoading(false); }
    })();
    return () => { on = false; };
  }, [p.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setPar = (n: number, delta: number) => {
    if (!course) return;
    const next: Course = { ...course, holes: course.holes.map((h) => (h.number === n ? { ...h, par: Math.max(3, Math.min(6, h.par + delta)) } : h)), updatedAt: new Date().toISOString() };
    setCourse(next); upsertCourse(next);
  };

  const gpsHoles = course ? course.holes.filter((h) => !!h.geometry?.green).length : 0;
  const fav = favourites.includes(p.id);
  const tee = course?.tees[0];

  return (
    <Screen>
      <Pad style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={20} color={t.text2} /><Text style={{ fontFamily: fonts.body, fontSize: 15, color: t.text2 }}>Back</Text>
        </Pressable>
        {course && (
          <Pressable onPress={() => toggleFavourite(p.id)} hitSlop={10} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: fav ? t.ink : t.card, borderWidth: 1, borderColor: fav ? t.ink : t.border12, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="heart" size={18} color={fav ? t.onInk : t.text} />
          </Pressable>
        )}
      </Pad>

      {loading ? (
        <Pad style={{ paddingTop: 40, alignItems: 'center' }}><ActivityIndicator color={t.text4} /><Muted style={{ marginTop: 12 }}>Loading hole map from OpenStreetMap…</Muted></Pad>
      ) : !course ? (
        <Pad><Muted>{err ?? 'Course not found.'}</Muted></Pad>
      ) : (
        <>
          <Pad>
            <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: t.text }}>{course.name}</Text>
            <Muted style={{ marginTop: 4 }}>{[course.city, course.country].filter(Boolean).join(', ') || 'Location not set'} · {course.holes.length} holes</Muted>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <Badge label={course.source === 'osm' ? 'OpenStreetMap data' : course.source === 'manual' ? 'Created by you' : 'Verified'} />
              <Badge label={hasGps(course) ? `GPS on ${gpsHoles} of ${course.holes.length} holes` : 'No GPS geometry yet'} />
              {!course.verified && <Badge label="Community data — check pars" />}
            </View>
            {err && <Muted style={{ marginTop: 10 }}>{err}</Muted>}
          </Pad>

          <Pad style={{ marginTop: 18 }}>
            <Button label="Play this course" onPress={() => { touchRecent(course.id); router.push({ pathname: '/round/new', params: { courseId: course.id } }); }} />
          </Pad>

          <SectionLabel right={<Muted>Tap +/− to fix a par</Muted>}>Holes</SectionLabel>
          <Pad>
            <Card soft style={{ paddingVertical: 4, paddingHorizontal: 12 }}>
              {course.holes.map((h, i) => {
                const d = tee?.holes.find((x) => x.hole === h.number)?.distanceM;
                return (
                  <View key={h.number}>
                    {i > 0 && <Divider />}
                    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: TAP, gap: 12 }}>
                      <Text style={{ width: 30, fontFamily: fonts.display, fontSize: 17, color: t.text }}>{h.number}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: t.text3 }}>
                          {d ? `${fmtDistance(d, golfer.units)} ${unitLabel(golfer.units)}` : 'Distance unknown'}{h.strokeIndex ? ` · SI ${h.strokeIndex}` : ''}{h.geometry?.green ? ' · GPS' : ''}
                        </Text>
                      </View>
                      <Pressable onPress={() => setPar(h.number, -1)} hitSlop={6} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.border12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: fonts.display, fontSize: 18, color: t.text }}>−</Text></Pressable>
                      <Text style={{ width: 44, textAlign: 'center', fontFamily: fonts.display, fontSize: 17, color: t.text }}>Par {h.par}</Text>
                      <Pressable onPress={() => setPar(h.number, 1)} hitSlop={6} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.border12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: fonts.display, fontSize: 18, color: t.text }}>+</Text></Pressable>
                    </View>
                  </View>
                );
              })}
            </Card>
          </Pad>

          <Pad style={{ marginTop: 18 }}>
            <Button label="Report incorrect course data" variant="ghost" size="md" onPress={() => Alert.alert('Thanks for flagging it', 'You can fix pars right here, and they\'re saved for your rounds. Shared corrections and verification arrive with accounts in the next release.')} />
            <Muted style={{ textAlign: 'center', marginTop: 6, fontSize: 12.5 }}>Map data © OpenStreetMap contributors (ODbL)</Muted>
          </Pad>
        </>
      )}
    </Screen>
  );
}

function Badge({ label }: { label: string }) {
  const t = useTheme();
  return <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.3, color: t.text, backgroundColor: t.fill06, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9, overflow: 'hidden' }}>{label}</Text>;
}
