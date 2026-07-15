import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, radius, shadow } from '../theme';
import { Sparkle } from '../Icon';
import { Wordmark } from '../ui';
import { ChatMessage, coachReply, coachIsLive, COACH_GREETING, COACH_SUGGESTIONS } from '../coach';
import { Profile } from '../profile';
import { SessionRecord } from '../progress';

function SendGlyph({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CoachAvatar() {
  return (
    <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
      <Sparkle size={16} color={colors.white} />
    </View>
  );
}

export default function Coach({ profile, streak, sessions }: { profile: Profile; streak: number; sessions: SessionRecord[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: COACH_GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    scrollToEnd();
    try {
      const reply = await coachReply(next, profile, streak, sessions);
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', text: `Sorry — I couldn't reach the coaching service just now. (${e?.message ?? 'network error'})` }]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* header */}
      <View style={{ paddingTop: 58, paddingHorizontal: 24, paddingBottom: 12 }}>
        <View style={{ marginBottom: 16 }}>
          <Wordmark height={44} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink55, marginBottom: 2 }}>Your AI golf coach</Text>
            <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, color: colors.ink }}>Coach</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.fill06, borderWidth: 1, borderColor: colors.border12, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 12 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: coachIsLive ? colors.ink : colors.ink40 }} />
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, color: colors.ink55 }}>{coachIsLive ? 'Live' : 'Demo'}</Text>
          </View>
        </View>
      </View>

      {/* messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 14 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToEnd}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <View key={i} style={{ alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: colors.ink, borderRadius: 20, borderBottomRightRadius: 6, paddingVertical: 12, paddingHorizontal: 16 }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 22, color: colors.white }}>{m.text}</Text>
            </View>
          ) : (
            <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end', maxWidth: '90%' }}>
              <CoachAvatar />
              <View style={[{ flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 20, borderBottomLeftRadius: 6, paddingVertical: 12, paddingHorizontal: 16 }, shadow.cardSoft]}>
                <Text style={{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 23, color: colors.ink }}>{m.text}</Text>
              </View>
            </View>
          )
        )}

        {loading && (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <CoachAvatar />
            <View style={[{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 20, borderBottomLeftRadius: 6, paddingVertical: 14, paddingHorizontal: 18 }, shadow.cardSoft]}>
              <ActivityIndicator size="small" color={colors.ink40} />
            </View>
          </View>
        )}

        {showSuggestions && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, paddingLeft: 40 }}>
            {COACH_SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => send(s)} style={{ borderWidth: 1, borderColor: colors.border12, backgroundColor: colors.white, borderRadius: 16, paddingVertical: 9, paddingHorizontal: 14 }}>
                <Text style={{ fontFamily: fonts.bodyMed, fontSize: 13.5, color: colors.ink }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* input bar — lifted above the floating tab bar (26 inset + 66 height + gap) */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 104, flexDirection: 'row', alignItems: 'flex-end', gap: 10, backgroundColor: colors.canvas }}>
        <View style={{ flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border12, borderRadius: 24, paddingHorizontal: 18, paddingVertical: Platform.OS === 'ios' ? 12 : 4, minHeight: 48, justifyContent: 'center' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach anything…"
            placeholderTextColor={colors.ink40}
            style={{ fontFamily: fonts.body, fontSize: 15.5, color: colors.ink, maxHeight: 120 }}
            multiline
            onSubmitEditing={() => send()}
            blurOnSubmit={false}
            returnKeyType="send"
          />
        </View>
        <Pressable
          onPress={() => send()}
          disabled={!input.trim() || loading}
          style={[{ width: 48, height: 48, borderRadius: 24, backgroundColor: input.trim() && !loading ? colors.ink : colors.disabledBg, alignItems: 'center', justifyContent: 'center' }, input.trim() && !loading ? shadow.button : null]}
        >
          <SendGlyph color={input.trim() && !loading ? colors.white : colors.disabledText} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
