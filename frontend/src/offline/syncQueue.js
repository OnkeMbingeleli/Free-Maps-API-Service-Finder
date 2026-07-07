// IndexedDB-backed queue for writes made while offline.
// On reconnect, useOffline.js calls flushSyncQueue() to replay them
// against Supabase, applying the conflict-resolution rules from
// blueprint §7 (last-write-wins / merge / flag-for-review).

const DB_NAME = 'service-finder-offline';
const STORE_NAME = 'sync_queue';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueSync(table, payload) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add({
      table,
      payload,
      client_timestamp: new Date().toISOString(),
      conflict_resolution_strategy: 'last_write_wins',
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function flushSyncQueue() {
  const { supabase } = await import('../config/supabaseClient');
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const all = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  for (const item of all) {
    try {
      await supabase.from(item.table).insert({
        ...item.payload,
        client_timestamp: item.client_timestamp,
        conflict_resolution_strategy: item.conflict_resolution_strategy,
      });
      store.delete(item.id);
    } catch (err) {
      // leave it queued, try again on next reconnect
      console.error('Sync replay failed for', item.table, err);
    }
  }
}
