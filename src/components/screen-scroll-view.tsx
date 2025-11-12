import { cn } from 'heroui-native';
import { type FC, type PropsWithChildren } from 'react';
import { Platform, ScrollView, type ScrollViewProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface Props extends AnimatedProps<ScrollViewProps> {
  className?: string;
  contentContainerClassName?: string;
  padTop?: boolean;
}

export const ScreenScrollView: FC<PropsWithChildren<Props>> = ({
  children,
  className,
  contentContainerClassName,
  padTop = false,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = padTop
    ? Platform.select({
        ios: insets.top,
        android: insets.top,
        default: insets.top,
      })
    : 0;
  return (
    <AnimatedScrollView
      className={cn('bg-background', className)}
      contentContainerClassName={cn('px-5', contentContainerClassName)}
      contentContainerStyle={{
        paddingTop: topPadding,
        paddingBottom: insets.bottom + 32,
      }}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </AnimatedScrollView>
  );
};
