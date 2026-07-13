// Drill catalog + sample data — copy lifted verbatim from the design prototype.
import { ImageSourcePropType } from 'react-native';

const IMG = {
  chip: require('../assets/drills/drill-chip.webp') as ImageSourcePropType,
  putt: require('../assets/drills/drill-putt.webp') as ImageSourcePropType,
  tempo: require('../assets/drills/drill-tempo.webp') as ImageSourcePropType,
  drive: require('../assets/drills/drill-drive.webp') as ImageSourcePropType,
  irons: require('../assets/drills/drill-irons.webp') as ImageSourcePropType,
  setup: require('../assets/drills/drill-setup.webp') as ImageSourcePropType,
};

export const ASSETS = {
  hero: require('../assets/drills/golf-hero.webp') as ImageSourcePropType,
  wordmarkDark: require('../assets/drills/golfhaus-dark.png') as ImageSourcePropType,
  wordmarkWhite: require('../assets/drills/golfhaus-white.png') as ImageSourcePropType,
};

export type Drill = {
  id: string;
  num?: string;
  img: ImageSourcePropType;
  name: string;
  skill: string;
  sub: string;
  where: string;
  whereShort: string;
  duration: string;
  durationSec: number;
  difficulty: string;
  level: string;
  logQ: string;
  metricShort: string;
  why: string;
  steps: string[];
  cues: string[];
  metric: string;
};

export const drills: Drill[] = [
  {
    id: 'ladder', num: '01', img: IMG.chip, name: 'Landing Spot Ladder', skill: 'Short Game', sub: 'Chipping',
    where: 'Range or backyard', whereShort: 'Range', duration: '12 min', durationSec: 720,
    difficulty: 'Easy', level: 'Beginner',
    logQ: 'How many of 10 chips finished close?', metricShort: '7 of 10',
    why: "Here's the thing — most shots leak away from inside 50 metres, not off the tee. You said you want to start lowering your score, so we're going where it's quickest: getting your chips to finish close. Pick a landing spot, land it there, and let the ball do the rest. Nail this and three shots around the green become two. Easy wins, no swing overhaul.",
    steps: [
      'Drop 10 balls just off the edge of the green.',
      'Pick a clear landing spot — a leaf, a towel, an old divot.',
      'Make relaxed, equal-length swings and let the loft lift it.',
      'Land it on your spot. Don’t chase the hole — trust the roll.',
    ],
    cues: ['Weight slightly forward, stays there', 'Quiet hands — rock the shoulders', 'Same easy tempo every chip'],
    metric: 'Land 7 of 10 chips inside a towel-width zone.',
  },
  {
    id: 'clock', num: '02', img: IMG.putt, name: 'The Clock Drill', skill: 'Putting', sub: 'Distance control',
    where: 'Practice green or mat', whereShort: 'Green', duration: '10 min', durationSec: 600,
    difficulty: 'Easy', level: 'Beginner',
    logQ: 'How many of 10 lag putts stopped close?', metricShort: '8 of 10',
    why: "Three-putts are quiet score-killers — and they almost always come from speed, not line. This one trains your feel for distance so the first putt cosies up next to the hole. Get your pace right and the second putt becomes a tap-in. It’s the least glamorous part of golf and the fastest way to save shots.",
    steps: [
      'Place balls at 3, 6 and 9 feet around one hole.',
      'Putt the closest ring first, then work outward.',
      'Watch the pace, not the line — aim to die it at the hole.',
      'Any putt that finishes past the hole, start the ring again.',
    ],
    cues: ['Eyes over the ball at setup', 'Smooth back, smooth through', 'Let the putter do the work'],
    metric: 'Get 8 of 10 lag putts to stop within a putter-length.',
  },
  {
    id: 'tempo', num: '03', img: IMG.tempo, name: 'One-Hand Tempo', skill: 'Setup & Tempo', sub: 'Fundamentals',
    where: 'At home', whereShort: 'Home', duration: '6 min', durationSec: 360,
    difficulty: 'Easy', level: 'New-friendly',
    logQ: 'How many of 10 swings felt smooth?', metricShort: '7 of 10',
    why: "A repeatable swing starts with tempo you can actually feel — and you don’t need a ball or a range to build it. Slowing down and swinging with one hand teaches your body the rhythm that holds up under pressure. Two minutes of this at home does more for your consistency than a bucket of balls smashed flat-out.",
    steps: [
      'Grip a mid-iron with your lead hand only, near the bottom.',
      'Make slow half-swings, feeling the club’s weight swing through.',
      'Count “one-two” back, “three” through — same every time.',
      'Add your other hand back on, keep the exact same rhythm.',
    ],
    cues: ['Loose grip pressure', 'Let it swing, don’t force it', 'Balanced finish, hold it'],
    metric: 'Make 7 of 10 swings that feel smooth and balanced.',
  },
];

