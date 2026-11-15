/* ============================================================
 * match.js — 匹配池：查活人 / 4~10s 窗口 / AI 补位 / 房主发起邀请
 * ============================================================ */

const NET_LOBBY_TOPIC = 'qqsg:lobby';
const MODE_SIZE = { duel: 2, team: 4, chaos: 4, lord: 6 };
const MODE_LABEL = { duel: '1v1 单挑', team: '2v2 合作', chaos: '4人大乱斗', lord: '主公模式' };

const netMatch = {
  active: false,
  mode: 'chaos',
  clientId: '',
  nickname: '',
  channel: null,
  waitStartedAt: 0,
  waitDuration: 0,
  timer: null,
  pollTimer: null,
  invited: false,
};

function netMatchElapsed() {
  return netMatch.waitStartedAt ? Math.floor((Date.now() - netMatch.waitStartedAt) / 1000) : 0;
}

function netMatchSetStatus(txt) {
  const el = document.getElementById('matchTimer');
  if (el) el.textContent = txt;
}

function netMatchAddOpponent(name, rank) {
  const box = document.getElementById('matchOpponentList');
  if (!box) return;
  const first = String(name || 'U').charAt(0);
  const div = document.createElement('div');
  div.className = 'match-opp-item';
  div.innerHTML = '<div class="match-opp-avatar">' + escapeHtml(first) + '</div>' +
    '<div class="match-opp-info"><div class="match-opp-name">' + escapeHtml(name) + '</div>' +
    '<div class="match-opp-rank">' + escapeHtml(rank || '青铜') + '</div></div>' +
    '<div class="match-opp-status">匹配中</div>';
  box.appendChild(div);
}

