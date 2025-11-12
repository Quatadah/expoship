import { useRouter } from 'expo-router';
import { Button, Card, Divider } from 'heroui-native';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, Image, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { useToast } from '../../components/toast-context';
import { useAuth } from '../../features/auth/use-auth';
import { paywallPlans } from '../../features/billing/paywall-data';
import { haptics } from '../../lib/haptics';

type Slide = {
  title: string;
  description: string;
  image: string;
};

const slides: Slide[] = [
  {
    title: 'Authenticate instantly',
    description:
      'Supabase Auth with secure email logins, OAuth providers, and RLS-powered JWT sessions.',
    image:
      'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/home-components-light.png',
  },
  {
    title: 'Monetize from day one',
    description:
      'Stripe payment sheets and RevenueCat subscriptions connect to unified premium state and analytics.',
    image:
      'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/showcase-paywall.png',
  },
  {
    title: 'Delight users automatically',
    description:
      'Motion, haptics, notifications, and AI helpers keep your mobile SaaS sticky and engaging.',
    image:
      'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/showcase-onboarding-dark-1.png',
  },
];

const { width } = Dimensions.get('window');

type SlideCardProps = {
  slide: Slide;
  index: number;
  width: number;
  scrollX: SharedValue<number>;
};

const SlideCard = ({ slide, index, width, scrollX }: SlideCardProps) => {
  const animatedContainerStyle = useAnimatedStyle(() => {
    'worklet';

    const position = index * width;
    const inputRange = [position - width, position, position + width];

    const opacity = interpolate(scrollX.value, inputRange, [0.55, 1, 0.55], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [28, 0, 28], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <View style={{ width }} className="px-6">
      <Animated.View
        entering={FadeInDown.springify()}
        style={[animatedContainerStyle, { flex: 1 }]}
      >
        <Card className="bg-background/90 border border-foreground/10 overflow-hidden">
          <Card.Body className="gap-4 pb-6">
            <Image
              source={{ uri: slide.image }}
              className="w-full h-52 rounded-2xl"
              resizeMode="cover"
            />
            <Animated.View entering={FadeInDown.springify()} className="gap-2">
              <AppText className="text-xl font-semibold text-foreground">{slide.title}</AppText>
              <AppText className="text-base text-foreground/70 leading-6">
                {slide.description}
              </AppText>
            </Animated.View>
          </Card.Body>
        </Card>
      </Animated.View>
    </View>
  );
};

const OnboardingView = () => {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<Animated.FlatList<Slide>>(null);
  const scrollX = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleScrollToIndex = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handleOpenPaywall = useCallback(() => {
    router.push('/(modals)/paywall');
  }, [router]);

  const handleComplete = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const result = await updateProfile({ onboarding_completed: true });
        if (!result.success) {
          throw new Error(result.error.message);
        }
      }
      await haptics.success();
      showToast({
        title: 'You are all set!',
        description: 'Explore the Home tab to see every feature in action.',
        type: 'success',
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      await haptics.warning();
      showToast({
        title: 'Something went wrong',
        description:
          error instanceof Error ? error.message : 'Unable to finish onboarding.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [router, showToast, updateProfile, user]);

  return (
    <ScreenScrollView className="bg-background" contentContainerClassName="pb-12" padTop>
      <View className="mb-6 px-6 pt-2 gap-2">
        <AppText className="text-xs tracking-[0.35em] text-muted uppercase">
          Quick tour
        </AppText>
        <AppText className="text-3xl font-semibold text-foreground leading-tight">
          Ship faster with ExpoShip.
        </AppText>
        <AppText className="text-base text-foreground/70">
          Here is a snapshot of everything that comes wired out of the box.
        </AppText>
      </View>
      <Animated.FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => (
          <SlideCard slide={item} index={index} width={width} scrollX={scrollX} />
        )}
      />

      <View className="flex-row justify-center items-center gap-2 mt-6">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              currentIndex === index
                ? 'w-8 bg-primary'
                : 'w-2 bg-foreground/20'
            }`}
          />
        ))}
      </View>

      <View className="mt-8 px-6 gap-3">
        <Button
          variant="bordered"
          onPress={() => handleScrollToIndex(Math.min(currentIndex + 1, slides.length - 1))}
          isDisabled={currentIndex === slides.length - 1}
        >
          Next
        </Button>
        <Button color="primary" onPress={handleComplete} isLoading={loading}>
          {currentIndex === slides.length - 1 ? 'Finish' : 'Skip & finish'}
        </Button>
        <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-10 gap-5">
          <View className="gap-3 rounded-3xl border border-foreground/15 bg-primary/5 p-6">
            <AppText className="text-xs tracking-[0.35em] uppercase text-primary">
              Premium
            </AppText>
            <AppText className="text-2xl font-semibold text-foreground leading-tight">
              Unlock ExpoShip Premium right from onboarding.
            </AppText>
            <AppText className="text-base text-foreground/70 leading-6">
              Access the RevenueCat-powered subscription paywall to activate advanced analytics,
              AI automations, and white-glove support.
            </AppText>

          </View>

          <View className="gap-4">
            {paywallPlans.map((plan) => (
              <Card key={plan.id} className="border border-foreground/10 bg-background/90">
                <Card.Body className="gap-3">
                  <View className="gap-1">
                    <AppText className="text-lg font-semibold text-foreground">
                      {plan.title}
                    </AppText>
                    <AppText className="text-sm text-primary font-medium">
                      {plan.price}
                    </AppText>
                    <AppText className="text-sm text-foreground/70">{plan.caption}</AppText>
                  </View>
                  <Divider className="bg-foreground/10" />
                  <View className="gap-2">
                    {plan.perks.map((perk) => (
                      <View key={perk} className="flex-row items-start gap-2">
                        <AppText className="text-primary text-base">•</AppText>
                        <AppText className="flex-1 text-sm text-foreground/80">{perk}</AppText>
                      </View>
                    ))}
                  </View>
                </Card.Body>
              </Card>
            ))}
          </View>

          <Button color="secondary" onPress={handleOpenPaywall}>
            View full paywall
          </Button>
        </Animated.View>
      </View>
    </ScreenScrollView>
  );
};

export default OnboardingView;

