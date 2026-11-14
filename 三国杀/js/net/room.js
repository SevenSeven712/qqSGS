/* ============================================================
 * room.js — 房间：创建/加入/离开、Presence、广播收发
 * ============================================================ */

const netRoom = {
  role: null,
  code: null,
  clientId: null,
  seat: null,
  channel: null,
  privateChannel: null,
  privateTopic: null,
  guests: [],
  started: false,
  myName: '',
  presenceList: [],
};

function netIsRemoteSeat(seat) {
  if (!netRoom.role) return false;
  if (netRoom.role === 'host') {
    return (netRoom.guests || []).some(g => g.seat === seat);
  }
  if (netRoom.role === 'guest') {
    return seat === 0;
  }
  return false;
}

function netGenCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function netGenId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'x' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function netIsOnline() { return !!netRoom.role; }
function netIsHost() { return netRoom.role === 'host'; }
function netIsGuest() { return netRoom.role === 'guest'; }

function netSubscribeChannel(ch) {
  return new Promise((resolve, reject) => {
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') resolve();
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') reject(new Error('频道订阅失败：' + status));
    });
  });
}

async function netSend(event, payload, target) {
  if (!netRoom.channel) return;
  try {
    await netRoom.channel.send({
      type: 'broadcast',
      event,
      payload: Object.assign({}, payload, { _from: netRoom.clientId, _target: target || null }),
    });
  } catch (e) {
    console.warn('[net] send failed', e);
  }
}

async function netJoinRoom(code, role) {
  const sb = getSupabase();
  netRoom.code = code;
  netRoom.role = role;
  netRoom.clientId = netGenId();
  netRoom.myName = localStorage.getItem('qQiNick') || '玩家';
  netRoom.presenceList = [];

  const ch = sb.channel('qqsg:' + code, {
    config: { presence: { key: netRoom.clientId } },
  });

  ch.on('presence', { event: 'sync' }, () => netHandlePresence(ch.presenceState()));
  ch.on('broadcast', { event: NET_MSG.HELLO }, ({ payload }) => netOnHello(payload));
  ch.on('broadcast', { event: NET_MSG.WELCOME }, ({ payload }) => netOnWelcome(payload));
  ch.on('broadcast', { event: NET_MSG.INTENT }, ({ payload }) => netOnIntent(payload));
  ch.on('broadcast', { event: NET_MSG.PUBLIC_STATE }, ({ payload }) => netOnPublicState(payload));
  ch.on('broadcast', { event: NET_MSG.CHAT }, ({ payload }) => netOnChat(payload));
  ch.on('broadcast', { event: NET_MSG.START }, ({ payload }) => netOnStart(payload));
  ch.on('broadcast', { event: NET_MSG.BYE }, ({ payload }) => netOnBye(payload));

  await netSubscribeChannel(ch);
  netRoom.channel = ch;
  await ch.track({ name: netRoom.myName, seat: role === 'host' ? 0 : -1, role });
}

async function netHostCreateRoom() {
  const code = netGenCode();
  await netJoinRoom(code, 'host');
  netRoom.guests = [];
  netRoom.started = false;
  state.localIndices = [0];
  netRenderRoomUI();
  switchView('netRoomView');
  return code;
}

async function netGuestJoinRoom(code) {
  await netJoinRoom(code, 'guest');
  const privateTopic = 'qqsg:' + code + ':priv-' + netGenId();
  netRoom.privateTopic = privateTopic;
  const pc = getSupabase().channel(privateTopic);
  pc.on('broadcast', { event: NET_MSG.PRIVATE_HAND }, ({ payload }) => {
    if (payload && typeof payload.seat === 'number') netApplyPrivateHand(payload.hand, payload.seat);
  });
  await netSubscribeChannel(pc);
  netRoom.privateChannel = pc;
  await netSend(NET_MSG.HELLO, {
    clientId: netRoom.clientId,
    name: netRoom.myName,
    privateTopic,
  });
  netRenderRoomUI();
  switchView('netRoomView');
}

async function netLeaveRoom() {
  try {
    if (netRoom.channel) {
      await netSend(NET_MSG.BYE, { name: netRoom.myName });
      await netRoom.channel.untrack();
      await netRoom.channel.unsubscribe();
    }
    if (netRoom.privateChannel) await netRoom.privateChannel.unsubscribe();
    (netRoom.guests || []).forEach(g => { if (g.channel) g.channel.unsubscribe(); });
  } catch (e) {}
  netRoom.role = null;
  netRoom.code = null;
  netRoom.seat = null;
  netRoom.channel = null;
  netRoom.privateChannel = null;
  netRoom.privateTopic = null;
  netRoom.guests = [];
  netRoom.started = false;
  netRoom.presenceList = [];
  if (typeof resetGame === 'function') resetGame();
}

