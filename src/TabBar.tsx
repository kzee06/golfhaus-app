import React from 'react';
import { Pressable, View } from 'react-native';
import { colors, radius, shadow } from './theme';
import { Icon, NavDrills, NavProgress } from './Icon';

export type Tab = 'today' | 'drills' | 'progress' | 'you';

export default function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: { key: Tab; render: (active: boolean) => React.ReactNode }[] = [
    { key: 'today', render: (a) => <Icon name="navHome" size={23} color={a ? colors.white : colors.ink40} sw={2} /> },
    { key: 'drills', render: (a) => <NavDrills color={a ? colors.white : colors.ink40} /> },
    { key: 'progress', render: (a) => <NavProgress color={a ? colors.white : colors.ink40} /> },
    { key: 'you', render: (a) => <Icon name="navYou" size={23} color={a ? colors.white : colors.ink40} sw={2} /> },
  ];
  return (
    <View style={[{ position: 'absolute', bottom: 26, left: 26, right: 26, height: 66, borderRadius: radius.nav, backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 14 }, shadow.nav]}>
      {items.map((it) => {
        const active = tab === it.key;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)} style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.ink : 'transparent' }}>
            {it.render(active)}
          </Pressable>
        );
      })}
    </View>
  );
}
