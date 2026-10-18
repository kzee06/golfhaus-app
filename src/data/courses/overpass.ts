// Course discovery and geometry from OpenStreetMap via the Overpass API.
//
// OSM has a proper golf schema: leisure=golf_course for the course, and inside it
// golf=hole (a tee→green line with ref/par/handicap), golf=green (polygon),
// golf=tee, golf=bunker, golf=water_hazard. We only ever derive GPS distances
// from this real geometry; where it's missing the hole simply has no GPS data.
// Data © OpenStreetMap contributors, ODbL — attribution is shown in the app.

import { Course, CourseSummary, Hazard, Hole, HoleGeometry, LatLng, TeeBox, newId } from '../../domain/types';
import { centroid, distanceM, greenFromPolygon } from '../../gps/geo';

const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

type OsmElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  tags?: Record<string, string>;
  center?: { lat: number; lon: number };
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
  geometry?: { lat: number; lon: number }[];
};

// Public Overpass instances can be slow, rate-limited or blocked; never let a
// request hang the UI. Each attempt gets a hard timeout.
const REQUEST_TIMEOUT_MS = 12000;

async function overpass(query: string, signal?: AbortSignal): Promise<OsmElement[]> {
  let lastErr: unknown;
  for (const url of ENDPOINTS) {
    const ac = new AbortController();
    const onAbort = () => ac.abort();
    signal?.addEventListener('abort', onAbort);
    const timer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: ac.signal,
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const json = await res.json();
      return (json.elements ?? []) as OsmElement[];
    } catch (e) {
      lastErr = e;
      if (signal?.aborted) throw e;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
  throw lastErr ?? new Error('Overpass unavailable');
}

const extId = (e: OsmElement) => `${e.type}/${e.id}`;
const courseId = (e: OsmElement) => `osm:${e.type}/${e.id}`;

function toSummary(e: OsmElement, from?: LatLng): CourseSummary | null {
  const name = e.tags?.name;
  if (!name || !e.center) return null;
  const location = { lat: e.center.lat, lng: e.center.lon };
  return {
    id: courseId(e),
    name,
    location,
    city: e.tags?.['addr:city'] ?? e.tags?.['addr:suburb'],
    country: e.tags?.['addr:country'],
    source: 'osm',
    externalId: extId(e),
    distanceM: from ? distanceM(from, location) : undefined,
  };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\"]/g, '\\$&');

// Search courses by name (case-insensitive substring), worldwide.
export async function searchCoursesByName(q: string, signal?: AbortSignal): Promise<CourseSummary[]> {
  const needle = escapeRe(q.trim());
  if (needle.length < 2) return [];
  const query = `[out:json][timeout:25];
(
  way["leisure"="golf_course"]["name"~"${needle}",i];
  relation["leisure"="golf_course"]["name"~"${needle}",i];
);
out center tags 40;`;
  const els = await overpass(query, signal);
  return els.map((e) => toSummary(e)).filter((x): x is CourseSummary => !!x);
}

// Courses within a radius of a point, nearest first.
export async function coursesNearby(at: LatLng, radiusM = 30000, signal?: AbortSignal): Promise<CourseSummary[]> {
  const query = `[out:json][timeout:25];
(
  way["leisure"="golf_course"](around:${Math.round(radiusM)},${at.lat},${at.lng});
  relation["leisure"="golf_course"](around:${Math.round(radiusM)},${at.lat},${at.lng});
);
out center tags 40;`;
  const els = await overpass(query, signal);
  return els
    .map((e) => toSummary(e, at))
    .filter((x): x is CourseSummary => !!x)
    .sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0));
}

