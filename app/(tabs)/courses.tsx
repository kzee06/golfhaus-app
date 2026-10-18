// Courses — search by name, find nearby via GPS, favourites and recents.
// Data from OpenStreetMap (ODbL); courses can also be created by hand.
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Pad, Header, SectionLabel, Muted, Button, Card } from '../../src/ui';
import { CourseRow } from '../../src/components';
import { useApp } from '../../src/data/AppState';
import { searchCoursesByName, coursesNearby, manualCourse } from '../../src/data/courses/overpass';
import { currentPosition } from '../../src/gps/useLocation';
import { CourseSummary } from '../../src/domain/types';
import { fonts, useTheme } from '../../src/theme';

export default function Courses() {
  const router = useRouter();
  const t = useTheme();
  const { courses, favourites, recents, golfer, upsertCourse, touchRecent } = useApp();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<CourseSummary[] | null>(null);
  const [nearby, setNearby] = useState<CourseSummary[] | null>(null);
  const [busy, setBusy] = useState<'search' | 'nearby' | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  // Debounced name search.
  useEffect(() => {
    abort.current?.abort();
    if (q.trim().length < 2) { setResults(null); setBusy(null); return; }
    const ac = new AbortController(); abort.current = ac;
    setBusy('search'); setErr(null);
    const id = setTimeout(async () => {
      try { setResults(await searchCoursesByName(q, ac.signal)); }
      catch (e) { if (!ac.signal.aborted) setErr('Search is unavailable right now.'); }
      finally { if (!ac.signal.aborted) setBusy(null); }
    }, 450);
    return () => { clearTimeout(id); ac.abort(); };
  }, [q]);

  const findNearby = async () => {
    setBusy('nearby'); setErr(null);
    const pos = await currentPosition();
    if (!pos) { setErr('Location permission is needed to find courses near you.'); setBusy(null); return; }
    try { setNearby(await coursesNearby(pos, 40000)); }
    catch { setErr('Could not load nearby courses.'); }
    finally { setBusy(null); }
  };

  const open = (c: CourseSummary) => router.push({ pathname: '/course/[id]', params: { id: c.id, name: c.name, lat: String(c.location.lat), lng: String(c.location.lng), city: c.city ?? '', country: c.country ?? '', externalId: c.externalId ?? '', source: c.source } });

  const createManual = () => {
    const name = q.trim() || 'My course';
    const c = manualCourse(name, null);
    upsertCourse(c); touchRecent(c.id);
    router.push({ pathname: '/course/[id]', params: { id: c.id } });
  };

  const favs = favourites.map((id) => courses[id]).filter(Boolean);
  const recs = recents.map((id) => courses[id]).filter(Boolean).filter((c) => !favourites.includes(c.id));
  const showingSearch = q.trim().length >= 2;

  return (
    <Screen>
      <Header eyebrow="Find somewhere to play" title="Courses" />
      <Pad>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderWidth: 1, borderColor: t.border12, borderRadius: 16, paddingHorizontal: 16, backgroundColor: t.card }}>
          <TextInput value={q} onChangeText={setQ} placeholder="Search by course name" placeholderTextColor={t.text4} autoCorrect={false} style={{ flex: 1, fontFamily: fonts.body, fontSize: 16, color: t.text }} returnKeyType="search" />
          {busy === 'search' ? <ActivityIndicator color={t.text4} /> : q ? <Pressable onPress={() => setQ('')} hitSlop={10}><Text style={{ fontFamily: fonts.bodySemi, color: t.text3 }}>Clear</Text></Pressable> : null}
        </View>
        {!showingSearch && (
          <View style={{ marginTop: 10 }}>
            <Button label={busy === 'nearby' ? 'Finding courses near you…' : 'Courses near me'} variant="secondary" size="md" onPress={findNearby} disabled={busy === 'nearby'} />
          </View>
        )}
        {err && <Muted style={{ marginTop: 10 }}>{err}</Muted>}
      </Pad>

      {showingSearch && (
        <>
          <SectionLabel>Results</SectionLabel>
          <Pad>
            {((results && results.length === 0) || err) && busy !== 'search' && (
              <Card soft>
                <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: t.text }}>{err ? 'Course search is unavailable right now' : `No course named “${q.trim()}” found`}</Text>
                <Muted style={{ marginTop: 4, marginBottom: 12 }}>{err ? 'OpenStreetMap isn’t responding. Create the course by hand and you can score there today.' : 'We search OpenStreetMap. You can create it by hand and score there today.'}</Muted>
                <Button label="Create this course" size="md" variant="secondary" onPress={createManual} />
              </Card>
            )}
            {results?.map((c) => <CourseRow key={c.id} c={c} units={golfer.units} onPress={() => open(c)} />)}
          </Pad>
        </>
      )}

      {!showingSearch && nearby && (
        <>
          <SectionLabel>Near you</SectionLabel>
          <Pad>
            {nearby.length === 0 ? <Muted>No mapped courses within 40 km.</Muted> : nearby.map((c) => <CourseRow key={c.id} c={c} units={golfer.units} onPress={() => open(c)} />)}
          </Pad>
        </>
      )}

      {!showingSearch && favs.length > 0 && (
        <>
          <SectionLabel>Favourites</SectionLabel>
          <Pad>{favs.map((c) => <CourseRow key={c.id} c={{ id: c.id, name: c.name, location: c.location, city: c.city, country: c.country, source: c.source }} onPress={() => router.push({ pathname: '/course/[id]', params: { id: c.id } })} />)}</Pad>
        </>
      )}

      {!showingSearch && recs.length > 0 && (
        <>
          <SectionLabel>Recent</SectionLabel>
          <Pad>{recs.map((c) => <CourseRow key={c.id} c={{ id: c.id, name: c.name, location: c.location, city: c.city, country: c.country, source: c.source }} onPress={() => router.push({ pathname: '/course/[id]', params: { id: c.id } })} />)}</Pad>
        </>
      )}

      {!showingSearch && !nearby && favs.length === 0 && recs.length === 0 && (
        <Pad style={{ marginTop: 26 }}>
          <Muted style={{ textAlign: 'center' }}>Search for your course, or find ones near you. Course data © OpenStreetMap contributors.</Muted>
        </Pad>
      )}
      {!showingSearch && (
        <Pad style={{ marginTop: 26 }}>
          <Button label="Create a course by hand" variant="ghost" size="md" onPress={createManual} />
        </Pad>
      )}
    </Screen>
  );
}
