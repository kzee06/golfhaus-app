import React from 'react';
import { Pressable, View } from 'react-native';
import { colors, radius, shadow } from './theme';
import { Icon, NavDrills, NavProgress, Sparkle } from './Icon';

export type Tab = 'today' | 'drills' | 'coach' | 'progress' | 'you';

export default function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const glyph: Record<Exclude<Tab, 'coach'>, (a: boolean) => React.ReactNode> = {
    today: (a) => <Icon name="navHome" size={23} color={a ? colors.white : colors.ink40} sw={2} />,
    drills: (a) => <NavDrills color={a ? colors.white : colors.ink40} />,
    progress: (a) => <NavProgress color={a ? colors.white : colors.ink40} />,
    you: (a) => <Icon name="navYou" size={23} color={a ? colors.white : colors.ink40} sw={2} />,
  };

  const sideTab = (key: Exclude<Tab, 'coach'>) => {
    const active = tab === key;
    return (
      <Pressable key={key} onPress={() => onChange(key)} style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.ink : 'transparent' }}>
        {glyph[key](active)}
      </Pressable>
    );
  };

  const coachActive = tab === 'coach';

  return (
    <View style={[{ position: 'absolute', bottom: 26, left: 26, right: 26, height: 66, borderRadius: radius.nav, backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 }, shadow.nav]}>
      {sideTab('today')}
      {sideTab('drills')}

      {/* Coach — the assistant, featured with a ring like the reference's center tab */}
      <Pressable
        onPress={() => onChange('coach')}
        style={[
          { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: coachActive ? colors.ink : colors.white, borderWidth: 1.5, borderColor: colors.ink },
          coachActive ? shadow.button : shadow.cardSoft,
        ]}
      >
        <Sparkle size={22} color={coachActive ? colors.white : colors.ink} />
      </Pressable>

      {sideTab('progress')}
      {sideTab('you')}
    </View>
  );
}
