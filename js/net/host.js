/* ============================================================
 * host.js — 房主权威：执行游戏逻辑、广播快照、处理 intent
 * ============================================================ */

let _netSnapTimer = null;
let _hostPendingTimer = null;
let _hostPendingKey = '';

function netHostScheduleSnapshot() {
  if (_netSnapTimer) return;
  _netSnapTimer = setTimeout(() => {
    _netSnapTimer = null;
    netHostBroadcastSnapshot();
  }, 40);
}

function netHostCheckPendingTimeout() {
  const clear = () => {
    if (_hostPendingTimer) { clearTimeout(_hostPendingTimer); _hostPendingTimer = null; }
    _hostPendingKey = '';
  };
  if (!netIsHost() || !netRoom.started || !state.pending) { clear(); return; }
  if (!netIsRemoteSeat(state.currentIdx)) { clear(); return; }
  const pk = String(state.pending.type) + ':' + state.currentIdx + ':' + String(state.pending.from == null ? '' : state.pending.from);
  if (pk === _hostPendingKey) return;
  if (_hostPendingTimer) clearTimeout(_hostPendingTimer);
  _hostPendingKey = pk;
  const targetIdx = state.currentIdx;
  const pendingType = state.pending.type;
  _hostPendingTimer = setTimeout(() => {
    _hostPendingTimer = null;
    _hostPendingKey = '';
    if (!netIsHost() || !state.pending) return;
    if (state.currentIdx !== targetIdx) return;
    if (!netIsRemoteSeat(targetIdx)) return;
    try {
      const p = state.players[targetIdx];
      addLog('【联机】' + (p ? p.name : '玩家') + ' 响应超时（30 秒），自动按「不出」处理');
      if (pendingType === 'respond_kill' || pendingType === CARD_TYPES.SOUTH || pendingType === CARD_TYPES.ARROWS) {
        respondPending('no');
      }
    } catch (e) {
      console.error('[net] pending timeout error', e);
    }
  }, 30000);
}

async function netHostBroadcastSnapshot() {
  if (netRoom.role !== 'host' || !netRoom.started) return;
  const snap = netBuildPublicSnapshot();
  await netSend(NET_MSG.PUBLIC_STATE, { snap });
  for (const g of netRoom.guests) {
    if (!g.channel) continue;
    if (g.isAI) continue;
    const p = state.players[g.seat];
    const hand = p && p.hand ? p.hand.map(netSerializeCard) : [];
    try {
      await g.channel.send({
        type: 'broadcast',
        event: NET_MSG.PRIVATE_HAND,
        payload: { seat: g.seat, hand },
      });
    } catch (e) {
      console.warn('[net] private hand send failed', e);
    }
  }
}

function netOnIntent(payload) {
  if (netRoom.role !== 'host' || !netRoom.started) return;
  if (!payload || !payload.from) return;
  if (payload._from === netRoom.clientId) return;
  if (payload._target && payload._target !== netRoom.clientId) return;
  const g = netRoom.guests.find(x => x.clientId === payload.from);
  if (!g) return;
  netHostHandleIntent(g.seat, payload.kind, payload.data || {});
}

function netHostHandleIntent(seat, kind, data) {
  const p = state.players[seat];
  if (!p || p.hp <= 0) return;

  try {
    switch (kind) {
      case NET_INTENT.USE_CARD: {
        if (state.currentIdx !== seat) return;
        if (state.pending) return;
        const idx = data.handIndex | 0;
        const card = p.hand[idx];
        if (!card) return;
        const ti = (data.targetIdx === null || data.targetIdx === undefined) ? seat : (data.targetIdx | 0);
        useCard(card, seat, ti);
        break;
      }
      case NET_INTENT.END_TURN: {
        if (state.currentIdx !== seat) return;
        if (state.pending) return;
        endTurn();
        break;
      }
      case NET_INTENT.RESPOND: {
        if (state.currentIdx !== seat) return;
        if (!state.pending) return;
        respondPending(data.choice);
        break;
      }
      case NET_INTENT.DISCARD_ONE: {
        if (state.currentIdx !== seat) return;
        const idx = data.handIndex | 0;
        const c = p.hand[idx];
        if (!c) return;
        p.hand.splice(idx, 1);
        state.discard.push(c);
        addLog('【弃】 ' + p.name + '弃置【' + c.name + '】');
        refreshUI();
        break;
      }
      case NET_INTENT.CONFIRM_DISCARD: {
        const idxs = Array.isArray(data.indices) ? data.indices : [];
        state.selectedDiscardIndices = new Set(idxs);
        const prevLocal = state.localIndices;
        state.localIndices = [seat];
        try { confirmDiscard(); }
        finally { state.localIndices = prevLocal; }
        break;
      }
      case NET_INTENT.CONFIRM_NEXT_ROUND:
        confirmEnterNextRound();
        break;
      case NET_INTENT.USE_SKILL: {
        const fn = data.skill;
        if (typeof window[fn] !== 'function') return;
        const prevLocal = state.localIndices;
        const prevCur = state.currentIdx;
        state.localIndices = [seat];
        state.currentIdx = seat;
        try { window[fn].apply(null, data.args || []); }
        finally { state.currentIdx = prevCur; state.localIndices = prevLocal; }
        break;
      }
      default:
        return;
    }
  } catch (e) {
    console.error('[net] intent error', e);
    addLog('【联机】操作失败：' + (e && e.message ? e.message : e));
  }
  netHostScheduleSnapshot();
}

