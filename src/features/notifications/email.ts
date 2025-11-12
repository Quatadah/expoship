import { supabase } from '../../lib/supabase';

export type TransactionalEmailPayload = {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, unknown>;
};

export const sendTransactionalEmail = async (
  payload: TransactionalEmailPayload
) => {
  try {
    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: payload,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.warn('[Email] Failed to trigger transactional email', error);
    throw error;
  }
};

