import React, { useEffect, useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  SchibstedGrotesk_500Medium,
  SchibstedGrotesk_600SemiBold,
  SchibstedGrotesk_700Bold,
  SchibstedGrotesk_800ExtraBold,
} from '@expo-google-fonts/schibsted-grotesk';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';

import { colors } from './src/theme';
import { allDrills, drills } from './src/data';
import { Profile, EMPTY_PROFILE, isOnboarded, STEPS } from './src/profile';
import { loadProfile, saveProfile, clearProfile, loadProgress, saveProgress, clearProgress } from './src/store';
import {
  ProgressState, EMPTY_PROGRESS, addSession, recordFromSession, computeStreak,
  practicedDayKeys,
} from './src/progress';
import TabBar, { Tab } from './src/TabBar';
import Onboarding from './src/screens/Onboarding';
import Today from './src/screens/Today';
import Progress from './src/screens/Progress';
import You from './src/screens/You';
import Coach from './src/screens/Coach';
import Library from './src/screens/Library';
import ActivityDetail from './src/screens/ActivityDetail';
import DrillDetail from './src/screens/DrillDetail';
import Session from './src/screens/Session';
import Done from './src/screens/Done';
import SessionPlayer from './src/screens/SessionPlayer';
import { activityById } from './src/content';
import { PlanSession } from './src/plan';

type Phase = 'onboarding' | 'app';
type Overlay = null | 'drill' | 'activity' | 'session' | 'player';
type Mode = 'timing' | 'logging' | 'done';

const N = STEPS.length; // number of onboarding question steps

