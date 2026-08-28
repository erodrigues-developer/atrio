import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import {
  Bell,
  CalendarCheck,
  CircleHelp,
  MessageCircle,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { ConciergeInputBar } from '@/src/design-system/product/ConciergeInputBar';
import { ConciergeMessageBubble } from '@/src/design-system/product/ConciergeMessageBubble';
import { QuickSuggestionChip } from '@/src/design-system/product/QuickSuggestionChip';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import {
  createConciergeMessage,
  listConciergeMessages,
  type ConciergeMessageResponse,
} from '@/src/services/atrio-api';
import { connectGuestConcierge, type ConciergeRealtimeMessage } from '@/src/services/concierge-realtime';
import { getAccessToken, useSession } from '@/src/stores/session.store';

const suggestionIcons: Record<string, LucideIcon> = {
  help: CircleHelp,
  recommendation: Sparkles,
  reservation: CalendarCheck,
  request: Bell,
  team: Users,
};

function mapMessage(message: ConciergeMessageResponse) {
  return {
    id: message.id,
    sender: message.sender,
    text: message.text,
    createdAt: message.createdAt,
  };
}

type ConciergeMessage = ReturnType<typeof mapMessage>;

function mergeMessages(current: ConciergeMessage[], incoming: ConciergeMessage[]) {
  const byId = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort((first, second) => first.createdAt.localeCompare(second.createdAt));
}

function mapRealtimeMessage(message: ConciergeRealtimeMessage): ConciergeMessage {
  return { id: message.id, sender: message.sender, text: message.text, createdAt: message.createdAt };
}

export default function ConciergeScreen() {
  const isFocused = useIsFocused();
  const session = useSession();
  const tabBarHeight = useBottomTabBarHeight();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [quickSuggestions, setQuickSuggestions] = useState<
    { id: string; label: string; icon: string }[]
  >([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function scrollToConversationEnd(animated = true) {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }

  useEffect(() => {
    if (!isFocused || !session?.stayId) {
      return;
    }

    let isMounted = true;

    listConciergeMessages(session.stayId)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setMessages((current) => mergeMessages(current, response.messages.map(mapMessage)));
        setQuickSuggestions(response.quickSuggestions);
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Nao foi possivel carregar a conversa.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isFocused, session?.stayId]);

  useEffect(() => {
    const token = getAccessToken();
    if (!isFocused || !session?.stayId || !token) return;

    const socket = connectGuestConcierge(token);
    const onMessage = (message: ConciergeRealtimeMessage) => {
      if (message.stayId !== session.stayId) return;
      setMessages((current) => mergeMessages(current, [mapRealtimeMessage(message)]));
      setErrorMessage(null);
    };
    const onSocketError = (payload: { message?: string }) => {
      if (payload.message) setErrorMessage(payload.message);
    };

    socket.on('concierge:message', onMessage);
    socket.on('concierge:error', onSocketError);

    return () => {
      socket.off('concierge:message', onMessage);
      socket.off('concierge:error', onSocketError);
      socket.disconnect();
    };
  }, [isFocused, session?.stayId]);

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
  }, [messages.length]);

  async function sendMessage(text: string, source?: string) {
    if (!session?.stayId) {
      return;
    }

    try {
      const response = await createConciergeMessage(session.stayId, { text, source });
      setMessages((currentMessages) => mergeMessages(currentMessages, [
        mapMessage(response.message),
        ...(response.reply ? [mapMessage(response.reply)] : []),
      ]));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel enviar sua mensagem.',
      );
    }
  }

  function handleSuggestionPress(suggestion: { id: string; label: string }) {
    void sendMessage(suggestion.label, suggestion.id);
  }

  function handleSendMessage() {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    setDraftMessage('');
    void sendMessage(trimmedMessage, 'typed_message');
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
        <YStack flex={1} paddingBottom={tabBarHeight}>
          <ScrollView
            contentContainerStyle={{
              paddingTop: spacing.lg,
              paddingHorizontal: spacing.xxl,
              paddingBottom: spacing.xl,
            }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollToConversationEnd(true)}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}>
            <YStack gap={spacing.xxl}>
              <YStack gap={spacing.sm}>
                <Text letterSpacing={-0.5} variant="title1">
                  Concierge
                </Text>
                <Text colorToken="textSecondary" maxWidth="92%" variant="body">
                  Como podemos ajudar durante a sua estadia?
                </Text>
              </YStack>

              {quickSuggestions.length > 0 ? (
                <YStack gap={spacing.md}>
                  <Text variant="bodyMedium">Sugestões rápidas</Text>
                  <XStack columnGap={spacing.sm} flexWrap="wrap" rowGap={spacing.sm}>
                    {quickSuggestions.map((suggestion) => (
                      <QuickSuggestionChip
                        icon={suggestionIcons[suggestion.id] ?? MessageCircle}
                        key={suggestion.id}
                        label={suggestion.label}
                        onPress={() => handleSuggestionPress(suggestion)}
                      />
                    ))}
                  </XStack>
                </YStack>
              ) : null}

              {messages.length > 0 ? (
                <YStack gap={spacing.md}>
                  {messages.map((message) => (
                    <ConciergeMessageBubble key={message.id} message={message} />
                  ))}
                </YStack>
              ) : null}

              {errorMessage ? (
                <Text colorToken="danger" variant="bodySmall">
                  {errorMessage}
                </Text>
              ) : null}
            </YStack>
          </ScrollView>

          <YStack
            backgroundColor={colors.background}
            borderTopColor={colors.borderSoft}
            borderTopWidth={1}
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
