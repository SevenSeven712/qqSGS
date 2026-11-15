/* ============================================================
 * state.js — 全局 state、摸牌、回合归属工具
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

const state = { mode: 'duel', players: [], teams: [], deck: [], discard: [], currentIdx: 0, phase: 'waiting',
      selectedCardIdx: null, gameOver: false, pending: null, localIndices: [], needTarget: null, aiTimerActive: false,
      aiCooldown: false, takenGenerals: [], offlineMode: false, offlinePickIdx: 0, roundNumber: 1, subRoundCount: 1,
      playersActedThisRound: new Set(), playersPlayedThisRound: new Set(), selectedDiscardIndices: new Set(),
      aoeJustResolved: false, fullLogHistory: [] };

const shuffle = a => [...a].sort(() => Math.random() - 0.5);

function drawCards(n) {
      const d = [];
      for (let i = 0; i < n; i++) {
        if (state.deck.length === 0 && state.discard.length > 0) { state.deck = shuffle(state.discard);
          state.discard = []; }
        if (state.deck.length) d.push(state.deck.pop());
      }
      return d;
    }

function getCur() { return state.players[state.currentIdx]; }
function isLocal(i) { return state.localIndices.includes(i); }

function sameTeam(a, b) { return state.mode === 'team' && state.teams[a] !== undefined && state.teams[a] === state
        .teams[b]; }

function getTeamColor(i) {
  if (state.mode !== 'team') return 'var(--text)';
  return state.teams[i] === 0 ? '#b3362b' : '#4a6c8c';
}

function refreshUI() { renderPlayers();
      renderMyHand();
      renderEquipArea();
      updateButtons();
      showResponsePanel();
      updateRoundDisplay(); }
