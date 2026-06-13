import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  Bell,
  CalendarCheck,
  CircleHelp,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { guestMock } from '@/src/mocks/guest.mock';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { ConciergeInputBar, conciergeInputBarHeight } from '@/src/design-system/product/ConciergeInputBar';
import { ConciergeMessageBubble } from '@/src/design-system/product/ConciergeMessageBubble';
import { QuickSuggestionChip } from '@/src/design-system/product/QuickSuggestionChip';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import {
  buildInitialConciergeMessages,
  conciergeQuickReplies,
  conciergeQuickSuggestions,
  defaultConciergeReply,
  type ConciergeMessage,
  type ConciergeQuickSuggestion,
} from '@/src/mocks/concierge.mock';
import { useSession } from '@/src/stores/session.store';

const suggestionIcons: Record<ConciergeQuickSuggestion, LucideIcon> = {
  'Preciso de ajuda': CircleHelp,
  'Quero uma recomendação': Sparkles,
  'Quero reservar algo': CalendarCheck,
  'Tenho uma solicitação': Bell,
  'Falar com a equipe': Users,
};

export default function ConciergeScreen() {
  const session = useSession();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const pendingReplyTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextMessageIndexRef = useRef(1);
  const guestName = session?.guestName?.trim() || guestMock.firstName;
  const [messages, setMessages] = useState<ConciergeMessage[]>(() => buildInitialConciergeMessages(guestName));
  const [draftMessage, setDraftMessage] = useState('');
  const [footerHeight, setFooterHeight] = useState(conciergeInputBarHeight + spacing.xl);
  const welcomeMessage = messages[0];
  const conversationMessages = messages.slice(1);
  const reservedConversationBottomSpace = footerHeight + tabBarHeight + insets.bottom + spacing.lg;

  function scrollToConversationEnd(animated = true) {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }

  useEffect(() => {
    return () => {
      pendingReplyTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      scrollToConversationEnd(false);
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  useEffect(() => {
    scrollToConversationEnd(true);
  }, [messages.length, footerHeight]);

  function createMessage(sender: ConciergeMessage['sender'], text: string): ConciergeMessage {
    const nextIndex = nextMessageIndexRef.current;
    nextMessageIndexRef.current += 1;

    return {
      id: `message-${nextIndex}`,
      sender,
      text,
    };
  }

  function queueHotelReply(text: string) {
    const timeoutId = setTimeout(() => {
      setMessages((currentMessages) => [...currentMessages, createMessage('hotel', text)]);
      pendingReplyTimeoutsRef.current = pendingReplyTimeoutsRef.current.filter(
        (registeredTimeoutId) => registeredTimeoutId !== timeoutId,
      );
    }, 480);

    pendingReplyTimeoutsRef.current.push(timeoutId);
  }

  function handleSuggestionPress(suggestion: ConciergeQuickSuggestion) {
    setMessages((currentMessages) => [...currentMessages, createMessage('guest', suggestion)]);
    queueHotelReply(conciergeQuickReplies[suggestion]);
  }

  function handleSendMessage() {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    setMessages((currentMessages) => [...currentMessages, createMessage('guest', trimmedMessage)]);
    setDraftMessage('');
    queueHotelReply(defaultConciergeReply);
  }

  return (
    <Screen
      dismissKeyboardOnPressOutside
      paddingBottom={0}
      paddingHorizontal={0}
      paddingTop={0}
      safeAreaEdges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <YStack flex={1}>
          <ScrollView
            contentContainerStyle={{
              paddingTop: spacing.lg,
              paddingHorizontal: spacing.xxl,
              paddingBottom: reservedConversationBottomSpace,
            }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollToConversationEnd(true)}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}>
            <YStack gap={spacing.xxl}>
              <YStack gap={spacing.sm}>
                <Text letterSpacing={-0.5} variant="title1">
                  Concierge
                </Text>
                <Text colorToken="textSecondary" maxWidth="92%" variant="body">
                  Como podemos ajudar durante a sua estadia?
                </Text>
              </YStack>

              {welcomeMessage ? <ConciergeMessageBubble message={welcomeMessage} /> : null}

              <YStack gap={spacing.md}>
                <Text variant="bodyMedium">Sugestões rápidas</Text>
                <XStack columnGap={spacing.sm} flexWrap="wrap" rowGap={spacing.sm}>
                  {conciergeQuickSuggestions.map((suggestion) => (
                    <QuickSuggestionChip
                      icon={suggestionIcons[suggestion]}
                      key={suggestion}
                      label={suggestion}
                      onPress={() => handleSuggestionPress(suggestion)}
                    />
                  ))}
                </XStack>
              </YStack>

              {conversationMessages.length > 0 ? (
                <YStack gap={spacing.md}>
                  {conversationMessages.map((message) => (
                    <ConciergeMessageBubble key={message.id} message={message} />
                  ))}
                </YStack>
              ) : null}
            </YStack>
          </ScrollView>

          <YStack
            backgroundColor={colors.background}
            borderTopColor={colors.borderSoft}
            borderTopWidth={1}
            bottom={0}
            left={0}
            onLayout={(event) => {
              const nextHeight = event.nativeEvent.layout.height;

              if (Math.abs(nextHeight - footerHeight) > 1) {
                setFooterHeight(nextHeight);
              }
            }}
            position="absolute"
            right={0}
            zIndex={1}>
            <YStack
              backgroundColor={colors.background}
              paddingBottom={spacing.md}
              paddingHorizontal={spacing.xxl}
              paddingTop={spacing.md}
              width="100%">
              <ConciergeInputBar onChangeText={setDraftMessage} onSend={handleSendMessage} value={draftMessage} />
            </YStack>
          </YStack>
        </YStack>
      </KeyboardAvoidingView>
    </Screen>
  );
}
