import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon, ChevronRight } from '../Icon';
import { Activity, glyphForActivity, ACTIVITY_TYPE_LABEL, PILLAR_OF } from '../content';

const pillStyle = {
  fontFamily: fonts.displaySemi,
  fontSize: 11,
  color: 'rgba(20,20,20,0.6)',
  backgroundColor: colors.fill05,
  paddingVertical: 3,
  paddingHorizontal: 8,
  borderRadius: 7,
  overflow: 'hidden' as const,
};

const DIFF = ['', 'Gentle', 'Easy', 'Moderate', 'Hard', 'Demanding'];

export function difficultyLabel(a: Activity): string {
  if (a.type === 'drill') {
    return a.skillLevel === 'all' ? 'All levels' : a.skillLevel[0].toUpperCase() + a.skillLevel.slice(1);
  }
  return DIFF[a.physDifficulty] || 'Moderate';
}

// Glyph tile fallback for activities without photography.
function GlyphTile({ activity, size }: { activity: Activity; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 15, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={glyphForActivity(activity)} size={size * 0.42} color={colors.white} sw={1.8} />
    </View>
  );
}

export default function ActivityCard({ activity, onPress }: { activity: Activity; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 11, flexDirection: 'row', gap: 13, alignItems: 'center' }, shadow.cardSoft]}>
      {activity.thumbnail ? (
        <View style={{ width: 72, height: 72, borderRadius: 15, overflow: 'hidden', backgroundColor: colors.ink }}>
          <Image source={activity.thumbnail} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        </View>
      ) : (
        <GlyphTile activity={activity} size={72} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: colors.ink }} numberOfLines={1}>{activity.title}</Text>
        {/* Always golf context: how this improves the golfer's game. */}
        <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: colors.ink55, marginTop: 3, lineHeight: 18 }} numberOfLines={2}>{activity.golfBenefit}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
          <Text style={pillStyle}>{activity.durationMin} min</Text>
          <Text style={pillStyle}>{difficultyLabel(activity)}</Text>
          <Text style={pillStyle}>{activity.category}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.ink30} />
    </Pressable>
  );
}

export { PILLAR_OF };
