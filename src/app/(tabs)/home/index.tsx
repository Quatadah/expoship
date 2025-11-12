import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ThemeToggle } from '../../../components/theme-toggle';

const StyledFeather = withUniwind(Feather);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  accent: string;
};

type FeatureHighlight = {
  id: string;
  title: string;
  description: string;
  points: { label: string; icon: keyof typeof Feather.glyphMap }[];
};

const quickActions: QuickAction[] = [
  {
    id: 'paywall',
    title: 'Manage Subscription',
    description: 'Preview the native paywall powered by RevenueCat + Stripe.',
    icon: 'credit-card',
    route: '/(tabs)/home/paywall',
    accent: '#F97316',
  },
  {
    id: 'themes',
    title: 'Personalize Theme',
    description: 'Switch between curated palettes with one tap.',
    icon: 'sun',
    route: '/(tabs)/home/themes',
    accent: '#8B5CF6',
  },
  {
    id: 'components',
    title: 'Component Library',
    description: 'Dive into 60+ polished HeroUI Native components.',
    icon: 'grid',
    route: '/(tabs)/components',
    accent: '#0EA5E9',
  },
];

const featureHighlights: FeatureHighlight[] = [
  {
    id: 'experience',
    title: 'Beautiful UX right out of the box',
    description:
      'Screen flows for onboarding, settings, paywalls, and authenticated sections are prebuilt so you can launch faster.',
    points: [
      { label: 'Delightful onboarding', icon: 'map' },
      { label: 'Native sheet modals', icon: 'square' },
      { label: 'HeroUI design system', icon: 'layers' },
    ],
  },
  {
    id: 'platform',
    title: 'Production integrations',
    description:
      'Supabase, RevenueCat, Stripe, typed Zustand store, and Expo Router configured with sensible defaults and type safety.',
    points: [
      { label: 'Realtime Supabase', icon: 'activity' },
      { label: 'Secure auth flows', icon: 'lock' },
      { label: 'Billing telemetry', icon: 'bar-chart-2' },
    ],
  },
];

