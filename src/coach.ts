// GolfHaus Coach — conversational AI backed by Claude (claude-opus-4-8), with a
// scripted fallback so the feature works in Expo Go with no API key configured.
//
// We call the Messages API with fetch rather than @anthropic-ai/sdk: the SDK
// pulls in Node stream internals that don't bundle cleanly under Metro/Expo,
// while fetch + JSON is reliable in React Native. Non-streaming keeps us clear
// of RN's lack of SSE body support and well under request timeouts.

import { ACTIVITIES, ACTIVITY_TYPE_LABEL } from './content';
import { Profile, LEVEL_LABEL, goalLabel, equipmentLabel, locationLabel, bodyAreaLabel, optionLabel } from './profile';

export type ChatRole = 'user' | 'assistant';
export type ChatMessage = { role: ChatRole; text: string };

// EXPO_PUBLIC_ vars are inlined into the client bundle at build time.
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
export const coachIsLive = !!API_KEY;

function profileLine(p: Profile): string {
  const level = p.level ? LEVEL_LABEL[p.level] : 'a keen golfer';
  const goals = p.goals.length ? p.goals.map(goalLabel).join(', ') : 'general improvement';
  const equip = p.equipment.filter((e) => e !== 'none').map(equipmentLabel).join(', ') || 'minimal equipment';
  const where = p.locations.length ? p.locations.map(locationLabel).join(', ') : 'home';
  const tight = p.tightAreas.length ? p.tightAreas.map(bodyAreaLabel).join(', ') : 'nothing in particular';
  const excl = p.exclusions.length ? ` Avoid: ${p.exclusions.join(', ')}.` : '';
  const practice = optionLabel('practiceFreq', p.practiceFreq);
  const hcp = optionLabel('handicapRange', p.handicapRange);
  const diff = optionLabel('workoutDifficulty', p.workoutDifficulty);
  return `Level: ${level}. Goals: ${goals}. Scoring: ${hcp}. Practises: ${practice}. Trains at: ${where}. Equipment: ${equip}. Preferred difficulty: ${diff}. Tight areas: ${tight}.${excl}`;
}

function buildSystemPrompt(p: Profile): string {
  const catalog = ACTIVITIES
    .map((a) => `- ${a.title} (${ACTIVITY_TYPE_LABEL[a.type]}/${a.category}, ${a.durationMin} min): ${a.problem}`)
    .join('\n');

  return `You are the GolfHaus Coach — a warm, encouraging personal coach for a golfer's game AND their golf body, living inside the GolfHaus app. You help them practise smarter with drills, mobility, strength, yoga, warmups, and recovery.

The golfer:
${profileLine(p)}

Voice and format:
- Friendly, concrete, and motivating — never condescending. Celebrate effort.
- Keep replies short: 2-4 tight paragraphs at most, or a short list. No walls of text.
- Plain text only. No markdown headers, no emoji.
- Recommend specific GolfHaus activities from the library below by name, and say briefly why. Only recommend things the golfer can actually do given their equipment, location, and any movements they said to avoid.
- Balance skill work with the golf body — mobility, strength, and recovery matter for their game.
- You can also answer questions about how the app works (Today's plan, Library, sessions, progress, streaks).
- Do not give medical advice or diagnose injuries; if they mention pain, suggest they ease off and see a professional.

GolfHaus activity library:
${catalog}`;
}

