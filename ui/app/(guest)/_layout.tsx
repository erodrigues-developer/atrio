import { Redirect, Tabs, router } from 'expo-router';
import {
  BedDouble,
  Bell,
  Compass,
  House,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react-native';
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
const TAB_BAR_MAX_BOTTOM_PADDING = 20;

type GuestTabConfig = {
  accessibilityLabel: string;
  icon: LucideIcon;
  label: string;
  name:
    | 'today/index'
    | 'discover/index'
    | 'services/index'
    | 'stay/index'
    | 'concierge/index';
};

const guestTabs: GuestTabConfig[] = [
  {
    name: 'today/index',
    label: 'Hoje',
    accessibilityLabel: 'Hoje',
    icon: House,
  },
  {
    name: 'discover/index',
    label: 'Descobrir',
    accessibilityLabel: 'Descobrir',
    icon: Compass,
  },
  {
    name: 'services/index',
    label: 'Serviços',
    accessibilityLabel: 'Serviços',
    icon: Bell,
  },
  {
    name: 'stay/index',
    label: 'Estadia',
    accessibilityLabel: 'Estadia',
    icon: BedDouble,
  },
  {
    name: 'concierge/index',
    label: 'Concierge',
    accessibilityLabel: 'Concierge',
    icon: MessageCircle,
  },
];

const hiddenGuestRoutes = [
  'stay/wifi',
  'stay/requests/index',
  'stay/reservations',
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
  const tabBarBottomPadding = Math.min(
    Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_PADDING),
    TAB_BAR_MAX_BOTTOM_PADDING,
  );
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + tabBarBottomPadding;

  if (!session?.isAuthenticated) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return (
    <YStack backgroundColor={colors.background} flex={1}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <StayContextBar
          checkOutTime={stayMock.checkOutTime}
          hotelName={stayMock.hotelName}
          onPress={() => router.push('/(guest)/stay')}
          roomNumber={stayMock.roomNumber}
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
          tabBarIconStyle: {
            marginBottom: 2,
          },
          tabBarItemStyle: {
            height: 56,
            justifyContent: 'center',
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
            height: tabBarHeight,
            paddingTop: 10,
            paddingBottom: tabBarBottomPadding,
          },
        }}>
        {guestTabs.map(({ accessibilityLabel, icon: Icon, label, name }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: label,
              tabBarAccessibilityLabel: accessibilityLabel,
              tabBarIcon: ({ color }) => (
                <Icon color={color} size={TAB_ICON_SIZE} strokeWidth={TAB_ICON_STROKE_WIDTH} />
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