// Fetch a full course: holes, greens, tees and hazards inside the course area.
export async function fetchCourse(summary: CourseSummary, signal?: AbortSignal): Promise<Course> {
  const [type, id] = (summary.externalId ?? '').split('/');
  const ref = type === 'relation' ? `rel(${id})` : `way(${id})`;
  // 1) course bounds
  const bounds = await overpass(`[out:json][timeout:25];${ref};out bb tags;`, signal);
  const course = bounds[0];
  const bb = course?.bounds;
  if (!bb) {
    return bareCourse(summary);
  }
  // 2) features within the bounding box (slightly padded)
  const pad = 0.0015;
  const box = `${bb.minlat - pad},${bb.minlon - pad},${bb.maxlat + pad},${bb.maxlon + pad}`;
  const query = `[out:json][timeout:30][bbox:${box}];
(
  way["golf"="hole"];
  way["golf"="green"];
  way["golf"="tee"];
  way["golf"="bunker"];
  way["golf"="water_hazard"];
  way["natural"="water"];
);
out geom tags;`;
  const els = await overpass(query, signal);

  const holeWays = els.filter((e) => e.tags?.golf === 'hole' && e.geometry && e.geometry.length >= 2);
  const greens = els.filter((e) => e.tags?.golf === 'green' && e.geometry && e.geometry.length >= 3).map((e) => ({
    poly: e.geometry!.map((p) => ({ lat: p.lat, lng: p.lon })),
  }));
  const hazards: Hazard[] = els
    .filter((e) => (e.tags?.golf === 'bunker' || e.tags?.golf === 'water_hazard' || e.tags?.natural === 'water') && e.geometry && e.geometry.length >= 3)
    .map((e) => {
      const polygon = e.geometry!.map((p) => ({ lat: p.lat, lng: p.lon }));
      return { kind: e.tags?.golf === 'bunker' ? 'bunker' : 'water', point: centroid(polygon), polygon } as Hazard;
    });

  const holes: Hole[] = [];
  const teeHoles: TeeBox['holes'] = [];
  const usedGreens = new Set<number>();

  for (const w of holeWays) {
    const num = parseInt(w.tags?.ref ?? '', 10);
    if (!num || num < 1 || num > 18) continue;
    const line = w.geometry!.map((p) => ({ lat: p.lat, lng: p.lon }));
    const tee = line[0];
    const end = line[line.length - 1];
    // nearest green polygon to the hole's end point
    let gi = -1, gd = Infinity;
    greens.forEach((g, i) => {
      if (usedGreens.has(i)) return;
      const d = distanceM(end, centroid(g.poly));
      if (d < gd) { gd = d; gi = i; }
    });
    const geometry: HoleGeometry = { tee };
    if (gi >= 0 && gd < 80) {
      usedGreens.add(gi);
      geometry.green = greenFromPolygon(greens[gi].poly, tee);
    }
    // hazards near this hole's line (within ~60 m of any vertex)
    geometry.hazards = hazards.filter((h) => line.some((p) => distanceM(p, h.point) < 60));

    const par = parseInt(w.tags?.par ?? '', 10);
    const si = parseInt(w.tags?.handicap ?? '', 10);
    const distTag = parseFloat(w.tags?.dist ?? '');
    // Hole length: tagged distance if present, else the length of the mapped line.
    const lineLen = line.slice(1).reduce((s, p, i) => s + distanceM(line[i], p), 0);
    const distanceM_ = Number.isFinite(distTag) ? distTag : Math.round(lineLen);

    holes.push({ number: num, par: Number.isFinite(par) && par > 0 ? par : 4, strokeIndex: Number.isFinite(si) ? si : undefined, geometry });
    teeHoles.push({ hole: num, distanceM: distanceM_ > 50 ? distanceM_ : undefined });
  }
  holes.sort((a, b) => a.number - b.number);
  teeHoles.sort((a, b) => a.hole - b.hole);

  if (holes.length === 0) return bareCourse(summary);

  const tees: TeeBox[] = [{ id: newId(), name: 'Standard', holes: teeHoles }];
  return {
    id: summary.id,
    name: summary.name,
    location: summary.location,
    city: summary.city ?? course.tags?.['addr:city'],
    country: summary.country ?? course.tags?.['addr:country'] ?? '',
    source: 'osm',
    externalId: summary.externalId,
    verified: false,
    holes,
    tees,
    updatedAt: new Date().toISOString(),
  };
}

// A course with no mapped holes yet: 18 editable par-4 holes so scoring works.
// Flagged unverified so the UI invites the golfer to fix pars.
export function bareCourse(summary: CourseSummary, holeCount = 18): Course {
  return {
    id: summary.id,
    name: summary.name,
    location: summary.location,
    city: summary.city,
    country: summary.country ?? '',
    source: summary.source === 'osm' ? 'osm' : 'manual',
    externalId: summary.externalId,
    verified: false,
    holes: Array.from({ length: holeCount }, (_, i) => ({ number: i + 1, par: 4 })),
    tees: [{ id: newId(), name: 'Standard', holes: Array.from({ length: holeCount }, (_, i) => ({ hole: i + 1 })) }],
    updatedAt: new Date().toISOString(),
  };
}

// A hand-made course (no OSM record).
export function manualCourse(name: string, location: LatLng | null, holeCount = 18): Course {
  const summary: CourseSummary = { id: `manual:${newId()}`, name, location: location ?? { lat: 0, lng: 0 }, source: 'manual' };
  return { ...bareCourse(summary, holeCount), source: 'manual' };
}

export const hasGps = (c: Course): boolean => c.holes.some((h) => !!h.geometry?.green);
