// Foreground GPS with permission handling. Battery-conscious: balanced accuracy
// and only reports when the golfer has moved a few metres.

import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { LatLng } from '../domain/types';

export type GpsStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export function useLocation(enabled: boolean): { pos: LatLng | null; accuracyM: number | null; status: GpsStatus } {
  const [pos, setPos] = useState<LatLng | null>(null);
  const [accuracyM, setAccuracy] = useState<number | null>(null);
  const [status, setStatus] = useState<GpsStatus>('idle');

  useEffect(() => {
    if (!enabled) return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    setStatus('requesting');
    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (perm.status !== 'granted') { setStatus('denied'); return; }
      setStatus('granted');
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 3, timeInterval: 2000 },
        (l) => {
          setPos({ lat: l.coords.latitude, lng: l.coords.longitude });
          setAccuracy(l.coords.accuracy ?? null);
        },
      );
    })().catch(() => { if (!cancelled) setStatus('unavailable'); });
    return () => { cancelled = true; sub?.remove(); };
  }, [enabled]);

  return { pos, accuracyM, status };
}

// One-shot position for "courses near me".
export async function currentPosition(): Promise<LatLng | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return null;
    const l = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: l.coords.latitude, lng: l.coords.longitude };
  } catch {
    return null;
  }
}