export const library: Drill[] = [
  {
    id: 'gate', img: IMG.putt, name: 'Gate Putting', skill: 'Putting', sub: 'Start line',
    where: 'Practice green', whereShort: 'Green', duration: '8 min', durationSec: 480, difficulty: 'Easy', level: 'Beginner',
    logQ: 'How many of 10 rolled through clean?', metricShort: '8 of 10',
    why: "If your ball starts on the wrong line, even perfect speed misses. Two tees just wider than the ball make a gate — roll through it and you know your face was square at impact. It's the fastest feedback in golf: clip a tee and you saw exactly what went wrong.",
    steps: ['Stick two tees a ball-and-a-bit apart, just ahead of the ball.', 'Aim at a hole 6–8 feet away.', 'Roll putts through the gate without clipping either tee.', 'Clip one? Note which side and reset.'],
    cues: ['Eyes directly over the ball', 'Putter face square at the gate', 'Smooth, unhurried stroke'],
    metric: 'Roll 8 of 10 through the gate cleanly.',
  },
  {
    id: 'bump', img: IMG.chip, name: 'Bump & Run Bowls', skill: 'Short Game', sub: 'Chipping',
    where: 'Around the green', whereShort: 'Green', duration: '12 min', durationSec: 720, difficulty: 'Medium', level: 'Improver',
    logQ: 'How many of 10 finished in the zone?', metricShort: '6 of 10',
    why: "The lower you keep it, the more predictable it rolls. This trains the bread-and-butter shot that gets you out of trouble all round long — land it on the green early and let it release like a putt. Less air time, fewer surprises, more tap-ins.",
    steps: ['Use an 8 or 9-iron, ball back in your stance.', 'Pick a landing spot a few feet onto the green.', 'Make a putting-style stroke — minimal wrist.', 'Watch it release and roll toward the hole.'],
    cues: ['Hands ahead of the ball', 'Low follow-through', 'Trust the roll'],
    metric: 'Finish 6 of 10 within a flagstick of the hole.',
  },
  {
    id: 'tee', img: IMG.drive, name: 'Tee Height Ladder', skill: 'Driving', sub: 'Strike',
    where: 'Driving range', whereShort: 'Range', duration: '14 min', durationSec: 840, difficulty: 'Medium', level: 'Improver',
    logQ: 'How many of 10 found the middle?', metricShort: '6 of 10',
    why: "Catching the driver flush is mostly about where the ball sits and where you hit up. Laddering tee heights teaches your body to find the centre of the face every time — and centre strikes go straighter and further without swinging any harder.",
    steps: ['Tee the ball low for the first 5 swings.', 'Tee it standard height for the next 5.', 'Feel where the face meets the ball each time.', 'Settle on the height that finds the middle most.'],
    cues: ['Tilt slightly behind the ball', 'Sweep up through impact', 'Stay balanced to the finish'],
    metric: 'Find the centre on 6 of 10 drives.',
  },
  {
    id: 'towel', img: IMG.irons, name: 'Towel Under Arms', skill: 'Irons', sub: 'Connection',
    where: 'Range or home', whereShort: 'Home', duration: '7 min', durationSec: 420, difficulty: 'Easy', level: 'Beginner',
    logQ: 'How many of 10 stayed connected?', metricShort: '7 of 10',
    why: "Thin and fat iron shots usually come from arms running away from your body. A towel tucked under both arms keeps everything turning together — the move that produces crisp, consistent contact. It feels restrictive at first; that restriction is the lesson.",
    steps: ['Tuck a towel under both upper arms.', 'Make half-swings keeping the towel in place.', 'If it drops, your arms disconnected — reset.', 'Build up to fuller swings, towel still held.'],
    cues: ['Chest and arms turn together', 'No flailing at the top', 'Rotate through, towel stays put'],
    metric: 'Keep it tucked on 7 of 10 swings.',
  },
  {
    id: 'align', img: IMG.setup, name: 'Alignment Stick Setup', skill: 'Setup & Tempo', sub: 'Aim',
    where: 'At home', whereShort: 'Home', duration: '5 min', durationSec: 300, difficulty: 'Easy', level: 'New-friendly',
    logQ: 'How many of 10 setups felt square?', metricShort: '8 of 10',
    why: "Half of all misses are just aim. Laying a stick on the ground rewires your eyes to what 'straight' actually looks like — most amateurs aim well right without ever knowing it. Five minutes here saves you guessing on the course.",
    steps: ['Lay one stick along your toe line.', 'Lay a second pointing at your target.', 'Build your stance parallel to the sticks.', 'Step away, step back, rebuild it from scratch.'],
    cues: ['Feet, hips, shoulders all parallel', 'Aim the clubface first', 'Body lines follow the club'],
    metric: 'Build a square setup 8 of 10 times.',
  },
  {
    id: 'coin', img: IMG.putt, name: 'Coin Toss Lag', skill: 'Putting', sub: 'Distance control',
    where: 'Practice green', whereShort: 'Green', duration: '9 min', durationSec: 540, difficulty: 'Easy', level: 'Improver',
    logQ: 'How many of 10 stopped over the coin?', metricShort: '7 of 10',
    why: "Long putts are all about speed. Drop a coin as your target instead of a hole and suddenly you stop steering the line and start feeling the pace. Get lag putts to die right on top of the coin and three-putts quietly disappear from your card.",
    steps: ['Place a coin 25–35 feet away — no hole needed.', 'Putt to stop the ball directly over the coin.', 'Reset the coin a different distance each time.', 'Score a point for anything within a foot.'],
    cues: ['Look at the coin, not the ball', 'Longer stroke, same tempo', 'Let it die at the target'],
    metric: 'Stop 7 of 10 within a foot of the coin.',
  },
  {
    id: 'flop', img: IMG.chip, name: 'High Soft Flop', skill: 'Short Game', sub: 'Pitching',
    where: 'Around the green', whereShort: 'Green', duration: '11 min', durationSec: 660, difficulty: 'Hard', level: 'Advanced',
    logQ: 'How many of 10 landed soft?', metricShort: '5 of 10',
    why: "Sometimes you're short-sided with no green to work with — you need height and a soft landing, fast. This builds the confidence to open the face and swing through without decelerating. It's an advanced shot, but owning it turns scary lies into makeable pars.",
    steps: ['Open your stance and the clubface wide.', 'Play the ball forward, weight slightly left.', 'Make a long, unhurried swing — accelerate through.', 'Let the loft pop it up and land it soft.'],
    cues: ['Commit — never decelerate', 'Keep the face open through impact', 'Full finish, high hands'],
    metric: 'Land 5 of 10 softly on the green.',
  },
  {
    id: 'bunker', img: IMG.irons, name: 'Line in the Sand', skill: 'Short Game', sub: 'Bunker',
    where: 'Practice bunker', whereShort: 'Bunker', duration: '10 min', durationSec: 600, difficulty: 'Medium', level: 'Improver',
    logQ: 'How many of 10 escaped first try?', metricShort: '7 of 10',
    why: "Most bunker trouble comes from trying to hit the ball — you should be hitting the sand. Draw a line and practice splashing the sand at the same spot every time. Trust the bounce, take your consistent divot of sand, and the ball floats out on a cushion.",
    steps: ['Draw a line in the sand, no ball yet.', 'Splash sand starting right on the line.', 'Repeat until your entry point is consistent.', 'Add a ball just ahead of the line and swing the same.'],
    cues: ['Hit the sand, not the ball', 'Open face, use the bounce', 'Keep swinging through the sand'],
    metric: 'Escape on 7 of 10 first attempts.',
  },
  {
    id: 'punch', img: IMG.drive, name: 'Knock-Down Punch', skill: 'Irons', sub: 'Trajectory',
    where: 'Driving range', whereShort: 'Range', duration: '9 min', durationSec: 540, difficulty: 'Medium', level: 'Improver',
    logQ: 'How many of 10 flew low & straight?', metricShort: '6 of 10',
    why: "Wind wrecks scores when you only own one trajectory. A knock-down — ball back, shorter finish — flights it low and takes the wind out of play. It's also your go-to for control on tight holes. One club, three heights: that's how good players score.",
    steps: ['Take one more club than normal, grip down.', 'Play the ball an inch back in your stance.', 'Make a smooth ¾ backswing.', 'Finish low — hands stop around chest height.'],
    cues: ['Quiet, controlled tempo', 'Shorter follow-through', 'Cover the ball, hands ahead'],
    metric: 'Flight 6 of 10 low and on line.',
  },
  {
    id: 'mirror', img: IMG.tempo, name: 'Mirror Posture Check', skill: 'Setup & Tempo', sub: 'Posture',
    where: 'At home', whereShort: 'Home', duration: '5 min', durationSec: 300, difficulty: 'Easy', level: 'New-friendly',
    logQ: 'How many of 10 setups looked athletic?', metricShort: '8 of 10',
    why: "Good swings start from good posture, and you can't feel your own — but a mirror never lies. Two minutes checking your spine tilt and knee flex trains the athletic, balanced setup that makes every other move easier. It's the cheapest lesson in golf.",
    steps: ['Set up in front of a full-length mirror, face-on.', 'Check: soft knees, tilt from the hips, straight spine.', 'Turn to a down-the-line view and check again.', 'Step away and rebuild it from scratch each rep.'],
    cues: ['Tilt from the hips, not the waist', 'Weight in the balls of your feet', 'Arms hang naturally under shoulders'],
    metric: 'Nail an athletic setup 8 of 10 times.',
  },
  {
    id: 'threeball', img: IMG.drive, name: '9-Shot Shaping', skill: 'Driving', sub: 'Shot shaping',
    where: 'Driving range', whereShort: 'Range', duration: '15 min', durationSec: 900, difficulty: 'Hard', level: 'Advanced',
    logQ: 'How many of 9 shapes came off?', metricShort: '5 of 9',
    why: "The ultimate control drill: three heights times three curves. Working the ball on command means you truly own your face and path — and even if you only ever hit one shape on the course, chasing all nine sharpens your strike and awareness like nothing else.",
    steps: ['Hit low, medium, high with a straight ball first.', 'Add a draw at each height.', 'Add a fade at each height.', 'Call your shot out loud before every swing.'],
    cues: ['Face controls start, path controls curve', 'Commit to the shape fully', 'Reset between each attempt'],
    metric: 'Pull off 5 of the 9 shapes cleanly.',
  },
];

