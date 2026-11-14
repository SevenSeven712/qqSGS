/* ============================================================
 * room.js — 房间：创建/加入/离开、Presence、广播收发
 * ============================================================ */

const NET_MODE_VALID = ['duel', 'team', 'chaos', 'lord'];

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
  mode: 'chaos',
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
  ch.on('broadcast', { event: NET_MSG.ROOM_MODE }, ({ payload }) => netOnRoomMode(payload));

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

async function netLeaveRoom(opts) {
  const o = opts || {};
  const wasHost = netRoom.role === 'host';
  try {
    if (netRoom.channel) {
      if (!o.silent) {
        if (wasHost) {
          await netSend(NET_MSG.BYE, {
            name: netRoom.myName,
            reason: '房主已解散房间',
            closeRoom: true,
          });
        } else {
          await netSend(NET_MSG.BYE, {
            name: netRoom.myName,
            reason: o.reason || '对方已离开',
          });
        }
      }
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

  if (netRoom.role === 'guest') {
    const hostIn = list.some(x => x.role === 'host');
    if (hostIn) {
      netRoom._sawHost = true;
    } else if (netRoom._sawHost) {
      // 曾见过房主，现在不见了 → 房间已解散（房间页 / 对局中都生效）
      netHandleRoomClosed(netRoom.started ? '房主已离开，对局结束' : '房主已离开，房间已解散');
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
  await netSend(NET_MSG.WELCOME, { seat: g.seat, code: netRoom.code, hostName: netRoom.myName, mode: netRoom.mode || 'chaos' }, g.clientId);
  netRenderRoomUI();
}

async function netOnWelcome(payload) {
  if (!payload) return;
  if (payload._target && payload._target !== netRoom.clientId) return;
  if (netRoom.role !== 'guest') return;
  netRoom.seat = payload.seat;
  state.localIndices = [payload.seat];
  if (payload.mode && NET_MODE_VALID.indexOf(payload.mode) >= 0) netRoom.mode = payload.mode;
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
  if (payload.mode && NET_MODE_VALID.indexOf(payload.mode) >= 0) netRoom.mode = payload.mode;
  const title = document.getElementById('gameModeTitle');
  if (title) title.textContent = payload.modeLabel || '联机对战';
  switchView('gameView');
}

let _netClosedHandled = false;
async function netHandleRoomClosed(reason) {
  if (!netRoom.code) return;
  if (_netClosedHandled) return;
  _netClosedHandled = true;
  try {
    showToast('联机', reason || '房间已解散', 'error');
    await netLeaveRoom({ silent: true });
    if (typeof resetGame === 'function') resetGame();
    switchView('mainMenu');
  } finally {
    setTimeout(() => { _netClosedHandled = false; }, 800);
  }
}

async function netSetMode(mode) {
  if (netRoom.role !== 'host') return;
  if (netRoom.started) return;
  if (NET_MODE_VALID.indexOf(mode) < 0) return;
  netRoom.mode = mode;
  netRenderRoomUI();
  await netSend(NET_MSG.ROOM_MODE, { mode: mode });
}

function netOnRoomMode(payload) {
  if (!payload || !payload.mode) return;
  if (payload._from === netRoom.clientId) return;
  if (NET_MODE_VALID.indexOf(payload.mode) < 0) return;
  netRoom.mode = payload.mode;
  netRenderRoomUI();
}

function netOnBye(payload) {
  if (!payload) return;
  if (payload._target && payload._target !== netRoom.clientId) return;
  if (payload._from === netRoom.clientId) return;
  if (payload.closeRoom) {
    netHandleRoomClosed(payload.reason || '房主已解散房间');
    return;
  }
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

  const modeGrid = document.getElementById('netModeGrid');
  const modeHint = document.getElementById('netModeHint');
  const startBtn = document.getElementById('btnNetStart');
  const waitHint = document.getElementById('netWaitHint');
  const curMode = netRoom.mode || 'chaos';
  const memberCount = (netRoom.presenceList || []).length;
  let canStart = false;
  let hint = '';

  if (modeGrid) {
    modeGrid.querySelectorAll('.net-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === curMode);
      btn.disabled = (netRoom.role !== 'host') || netRoom.started;
    });
    const activeBtn = modeGrid.querySelector('.net-mode-btn[data-mode="' + curMode + '"]');
    if (activeBtn) {
      const min = parseInt(activeBtn.dataset.min, 10) || 2;
      const max = parseInt(activeBtn.dataset.max, 10) || 6;
      if (memberCount < min) {
        hint = '还需 ' + (min - memberCount) + ' 人（当前 ' + memberCount + '/' + min + '）';
      } else if (memberCount > max) {
        hint = '人数超出（当前 ' + memberCount + '，最多 ' + max + '）';
      } else {
        hint = '当前 ' + memberCount + '/' + max + ' 人，可以开始';
        canStart = true;
      }
    }
  }
  if (modeHint) modeHint.textContent = hint;

  if (startBtn) {
    startBtn.style.display = netRoom.role === 'host' ? 'inline-flex' : 'none';
    startBtn.disabled = !canStart;
  }
  if (waitHint) waitHint.style.display = netRoom.role === 'host' ? 'none' : 'inline';
}
