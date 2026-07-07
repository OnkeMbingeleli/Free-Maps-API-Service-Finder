import { useEffect, useState } from 'react';
import { enqueueSync, flushSyncQueue } from '../offline/syncQueue';

// Tracks online/offline state and auto-replays queued writes on reconnect
// (blueprint §7 Offline-first architecture + §7 conflict resolution).
export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function goOnline() {
      setIsOnline(true);
      flushSyncQueue(); // replay anything queued while offline
    }
    function goOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Call this instead of calling supabase directly for writes that must
  // survive going offline (suggestions, reports, chat messages).
  async function writeWithOfflineSupport(table, payload) {
    if (isOnline) {
      return supabaseWrite(table, payload);
    }
    await enqueueSync(table, payload);
    return { queued: true };
  }

  return { isOnline, writeWithOfflineSupport };
}

async function supabaseWrite(table, payload) {
  const { supabase } = await import('../config/supabaseClient');
  return supabase.from(table).insert(payload);
}