export const allDrills = (): Drill[] => [...drills, ...library];

export const skills = [
  { key: 'Driving', now: 60, then: 56 },
  { key: 'Irons', now: 52, then: 50 },
  { key: 'Short Game', now: 44, then: 30 },
  { key: 'Putting', now: 48, then: 38 },
  { key: 'Bunker', now: 38, then: 36 },
  { key: 'Setup', now: 64, then: 55 },
  { key: 'Swing', now: 50, then: 48 },
  { key: 'Course', now: 56, then: 52 },
];

export const trend = [30, 29, 29, 28, 27, 26, 25, 24];

export const recent = [
  { title: 'Short game focus', meta: 'Sat · 3 drills · 28 min', score: '8/10' },
  { title: 'Putting & tempo', meta: 'Thu · 2 drills · 20 min', score: '7/10' },
  { title: 'Driving accuracy', meta: 'Tue · 3 drills · 35 min', score: '6/10' },
];

export const levelData = [
  { key: 'new', label: 'Brand new', desc: 'Just picking up the clubs — or about to.' },
  { key: 'beginner', label: 'Beginner', desc: 'Played a bit, still finding my feet.' },
  { key: 'improver', label: 'Improver', desc: 'I can get round — now I want to get better.' },
];

export const goalData = [
  { key: 'confidence', label: 'I just want to start with confidence' },
  { key: 'straight', label: "I can't hit it straight" },
  { key: 'distance', label: 'I want more distance' },
  { key: 'short', label: 'My putting and chipping need work' },
  { key: 'unsure', label: "I'm not sure what I'm doing wrong" },
  { key: 'score', label: 'I want to break 100 / lower my score' },
];

export const accessData = [
  { key: 'range', label: 'Driving range' },
  { key: 'course', label: 'On the course' },
  { key: 'home', label: 'At home' },
  { key: 'mat', label: 'Putting mat' },
];

// icon key maps
export const goalIco: Record<string, string> = { confidence: 'sprout', straight: 'target', distance: 'zap', short: 'flag', unsure: 'help', score: 'trendDown' };
export const accessIco: Record<string, string> = { range: 'crosshair', course: 'flag', home: 'home', mat: 'mat' };
export const recentIco = ['flag', 'target', 'crosshair'];

export const buildLines = [
  'Reading your goal and level…',
  'Finding where you’ll save the most shots…',
  'Setting drills you can actually do…',
];

export const rationale =
  "Today's all about your short game — the fastest way to start knocking strokes off your score. We'll keep it light: three quick drills, mostly around the green.";
