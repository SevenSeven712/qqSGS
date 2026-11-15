/* ============================================================
 * protocol.js — 联机消息协议 + 快照序列化/应用
 * ============================================================ */

const NET_MSG = {
  HELLO: 'hello',
  WELCOME: 'welcome',
  INTENT: 'intent',
  PUBLIC_STATE: 'public_state',
  PRIVATE_HAND: 'private_hand',
  CHAT: 'chat',
  START: 'start',
  ROOM_MODE: 'room_mode',
  BYE: 'bye',
};

const NET_INTENT = {
  USE_CARD: 'useCard',
  END_TURN: 'endTurn',
  RESPOND: 'respond',
  DISCARD_ONE: 'discardOne',
  CONFIRM_DISCARD: 'confirmDiscard',
  CONFIRM_NEXT_ROUND: 'confirmNextRound',
  USE_SKILL: 'useSkill',
};

const NET_EQUIP_SLOTS = ['weapon', 'armor', 'plus1', 'minus1'];

function netSerializeCard(c) {
  return {
    type: c.type,
    name: c.name,
    suit: c.suit,
    cat: c.cat,
    sub: c.sub,
    desc: c.desc,
    range: c.range,
  };
}

function netSerializePlayerForAll(p) {
  const equip = {};
  NET_EQUIP_SLOTS.forEach(s => {
    if (p.equip && p.equip[s]) {
      equip[s] = { name: p.equip[s].name, sub: p.equip[s].sub, desc: p.equip[s].desc };
    }
  });
  return {
    name: p.name,
    avatar: p.avatar || '',
    hp: p.hp,
    maxHp: p.maxHp,
    handCount: p.hand ? p.hand.length : 0,
    generalId: p.general ? p.general.id : null,
    rank: p.rank,
    wins: p.wins,
    losses: p.losses,
    locked: !!p.locked,
    goldenShield: !!p.goldenShield,
    waterShield: !!p.waterShield,
    equip,
  };
}

function netBuildPublicSnapshot() {
  return {
    mode: state.mode,
    currentIdx: state.currentIdx,
    phase: state.phase,
    roundNumber: state.roundNumber,
    subRoundCount: state.subRoundCount,
    gameOver: state.gameOver,
    teams: state.teams || [],
    pending: state.pending ? JSON.parse(JSON.stringify(state.pending)) : null,
    players: state.players.map(netSerializePlayerForAll),
    logs: (state.fullLogHistory || []).slice(-60).map(l => ({ time: l.time, msg: l.msg })),
    deckCount: state.deck ? state.deck.length : 0,
    discardCount: state.discard ? state.discard.length : 0,
    fx: (typeof netTakeFx === 'function') ? netTakeFx() : [],
  };
}

function netApplyPublicSnapshot(snap) {
  if (!snap) return;
  state.mode = snap.mode;
  state.currentIdx = snap.currentIdx;
  state.phase = snap.phase;
  state.roundNumber = snap.roundNumber;
  state.subRoundCount = snap.subRoundCount;
  state.gameOver = snap.gameOver;
  state.teams = snap.teams || [];
  state.pending = snap.pending;

  const oldPlayers = state.players || [];
  state.players = snap.players.map((sp, i) => {
    const old = oldPlayers[i] || {};
    return {
      id: i,
      name: sp.name,
      avatar: sp.avatar || '',
      hp: sp.hp,
      maxHp: sp.maxHp,
      hand: (i === ((typeof netRoom !== 'undefined' && netRoom && netRoom.role === 'guest') ? netRoom.seat : 0)) ? (old.hand || []) : new Array(Math.max(0, sp.handCount || 0)).fill(null),
      general: (GENERALS || []).find(g => g.id === sp.generalId) || null,
      equip: sp.equip || {},
      rank: sp.rank,
      wins: sp.wins,
      losses: sp.losses,
      locked: sp.locked,
      goldenShield: sp.goldenShield,
      waterShield: sp.waterShield,
    };
  });

  const logBox = document.getElementById('logBox');
  if (logBox && snap.logs) {
    logBox.innerHTML = snap.logs.map(l => '<div>' + l.msg + '</div>').join('');
    logBox.scrollTop = logBox.scrollHeight;
  }
  state.fullLogHistory = (snap.logs || []).map(l => ({ time: l.time, msg: l.msg }));

  if (snap.fx && snap.fx.length && typeof netReplayFx === 'function') {
    snap.fx.forEach(function (item) { netReplayFx(item.type, item.data); });
  }

  if (typeof refreshUI === 'function') refreshUI();
}

function netApplyPrivateHand(hand, seat) {
  if (!state.players || !state.players[seat]) return;
  state.players[seat].hand = (hand || []).map(c => Object.assign({}, c));
  if (typeof refreshUI === 'function') refreshUI();
}
