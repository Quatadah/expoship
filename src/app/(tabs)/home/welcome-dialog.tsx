import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';
import { AppText } from '../../../components/app-text';

export default function WelcomeDialogScreen() {
  const router = useRouter();
  const accent = useThemeColor('accent');
  const StyledFeather = withUniwind(Feather);

  return (
    <View className="flex-1 justify-between px-6 py-8">
      <LinearGradient
        colors={[accent + '25', accent + '04']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 28,
          padding: 26,
          borderWidth: 1,
          borderColor: accent + '24',
        }}
      >
        <View className="gap-6">
          <View className="gap-3">
            <View className="rounded-full bg-accent/20 px-3 py-1 self-start">
              <AppText className="text-[11px] font-semibold uppercase tracking-[0.4em] text-accent">
                expo ship
              </AppText>
            </View>
            <AppText className="text-3xl font-bold text-foreground leading-tight">
              Welcome aboard! Your SaaS toolkit is ready.
            </AppText>
            <AppText className="text-sm leading-6 text-foreground/65">
              Explore native sheet dialogs, polished onboarding, and production-ready billing flows
              without writing everything from scratch.
            </AppText>
          </View>

          <View className="gap-3">
            {[
              'HeroUI components themed for dark and light mode',
              'Supabase auth & realtime data wired in',
              'RevenueCat & Stripe billing flows ready to go',
            ].map((item) => (
              <View key={item} className="flex-row items-start gap-3">
                <StyledFeather name="check-circle" size={16} className="text-accent mt-1.5" />
                <AppText className="flex-1 text-sm text-foreground/65 leading-5">{item}</AppText>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      <View className="flex-row justify-end gap-3">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          Maybe Later
        </Button>
        <Button
          size="sm"
          variant="primary"
          onPress={() => {
            router.back();
            router.push('/(tabs)/home/paywall');
          }}
        >
          See Premium Plans
        </Button>
      </View>
    </View>
  );
}

