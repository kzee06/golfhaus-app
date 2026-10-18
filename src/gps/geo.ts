// Geospatial maths for GPS distances. Pure; operates only on real coordinates.
// Distances are only ever derived from course geometry — never estimated.

import { GreenGeometry, HoleGeometry, LatLng, Units } from '../domain/types';

const R = 6371008.8; // mean Earth radius, metres
const toRad = (d: number) => (d * Math.PI) / 180;

// Great-circle distance in metres (haversine).
export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Initial bearing from a to b, degrees 0..360.
export function bearingDeg(a: LatLng, b: LatLng): number {
  const la1 = toRad(a.lat), la2 = toRad(b.lat), dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Centroid of a small polygon (fine at golf-hole scale).
export function centroid(pts: LatLng[]): LatLng {
  const n = pts.length || 1;
  return { lat: pts.reduce((s, p) => s + p.lat, 0) / n, lng: pts.reduce((s, p) => s + p.lng, 0) / n };
}

// Build front/middle/back from a green polygon and a reference point "behind"
// the player (normally the tee): front = nearest vertex to the reference, back =
// farthest, middle = centroid. These are green distances, not pin distances.
export function greenFromPolygon(polygon: LatLng[], reference: LatLng): GreenGeometry {
  const middle = centroid(polygon);
  let front = polygon[0], back = polygon[0];
  let dMin = Infinity, dMax = -Infinity;
  for (const p of polygon) {
    const d = distanceM(reference, p);
    if (d < dMin) { dMin = d; front = p; }
    if (d > dMax) { dMax = d; back = p; }
  }
  return { front, middle, back, polygon };
}

export type GreenDistances = { front: number; middle: number; back: number };

// Distances from the player's position to the green. Front/back are re-derived
// from the player's current position when a polygon exists, so "front" is
// always the nearest edge from where they stand.
export function distancesToGreen(pos: LatLng, g: HoleGeometry | undefined): GreenDistances | null {
  if (!g?.green) return null;
  const green = g.green.polygon && g.green.polygon.length >= 3 ? greenFromPolygon(g.green.polygon, pos) : g.green;
  return {
    front: distanceM(pos, green.front),
    middle: distanceM(pos, green.middle),
    back: distanceM(pos, green.back),
  };
}

export const mToYd = (m: number) => m * 1.0936133;

export function fmtDistance(m: number, units: Units): string {
  const v = units === 'yd' ? mToYd(m) : m;
  return `${Math.round(v)}`;
}

export const unitLabel = (units: Units) => (units === 'yd' ? 'yd' : 'm');

// Which hole is the player nearest to (by tee or green middle)? Used for
// auto-advance; the UI always allows a manual override.
export function nearestHole(pos: LatLng, holes: { number: number; geometry?: HoleGeometry }[]): number | null {
  let best: number | null = null, bestD = Infinity;
  for (const h of holes) {
    const ref = h.geometry?.tee ?? h.geometry?.green?.middle;
    if (!ref) continue;
    const d = distanceM(pos, ref);
    if (d < bestD) { bestD = d; best = h.number; }
  }
  return best;
}
