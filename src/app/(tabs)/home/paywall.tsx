import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button, Card, Divider, useThemeColor } from 'heroui-native';
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { paywallPlans } from '../../../features/billing/paywall-data';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { withUniwind } from 'uniwind';

export default function PaywallScreen() {
  const router = useRouter();
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');
  const StyledFeather = withUniwind(Feather);

  return (
    <ScreenScrollView contentContainerClassName="px-6 pb-12">
      <LinearGradient
        colors={[accent + '25', accent + '04']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 32,
          marginTop: 24,
          marginBottom: 28,
          padding: 26,
          borderWidth: 1,
          borderColor: accent + '22',
        }}
      >
        <View className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="rounded-2xl bg-accent/20 p-3">
              <StyledFeather name="crown" size={22} className="text-accent" />
            </View>
            <View className="flex-1">
              <AppText className="text-xl font-semibold text-foreground">
                Upgrade to ExpoShip Premium
              </AppText>
              <AppText className="text-sm leading-5 text-foreground/65">
                Unlock gorgeous screens, production integrations, and premium workflows tailor-made
                for SaaS apps.
              </AppText>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {['Unlimited projects', 'Realtime data', 'Billing telemetry', 'Seamless auth'].map(
              (chip) => (
                <View key={chip} className="rounded-full bg-background/80 border border-foreground/10 px-3 py-1">
                  <AppText className="text-xs font-medium text-foreground/60">{chip}</AppText>
                </View>
              )
            )}
          </View>
        </View>
      </LinearGradient>

      <View className="gap-4">
        {paywallPlans.map((plan, index) => (
          <Card
            key={plan.id}
            className={`border ${
              index === 1 ? 'border-primary/40 bg-primary/6' : 'border-foreground/10'
            } bg-background/95`}
          >
            <Card.Body className="gap-4">
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <AppText className="text-lg font-bold text-foreground">
                    {plan.title}
                  </AppText>
                  {index === 1 && (
                    <View className="rounded-full bg-primary px-2.5 py-1">
                      <AppText className="text-xs font-bold text-white">POPULAR</AppText>
                    </View>
                  )}
                </View>
                <AppText className="text-base text-primary font-bold">{plan.price}</AppText>
                <AppText className="text-sm text-foreground/70">{plan.caption}</AppText>
              </View>
              <Divider className="bg-foreground/10" />
              <View className="gap-2">
                {plan.perks.map((perk) => (
                  <View key={perk} className="flex-row items-start gap-3">
                    <StyledFeather name="check-circle" size={16} className="text-accent mt-1.5" />
                    <AppText className="flex-1 text-sm text-foreground/80 leading-5">{perk}</AppText>
                  </View>
                ))}
              </View>
              <Button
                variant={index === 1 ? 'primary' : 'secondary'}
                isDisabled
                className="mt-2"
              >
                Choose {plan.title}
              </Button>
            </Card.Body>
          </Card>
        ))}
      </View>

      <View className="mt-8 rounded-3xl border border-foreground/10 bg-background/95 p-5 gap-3">
        <AppText className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/55">
          What’s inside
        </AppText>
        <AppText className="text-sm leading-6 text-foreground/70">
          RevenueCat handles subscription states while Stripe powers checkout and invoicing. Supabase
          keeps entitlements in sync, giving you real-time insights in the settings dashboard.
        </AppText>
        <View className="flex-row justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            Maybe Later
          </Button>
          <Button
            size="sm"
            onPress={() => {
              router.back();
              router.push('/(modals)/paywall');
            }}
          >
            View Full Plans
          </Button>
        </View>
      </View>
    </ScreenScrollView>
  );
}

