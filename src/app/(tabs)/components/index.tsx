import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import type { FC } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';

const StyledMaterialCommunityIcons = withUniwind(MaterialCommunityIcons);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Component = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  path: string;
  accent?: string;
};

const components: Component[] = [
  {
    title: 'Accordion',
    icon: 'menu-down',
    path: 'accordion',
    accent: '#8B5CF6',
  },
  {
    title: 'Avatar',
    icon: 'account-circle',
    path: 'avatar',
    accent: '#0EA5E9',
  },
  {
    title: 'Button',
    icon: 'gesture-tap',
    path: 'button',
    accent: '#F97316',
  },
  {
    title: 'Card',
    icon: 'card',
    path: 'card',
    accent: '#EC4899',
  },
  {
    title: 'Checkbox',
    icon: 'checkbox-marked',
    path: 'checkbox',
    accent: '#10B981',
  },
  {
    title: 'Chip',
    icon: 'tag',
    path: 'chip',
    accent: '#6366F1',
  },
  {
    title: 'Dialog',
    icon: 'message-text',
    path: 'dialog',
    accent: '#F59E0B',
  },
  {
    title: 'Divider',
    icon: 'minus',
    path: 'divider',
    accent: '#6B7280',
  },
  {
    title: 'Error View',
    icon: 'alert-circle',
    path: 'error-view',
    accent: '#EF4444',
  },
  {
    title: 'Form Field',
    icon: 'form-textbox',
    path: 'form-field',
    accent: '#3B82F6',
  },
  {
    title: 'Popover',
    icon: 'popcorn',
    path: 'popover',
    accent: '#A855F7',
  },
  {
    title: 'Radio Group',
    icon: 'radiobox-marked',
    path: 'radio-group',
    accent: '#14B8A6',
  },
  {
    title: 'Scroll Shadow',
    icon: 'shadow',
    path: 'scroll-shadow',
    accent: '#64748B',
  },
  {
    title: 'Select',
    icon: 'menu-down',
    path: 'select',
    accent: '#8B5CF6',
  },
  {
    title: 'Skeleton',
    icon: 'loading',
    path: 'skeleton',
    accent: '#94A3B8',
  },
  {
    title: 'Spinner',
    icon: 'loading',
    path: 'spinner',
    accent: '#06B6D4',
  },
  {
    title: 'Surface',
    icon: 'layers',
    path: 'surface',
    accent: '#6366F1',
  },
  {
    title: 'Switch',
    icon: 'toggle-switch',
    path: 'switch',
    accent: '#10B981',
  },
  {
    title: 'Tabs',
    icon: 'tab',
    path: 'tabs',
    accent: '#F97316',
  },
  {
    title: 'Text Field',
    icon: 'textbox',
    path: 'text-field',
    accent: '#3B82F6',
  },
];

const ComponentCard: FC<{
  component: Component;
  index: number;
  onPress: (path: string) => void;
}> = ({ component, index, onPress }) => {
  const accent = component.accent || '#6366F1';

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 30).springify()}
      onPress={() => onPress(`/components/${component.path}`)}
      style={{ width: '50%', paddingHorizontal: 6, marginBottom: 12 }}
    >
      <View
        className="rounded-2xl border border-foreground/10 bg-background/80 overflow-hidden active:scale-[0.98]"
        style={{
          shadowColor: accent,
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <LinearGradient
          colors={[accent + '15', accent + '08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 16 }}
        >
          <View className="items-center gap-3">
            <View
              className="rounded-xl p-3"
              style={{ backgroundColor: accent + '20' }}
            >
              <StyledMaterialCommunityIcons
                name={component.icon}
                size={24}
                color={accent}
              />
            </View>
            <AppText className="text-sm font-semibold text-foreground text-center">
              {component.title}
            </AppText>
          </View>
        </LinearGradient>
      </View>
    </AnimatedPressable>
  );
};

export default function App() {
  const router = useRouter();
  const accentColor = useThemeColor('accent');
  const insets = useSafeAreaInsets();

  const handlePress = (path: string) => {
    router.push(path as any);
  };

  return (
    <ScreenScrollView
      contentContainerClassName="px-5 pb-32"
      style={{ paddingTop: insets.top + 16 }}
    >
      <Animated.View entering={FadeInDown.springify()} className="mb-8">
        <LinearGradient
          colors={[accentColor + '20', accentColor + '08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: accentColor + '15',
          }}
        >
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-accent/20 px-3 py-1">
                <AppText className="text-[11px] font-semibold uppercase tracking-[0.4em] text-accent">
                  Component Library
                </AppText>
              </View>
            </View>
            <AppText className="text-2xl font-bold text-foreground leading-tight">
              Explore Components
            </AppText>
            <AppText className="text-sm leading-5 text-foreground/65">
              Browse through our collection of {components.length} beautifully
              designed HeroUI Native components. Each component is fully
              customizable and ready to use.
            </AppText>
          </View>
        </LinearGradient>
      </Animated.View>

      <View className="gap-4">
        <View className="flex-row items-center justify-between mb-2">
          <AppText className="text-lg font-bold text-foreground">
            All Components
          </AppText>
          <AppText className="text-xs text-foreground/50">
            {components.length} items
          </AppText>
        </View>

        <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
          {components.map((component, index) => (
            <ComponentCard
              key={component.title}
              component={component}
              index={index}
              onPress={handlePress}
            />
          ))}
        </View>
      </View>
    </ScreenScrollView>
  );
}
