import { useRouter } from 'expo-router';
import { Button, Card, Divider } from 'heroui-native';
import { useEffect, useState } from 'react';
import { ImageBackground, View } from 'react-native';
import PaywallBackground from '../../assets/images/paywall-showcase-bg.jpeg';
import { AppText } from '../components/app-text';
import { ScreenScrollView } from '../components/screen-scroll-view';
import { useAuth } from '../features/auth/use-auth';
import { logPaywallDismiss, logPaywallImpression, logPaywallPurchase } from '../features/billing/analytics';
import { useBilling } from '../features/billing/billing-context';

type PaywallPlan = {
  id: string;
  title: string;
  price: string;
  caption: string;
  perks: string[];
};

const plans: PaywallPlan[] = [
  {
    id: 'pro_monthly',
    title: 'Pro Monthly',
    price: '$14.99 / month',
    caption: 'Best for teams validating premium demand.',
    perks: [
      'Unlimited projects & real-time sync',
      'Premium AI completions & automations',
      'Priority support with incident SLAs',
    ],
  },
  {
    id: 'pro_yearly',
    title: 'Pro Yearly',
    price: '$149 / year',
    caption: 'Two months free with an annual commitment.',
    perks: [
      'All Pro Monthly features',
      'Advanced analytics exports',
      'Roadmap co-design sessions',
    ],
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    purchaseSubscription,
    restore,
    loading,
    isRevenueCatEnabled,
  } = useBilling();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    void logPaywallImpression(user?.id ?? null);

    return () => {
      void logPaywallDismiss(user?.id ?? null);
    };
  }, [user?.id]);

  const handleSelectPlan = async (planId: string) => {
    if (!isRevenueCatEnabled) {
      setError('RevenueCat is not configured. Set a valid API key to enable purchases.');
      return;
    }

    setSelectedPlan(planId);
    setFeedback(null);
    setError(null);

    const result = await purchaseSubscription(planId);

    if (!result.success) {
      setError(result.message);
      setSelectedPlan(null);
      return;
    }

    await logPaywallPurchase(user?.id ?? null, { planId });
    setFeedback('Subscription activated! Redirecting back to settings…');
    setTimeout(() => {
      router.back();
    }, 1200);
  };

  const handleRestore = async () => {
    setFeedback(null);
    setError(null);
    const result = await restore();

    if (!result.success) {
      setError(result.message);
      return;
    }

    setFeedback('Purchases restored.');
  };

  return (
    <ScreenScrollView
      contentContainerClassName="pb-16"
      className="bg-background"
    >
      <ImageBackground
        source={PaywallBackground}
        className="h-64 rounded-b-3xl overflow-hidden"
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/60 items-center justify-end pb-8 px-6 gap-3">
          <AppText className="text-white/90 text-xs tracking-[0.3em] uppercase">
            ExpoShip Premium
          </AppText>
          <AppText className="text-white text-3xl font-semibold text-center leading-tight">
            Build, launch, and scale mobile SaaS without limits.
          </AppText>
          <AppText className="text-white/80 text-sm text-center">
            Unlock RevenueCat-powered subscriptions, Stripe one-time purchases, realtime
            analytics, and advanced AI workflows.
          </AppText>
        </View>
      </ImageBackground>

      <View className="px-6 mt-8 gap-5">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border ${
              selectedPlan === plan.id ? 'border-primary' : 'border-foreground/10'
            } bg-background/90`}
          >
            <Card.Body className="gap-4">
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
              <Button
                color="primary"
                onPress={() => handleSelectPlan(plan.id)}
                isDisabled={loading}
                isLoading={loading && selectedPlan === plan.id}
              >
                Start {plan.title}
              </Button>
            </Card.Body>
          </Card>
        ))}

        <Card className="border border-foreground/10 bg-background/90">
          <Card.Body className="gap-3">
            <AppText className="text-sm text-foreground/70">
              Already purchased on another device?
            </AppText>
            <Button
              variant="bordered"
              onPress={handleRestore}
              isDisabled={loading}
            >
              Restore purchases
            </Button>
            <Button variant="light" onPress={() => router.back()}>
              Maybe later
            </Button>
          </Card.Body>
        </Card>

        {feedback && (
          <Card className="border border-success/40 bg-success/10">
            <Card.Body>
              <AppText className="text-sm text-success/90">{feedback}</AppText>
            </Card.Body>
          </Card>
        )}

        {error && (
          <Card className="border border-danger/40 bg-danger/10">
            <Card.Body>
              <AppText className="text-sm text-danger/90">{error}</AppText>
            </Card.Body>
          </Card>
        )}
      </View>
    </ScreenScrollView>
  );
}

