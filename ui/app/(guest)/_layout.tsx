import { Redirect, Tabs, router, type Href } from 'expo-router';
import {
  BedDouble,
  Bell,
  Compass,
  House,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react-native';
import { Text as NativeText, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { StayContextBar } from '@/src/design-system/product/StayContextBar';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { stayMock } from '@/src/mocks/stay.mock';
import { useSession } from '@/src/stores/session.store';

const TAB_ICON_SIZE = 22;
const TAB_ICON_STROKE_WIDTH = 1.9;
const TAB_BAR_BASE_HEIGHT = 64;
const TAB_BAR_MIN_BOTTOM_PADDING = 12;

type GuestTabConfig = {
  accessibilityLabel: string;
  href: Href;
  icon: LucideIcon;
  label: string;
  name: 'today/index' | 'discover/index' | 'services/index' | 'stay' | 'concierge/index';
};

const guestTabs: GuestTabConfig[] = [
  {
    name: 'today/index',
    href: '/(guest)/today',
    label: 'Hoje',
    accessibilityLabel: 'Hoje',
    icon: House,
  },
  {
    name: 'discover/index',
    href: '/(guest)/discover',
    label: 'Experiências',
    accessibilityLabel: 'Experiências',
    icon: Compass,
  },
  {
    name: 'services/index',
    href: '/(guest)/services',
    label: 'Serviços',
    accessibilityLabel: 'Serviços',
    icon: Bell,
  },
  {
    name: 'stay',
    href: '/(guest)/stay',
    label: 'Estadia',
    accessibilityLabel: 'Estadia',
    icon: BedDouble,
  },
  {
    name: 'concierge/index',
    href: '/(guest)/concierge',
    label: 'Concierge',
    accessibilityLabel: 'Concierge',
    icon: MessageCircle,
  },
];

const hiddenGuestRoutes = [
  'discover/collection/[id]',
  'discover/experience/[id]',
  'discover/experience/[id]/schedule',
  'discover/experience/[id]/confirmation',
  'services/request/[type]',
  'services/request/[type]/confirmation',
] as const;

export default function GuestLayout() {
  const session = useSession();
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_PADDING);
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + tabBarBottomPadding;
  const roomNumber = session?.roomNumber ?? stayMock.roomNumber;
  const hotelName = session?.hotelName ?? stayMock.hotelName;
  const checkOutTime = session?.checkOutTime ?? stayMock.checkOutTimeLabel;

  if (!session?.isAuthenticated) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return (
    <YStack backgroundColor={colors.surface} flex={1}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <StayContextBar
          checkOutTime={checkOutTime}
          hotelName={hotelName}
          onPress={() => router.navigate('/(guest)/stay')}
          roomNumber={roomNumber}
        />
      </SafeAreaView>

      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: colors.background,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarHideOnKeyboard: false,
          tabBarBackground: () => <View style={{ flex: 1, backgroundColor: colors.surface }} />,
          tabBarIconStyle: {
            marginBottom: 2,
          },
          tabBarItemStyle: {
            height: 56,
            justifyContent: 'center',
            paddingHorizontal: 0,
            paddingTop: spacing.xs,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            lineHeight: 16,
            marginTop: 1,
          },
          tabBarLabelPosition: 'below-icon',
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderSoft,
            borderTopWidth: 1,
            bottom: 0,
            height: tabBarHeight,
            left: 0,
            paddingTop: 10,
            paddingBottom: tabBarBottomPadding,
            position: 'absolute',
            right: 0,
          },
        }}>
        {guestTabs.map(({ accessibilityLabel, href, icon: Icon, label, name }) => (
          <Tabs.Screen
            key={name}
            name={name}
            listeners={{
              tabPress: (event) => {
                event.preventDefault();
                router.navigate(href);
              },
            }}
            options={{
              href,
              title: label,
              tabBarAccessibilityLabel: accessibilityLabel,
              tabBarIcon: ({ color }) => (
                <Icon color={color} size={TAB_ICON_SIZE} strokeWidth={TAB_ICON_STROKE_WIDTH} />
              ),
              tabBarLabel: ({ color }) => (
                <NativeText
                  allowFontScaling={false}
                  maxFontSizeMultiplier={1}
                  numberOfLines={1}
                  style={{
                    color,
                    fontSize: label === 'Experiências' ? 10 : 12,
                    fontWeight: '500',
                    lineHeight: 16,
                    marginTop: 1,
                    textAlign: 'center',
                    width: '100%',
                  }}>
                  {label}
                </NativeText>
              ),
            }}
          />
        ))}
        {hiddenGuestRoutes.map((name) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              href: null,
            }}
          />
        ))}
      </Tabs>
    </YStack>
  );
}
