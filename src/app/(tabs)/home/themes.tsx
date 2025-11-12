import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button, Card, useThemeColor } from 'heroui-native';
import { Pressable, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { useAppTheme } from '../../../contexts/app-theme-context';
import { withUniwind } from 'uniwind';

type ThemeOption = {
  id: string;
  name: string;
  lightVariant: string;
  darkVariant: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
};

const availableThemes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    lightVariant: 'light',
    darkVariant: 'dark',
    colors: {
      primary: '#006FEE',
      secondary: '#17C964',
      tertiary: '#F5A524',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    lightVariant: 'lavender-light',
    darkVariant: 'lavender-dark',
    colors: {
      primary: 'hsl(270 50% 75%)',
      secondary: 'hsl(160 40% 70%)',
      tertiary: 'hsl(45 55% 75%)',
    },
  },
  {
    id: 'mint',
    name: 'Mint',
    lightVariant: 'mint-light',
    darkVariant: 'mint-dark',
    colors: {
      primary: 'hsl(165 45% 70%)',
      secondary: 'hsl(145 50% 68%)',
      tertiary: 'hsl(55 60% 75%)',
    },
  },
  {
    id: 'sky',
    name: 'Sky',
    lightVariant: 'sky-light',
    darkVariant: 'sky-dark',
    colors: {
      primary: 'hsl(200 50% 72%)',
      secondary: 'hsl(175 45% 70%)',
      tertiary: 'hsl(48 58% 75%)',
    },
  },
];

const ThemeCircle = ({
  theme,
  isActive,
  onPress,
}: {
  theme: ThemeOption;
  isActive: boolean;
  onPress: () => void;
}) => {
  const borderColor = isActive ? theme.colors.primary : 'rgba(148, 163, 184, 0.25)';

  return (
    <Pressable onPress={onPress} className="items-center gap-3 active:scale-[0.98]">
      <View className="rounded-2xl border p-[1px]" style={{ borderColor }}>
        <View
          className="h-24 w-24 overflow-hidden rounded-[15px] border border-white/10 bg-background/90"
          style={{ position: 'relative' }}
        >
          <View style={{ flex: 1, backgroundColor: theme.colors.primary }} />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '45%',
              backgroundColor: theme.colors.secondary,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '55%',
              height: '55%',
              backgroundColor: theme.colors.tertiary,
            }}
          />
        </View>
      </View>
      <AppText
        className={`text-sm font-semibold ${
          isActive ? 'text-foreground' : 'text-foreground/55'
        }`}
      >
        {theme.name}
      </AppText>
    </Pressable>
  );
};

export default function ThemesScreen() {
  const router = useRouter();
  const { currentTheme, setTheme, isLight } = useAppTheme();
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');
  const StyledFeather = withUniwind(Feather);

  const getCurrentThemeId = () => {
    if (currentTheme === 'light' || currentTheme === 'dark') return 'default';
    if (currentTheme.startsWith('lavender')) return 'lavender';
    if (currentTheme.startsWith('mint')) return 'mint';
    if (currentTheme.startsWith('sky')) return 'sky';
    return 'default';
  };

  const handleThemeSelect = (theme: ThemeOption) => {
    const variant = isLight ? theme.lightVariant : theme.darkVariant;
    setTheme(variant as any);
  };

  return (
    <ScreenScrollView contentContainerClassName="px-6 pb-10">
      <LinearGradient
        colors={[accent + '1F', accent + '06']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 32,
          marginTop: 24,
          marginBottom: 28,
          padding: 26,
          borderWidth: 1,
          borderColor: accent + '1f',
        }}
      >
        <View className="gap-4">
          <View className="flex-row items-start gap-3">
            <View className="rounded-2xl bg-accent/15 p-3">
              <StyledFeather name="palette" size={22} className="text-accent" />
            </View>
            <View className="flex-1 gap-2">
              <AppText className="text-xl font-semibold text-foreground">
                Curated themes for every brand
              </AppText>
              <AppText className="text-sm leading-5 text-foreground/65">
                Switch between light and dark palettes instantly. Each theme updates HeroUI
                components, backgrounds, and accent hues across the app.
              </AppText>
            </View>
          </View>
          <View className="rounded-2xl border border-white/15 bg-background/80 p-4 gap-3">
            <AppText className="text-xs uppercase tracking-[0.4em] text-foreground/40">
              preview
            </AppText>
            <Card className="border border-foreground/10 bg-background/90">
              <Card.Body className="gap-3">
                <View className="flex-row items-center justify-between">
                  <AppText className="text-sm font-semibold text-foreground">Home</AppText>
                  <View className="rounded-full bg-accent/20 px-3 py-1">
                    <AppText className="text-[10px] tracking-[0.35em] text-accent uppercase">
                      {getCurrentThemeId()}
                    </AppText>
                  </View>
                </View>
                <View className="gap-2">
                  <View className="h-2 rounded-full bg-foreground/15" />
                  <View className="h-2 rounded-full bg-foreground/10 w-3/4" />
                  <View className="h-8 rounded-2xl bg-accent/25" />
                </View>
              </Card.Body>
            </Card>
          </View>
        </View>
      </LinearGradient>

      <Card className="border border-foreground/10 bg-background/90">
        <Card.Body className="gap-6">
          <View className="flex-row justify-around flex-wrap gap-5 py-2">
            {availableThemes.map((theme) => (
              <ThemeCircle
                key={theme.id}
                theme={theme}
                isActive={getCurrentThemeId() === theme.id}
                onPress={() => handleThemeSelect(theme)}
              />
            ))}
          </View>
        </Card.Body>
      </Card>

      <View className="mt-8 rounded-3xl border border-foreground/10 bg-background/95 p-5 gap-4">
        <AppText className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/45">
          Color system
        </AppText>
        <AppText className="text-sm leading-6 text-foreground/70">
          Theme switching is instant and persisted. Each palette offers light and dark variants with
          matching accent, secondary, and tertiary shades so every screen stays cohesive.
        </AppText>
        <View className="flex-row justify-end gap-3">
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            Done
          </Button>
        </View>
      </View>
    </ScreenScrollView>
  );
}

