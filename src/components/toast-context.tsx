import Ionicons from '@expo/vector-icons/Ionicons';
import { Card } from 'heroui-native';
import { AnimatePresence, MotiView } from 'moti';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentProps,
} from 'react';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';
import { AppText } from './app-text';

type ToastType = 'default' | 'success' | 'error' | 'warning';

type ToastOptions = {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
};

type Toast = ToastOptions & {
  id: number;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ToastIcon = withUniwind(Ionicons);

type IconName = ComponentProps<typeof Ionicons>['name'];

type ToastVisualStyle = {
  card: string;
  title: string;
  description: string;
  iconName: IconName;
  iconContainer: string;
  iconClass: string;
};

const TOAST_STYLES: Record<ToastType, ToastVisualStyle> = {
  success: {
    card: 'border border-success/30 bg-surface',
    title: 'text-foreground',
    description: 'text-foreground/70',
    iconName: 'checkmark',
    iconContainer: 'bg-success/15',
    iconClass: 'text-success',
  },
  error: {
    card: 'border border-danger/30 bg-surface',
    title: 'text-foreground',
    description: 'text-foreground/70',
    iconName: 'close',
    iconContainer: 'bg-danger/15',
    iconClass: 'text-danger',
  },
  warning: {
    card: 'border border-warning/30 bg-surface',
    title: 'text-foreground',
    description: 'text-foreground/70',
    iconName: 'warning',
    iconContainer: 'bg-warning/15',
    iconClass: 'text-warning',
  },
  default: {
    card: 'border border-foreground/15 bg-surface',
    title: 'text-foreground',
    description: 'text-foreground/70',
    iconName: 'information-circle',
    iconContainer: 'bg-foreground/10',
    iconClass: 'text-foreground',
  },
};

const getStylesForType = (type: ToastType) => {
  switch (type) {
    case 'success':
      return TOAST_STYLES.success;
    case 'error':
      return TOAST_STYLES.error;
    case 'warning':
      return TOAST_STYLES.warning;
    default:
      return TOAST_STYLES.default;
  }
};

const TOAST_DURATION = 3500;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Date.now();
    const toast: Toast = {
      id,
      title: options.title,
      description: options.description,
      type: options.type ?? 'default',
      duration: options.duration ?? TOAST_DURATION,
    };

    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, toast.duration);
  }, []);

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <View
          pointerEvents="none"
          className="absolute inset-x-4 top-14 gap-2"
        >
          <AnimatePresence>
            {toasts.map((toast) => {
              const styles = getStylesForType(toast.type ?? 'default');
              return (
                <MotiView
                  key={toast.id}
                  from={{ opacity: 0, translateY: -20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -20 }}
                  transition={{ type: 'timing', duration: 250 }}
                >
                  <Card className={`px-4 py-3 ${styles.card}`}>
                    <Card.Body className="flex-row items-start gap-3">
                      <View
                        className={`mt-1 size-9 items-center justify-center rounded-full ${styles.iconContainer}`}
                      >
                        <ToastIcon
                          name={styles.iconName}
                          className={`text-lg ${styles.iconClass}`}
                        />
                      </View>
                      <View className="flex-1 gap-1">
                        <AppText className={`text-sm font-semibold ${styles.title}`}>
                          {toast.title}
                        </AppText>
                        {toast.description && (
                          <AppText className={`text-xs ${styles.description}`}>
                            {toast.description}
                          </AppText>
                        )}
                      </View>
                    </Card.Body>
                  </Card>
                </MotiView>
              );
            })}
          </AnimatePresence>
        </View>
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

