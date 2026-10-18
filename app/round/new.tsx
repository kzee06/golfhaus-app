// New round — course → tees → holes → players → start. Three taps when the
// course is already known.
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Pad, Button, Card, Chip, Muted, SectionLabel, Row, Divider } from '../../src/ui';
import { useApp, activeRound } from '../../src/data/AppState';
import { Course, Round, RoundPlayer, newId } from '../../src/domain/types';
import { fonts, useTheme } from '../../src/theme';
import { ChevronLeft, CheckIcon } from '../../src/Icon';

export default function NewRound() {
  const router = useRouter();
  const t = useTheme();
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const { courses, favourites, recents, golfer, rounds, upsertRound, touchRecent } = useApp();
  const live = activeRound(rounds);

  const [selectedId, setSelectedId] = useState<string | null>(courseId ?? null);
  const course: Course | undefined = selectedId ? courses[selectedId] : undefined;
  const [teeId, setTeeId] = useState<string | null>(null);
  const [mode, setMode] = useState<'18' | 'front' | 'back'>('18');
  const [guests, setGuests] = useState<string[]>([]);
  const [guestName, setGuestName] = useState('');

  const pickable = useMemo(() => [...favourites, ...recents].filter((id, i, a) => a.indexOf(id) === i).map((id) => courses[id]).filter(Boolean), [favourites, recents, courses]);
  const nineOnly = (course?.holes.length ?? 18) <= 9;
  const tee = course?.tees.find((x) => x.id === teeId) ?? course?.tees[0];

  // Guard against a fast double-tap creating two rounds before navigation.
  const starting = useRef(false);
  const start = () => {
    if (!course || starting.current) return;
    starting.current = true;
    const holeCount: 9 | 18 = nineOnly || mode !== '18' ? 9 : 18;
    const startHole: 1 | 10 = mode === 'back' && !nineOnly ? 10 : 1;
    const me: RoundPlayer = { id: 'me', name: golfer.name || 'You', isMe: true, userId: null, scores: {} };
    const others: RoundPlayer[] = guests.map((n) => ({ id: newId(), name: n, isMe: false, userId: null, scores: {} }));
    const now = new Date().toISOString();
    const round: Round = {
      id: newId(),
      course: {
        courseId: course.id, name: course.name, teeId: tee?.id, teeName: tee?.name,
        holes: course.holes.map((h) => ({ number: h.number, par: h.par, strokeIndex: h.strokeIndex, distanceM: tee?.holes.find((x) => x.hole === h.number)?.distanceM })),
      },
      holeCount, startHole, startedAt: now, status: 'active', visibility: 'private', revision: 1,
      players: [me, ...others], scorekeeperId: 'me', updatedAt: now,
    };
    upsertRound(round); touchRecent(course.id);
    router.replace(`/round/${round.id}`);
  };

  return (
    <Screen>
      <Pad style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={20} color={t.text2} /><Text style={{ fontFamily: fonts.body, fontSize: 15, color: t.text2 }}>Cancel</Text>
        </Pressable>
      </Pad>
      <Pad><Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: t.text }}>New round</Text></Pad>

      {live && (
        <Pad style={{ marginTop: 14 }}>
          <Card>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: t.text }}>You have a round in progress</Text>
            <Muted style={{ marginTop: 2, marginBottom: 12 }}>{live.course.name}. Finish it before starting another.</Muted>
            <Button label="Resume that round" size="md" onPress={() => router.replace(`/round/${live.id}`)} />
          </Card>
        </Pad>
      )}

      {!live && (
        <>
          <SectionLabel>Course</SectionLabel>
          <Pad>
            {course ? (
              <Card soft onPress={() => setSelectedId(null)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center' }}><CheckIcon size={13} color={t.onInk} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: t.text }} numberOfLines={1}>{course.name}</Text>
                    <Muted>{course.holes.length} holes · tap to change</Muted>
                  </View>
                </View>
              </Card>
            ) : (
              <Card soft style={{ paddingVertical: 4 }}>
                {pickable.length === 0 && <Muted style={{ paddingVertical: 12 }}>No courses saved yet.</Muted>}
                {pickable.map((c, i) => (
                  <View key={c.id}>{i > 0 && <Divider />}<Row title={c.name} subtitle={`${c.holes.length} holes${c.city ? ` · ${c.city}` : ''}`} onPress={() => { setSelectedId(c.id); setTeeId(null); }} /></View>
                ))}
                <Divider />
                <Row title="Find a course" subtitle="Search, nearby, or create by hand" onPress={() => router.push('/courses')} />
              </Card>
            )}
          </Pad>

          {course && (
            <>
              {course.tees.length > 1 && (
                <>
                  <SectionLabel>Tees</SectionLabel>
                  <Pad style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {course.tees.map((x) => <Chip key={x.id} label={x.name} on={(tee?.id) === x.id} onPress={() => setTeeId(x.id)} />)}
                  </Pad>
                </>
              )}

              <SectionLabel>Holes</SectionLabel>
              <Pad style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {nineOnly ? <Chip label="9 holes" on /> : (
                  <>
                    <Chip label="18 holes" on={mode === '18'} onPress={() => setMode('18')} />
                    <Chip label="Front 9" on={mode === 'front'} onPress={() => setMode('front')} />
                    <Chip label="Back 9" on={mode === 'back'} onPress={() => setMode('back')} />
                  </>
                )}
              </Pad>

              <SectionLabel>Players</SectionLabel>
              <Pad>
                <Card soft style={{ paddingVertical: 4 }}>
                  <Row title={golfer.name || 'You'} subtitle="Scorekeeper" />
                  {guests.map((g, i) => (
                    <View key={i}><Divider /><Row title={g} subtitle="Guest" right={<Pressable onPress={() => setGuests((gs) => gs.filter((_, j) => j !== i))} hitSlop={10}><Text style={{ fontFamily: fonts.bodySemi, color: t.text3 }}>Remove</Text></Pressable>} /></View>
                  ))}
                  {guests.length < 3 && (
                    <>
                      <Divider />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}>
                        <TextInput value={guestName} onChangeText={setGuestName} placeholder="Add a playing partner" placeholderTextColor={t.text4} autoCapitalize="words" onSubmitEditing={() => { if (guestName.trim()) { setGuests((gs) => [...gs, guestName.trim()]); setGuestName(''); } }} style={{ flex: 1, height: 44, fontFamily: fonts.body, fontSize: 16, color: t.text }} />
                        <Button label="Add" size="md" variant="secondary" disabled={!guestName.trim()} onPress={() => { setGuests((gs) => [...gs, guestName.trim()]); setGuestName(''); }} />
                      </View>
                    </>
                  )}
                </Card>
                <Muted style={{ marginTop: 8 }}>You'll keep score for everyone. Live multiplayer (each player scoring on their own phone) arrives with accounts.</Muted>
              </Pad>

              <Pad style={{ marginTop: 26 }}>
                <Button label="Start round" onPress={start} />
              </Pad>
            </>
          )}
        </>
      )}
    </Screen>
  );
}
