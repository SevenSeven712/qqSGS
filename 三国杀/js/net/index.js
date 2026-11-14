/* ============================================================
 * index.js — 联机模块总入口：钩子 refreshUI、屏蔽 AI、断线回调
 * ============================================================ */

(function () {
  if (window.__netIndexHooked) return;
  window.__netIndexHooked = true;

  const _origRefreshUI = refreshUI;
  refreshUI = function () {
    _origRefreshUI.apply(this, arguments);
    if (netRoom.role === 'host' && netRoom.started) netHostScheduleSnapshot();
  };

  const _origScheduleAi = scheduleAi;
  scheduleAi = function () {
    if (netIsOnline()) return;
    return _origScheduleAi.apply(this, arguments);
  };

  window.onRealtimeDisconnected = function () {
    if (!netIsOnline()) return;
    console.warn('[net] realtime disconnected');
    showToast('联机', '与服务器的连接中断，请检查网络', 'error');
  };

  window.netInit = function () {
    if (!window.supabase) {
      console.error('[net] supabase-js 未加载');
      return false;
    }
    if (typeof getSupabase === 'function') {
      try { getSupabase(); } catch (e) { console.error(e); return false; }
    }
    return true;
  };
})();
