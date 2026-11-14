/* ============================================================
 * index.js — 联机模块总入口：钩子 refreshUI、屏蔽 AI、断线回调
 * ============================================================ */

(function () {
  if (window.__netIndexHooked) return;
  window.__netIndexHooked = true;

  const _origRefreshUI = refreshUI;
  refreshUI = function () {
    _origRefreshUI.apply(this, arguments);
    if (netRoom.role === 'host' && netRoom.started) {
      netHostScheduleSnapshot();
      netHostCheckPendingTimeout();
    }
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

  const _origNanman = (typeof showNanmanEffect === 'function') ? showNanmanEffect : null;
  if (_origNanman) {
    showNanmanEffect = function (fi) {
      _origNanman(fi);
      if (!window.__netReplaying && typeof netIsHost === 'function' && netIsHost()) netPushFx('nanman', { fi: fi });
    };
  }
  const _origArrows = (typeof showArrowsEffect === 'function') ? showArrowsEffect : null;
  if (_origArrows) {
    showArrowsEffect = function (fi) {
      _origArrows(fi);
      if (!window.__netReplaying && typeof netIsHost === 'function' && netIsHost()) netPushFx('arrows', { fi: fi });
    };
  }
  const _origGolden = (typeof showGoldenEffect === 'function') ? showGoldenEffect : null;
  if (_origGolden) {
    showGoldenEffect = function (fi) {
      _origGolden(fi);
      if (!window.__netReplaying && typeof netIsHost === 'function' && netIsHost()) netPushFx('golden', { fi: fi });
    };
  }
  const _origHarvest = (typeof showHarvestEffect === 'function') ? showHarvestEffect : null;
  if (_origHarvest) {
    showHarvestEffect = function (fi) {
      _origHarvest(fi);
      if (!window.__netReplaying && typeof netIsHost === 'function' && netIsHost()) netPushFx('harvest', { fi: fi });
    };
  }
  const _origExplosion = (typeof showExplosionEffect === 'function') ? showExplosionEffect : null;
  if (_origExplosion) {
    showExplosionEffect = function (idx) {
      _origExplosion(idx);
      if (!window.__netReplaying && typeof netIsHost === 'function' && netIsHost()) netPushFx('explosion', { targetIdx: idx });
    };
  }
  const _origShake = (typeof shakePlayerCard === 'function') ? shakePlayerCard : null;
  if (_origShake) {
    shakePlayerCard = function (idx) {
      _origShake(idx);
      if (!window.__netReplaying && typeof netIsHost === 'function' && netIsHost()) netPushFx('shake', { targetIdx: idx });
    };
  }
  const _origFloat = (typeof floatText === 'function') ? floatText : null;
  if (_origFloat) {
    floatText = function (id, tx, co) {
      _origFloat(id, tx, co);
      if (!window.__netReplaying && typeof netIsHost === 'function' && netIsHost()) {
        const m = /^player-(\d+)$/.exec(id || '');
        if (m) netPushFx('float', { idx: parseInt(m[1], 10), text: tx, color: co });
      }
    };
  }
  const _origAnimCard = (typeof animateCard === 'function') ? animateCard : null;
  if (_origAnimCard) {
    animateCard = function (fi, ti, nm) {
      const ret = _origAnimCard(fi, ti, nm);
      if (!window.__netReplaying && typeof netIsHost === 'function' && netIsHost()) {
        const m1 = /^player-(\d+)$/.exec(fi || '');
        const m2 = ti ? /^player-(\d+)$/.exec(ti) : null;
        if (m1) netPushFx('card', { fi: parseInt(m1[1], 10), ti: m2 ? parseInt(m2[1], 10) : null, nm: nm || '牌' });
      }
      return ret;
    };
  }

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
