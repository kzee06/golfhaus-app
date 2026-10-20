#!/usr/bin/env python3
"""Live smoke test for the GolfHaus schema, RLS and multiplayer rules.

Runs against the real project using only the PUBLIC (publishable) key, exactly
as the app would — so it proves what RLS actually allows, not what we hope.

    python3 -I supabase/tests/rls_smoke.py        # reads ./.env

Note: each run creates a few anonymous (guest) auth users. Clear them in
Supabase → Authentication → Users when convenient. Test rounds are deleted.
"""
import os, json, sys, datetime, urllib.request, urllib.error

def load_env(path='.env'):
    if not os.path.exists(path): return
    for line in open(path):
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1); os.environ.setdefault(k, v)

load_env()
URL = os.environ.get('EXPO_PUBLIC_SUPABASE_URL'); KEY = os.environ.get('EXPO_PUBLIC_SUPABASE_ANON_KEY')
if not URL or not KEY: sys.exit('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env')

def call(method, path, body=None, token=None, extra=None):
    h = {'apikey': KEY, 'content-type': 'application/json', 'Authorization': f'Bearer {token or KEY}'}
    if extra: h.update(extra)
    req = urllib.request.Request(URL + path, data=json.dumps(body).encode() if body is not None else None, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read(); return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read()
        try: return e.code, json.loads(raw)
        except Exception: return e.code, raw[:200]

res = []
def check(name, ok, detail=''):
    res.append(ok); print(('✓' if ok else '✗'), name, ('— ' + str(detail)[:160]) if (detail and not ok) else '')
iso = lambda d=0: (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=d)).isoformat()
guest = lambda: call('POST', '/auth/v1/signup', {})[1]

s, b = call('GET', '/rest/v1/courses?select=id&limit=1'); check('anon can read courses', s == 200, (s, b))
s, b = call('POST', '/rest/v1/rpc/courses_nearby', {'lat': -33.86, 'lng': 151.21, 'radius_m': 50000}); check('courses_nearby RPC (PostGIS)', s == 200, (s, b))

a = guest(); tok, uid = a['access_token'], a['user']['id']; check('guest sign-in (anonymous)', bool(tok))
s, b = call('GET', f'/rest/v1/profiles?select=is_guest&id=eq.{uid}', token=tok); check('profile auto-created as guest', s == 200 and b and b[0]['is_guest'] is True, b)

snap = {'name': 'Smoke Test Links', 'holes': [{'number': i, 'par': 4} for i in range(1, 19)]}
s, b = call('POST', '/rest/v1/rounds', {'course_snapshot': snap, 'hole_count': 18, 'created_by': uid, 'scorekeeper_id': uid}, token=tok, extra={'Prefer': 'return=representation'})
check('create round, read it back, 6-char invite code', s == 201 and b and len(b[0].get('invite_code') or '') == 6, (s, b))
if s != 201: sys.exit(1)
rid, code = b[0]['id'], b[0]['invite_code']
try:
    s, b = call('POST', '/rest/v1/round_players', {'round_id': rid, 'user_id': uid, 'name': 'Host', 'position': 0}, token=tok, extra={'Prefer': 'return=representation'})
    check('creator adds themselves to roster', s == 201, (s, b)); host_pid = b[0]['id']

    a2 = guest(); tok2, uid2 = a2['access_token'], a2['user']['id']
    s, b = call('POST', '/rest/v1/rpc/join_round', {'code': code.lower(), 'display_name': 'Sam'}, token=tok2); check('friend joins by invite code (case-insensitive)', s == 200 and b == rid, (s, b))
    call('POST', '/rest/v1/rpc/join_round', {'code': code, 'display_name': 'Sam'}, token=tok2)
    s, pl = call('GET', f'/rest/v1/round_players?select=id,name&round_id=eq.{rid}&order=position', token=tok2)
    check('joining twice is idempotent; friend sees full roster', s == 200 and [p['name'] for p in pl] == ['Host', 'Sam'], pl)
    sam_pid = [p for p in pl if p['name'] == 'Sam'][0]['id']

    s, b = call('POST', '/rest/v1/hole_scores', {'round_id': rid, 'player_id': sam_pid, 'hole': 1, 'strokes': 5, 'updated_at': iso(), 'updated_by': uid2}, token=tok2); check('friend scores their own hole', s == 201, (s, b))
    s, b = call('POST', '/rest/v1/hole_scores', {'round_id': rid, 'player_id': host_pid, 'hole': 1, 'strokes': 3, 'updated_at': iso()}, token=tok2); check("friend cannot score another player's hole", s in (401, 403), (s, b))
    s, b = call('PATCH', f'/rest/v1/hole_scores?round_id=eq.{rid}&player_id=eq.{sam_pid}&hole=eq.1', {'strokes': 4, 'updated_at': iso(5), 'updated_by': uid}, token=tok, extra={'Prefer': 'return=representation'})
    check("scorekeeper can correct a friend's score", s == 200 and b and b[0]['strokes'] == 4, (s, b))
    s, b = call('PATCH', f'/rest/v1/hole_scores?round_id=eq.{rid}&player_id=eq.{sam_pid}&hole=eq.1', {'strokes': 9, 'updated_at': iso(-300)}, token=tok2)
    check('stale (older) write rejected — no silent overwrite', s >= 400 and 'stale' in json.dumps(b).lower(), (s, b))
    s, b = call('GET', f'/rest/v1/hole_scores?select=strokes&round_id=eq.{rid}&player_id=eq.{sam_pid}', token=tok); check('score intact after stale attempt', b and b[0]['strokes'] == 4, b)

    tok3 = guest()['access_token']
    s, b = call('GET', f'/rest/v1/rounds?select=id&id=eq.{rid}', token=tok3); check('stranger cannot see a private round', s == 200 and b == [], b)
    s, b = call('GET', f'/rest/v1/hole_scores?select=strokes&round_id=eq.{rid}', token=tok3); check("stranger cannot see the round's scores", s == 200 and b == [], b)

    call('PATCH', f'/rest/v1/rounds?id=eq.{rid}', {'status': 'complete'}, token=tok)
    s, b = call('POST', '/rest/v1/hole_scores', {'round_id': rid, 'player_id': sam_pid, 'hole': 2, 'strokes': 4, 'updated_at': iso()}, token=tok2); check('no scoring once the round is complete', s in (401, 403), (s, b))
finally:
    s, _ = call('DELETE', f'/rest/v1/rounds?id=eq.{rid}', token=tok); check('cleanup: creator deletes the test round', s in (200, 204), s)

print(f'\nPASSED {sum(res)}/{len(res)}')
sys.exit(0 if all(res) else 1)