async function netStartMatching(mode) {
  const u = await netGetAuthUser(true);
  if (!u) { netShowAuthModal(function () { netStartMatching(mode); }); return; }
  netMatch.mode = mode || state.mode || 'chaos';
  netMatch.clientId = netGenId();
  netMatch.nickname = u.nickname || '玩家';
  netMatch.avatar = (u.avatar_url && /^https?:\/\//.test(u.avatar_url)) ? u.avatar_url : '';
  netMatch.active = true;
  netMatch.invited = false;
  state.mode = netMatch.mode;
  switchView('matchView');
  const box = document.getElementById('matchOpponentList');
  if (box) box.innerHTML = '';
  netMatchSetStatus('正在寻找对手...');

  const sb = getSupabase();
  const ch = sb.channel(NET_LOBBY_TOPIC + ':' + netMatch.mode, {
    config: { presence: { key: netMatch.clientId } },
  });
  ch.on('presence', { event: 'sync' }, function () {
    const st = ch.presenceState();
    const list = [];
    Object.keys(st || {}).forEach(function (k) {
      (st[k] || []).forEach(function (item) { list.push(Object.assign({ clientId: k }, item)); });
    });
    netMatchHandlePool(list);
  });
  ch.on('broadcast', { event: 'MATCH_INVITE' }, function (p) {
    const pl = p && p.payload;
    if (!pl || !pl.roomCode) return;
    if (pl.hostClientId === netMatch.clientId) return;
    if (!netMatch.active) return;
    if (netMatch.mode !== pl.mode) return;
    netMatchOnInvite(pl);
  });
  await netSubscribeChannel(ch);
  netMatch.channel = ch;
  try { await ch.track({ clientId: netMatch.clientId, nickname: netMatch.nickname, avatar: netMatch.avatar || '', mode: netMatch.mode, ts: Date.now() }); } catch (e) {}

  await new Promise(function (r) { setTimeout(r, 350); });
  if (!netMatch.active) return;

  const pool = netMatchPoolList(ch.presenceState());
  if (!netMatchAnyOther(pool)) {
    netMatchSetStatus('没有玩家在线，正在准备 AI 对战...');
    await new Promise(function (r) { setTimeout(r, 350); });
    netMatchFallbackToAI('当前没有其他玩家在线，已进入单机 AI 对战');
    return;
  }

  netMatch.waitStartedAt = Date.now();
  netMatch.waitDuration = 4 + Math.floor(Math.random() * 7);
  netMatchSetStatus('匹配中 1 秒');
  netMatch.pollTimer = setInterval(function () {
    if (!netMatch.active) return;
    const el = netMatchElapsed();
    if (el <= netMatch.waitDuration) netMatchSetStatus('匹配中 ' + el + ' 秒');
    else netMatchSetStatus('匹配完成');
  }, 1000);
  netMatch.timer = setTimeout(function () {
    if (!netMatch.active) return;
    netMatchFallbackToAI('等待超时，已进入 AI 对战');
  }, netMatch.waitDuration * 1000);
}

function netMatchPoolList(st) {
  const list = [];
  Object.keys(st || {}).forEach(function (k) {
    (st[k] || []).forEach(function (item) { list.push(Object.assign({ clientId: k }, item)); });
  });
  return list.filter(function (x) { return x.mode === netMatch.mode; });
}

function netMatchAnyOther(pool) {
  return pool.some(function (x) { return x.clientId !== netMatch.clientId; });
}

function netMatchHandlePool(pool) {
  if (!netMatch.active || netMatch.invited) return;
  const others = pool.filter(function (x) { return x.clientId !== netMatch.clientId; });
  others.forEach(function (o) {
    if (!document.querySelector('[data-opp="' + o.clientId + '"]')) netMatchAddOpponent(o.nickname || '玩家', '青铜');
  });
  if (others.length === 0) return;

  const sorted = pool.slice().sort(function (a, b) {
    return String(a.clientId).localeCompare(String(b.clientId));
  });
  if (sorted[0] && sorted[0].clientId === netMatch.clientId) {
    netMatchHostStartInvite(sorted);
  }
}

async function netMatchHostStartInvite(pool) {
  if (netMatch.invited) return;
  netMatch.invited = true;
  netMatchSetStatus('正在创建房间...');
  try {
    const code = await netHostCreateRoomEx(4);
    netMatch.timer && clearTimeout(netMatch.timer);
    netMatch.pollTimer && clearInterval(netMatch.pollTimer);
    netMatch.timer = null; netMatch.pollTimer = null;
    await netSend(NET_MSG.ROOM_MODE, { mode: netMatch.mode });
    if (netMatch.channel) {
      try {
        await netMatch.channel.send({
          type: 'broadcast',
          event: 'MATCH_INVITE',
          payload: { roomCode: code, hostClientId: netMatch.clientId, mode: netMatch.mode },
        });
      } catch (e) {}
      try { await netMatch.channel.untrack(); } catch (e) {}
      try { await netMatch.channel.unsubscribe(); } catch (e) {}
    }
    netMatch.channel = null;
    netMatch.active = false;
    setTimeout(function () { netHostFillAIAndStart(); }, 3000);
  } catch (e) {
    console.error('[net] host invite failed', e);
    netMatchFallbackToAI('创建房间失败，已改为 AI 对战');
  }
}

async function netMatchOnInvite(pl) {
  if (!netMatch.active || netMatch.invited) return;
  netMatch.invited = true;
  netMatchSetStatus('正在加入房间 ' + pl.roomCode + '...');
  if (netMatch.timer) { clearTimeout(netMatch.timer); netMatch.timer = null; }
  if (netMatch.pollTimer) { clearInterval(netMatch.pollTimer); netMatch.pollTimer = null; }
  const myId = netMatch.clientId;
  const myName = netMatch.nickname;
  if (netMatch.channel) {
    try { await netMatch.channel.untrack(); } catch (e) {}
    try { await netMatch.channel.unsubscribe(); } catch (e) {}
  }
  netMatch.channel = null;
  netMatch.active = false;
  try {
    netRoom.clientId = myId;
    netRoom.myName = myName;
    await netJoinRoom(pl.roomCode, 'guest');
    const privateTopic = 'qqsg:' + pl.roomCode + ':priv-' + netGenId();
    netRoom.privateTopic = privateTopic;
    const pc = getSupabase().channel(privateTopic);
    pc.on('broadcast', { event: NET_MSG.PRIVATE_HAND }, function (x) {
      if (x && x.payload && typeof x.payload.seat === 'number') netApplyPrivateHand(x.payload.hand, x.payload.seat);
    });
    await netSubscribeChannel(pc);
    netRoom.privateChannel = pc;
    await netSend(NET_MSG.HELLO, { clientId: myId, name: myName, privateTopic });
    netRenderRoomUI();
    switchView('netRoomView');
  } catch (e) {
    console.error('[net] join on invite failed', e);
    netMatchFallbackToAI('加入房间失败，已改为 AI 对战');
  }
}

function netMatchFallbackToAI(reason) {
  if (netMatch.channel) {
    try { netMatch.channel.untrack(); } catch (e) {}
    try { netMatch.channel.unsubscribe(); } catch (e) {}
  }
  netMatch.channel = null;
  netMatch.active = false;
  if (netMatch.timer) { clearTimeout(netMatch.timer); netMatch.timer = null; }
  if (netMatch.pollTimer) { clearInterval(netMatch.pollTimer); netMatch.pollTimer = null; }
  netMatchSetStatus(reason || '已进入 AI 对战');
  setTimeout(function () { startMatchLocalAI(netMatch.mode, true); }, 400);
}

function netMatchCancel() {
  if (netMatch.channel) {
    try { netMatch.channel.untrack(); } catch (e) {}
    try { netMatch.channel.unsubscribe(); } catch (e) {}
  }
  netMatch.channel = null;
  netMatch.active = false;
  netMatch.invited = false;
  if (netMatch.timer) { clearTimeout(netMatch.timer); netMatch.timer = null; }
  if (netMatch.pollTimer) { clearInterval(netMatch.pollTimer); netMatch.pollTimer = null; }
  switchView('modeSelect');
}

window.netStartMatching = netStartMatching;
window.netMatchCancel = netMatchCancel;
