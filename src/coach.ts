// GolfHaus Coach — conversational AI backed by Claude (claude-opus-4-8), with a
// scripted fallback so the feature works in Expo Go with no API key configured.
//
// We call the Messages API with fetch rather than @anthropic-ai/sdk: the SDK
// pulls in Node stream internals that don't bundle cleanly under Metro/Expo,
// while fetch + JSON is reliable in React Native. Non-streaming keeps us clear
// of RN's lack of SSE body support and well under request timeouts.

import { allDrills, levelData, goalData, accessData } from './data';

export type ChatRole = 'user' | 'assistant';
export type ChatMessage = { role: ChatRole; text: string };

export type CoachContext = {
  level: string | null;
  goal: string | null;
  access: string[];
  hcp: string;
  streak: number;
};

// EXPO_PUBLIC_ vars are inlined into the client bundle at build time.
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
export const coachIsLive = !!API_KEY;

function profileLine(ctx: CoachContext): string {
  const level = levelData.find((l) => l.key === ctx.level)?.label ?? 'Improver';
  const goal = goalData.find((g) => g.key === ctx.goal)?.label ?? 'lower their score';
  const access = ctx.access.length
    ? ctx.access.map((k) => accessData.find((a) => a.key === k)?.label ?? k).join(', ')
    : 'a driving range';
  const hcp = ctx.hcp || 'unknown';
  return `Level: ${level}. Main goal: "${goal}". Can practice at: ${access}. Handicap: ${hcp}. Current streak: ${ctx.streak} days.`;
}

function buildSystemPrompt(ctx: CoachContext): string {
  const catalog = allDrills()
    .map((d) => `- ${d.name} (${d.skill}/${d.sub}, ${d.duration}, ${d.whereShort}): ${d.metric}`)
    .join('\n');

  return `You are the GolfHaus Coach — a warm, encouraging personal golf coach living inside the GolfHaus app. You help this golfer practice smarter and enjoy the game.

The golfer:
${profileLine(ctx)}

Voice and format:
- Friendly, concrete, and motivating — never condescending. Celebrate effort.
- Keep replies short: 2-4 tight paragraphs at most, or a short list. No walls of text.
- Plain text only. No markdown headers, no emoji.
- When practice advice helps, recommend specific drills from the GolfHaus library below by name, and say briefly why. Only recommend drills the golfer can actually do given where they practice.
- You can also answer questions about how the app works (Today's plan, drill library, sessions, progress radar, streaks).
- Do not give medical advice or diagnose injuries; suggest they see a professional for pain.

GolfHaus drill library:
${catalog}`;
}

async function callClaude(history: ChatMessage[], ctx: CoachContext): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY as string,
      'anthropic-version': '2023-06-01',
      // Allows the call from browser-origin runtimes (Expo web). Harmless on native.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: buildSystemPrompt(ctx),
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
function demoReply(history: ChatMessage[], ctx: CoachContext): string {
  const last = [...history].reverse().find((m) => m.role === 'user')?.text.toLowerCase() ?? '';
  const has = (...w: string[]) => w.some((x) => last.includes(x));

  if (has('putt', 'green', 'three-putt', '3-putt')) {
    return "Putting is where scores quietly leak away. Start with The Clock Drill for pace — get 8 of 10 lag putts to die within a putter-length of the hole. Once your speed is steady, Gate Putting sharpens your start line. Ten focused minutes beats an hour of aimless rolling.";
  }
  if (has('chip', 'short game', 'around the green', 'pitch', 'bunker')) {
    return "Great instinct — most saved shots live inside 50 metres. Try the Landing Spot Ladder: pick a spot, land it there, and let the ball release. Aim for 7 of 10 finishing close. If you're short-sided, the High Soft Flop is your escape. Keep the tempo lazy and let the loft do the work.";
  }
  if (has('slice', 'straight', 'hook', 'direction', 'aim')) {
    return "A slice is usually aim plus an open face. Lay down an Alignment Stick Setup so your eyes learn what 'straight' really looks like — half of all misses are just aim. Then groove Tee Height Ladder to find the centre of the face; centred strikes curve far less. Small setup fixes, big payoff.";
  }
  if (has('distance', 'farther', 'further', 'power', 'driver', 'drive')) {
    return "More distance comes from centre strikes and tempo, not swinging harder. Work the Tee Height Ladder to flush the driver, and build rhythm with One-Hand Tempo at home. Once you're finding the middle, speed follows on its own — no muscle required.";
  }
  if (has('break 100', 'score', 'lower', 'handicap')) {
    return "Breaking 100 is a short-game game. Bank easy shots around the green with the Landing Spot Ladder and kill three-putts with The Clock Drill. Two dropped strokes a round adds up fast. Stack a few sessions this week and your card will thank you.";
  }
  if (has('today', 'practice', 'plan', 'what should i')) {
    return `Today's plan is a short-game focus — three quick drills, about 28 minutes. Start with the Landing Spot Ladder, then The Clock Drill, and finish with One-Hand Tempo. You're on a ${ctx.streak}-day streak, so let's keep it rolling.`;
  }
  return "I'm your GolfHaus coach — tell me what's bugging you in your game (putting, chipping, driving, staying straight) or what you're hoping to work on, and I'll point you to the right drills. What are we sorting out today?";
}

export async function coachReply(history: ChatMessage[], ctx: CoachContext): Promise<string> {
  if (!coachIsLive) {
    // Small delay so the typing indicator reads naturally.
    await new Promise((r) => setTimeout(r, 500));
    return demoReply(history, ctx);
  }
  return callClaude(history, ctx);
}

export const COACH_GREETING =
  "Hey KC — I'm your GolfHaus coach. Ask me anything about your game or the app, and I'll help you practice smarter. What's on your mind?";

export const COACH_SUGGESTIONS = [
  'What should I practice today?',
  "I can't stop slicing it",
  'How do I break 100?',
  'Help my putting',
];