export default function App() {
  const [fontsLoaded] = useFonts({
    SchibstedGrotesk_500Medium,
    SchibstedGrotesk_600SemiBold,
    SchibstedGrotesk_700Bold,
    SchibstedGrotesk_800ExtraBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // ---- state ----
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<Phase>('onboarding');
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<Tab>('today');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [activeId, setActiveId] = useState('ladder');
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<PlanSession | null>(null);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<Mode>('timing');
  const [logMade, setLogMade] = useState<number | null>(null);
  const [logFeel, setLogFeel] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState>(EMPTY_PROGRESS);

  // Streak and weekly practice derive from the real session log.
  const streak = computeStreak(progress.sessions, new Date());

  const activeDrill = allDrills().find((d) => d.id === activeId) || drills[0];

  // ---- hydrate persisted profile + progress on launch ----
  useEffect(() => {
    (async () => {
      const [p, prog] = await Promise.all([loadProfile(), loadProgress()]);
      setProfile(p);
      setProgress(prog);
      if (isOnboarded(p)) setPhase('app');
      setHydrated(true);
    })();
  }, []);

  // ---- persist profile / progress after any change (once hydrated) ----
  useEffect(() => {
    if (hydrated) saveProfile(profile);
  }, [profile, hydrated]);

  useEffect(() => {
    if (hydrated) saveProgress(progress);
  }, [progress, hydrated]);

  // ---- timer ----
  useEffect(() => {
    if (overlay === 'session' && mode === 'timing' && running) {
      const id = setInterval(() => {
        setElapsed((e) => Math.min(e + 1, activeDrill.durationSec));
      }, 1000);
      return () => clearInterval(id);
    }
  }, [overlay, mode, running, activeDrill.durationSec]);

  const buildTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (buildTimeout.current) clearTimeout(buildTimeout.current); }, []);

  // ---- onboarding handlers ----
  const setSingle = (field: keyof Profile, key: string) => setProfile((p) => ({ ...p, [field]: key }));

  const toggleMulti = (field: keyof Profile, key: string) =>
    setProfile((p) => {
      const arr = (p[field] as string[]) || [];
      const has = arr.includes(key);
      // Equipment "none" is exclusive with real equipment.
      if (field === 'equipment') {
        if (key === 'none') return { ...p, equipment: has ? [] : ['none'] } as Profile;
        const cleaned = arr.filter((x) => x !== 'none');
        return { ...p, equipment: has ? cleaned.filter((x) => x !== key) : [...cleaned, key] } as Profile;
      }
      if (has) return { ...p, [field]: arr.filter((x) => x !== key) };
      const cfg = STEPS.find((s) => s.field === field);
      if (cfg && cfg.mode === 'multi' && cfg.maxSelect && arr.length >= cfg.maxSelect) return p; // cap reached
      return { ...p, [field]: [...arr, key] };
    });

  const buildPlan = () => {
    setStep(N + 1);
    buildTimeout.current = setTimeout(() => {
      setProfile((p) => ({ ...p, onboardedAt: new Date().toISOString() }));
      setPhase('app');
      setTab('today');
      setStep(0);
    }, 2600);
  };

  const restart = () => {
    clearProfile();
    clearProgress();
    setProfile(EMPTY_PROFILE);
    setProgress(EMPTY_PROGRESS);
    setPhase('onboarding');
    setStep(0);
    setTab('today');
    setOverlay(null);
  };

  // Record a completed guided session, then return home.
  const finishSession = (session: PlanSession, feel: string | null) => {
    const id = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const rec = recordFromSession(session, feel as any, id, new Date().toISOString());
    setProgress((pr) => addSession(pr, rec));
  };

  const openDrill = (id: string) => { setActiveId(id); setOverlay('drill'); };
  const startSession = () => { setOverlay('session'); setMode('timing'); setElapsed(0); setRunning(true); setLogMade(null); setLogFeel(null); };
  const submitLog = () => { if (logMade === null || !logFeel) return; setMode('done'); };
  const backHome = () => { setOverlay(null); setTab('today'); };

  const greetH = new Date().getHours();
  const greeting = greetH < 12 ? 'Good morning' : greetH < 18 ? 'Good afternoon' : 'Good evening';

  const { width, height } = useWindowDimensions();
  if (!fontsLoaded || !hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }

  // Constrain to a phone-width column so the layout matches on wide/web
  // viewports; fills the screen on a real device.
  const frameW = Math.min(width, 440);
  const showTabBar = phase === 'app' && !overlay;

  return (
    <View style={{ flex: 1, backgroundColor: '#e6e6e3', alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar style="dark" />
      <View style={{ width: frameW, height, backgroundColor: colors.canvas, overflow: 'hidden' }}>
        {phase === 'onboarding' && (
          <Onboarding
            step={step}
            profile={profile}
            start={() => setStep(1)}
            back={() => setStep((s) => Math.max(0, s - 1))}
            next={() => setStep((s) => s + 1)}
            setSingle={setSingle}
            toggleMulti={toggleMulti}
            buildPlan={buildPlan}
          />
        )}

        {phase === 'app' && (
          <>
            {!overlay && tab === 'today' && (
              <Today
                profile={profile}
                greeting={greeting}
                name={profile.name}
                streak={streak}
                practicedDays={practicedDayKeys(progress.sessions)}
                history={progress.sessions}
                onOpenActivity={(id) => { setActiveActivityId(id); setOverlay('activity'); }}
                onStart={(s) => { if (s.activities.length) { setActiveSession(s); setOverlay('player'); } }}
                onCoach={() => setTab('coach')}
              />
            )}
            {!overlay && tab === 'drills' && <Library onOpen={(id) => { setActiveActivityId(id); setOverlay('activity'); }} />}
            {!overlay && tab === 'coach' && <Coach profile={profile} streak={streak} sessions={progress.sessions} />}
            {!overlay && tab === 'progress' && <Progress streak={streak} sessions={progress.sessions} />}
            {!overlay && tab === 'you' && <You profile={profile} onRestart={restart} />}

            {overlay === 'drill' && <DrillDetail drill={activeDrill} onClose={() => setOverlay(null)} onStart={startSession} />}

            {overlay === 'activity' && activeActivityId && (() => {
              const a = activityById(activeActivityId);
              return a ? <ActivityDetail activity={a} onClose={() => setOverlay(null)} /> : null;
            })()}

            {overlay === 'session' && mode !== 'done' && (
              <Session
                drill={activeDrill}
                mode={mode === 'logging' ? 'logging' : 'timing'}
                running={running}
                elapsed={elapsed}
                logMade={logMade}
                logFeel={logFeel}
                onClose={() => setOverlay(null)}
                onToggleRun={() => setRunning((r) => !r)}
                onOpenLog={() => { setMode('logging'); setRunning(false); }}
                onPickMade={setLogMade}
                onPickFeel={setLogFeel}
                onSubmit={submitLog}
              />
            )}

            {overlay === 'session' && mode === 'done' && <Done streak={streak} logMade={logMade} onBack={backHome} />}

            {overlay === 'player' && activeSession && (
              <SessionPlayer
                session={activeSession}
                name={profile.name}
                streak={streak}
                onExit={() => { setOverlay(null); setActiveSession(null); setTab('today'); }}
                onFinish={(summary) => finishSession(activeSession, summary.feel)}
              />
            )}

            {showTabBar && <TabBar tab={tab} onChange={(t) => { setTab(t); setOverlay(null); }} />}
          </>
        )}
      </View>
    </View>
  );
}
