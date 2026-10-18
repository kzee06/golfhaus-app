import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme';
import { PillTabBar } from '../../src/components';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs tabBar={(props) => <PillTabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.canvas } }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="play" options={{ title: 'Play' }} />
      <Tabs.Screen name="courses" options={{ title: 'Courses' }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
