import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Text, View, Easing } from 'react-native';
import { colors, fonts, shadow } from '../theme';
import { Icon, CheckIcon } from '../Icon';
import { PrimaryButton } from '../ui';

export default function Done({ streak, logMade, onBack }: { streak: number; logMade: number | null; onBack: () => void }) {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(pop, { toValue: 1, duration: 500, easing: Easing.bezier(0.34, 1.56, 0.64, 1), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [pop]);
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  const msg =
    logMade !== null && logMade >= 7
      ? "That's a strong session — your chipping is really coming along. Your coach will push it a touch tomorrow."
      : "Every rep counts. We'll keep this one in the plan and build on it next time.";

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
      <Animated.View style={[{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 28, opacity: pop, transform: [{ scale }] }, shadow.button]}>
        <CheckIcon size={46} color={colors.white} sw={3} />
      </Animated.View>
      <Text style={{ fontFamily: fonts.display, fontSize: 30, color: colors.ink, marginBottom: 12, textAlign: 'center', letterSpacing: -0.7 }}>Nice work, KC.</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.ink55, textAlign: 'center', maxWidth: 300, marginBottom: 8 }}>{msg}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 38, backgroundColor: colors.fill10, borderWidth: 1, borderColor: 'rgba(20,20,20,0.22)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14 }}>
        <Icon name="flame" size={18} color={colors.ink} />
        <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.ink }}>{streak}-day streak</Text>
      </View>
      <PrimaryButton label="Back to home" onPress={onBack} style={{ width: '100%', maxWidth: 320 }} />
    </View>
  );
}
