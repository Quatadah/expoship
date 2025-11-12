import { useEffect } from 'react';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

type SubscribeOptions = {
  schema?: string;
  table: string;
  event?: RealtimeEvent;
  filter?: string;
};

export const subscribeToTable = <T>(
  { schema = 'public', table, event = '*', filter }: SubscribeOptions,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel => {
  const channel = supabase.channel(`table:${schema}:${table}:${Date.now()}`);

  channel.on<T>(
    'postgres_changes',
    {
      event,
      schema,
      table,
      filter,
    },
    callback
  );

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`[Realtime] Subscribed to ${schema}.${table}`);
    }
  });

  return channel;
};

export const useRealtimeSubscription = <T>(
  options: SubscribeOptions | null,
  handler: (payload: RealtimePostgresChangesPayload<T>) => void
) => {
  useEffect(() => {
    if (!options) {
      return;
    }

    const channel = subscribeToTable<T>(options, handler);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handler, options?.event, options?.filter, options?.schema, options?.table]);
};

