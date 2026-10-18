import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { fonts, radius, shadow, useTheme } from '../../src/theme';
import { Icon } from '../../src/Icon';

export default function TabsLayout() {
  const t = useTheme();
  const icon = (name: string) => ({ color }: { color: string }) => <Icon name={name} size={23} color={color} sw={2} />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.text,
        tabBarInactiveTintColor: t.text4,
        tabBarLabelStyle: { fontFamily: fonts.displaySemi, fontSize: 11, marginTop: 2 },
        tabBarStyle: {
          position: 'absolute',
          left: 18, right: 18, bottom: Platform.OS === 'ios' ? 28 : 18,
          height: 70, paddingTop: 8, paddingBottom: 10,
          borderRadius: radius.nav, borderTopWidth: 0,
          backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
          ...shadow.nav,
        },
        sceneStyle: { backgroundColor: t.canvas },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('navHome') }} />
      <Tabs.Screen name="play" options={{ title: 'Play', tabBarIcon: icon('flag') }} />
      <Tabs.Screen name="courses" options={{ title: 'Courses', tabBarIcon: icon('pin') }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity', tabBarIcon: icon('heart') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('navYou') }} />
    </Tabs>
  );
}
