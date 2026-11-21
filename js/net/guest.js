/* ============================================================
 * guest.js — 客机：拦截本地操作 → 发 intent；应用服务端快照
 * ============================================================ */

(function () {
  if (window.__netGuestHooked) return;
  window.__netGuestHooked = true;

  let _lastActionTs = 0;
  function _throttle() {
    const now = Date.now();
    if (now - _lastActionTs < 250) return false;
    _lastActionTs = now;
    return true;
  }

  const _origUseCard = useCard;
  useCard = function (card, fi, ti) {
    if (!netIsGuest()) return _origUseCard.apply(this, arguments);
    if (!_throttle()) return false;
    const me = state.players[fi];
    if (!me) return false;
    const idx = me.hand.indexOf(card);
    if (idx < 0) return false;
    netGuestSendIntent(NET_INTENT.USE_CARD, { handIndex: idx, targetIdx: ti });
    return true;
  };

  const _origEndTurn = endTurn;
  endTurn = function () {
    if (!netIsGuest()) return _origEndTurn.apply(this, arguments);
    if (!_throttle()) return;
    netGuestSendIntent(NET_INTENT.END_TURN, {});
  };

  const _origRespond = respondPending;
  respondPending = function (ch) {
    if (!netIsGuest()) return _origRespond.apply(this, arguments);
    if (!_throttle()) return;
    const panel = document.getElementById('responsePanel');
    if (panel) panel.style.display = 'none';
    netGuestSendIntent(NET_INTENT.RESPOND, { choice: ch });
  };

  const _origConfirmDiscard = window.confirmDiscard;
  window.confirmDiscard = function () {
    if (!netIsGuest()) return _origConfirmDiscard.apply(this, arguments);
    const idxs = Array.from(state.selectedDiscardIndices || []);
    if (idxs.length === 0) return;
    netGuestSendIntent(NET_INTENT.CONFIRM_DISCARD, { indices: idxs });
  };

  const _origConfirmNext = window.confirmEnterNextRound;
  window.confirmEnterNextRound = function () {
    if (!netIsGuest()) return _origConfirmNext.apply(this, arguments);
    netGuestSendIntent(NET_INTENT.CONFIRM_NEXT_ROUND, {});
  };

  const _origRedoRound = window.redoRound;
  window.redoRound = function () {
    if (!netIsGuest()) return _origRedoRound.apply(this, arguments);
    netGuestSendIntent(NET_INTENT.CONFIRM_NEXT_ROUND, {});
  };

  ['useQiyuyangSkill'].forEach(function (fn) {
    const orig = window[fn];
    if (typeof orig !== 'function') return;
    window[fn] = function () {
      if (!netIsGuest()) return orig.apply(this, arguments);
      netGuestSendIntent(NET_INTENT.USE_SKILL, { skill: fn, args: Array.prototype.slice.call(arguments) });
    };
  });

  const _origSendChat = sendChatMessage;
  sendChatMessage = function () {
    if (!netIsOnline()) return _origSendChat.apply(this, arguments);
    const input = document.getElementById('chatInput');
    if (!input) return;
    const v = input.value.trim();
    if (!v) return;
    const name = localStorage.getItem('qQiNick') || '玩家';
    netBroadcastChat(name, v);
    if (typeof addChat === 'function') addChat(name, v);
    input.value = '';
  };

  document.addEventListener('DOMContentLoaded', function () {
    const discardBtn = document.getElementById('btnDiscard');
    if (discardBtn) {
      const orig = discardBtn.onclick;
      discardBtn.onclick = function () {
        if (!netIsGuest()) return orig && orig.apply(this, arguments);
        if (state.selectedCardIdx === null) return;
        netGuestSendIntent(NET_INTENT.DISCARD_ONE, { handIndex: state.selectedCardIdx });
        state.selectedCardIdx = null;
        refreshUI();
      };
    }

    const exitBtn = document.getElementById('btnExitGame');
    if (exitBtn) {
      const orig = exitBtn.onclick;
      exitBtn.onclick = function () {
        if (!netIsOnline()) return orig && orig.apply(this, arguments);
        netLeaveRoom();
        switchView('mainMenu');
      };
    }
  });
})();
