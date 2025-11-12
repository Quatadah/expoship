import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { useThemeColor } from 'heroui-native';
import { DynamicColorIOS, Platform } from 'react-native';

const TAB_ICON_SIZE = 22;

const createDynamicColor = (light: string, dark: string) =>
  Platform.OS === 'ios'
    ? DynamicColorIOS({ light, dark })
    : dark;

export default function TabsLayout() {
  const background = useThemeColor('background');
  const border = useThemeColor('border');

  return (
    <NativeTabs
      style={{
        backgroundColor: background,
        borderTopColor: border,
        borderTopWidth: Platform.select({ ios: 0.5, default: 1 }),
      }}
    >
      <NativeTabs.Trigger name="home">
        <Icon
          src={
            <VectorIcon family={Ionicons} name="home" size={TAB_ICON_SIZE} />
          }
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="components">
        <Icon
          src={
            <VectorIcon family={Ionicons} name="grid" size={TAB_ICON_SIZE} />
          }
        />
        <Label>Components</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Icon
          src={
            <VectorIcon family={Ionicons} name="settings" size={TAB_ICON_SIZE} />
          }
        />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