function netHandlePresence(st) {
  const list = [];
  Object.keys(st || {}).forEach(key => {
    (st[key] || []).forEach(item => list.push(Object.assign({ clientId: key }, item)));
  });
  netRoom.presenceList = list;
  netRenderRoomUI();

  if (netRoom.role === 'guest' && netRoom.started) {
    const hostIn = list.some(x => x.role === 'host');
    if (!hostIn) {
      showToast('联机', '房主已离开，对局结束', 'error');
      netLeaveRoom();
      switchView('mainMenu');
    }
  }
}

async function netOnHello(payload) {
  if (netRoom.role !== 'host' || !payload || !payload.clientId) return;
  if (payload._from === netRoom.clientId) return;
  if (netRoom.started) {
    await netSend(NET_MSG.BYE, { reason: '游戏已开始' }, payload.clientId);
    return;
  }
  let g = netRoom.guests.find(x => x.clientId === payload.clientId);
  if (!g) {
    const used = new Set([0].concat(netRoom.guests.map(x => x.seat)));
    let seat = 1;
    while (used.has(seat)) seat++;
    if (seat > 5) {
      await netSend(NET_MSG.BYE, { reason: '房间已满' }, payload.clientId);
      return;
    }
    g = {
      clientId: payload.clientId,
      seat,
      name: payload.name || '玩家',
      privateTopic: payload.privateTopic || null,
      channel: null,
    };
    netRoom.guests.push(g);
    if (g.privateTopic) {
      const pc = getSupabase().channel(g.privateTopic);
      await netSubscribeChannel(pc);
      g.channel = pc;
    }
  }
  await netSend(NET_MSG.WELCOME, { seat: g.seat, code: netRoom.code, hostName: netRoom.myName }, g.clientId);
  netRenderRoomUI();
}

async function netOnWelcome(payload) {
  if (!payload) return;
  if (payload._target && payload._target !== netRoom.clientId) return;
  if (netRoom.role !== 'guest') return;
  netRoom.seat = payload.seat;
  state.localIndices = [payload.seat];
  if (netRoom.channel) {
    await netRoom.channel.track({ name: netRoom.myName, seat: netRoom.seat, role: 'guest' });
  }
  netRenderRoomUI();
}

function netOnPublicState(payload) {
  if (!payload || !payload.snap) return;
  if (payload._from === netRoom.clientId) return;
  if (netRoom.role !== 'guest') return;
  netApplyPublicSnapshot(payload.snap);
}

function netOnStart(payload) {
  if (!payload) return;
  if (netRoom.role !== 'guest') return;
  netRoom.started = true;
  const title = document.getElementById('gameModeTitle');
  if (title) title.textContent = '联机对战';
  switchView('gameView');
}

function netOnBye(payload) {
  if (!payload) return;
  if (payload._target && payload._target !== netRoom.clientId) return;
  if (payload._from === netRoom.clientId) return;
  showToast('联机', payload.reason || '对方已离开', 'info');
}

function netOnChat(payload) {
  if (!payload) return;
  if (payload._from === netRoom.clientId) return;
  if (typeof addChat === 'function') addChat(payload.name || '玩家', payload.msg || '');
}

function netBroadcastChat(name, msg) {
  if (!netIsOnline()) return;
  netSend(NET_MSG.CHAT, { name, msg });
}

async function netGuestSendIntent(kind, data) {
  if (netRoom.role !== 'guest') return;
  await netSend(NET_MSG.INTENT, {
    from: netRoom.clientId,
    seat: netRoom.seat,
    kind,
    data: data || {},
  });
}

function netRenderRoomUI() {
  const codeEl = document.getElementById('netRoomCode');
  if (codeEl) codeEl.textContent = netRoom.code || '------';

  const listEl = document.getElementById('netRoomMembers');
  if (listEl) {
    const list = (netRoom.presenceList || []).slice().sort((a, b) => (a.seat == null ? 99 : a.seat) - (b.seat == null ? 99 : b.seat));
    if (list.length === 0) {
      listEl.innerHTML = '<div class="net-empty">等待玩家加入...</div>';
    } else {
      listEl.innerHTML = list.map(p => {
        const isHost = p.role === 'host';
        return '<div class="net-member' + (isHost ? ' is-host' : '') + '">' +
          '<span class="tag">' + (isHost ? '房主' : '玩家') + '</span>' +
          '<span class="name">' + escapeHtml(p.name || '玩家') + '</span>' +
          '</div>';
      }).join('');
    }
  }

  const startBtn = document.getElementById('btnNetStart');
  const waitHint = document.getElementById('netWaitHint');
  if (startBtn) startBtn.style.display = netRoom.role === 'host' ? 'inline-flex' : 'none';
  if (waitHint) waitHint.style.display = netRoom.role === 'host' ? 'none' : 'inline';
}
