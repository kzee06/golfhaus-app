// Row shapes for the tables in supabase/migrations. Hand-maintained and kept
// deliberately small; extend as features land.

export type ProfileRow = {
  id: string; name: string; handle: string | null; avatar_url: string | null;
  units: 'm' | 'yd'; home_course_id: string | null; is_guest: boolean;
  created_at: string; updated_at: string;
};

export type CourseRow = {
  id: string; name: string; address: string | null; city: string | null; country: string | null;
  source: 'osm' | 'manual' | 'provider'; external_id: string | null; verified: boolean;
  created_by: string | null; created_at: string; updated_at: string;
};

export type HoleRow = { id: string; course_id: string; number: number; par: number; stroke_index: number | null };

export type RoundRow = {
  id: string; course_id: string | null; course_snapshot: unknown; hole_count: 9 | 18; start_hole: 1 | 10;
  status: 'active' | 'complete'; visibility: 'public' | 'friends' | 'private'; revision: number;
  created_by: string; scorekeeper_id: string | null; invite_code: string | null;
  started_at: string; completed_at: string | null; updated_at: string;
};

export type RoundPlayerRow = { id: string; round_id: string; user_id: string | null; name: string; is_guest: boolean; position: number; created_at: string };

export type HoleScoreRow = {
  round_id: string; player_id: string; hole: number; strokes: number; putts: number | null;
  fairway: 'hit' | 'left' | 'right' | 'na' | null; gir: boolean | null; penalties: number | null;
  updated_at: string; updated_by: string | null;
};

export type NearbyCourseRow = { id: string; name: string; city: string | null; country: string | null; source: string; verified: boolean; distance_m: number; lat: number; lng: number };
