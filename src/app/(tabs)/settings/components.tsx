import Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { withUniwind } from 'uniwind';
import { AppText } from '../../../components/app-text';

const StyledFeather = withUniwind(Feather);

export type SettingIcon = {
  name: keyof typeof Feather.glyphMap;
  background: string;
  color: string;
};

export type SettingRowVariant = 'default' | 'primary' | 'destructive';

export type SettingRowProps = {
  id: string;
  label: string;
  subtitle?: string;
  detail?: string;
  icon?: SettingIcon;
  rightElement?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  variant?: SettingRowVariant;
};

export type SectionProps = {
  title?: string;
  items: SettingRowProps[];
};

export const Section = ({ title, items }: SectionProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <View className="gap-2">
      {title ? (
        <AppText className="text-xs tracking-[0.3em] text-muted uppercase px-1">
          {title}
        </AppText>
      ) : null}
      <View className="rounded-2xl overflow-hidden border border-foreground/10 bg-background/95">
        {items.map((item, index) => (
          <View key={item.id}>
            <SettingRow {...item} />
            {index < items.length - 1 && (
              <View className="h-[0.5px] bg-foreground/12 ml-4" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export const SettingRow = ({
  label,
  subtitle,
  detail,
  icon,
  rightElement,
  showChevron,
  onPress,
  disabled = false,
  variant = 'default',
}: SettingRowProps) => {
  if (variant !== 'default') {
    const textClass =
      variant === 'destructive' ? 'text-danger/85' : 'text-accent font-semibold';
    const content = (
      <View className={`px-4 py-4 items-center ${disabled ? 'opacity-60' : ''}`}>
        <AppText className={`text-base ${textClass}`}>
          {label}
        </AppText>
      </View>
    );

    if (onPress) {
      return (
        <Pressable onPress={onPress} disabled={disabled}>
          {content}
        </Pressable>
      );
    }

    return content;
  }

  const row = (
    <View className={`flex-row items-center px-4 py-4 ${disabled ? 'opacity-60' : ''}`}>
      {icon ? (
        <View
          className={`mr-3 h-9 w-9 rounded-2xl items-center justify-center ${icon.background}`}
        >
          <StyledFeather name={icon.name} size={18} className={icon.color} />
        </View>
      ) : null}
      <View className="flex-1">
        <AppText className="text-sm font-medium text-foreground">{label}</AppText>
        {subtitle ? (
          <AppText className="text-xs text-foreground/60 mt-1">{subtitle}</AppText>
        ) : null}
      </View>
      {rightElement ? (
        <View className="ml-3">{rightElement}</View>
      ) : detail ? (
        <AppText className="ml-3 text-sm text-foreground/60">{detail}</AppText>
      ) : null}
      {showChevron ? (
        <StyledFeather name="chevron-right" size={16} className="text-muted ml-2" />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} disabled={disabled}>
        {row}
      </Pressable>
    );
  }

  return row;
};