async function netHostFillAIAndStart() {
  if (!netIsHost()) return;
  if (netRoom.started) return;
  const mode = netRoom.mode || 'chaos';
  const need = MODE_SIZE[mode] || 4;
  const humans = (netRoom.guests || []).filter(g => !g.isAI).length + 1;
  if (humans < need) {
    const used = new Set([0].concat(netRoom.guests.map(g => g.seat)));
    let filled = 0;
    for (let s = 1; s < need && filled < (need - humans); s++) {
      if (used.has(s)) continue;
      netRoom.guests.push({
        clientId: '__ai_' + s + '_' + netGenId(),
        seat: s,
        name: getRandomName(),
        privateTopic: null,
        channel: null,
        isAI: true,
      });
      used.add(s);
      filled++;
    }
    addLog('【联机】已补 ' + filled + ' 个 AI 补位到 ' + need + ' 人');
  }
  try { await netHostStartGame(true); }
  catch (e) { console.error('[net] fill ai start failed', e); }
}

async function netHostStartGame(skipCheck) {
  if (netRoom.role !== 'host') return;
  const total = netRoom.guests.length + 1;
  const mode = netRoom.mode || 'chaos';
  const MODE_REQ = {
    duel: { min: 2, max: 2, label: '1v1 单挑' },
    team: { min: 4, max: 4, label: '2v2 合作' },
    chaos: { min: 4, max: 4, label: '4人大乱斗' },
    lord: { min: 6, max: 6, label: '主公模式' },
  };
  const req = MODE_REQ[mode] || MODE_REQ.chaos;
  if (!skipCheck) {
    if (total < req.min) { showToast('提示', req.label + ' 需要至少 ' + req.min + ' 人（当前 ' + total + ' 人）', 'info'); return; }
    if (total > req.max) { showToast('提示', req.label + ' 最多 ' + req.max + ' 人（当前 ' + total + ' 人）', 'info'); return; }
  }

  netRoom.guests.sort((a, b) => a.seat - b.seat);
  const maxSeat = Math.max(0, ...netRoom.guests.map(g => g.seat));
  const stats = getStats();

  state.players = [];
  for (let s = 0; s <= maxSeat; s++) {
    if (s === 0) {
      state.players.push({
        id: 0,
        name: netRoom.myName,
        avatar: netRoom.myAvatar || '',
        general: null, hp: 0, maxHp: 0,
        hand: [], equip: {},
        rank: getPlayerRank(),
        wins: stats.wins,
        losses: stats.losses,
      });
    } else {
      const g = netRoom.guests.find(x => x.seat === s);
      state.players.push({
        id: s,
        name: g ? g.name : '玩家' + s,
        avatar: (g && g.avatar) || '',
        general: null, hp: 0, maxHp: 0,
        hand: [], equip: {},
        rank: '青铜',
        wins: 0, losses: 0,
      });
    }
  }

  const pool = shuffle(GENERALS.slice());
  state.players.forEach((p, i) => {
    const g = pool[i % pool.length];
    p.general = g;
    p.maxHp = g.hp;
    p.hp = g.hp;
  });

  state.mode = mode;
  if (mode === 'team') {
    state.teams = state.players.map(function (_, i) { return i % 2; });
  } else {
    state.teams = [];
  }
  state.deck = shuffle(createDeck());
  state.discard = [];
  state.players.forEach(p => { p.hand = drawCards(4); });
  state.currentIdx = state.players.length - 1;
  state.gameOver = false;
  state.pending = null;
  state.needTarget = null;
  state.firstTurnDone = true;
  state.roundNumber = 1;
  state.subRoundCount = 1;
  state.playersActedThisRound.clear();
  state.playersPlayedThisRound.clear();
  state.fullLogHistory = [];
  state.localIndices = [0];

  netRoom.started = true;

  const title = document.getElementById('gameModeTitle');
  if (title) title.textContent = req.label;
  addLog('联机对局开始！模式：' + req.label);

  await netSend(NET_MSG.START, { total: state.players.length, mode: mode, modeLabel: req.label });
  await netHostBroadcastSnapshot();

  switchView('gameView');
  advanceTurn();
}
