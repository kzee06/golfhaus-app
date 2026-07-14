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
import TabBar, { Tab } from './src/TabBar';
import Onboarding from './src/screens/Onboarding';
import Today from './src/screens/Today';
import Drills from './src/screens/Drills';
import Progress from './src/screens/Progress';
import You from './src/screens/You';
import Coach from './src/screens/Coach';
import DrillDetail from './src/screens/DrillDetail';
import Session from './src/screens/Session';
import Done from './src/screens/Done';

type Phase = 'onboarding' | 'app';
type Overlay = null | 'drill' | 'session';
type Mode = 'timing' | 'logging' | 'done';

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

  // ---- state (mirrors the prototype state class) ----
  const [phase, setPhase] = useState<Phase>('onboarding');
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [access, setAccess] = useState<string[]>([]);
  const [hcp, setHcp] = useState('');
  const [tab, setTab] = useState<Tab>('today');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [activeId, setActiveId] = useState('ladder');
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<Mode>('timing');
  const [logMade, setLogMade] = useState<number | null>(null);
  const [logFeel, setLogFeel] = useState<string | null>(null);
  const streak = 6;

  const activeDrill = allDrills().find((d) => d.id === activeId) || drills[0];
  const canBuild = !!level && !!goal && access.length > 0;

  // ---- timer: increments only while running, session open, timing mode ----
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

  // ---- handlers ----
  const buildPlan = () => {
    if (!canBuild) return;
    setStep(5);
    buildTimeout.current = setTimeout(() => {
      setPhase('app');
      setTab('today');
      setStep(0);
    }, 2600);
  };
  const restart = () => {
    setPhase('onboarding');
    setStep(0);
    setLevel(null);
    setGoal(null);
    setAccess([]);
    setHcp('');
    setTab('today');
    setOverlay(null);
  };
  const openDrill = (id: string) => { setActiveId(id); setOverlay('drill'); };
  const startSession = () => { setOverlay('session'); setMode('timing'); setElapsed(0); setRunning(true); setLogMade(null); setLogFeel(null); };
  const submitLog = () => { if (logMade === null || !logFeel) return; setMode('done'); };
  const backHome = () => { setOverlay(null); setTab('today'); };
  const toggleAccess = (k: string) => setAccess((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  const greetH = new Date().getHours();
  const greeting = greetH < 12 ? 'Good morning' : greetH < 18 ? 'Good afternoon' : 'Good evening';

  const { width, height } = useWindowDimensions();
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }

  // Constrain to a phone-width column so the layout matches the 402px design
  // on wide/web viewports; fills the screen on a real device.
  const frameW = Math.min(width, 440);
  const showTabBar = phase === 'app' && !overlay;

  return (
    <View style={{ flex: 1, backgroundColor: '#e6e6e3', alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar style="dark" />
      <View style={{ width: frameW, height, backgroundColor: colors.canvas, overflow: 'hidden' }}>
        {phase === 'onboarding' && (
          <Onboarding
            step={step}
            level={level}
            goal={goal}
            access={access}
            hcp={hcp}
            start={() => setStep(1)}
            back={() => setStep((s) => Math.max(0, s - 1))}
            next={() => setStep((s) => s + 1)}
            pickLevel={setLevel}
            pickGoal={setGoal}
            toggleAccess={toggleAccess}
            setHcp={setHcp}
            buildPlan={buildPlan}
            canBuild={canBuild}
          />
        )}

        {phase === 'app' && (
          <>
            {!overlay && tab === 'today' && <Today greeting={greeting} streak={streak} onOpen={openDrill} onStart={startSession} onCoach={() => setTab('coach')} />}
            {!overlay && tab === 'drills' && <Drills onOpen={openDrill} />}
            {!overlay && tab === 'coach' && <Coach ctx={{ level, goal, access, hcp, streak }} />}
            {!overlay && tab === 'progress' && <Progress streak={streak} />}
            {!overlay && tab === 'you' && <You level={level} goal={goal} hcp={hcp} access={access} onRestart={restart} />}

            {overlay === 'drill' && <DrillDetail drill={activeDrill} onClose={() => setOverlay(null)} onStart={startSession} />}

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

            {showTabBar && <TabBar tab={tab} onChange={(t) => { setTab(t); setOverlay(null); }} />}
          </>
        )}
      </View>
    </View>
  );
}