async function callClaude(history: ChatMessage[], profile: Profile): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY as string,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: buildSystemPrompt(profile),
      messages: history.map((m) => ({ role: m.role, content: m.text })),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Request failed (${res.status})`);
  }
  const text: string = (data.content || [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('')
    .trim();
  return text || "I didn't catch that — mind rephrasing?";
}

// Scripted fallback used when no API key is set. Keyed loosely to intent so it
// still feels helpful and on-brand without any network call or cost.
function demoReply(history: ChatMessage[], streak: number): string {
  const last = [...history].reverse().find((m) => m.role === 'user')?.text.toLowerCase() ?? '';
  const has = (...w: string[]) => w.some((x) => last.includes(x));

  if (has('tight', 'stiff', 'mobility', 'flexible', 'hip', 'back', 'sore', 'loosen')) {
    return "Let's free that up. Start with 90/90 Hip Switches and Open Book Thoracic Rotation — five minutes each, gentle and pain-free. Tight hips and a stiff upper back quietly cap your turn, so a little daily mobility does more for your swing than another bucket of balls. If anything sharpens into real pain, ease off and get it checked.";
  }
  if (has('strong', 'strength', 'gym', 'power', 'distance', 'speed', 'farther', 'further')) {
    return "More speed comes from a stronger, more stable base — not swinging harder. Build it with the Glute Bridge and Dead Bug for core and hips, then the Band Pallof Press for the anti-rotation that keeps your swing centred. When you're fresh and well warmed, the Rotational Med-Ball Throw turns that strength into swing speed.";
  }
  if (has('putt', 'green', 'three-putt', '3-putt')) {
    return "Putting is where scores quietly leak away. Start with The Clock Drill for pace — get 8 of 10 lag putts to die within a putter-length of the hole. Once your speed is steady, Gate Putting sharpens your start line. Ten focused minutes beats an hour of aimless rolling.";
  }
  if (has('chip', 'short game', 'around the green', 'pitch', 'bunker')) {
    return "Great instinct — most saved shots live inside 50 metres. Try the Landing Spot Ladder: pick a spot, land it there, and let the ball release. Aim for 7 of 10 finishing close. If you're short-sided, the High Soft Flop is your escape. Keep the tempo lazy and let the loft do the work.";
  }
  if (has('slice', 'straight', 'hook', 'direction', 'aim')) {
    return "A slice is usually aim plus an open face. Lay down an Alignment Stick Setup so your eyes learn what 'straight' really looks like — half of all misses are just aim. Then groove the Tee Height Ladder to find the centre of the face; centred strikes curve far less. Small setup fixes, big payoff.";
  }
  if (has('warm', 'before', 'round', 'tee', 'first')) {
    return "Don't start cold. Run the Five-Minute Pre-Round Warmup — leg swings, trunk rotations, then a few building half-swings — so you're loose from the first tee instead of the sixth. If you've got a mat handy, the Pre-Round Flow adds a little more.";
  }
  if (has('recover', 'rest', 'tired', 'after', 'foam')) {
    return "Recovery is training too. After a round or a hard session, run the Golfer's Foam Roll Flow and the Post-Round Recovery — gentle movement and slow breathing to bounce back for tomorrow. Keep it easy; if you're wrecked, rest beats grinding.";
  }
  if (has('today', 'practice', 'plan', 'what should i', 'do')) {
    return `Here's a solid 20 minutes: a three-minute mobility warmup (90/90 Hip Switches), then the Landing Spot Ladder for your short game, and finish with The Clock Drill for putting pace. You're on a ${streak}-day streak — keep it rolling.`;
  }
  return "I'm your GolfHaus coach — I can help with your game (putting, chipping, driving, staying straight) and your golf body (mobility, strength, warmups, recovery). Tell me what you're working on, or what's feeling tight, and I'll point you to the right activities.";
}

export async function coachReply(history: ChatMessage[], profile: Profile, streak: number): Promise<string> {
  if (!coachIsLive) {
    await new Promise((r) => setTimeout(r, 500));
    return demoReply(history, streak);
  }
  return callClaude(history, profile);
}

export const COACH_GREETING =
  "Hey — I'm your GolfHaus coach. Ask me anything about your game or your golf body, and I'll help you train smarter. What's on your mind?";

export const COACH_SUGGESTIONS = [
  'What should I do today?',
  "I can't stop slicing it",
  'My hips feel tight',
  'Help my putting',
];
