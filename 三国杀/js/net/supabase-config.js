/* ============================================================
 * supabase-config.js — Supabase 客户端初始化
 * ============================================================ */

const SUPABASE_URL = 'https://bdflblooezmhgawkzhkv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mQbWq3yUoa8U5fmlk61WnA_W_rsrqCL';

let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient) {
    if (!window.supabase) throw new Error('supabase-js 未加载');
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        heartbeatIntervalMs: 15000,
        heartbeatCallback: (status) => {
          if (status === 'disconnected' && typeof onRealtimeDisconnected === 'function') {
            onRealtimeDisconnected();
          }
        },
      },
    });
  }
  return supabaseClient;
}
