// GolfHaus domain model — pure types shared by the scorecard, GPS, courses and
// (later) the sync layer. No React, no storage. See docs/ARCHITECTURE.md §3.

export type LatLng = { lat: number; lng: number };

export type Units = 'm' | 'yd';

// Appearance preference; 'system' follows the device setting.
export type ThemeMode = 'system' | 'light' | 'dark';

// ─── Courses ─────────────────────────────────────────────────────────────────

export type CourseSource = 'osm' | 'manual' | 'provider';

export type GreenGeometry = {
  front: LatLng;
  middle: LatLng;
  back: LatLng;
  polygon?: LatLng[];
};

export type HazardKind = 'bunker' | 'water' | 'oob' | 'tree';
export type Hazard = { kind: HazardKind; point: LatLng; polygon?: LatLng[] };

export type HoleGeometry = {
  tee?: LatLng;
  green?: GreenGeometry;
  hazards?: Hazard[];
};

export type Hole = {
  number: number; // 1-based
  par: number;
  strokeIndex?: number;
  geometry?: HoleGeometry;
};

export type TeeHole = { hole: number; distanceM?: number; par?: number };

export type TeeBox = {
  id: string;
  name: string; // e.g. "Blue", "Men's", "Championship"
  colour?: string;
  rating?: number;
  slope?: number;
  holes: TeeHole[];
};

export type Course = {
  id: string;
  name: string;
  location: LatLng;
  address?: string;
  city?: string;
  country: string;
  source: CourseSource;
  externalId?: string; // e.g. OSM "way/123" or "relation/456"
  verified: boolean;
  holes: Hole[];
  tees: TeeBox[];
  updatedAt: string; // ISO
};

// A lightweight search hit before the full course is fetched.
export type CourseSummary = {
  id: string;
  name: string;
  location: LatLng;
  city?: string;
  country?: string;
  source: CourseSource;
  externalId?: string;
  holeCount?: number;
  distanceM?: number; // from the searcher, when searching nearby
};

// ─── Rounds & scoring ────────────────────────────────────────────────────────

export type Fairway = 'hit' | 'left' | 'right' | 'na';

export type HoleScore = {
  strokes: number;
  putts?: number;
  fairway?: Fairway;
  gir?: boolean;
  penalties?: number;
  updatedAt: string; // ISO — basis for sync/merge
  by?: string; // player id that wrote it (scorekeeper support)
};

export type RoundPlayer = {
  id: string;
  name: string;
  isMe: boolean;
  userId?: string | null; // null = guest
  scores: Record<number, HoleScore>; // keyed by hole number
};

export type RoundStatus = 'active' | 'complete';
export type Visibility = 'public' | 'friends' | 'private';

// A frozen view of the course at the time of play so history never changes if
// course data is edited later.
export type CourseSnapshot = {
  courseId: string;
  name: string;
  teeId?: string;
  teeName?: string;
  holes: { number: number; par: number; strokeIndex?: number; distanceM?: number }[];
};

export type Round = {
  id: string;
  course: CourseSnapshot;
  holeCount: 9 | 18;
  startHole: 1 | 10;
  startedAt: string;
  completedAt?: string;
  status: RoundStatus;
  visibility: Visibility;
  revision: number;
  players: RoundPlayer[];
  scorekeeperId?: string;
  updatedAt: string;
};

// ─── Golfer ──────────────────────────────────────────────────────────────────

export type ClubDistance = { club: string; avgM: number; source: 'manual' | 'tracked' };

export type Golfer = {
  id: string;
  name: string;
  handle?: string;
  units: Units;
  themeMode: ThemeMode;
  homeCourseId?: string;
  clubs: ClubDistance[];
  createdAt: string;
};

export const EMPTY_GOLFER: Golfer = {
  id: 'me',
  name: '',
  units: 'm',
  themeMode: 'system',
  clubs: [],
  createdAt: '',
};

// Hole numbers covered by a round, in play order.
export function holesInRound(r: Pick<Round, 'holeCount' | 'startHole'>): number[] {
  const out: number[] = [];
  for (let i = 0; i < r.holeCount; i++) out.push(((r.startHole - 1 + i) % 18) + 1);
  return out;
}

export const newId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
