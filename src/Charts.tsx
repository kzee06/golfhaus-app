import React from 'react';
import Svg, { Polygon, Line, Circle, Text as SvgText, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';
import { skills, trend } from './data';
import { fonts } from './theme';

// Radar: now (filled ink polygon + dots) over then (dashed grey polygon), 8 axes.
export function Radar() {
  const cx = 150, cy = 148, R = 104, n = skills.length;
  const pt = (i: number, r: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const grid = [0.25, 0.5, 0.75, 1].map((f, gi) => (
    <Polygon key={'g' + gi} points={skills.map((_, i) => pt(i, R * f).join(',')).join(' ')} fill="none" stroke="rgba(20,20,20,0.09)" strokeWidth={1} />
  ));
  const axes = skills.map((_, i) => {
    const [x, y] = pt(i, R);
    return <Line key={'a' + i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(20,20,20,0.07)" strokeWidth={1} />;
  });
  const thenPts = skills.map((s, i) => pt(i, (R * s.then) / 100).join(',')).join(' ');
  const nowPts = skills.map((s, i) => pt(i, (R * s.now) / 100).join(',')).join(' ');
  const dots = skills.map((s, i) => {
    const [x, y] = pt(i, (R * s.now) / 100);
    return <Circle key={'d' + i} cx={x} cy={y} r={3.5} fill="#141414" />;
  });
  const labels = skills.map((s, i) => {
    const [x, y] = pt(i, R + 17);
    const weak = s.now < 50;
    return (
      <SvgText
        key={'l' + i}
        x={x}
        y={y}
        fill={weak ? '#141414' : 'rgba(20,20,20,0.6)'}
        fontSize={10.5}
        fontWeight={weak ? '700' : '500'}
        fontFamily={fonts.displaySemi}
        textAnchor={Math.abs(x - cx) < 6 ? 'middle' : x > cx ? 'start' : 'end'}
      >
        {s.key}
      </SvgText>
    );
  });
  return (
    <Svg width={300} height={300} viewBox="0 0 300 300">
      {grid}
      {axes}
      <Polygon points={thenPts} fill="none" stroke="rgba(20,20,20,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
      <Polygon points={nowPts} fill="rgba(20,20,20,0.18)" stroke="#141414" strokeWidth={2} />
      {dots}
      {labels}
    </Svg>
  );
}

// Handicap trend area-line sparkline.
export function TrendChart({ width }: { width: number }) {
  const w = 318, h = 76, pad = 4;
  const vals = trend, max = Math.max(...vals), min = Math.min(...vals);
  const xs = (i: number) => pad + (i * (w - pad * 2)) / (vals.length - 1);
  const ys = (v: number) => pad + ((v - min) / (max - min)) * (h - pad * 2 - 6) + 3;
  const line = vals.map((v, i) => `${xs(i)},${ys(v)}`).join(' ');
  const area = `${pad},${h} ` + line + ` ${w - pad},${h}`;
  const last = vals.length - 1;
  return (
    <Svg width={width} height={(h / w) * width} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(20,20,20,0.3)" />
          <Stop offset="100%" stopColor="rgba(20,20,20,0)" />
        </LinearGradient>
      </Defs>
      <Polygon points={area} fill="url(#tg)" />
      <Polyline points={line} fill="none" stroke="#141414" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={xs(last)} cy={ys(vals[last])} r={4.5} fill="#141414" stroke="#ffffff" strokeWidth={2.5} />
    </Svg>
  );
}

// Circular countdown ring for the active session.
export function TimerRing({ progress }: { progress: number }) {
  // progress 0..1 elapsed. circumference for r=110 => 691.15
  const C = 691.15;
  const offset = C * (1 - progress);
  return (
    <Svg width={240} height={240} viewBox="0 0 240 240">
      <Circle cx={120} cy={120} r={110} stroke="rgba(20,20,20,0.08)" strokeWidth={10} fill="none" />
      <Circle
        cx={120}
        cy={120}
        r={110}
        stroke="#141414"
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${C}`}
        strokeDashoffset={offset}
        transform="rotate(-90 120 120)"
      />
    </Svg>
  );
}