const QuickActionCard: FC<{
  action: QuickAction;
  index: number;
  onPress: (route: string) => void;
}> = ({ action, index, onPress }) => {
  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 80).springify()}
      onPress={() => onPress(action.route)}
      className="overflow-hidden rounded-3xl border border-foreground/8 active:scale-[0.99]"
      style={{ shadowColor: action.accent, shadowOpacity: 0.08, shadowRadius: 14 }}
    >
      <LinearGradient
        colors={[action.accent + '1A', action.accent + '33']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: '100%', borderRadius: 24, padding: 22 }}
      >
        <View className="flex-row items-start gap-4">
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: action.accent + '26' }}
          >
            <StyledFeather name={action.icon} size={22} color={action.accent} />
          </View>
          <View className="flex-1 gap-2">
            <AppText className="text-lg font-semibold text-foreground">{action.title}</AppText>
            <AppText className="text-sm leading-5 text-foreground/65">
              {action.description}
            </AppText>
          </View>
          <StyledFeather name="arrow-right" size={18} className="text-foreground/40 mt-1" />
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const FeatureHighlightCard: FC<{
  feature: FeatureHighlight;
  index: number;
}> = ({ feature, index }) => {
  const accent = useThemeColor('accent');

  return (
    <Animated.View
      entering={FadeInUp.delay(250 + index * 120).springify()}
      className="rounded-3xl border border-foreground/8 bg-background/92 p-6"
      style={{
        shadowColor: accent,
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 12 },
      }}
    >
      <View className="gap-3">
        <AppText className="text-xl font-semibold text-foreground">{feature.title}</AppText>
        <AppText className="text-sm leading-6 text-foreground/65">{feature.description}</AppText>
        <View className="gap-2 pt-2">
          {feature.points.map((point) => (
            <View key={point.label} className="flex-row items-center gap-3">
              <View className="rounded-full bg-foreground/8 p-2">
                <StyledFeather name={point.icon} size={16} className="text-accent" />
              </View>
              <AppText className="text-sm text-foreground/70">{point.label}</AppText>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const accentColor = useThemeColor('accent');
  const foreground = useThemeColor('foreground');
  const highlights = useMemo(
    () => ['Supabase', 'HeroUI', 'Expo Router', 'RevenueCat', 'Stripe'],
    []
  );
  const insets = useSafeAreaInsets();

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScreenScrollView contentContainerClassName="px-6 pb-32" style={{ paddingTop: insets.top }}>
      <Animated.View entering={FadeInUp.springify()} className="pt-6 pb-10">
        <LinearGradient
          colors={[accentColor + '26', accentColor + '08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 32,
            padding: 24,
            borderWidth: 1,
            borderColor: accentColor + '22',
          }}
        >
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-3">
              <View className="flex-row items-center gap-2">
                <View className="rounded-full bg-accent/20 px-3 py-1">
                  <AppText className="text-[11px] font-semibold uppercase tracking-[0.4em] text-accent">
                    SaaS Starter
                  </AppText>
                </View>
                <StyledFeather name="zap" size={14} className="text-accent" />
              </View>
              <AppText className="text-3xl font-bold text-foreground leading-tight">
                Ship premium Expo apps without starting from scratch.
              </AppText>
              <AppText className="text-sm leading-6 text-foreground/65">
                ExpoShip pairs HeroUI Native with real integrations for auth, billing, payouts, and
                realtime collaboration so you can focus on your product.
              </AppText>
              <View className="flex-row gap-3 pt-3">
                <Button variant="primary" size="sm" onPress={() => handlePress('/(tabs)/home/paywall')}>
                  Preview Paywall
                </Button>
                <Button variant="ghost" size="sm" onPress={() => handlePress('/(tabs)/home/themes')}>
                  Switch Theme
                </Button>
              </View>
            </View>
            <View className="rounded-3xl border border-foreground/10 bg-background/80 p-2">
              <ThemeToggle />
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2 pt-6">
            {highlights.map((item, idx) => (
              <Animated.View
                key={item}
                entering={FadeInUp.delay(160 + idx * 80).springify()}
                className="rounded-full border border-foreground/10 bg-background/80 px-3 py-1.5"
              >
                <AppText className="text-xs font-semibold tracking-[0.3em] text-foreground/70">
                  {item}
                </AppText>
              </Animated.View>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      <View className="gap-6">
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <AppText className="text-xl font-bold text-foreground">Quick actions</AppText>
            <View className="flex-row items-center gap-2">
              <StyledFeather name="sparkles" size={16} className="text-accent" />
              <AppText className="text-xs uppercase tracking-[0.4em] text-foreground/50">
                native sheets
              </AppText>
            </View>
          </View>

          <View className="gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard key={action.id} action={action} index={index} onPress={handlePress} />
            ))}
          </View>
        </View>

        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <AppText className="text-xl font-bold text-foreground">Why ExpoShip?</AppText>
            <StyledFeather name="arrow-right" size={16} className="text-foreground/40" />
          </View>

          <View className="gap-4">
            {featureHighlights.map((feature, index) => (
              <FeatureHighlightCard key={feature.id} feature={feature} index={index} />
            ))}
          </View>
        </View>

        <View className="rounded-3xl border border-foreground/10 bg-background/92 p-6 gap-4 mt-6">
          <View className="flex-row items-center gap-3">
            <View
              className="rounded-2xl bg-accent/15 p-3"
              style={{ shadowColor: accentColor, shadowOpacity: 0.12, shadowRadius: 16 }}
            >
              <StyledFeather name="check-circle" size={24} className="text-accent" />
            </View>
            <AppText className="text-xl font-semibold text-foreground flex-1">
              Launch-ready building blocks
            </AppText>
          </View>
          <AppText className="text-sm text-foreground/65 leading-6">
            Authentication flows, native modals, onboarding journeys, billing dashboards, and a typed
            state store — everything your SaaS needs to go live.
          </AppText>
          <View className="flex-row flex-wrap gap-2 -mx-1">
            {['Auth', 'Billing', 'Realtime', 'Push', 'File storage', 'Analytics'].map((item) => (
              <View key={item} className="rounded-full bg-foreground/8 px-3 py-1.5 mx-1">
                <AppText className="text-xs font-medium text-foreground/60">{item}</AppText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScreenScrollView>
  );
}
