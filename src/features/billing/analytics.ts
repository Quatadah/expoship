import { supabase } from '../../lib/supabase';

type PaywallEventType = 'impression' | 'purchase' | 'dismiss';

const invokeEvent = async (type: PaywallEventType, payload: Record<string, unknown>) => {
  try {
    await supabase.functions.invoke('billing-analytics', {
      body: {
        type,
        timestamp: new Date().toISOString(),
        ...payload,
      },
    });
  } catch (error) {
    console.warn(`[BillingAnalytics] Failed to record ${type}`, error);
  }
};

export const logPaywallImpression = async (userId: string | null) => {
  await invokeEvent('impression', { userId });
};

export const logPaywallPurchase = async (
  userId: string | null,
  details: Record<string, unknown>
) => {
  await invokeEvent('purchase', {
    userId,
    ...details,
  });
};

export const logPaywallDismiss = async (userId: string | null) => {
  await invokeEvent('dismiss', { userId });
};

