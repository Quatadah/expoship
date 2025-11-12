import type { CustomerInfo } from 'react-native-purchases';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { env } from '../../lib/env';
import { useAuth } from '../auth/use-auth';
import {
  configureRevenueCat,
  getActiveEntitlements,
  getCustomerInfo,
  logoutRevenueCatUser,
  purchasePackage,
  restorePurchases,
} from './revenuecat';
import {
  configureStripe,
  initializePaymentSheet,
  openPaymentSheet,
  type PaymentSheetSetup,
} from './stripe';

type BillingPlan = 'free' | 'premium';

type BillingActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

type BillingContextValue = {
  initializing: boolean;
  loading: boolean;
  plan: BillingPlan;
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
  refresh: () => Promise<void>;
  purchaseSubscription: (packageId: string) => Promise<BillingActionResult>;
  restore: () => Promise<BillingActionResult>;
  startOneTimePurchase: (
    setup: PaymentSheetSetup
  ) => Promise<BillingActionResult>;
  isRevenueCatEnabled: boolean;
  isStripeEnabled: boolean;
};

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

const revenuecatEnabled = Boolean(env.revenuecatApiKey);
const stripeEnabled = Boolean(env.stripePublishableKey);
const entitlementId = env.revenuecatEntitlementId || 'pro';

export const BillingProvider = ({ children }: PropsWithChildren) => {
  const { user, profile, updateProfile, authState } = useAuth();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const determinePlan = useCallback(
    (info: CustomerInfo | null): BillingPlan => {
      if (!revenuecatEnabled || !info) {
        return 'free';
      }

      const entitlements = getActiveEntitlements(info);
      return entitlements.includes(entitlementId) ? 'premium' : 'free';
    },
    []
  );

  const syncProfilePlan = useCallback(
    async (info: CustomerInfo | null) => {
      if (!revenuecatEnabled) {
        return;
      }

      if (!user) {
        return;
      }

      const plan = determinePlan(info);
      if (profile?.billing_plan === plan) {
        return;
      }

      const result = await updateProfile({
        billing_plan: plan,
      });

      if (!result.success) {
        console.warn('[Billing] Failed to sync billing plan', result.error.message);
      }
    },
    [determinePlan, profile?.billing_plan, updateProfile, user]
  );

  const refresh = useCallback(async () => {
    if (!revenuecatEnabled || !user) {
      setCustomerInfo(null);
      setInitializing(false);
      return;
    }

    setLoading(true);
    const info = await getCustomerInfo();
    setCustomerInfo(info);
    await syncProfilePlan(info);
    setLoading(false);
    setInitializing(false);
  }, [syncProfilePlan, user]);

  useEffect(() => {
    const init = async () => {
      if (!revenuecatEnabled || !user) {
        await logoutRevenueCatUser();
        setCustomerInfo(null);
        setInitializing(false);
        return;
      }

      setInitializing(true);
      try {
        await configureRevenueCat(user.id);
        await refresh();
      } catch (error) {
        console.warn('[Billing] Failed to configure RevenueCat', error);
        setInitializing(false);
      }
    };

    void init();
  }, [refresh, user]);

  const purchaseSubscription = useCallback(
    async (packageIdentifier: string): Promise<BillingActionResult> => {
      if (!revenuecatEnabled || !user) {
        return {
          success: false,
          message:
            'RevenueCat is not configured. Add your API key to enable subscriptions.',
        };
      }

      try {
        await purchasePackage({ identifier: packageIdentifier });
        await refresh();
        return { success: true };
      } catch (error) {
        console.error('[Billing] Subscription purchase failed', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Purchase could not be completed.',
        };
      }
    },
    [refresh, user]
  );

  const restore = useCallback(async (): Promise<BillingActionResult> => {
    if (!revenuecatEnabled || !user) {
      return {
        success: false,
        message: 'RevenueCat is not configured.',
      };
    }

    try {
      await restorePurchases();
      await refresh();
      return { success: true };
    } catch (error) {
      console.error('[Billing] Restore purchases failed', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unable to restore purchases.',
      };
    }
  }, [refresh, user]);

  const startOneTimePurchase = useCallback(
    async (setup: PaymentSheetSetup): Promise<BillingActionResult> => {
      if (!stripeEnabled) {
        return {
          success: false,
          message:
            'Stripe publishable key missing. Update your environment configuration.',
        };
      }

      try {
        await configureStripe();
        const initResult = await initializePaymentSheet(setup);
        if (initResult.error) {
          return {
            success: false,
            message: initResult.error.message ?? 'Failed to initialize payment sheet.',
          };
        }

        const presentResult = await openPaymentSheet();
        if (presentResult.error) {
          return {
            success: false,
            message: presentResult.error.message ?? 'Payment sheet was cancelled.',
          };
        }

        await refresh();
        return { success: true };
      } catch (error) {
        console.error('[Billing] Stripe purchase failed', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Stripe payment failed.',
        };
      }
    },
    [refresh]
  );

  const plan = useMemo(() => determinePlan(customerInfo), [customerInfo, determinePlan]);
  const isPremium = plan === 'premium';

  const value = useMemo<BillingContextValue>(
    () => ({
      initializing,
      loading: loading || authState === 'processing',
      plan,
      isPremium,
      customerInfo,
      refresh,
      purchaseSubscription,
      restore,
      startOneTimePurchase,
      isRevenueCatEnabled: revenuecatEnabled,
      isStripeEnabled: stripeEnabled,
    }),
    [
      authState,
      customerInfo,
      initializing,
      isPremium,
      loading,
      plan,
      purchaseSubscription,
      refresh,
      restore,
      startOneTimePurchase,
    ]
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
};

export const useBilling = () => {
  const context = useContext(BillingContext);

  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }

  return context;
};

