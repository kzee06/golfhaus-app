import React from 'react';
import { Image, Pressable, Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, fonts, radius, shadow } from './theme';
import { ASSETS } from './data';
import { PlayIcon } from './Icon';

export function Wordmark({ height = 26, white = false }: { height?: number; white?: boolean }) {
  // Raster wordmark keeps aspect ~ 224/38. Use exact source aspect via resizeMode.
  return (
    <Image
      source={white ? ASSETS.wordmarkWhite : ASSETS.wordmarkDark}
      resizeMode="contain"
      style={{ height, width: height * 6.6 }}
    />
  );
}

// Full-width ink CTA. Optional play glyph and trailing/leading content.
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  height = 60,
  br = radius.pill,
  play = false,
  right,
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  height?: number;
  br?: number;
  play?: boolean;
  right?: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          height,
          borderRadius: br,
          backgroundColor: disabled ? colors.disabledBg : colors.ink,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        !disabled && shadow.button,
        style,
      ]}
    >
      {play && <PlayIcon size={18} color={disabled ? colors.disabledText : colors.white} />}
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 17, color: disabled ? colors.disabledText : colors.white }}>{label}</Text>
      {right}
    </Pressable>
  );
}

export function Kicker({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return (
    <Text style={[{ fontFamily: fonts.displaySemi, fontSize: 12, color: colors.ink, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }, style]}>
      {children}
    </Text>
  );
}

export function ScreenTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.screenTitle}>{children}</Text>;
}

export const styles = StyleSheet.create({
  screenTitle: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 30,
    letterSpacing: -0.9,
    color: colors.ink,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: 29,
    lineHeight: 32,
    letterSpacing: -0.8,
    color: colors.ink,
    marginBottom: 8,
  },
  sub: { fontFamily: fonts.body, fontSize: 15, color: colors.ink55, lineHeight: 21 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cardLg,
    ...shadow.card,
  },
  coachCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border18,
    borderRadius: radius.cardLg,
    padding: 18,
  },
});

// Coach label row: ink rounded tile + sparkle + "LABEL"
export function CoachLabel({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 11 }}>
      <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <SparkleWhite />
      </View>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, letterSpacing: 0.5, color: colors.ink }}>{text}</Text>
    </View>
  );
}

function SparkleWhite() {
  const { Sparkle } = require('./Icon');
  return <Sparkle size={14} color={colors.white} />;
}
