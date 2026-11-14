/* ============================================================
 * matchmaking.js — 匹配流程
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

let matchTimer = null;
let matchSecInterval = null;
let matchOpponentInterval = null;

async function startMatch() {
  const mode = state.mode || 'chaos';
  if (typeof netStartMatching === 'function' && typeof netGetAuthUser === 'function') {
    const u = await netGetAuthUser();
    if (u) {
      netStartMatching(mode);
      return;
    }
    showToast('提示', '未登录，已进入单机 AI 对战。登录后可匹配真人', 'info');
    startMatchLocalAI(mode);
    return;
  }
  startMatchLocalAI(mode);
}

function startMatchLocalAI(modeOverride, direct) {
  if (modeOverride) state.mode = modeOverride;
      const isDebug = localStorage.getItem('debugModeEnabled') === '1';
      const t = { lord: 6, team: 4, chaos: 4, duel: 2 } [state.mode] || 2;
      const oppCount = t - 1;

      state.players = Array.from({ length: t }, (_, i) => {
        const isLocal = i === 0;
        return {
          id: i,
          name: isLocal ? (localStorage.getItem('qQiNick') || '玩家') : getRandomName(),
          general: null,
          hp: 0,
          maxHp: 0,
          hand: [],
          equip: {},
          rank: isLocal ? getPlayerRank() : getOpponentRank(getPlayerRank()),
          wins: isLocal ? getStats().wins : Math.floor(Math.random() * 50),
          losses: isLocal ? getStats().losses : Math.floor(Math.random() * 30)
        };
      });
      state.localIndices = [0];
      state.teams = [];
      if (state.mode === 'team') for (let i = 0; i < t; i++) state.teams[i] = (i % 2 === 0) ? 0 : 1;
      state.offlineMode = false;

      if (isDebug || direct) {
        startGeneralSelect(false);
        return;
      }

      switchView('matchView');
      const oppList = document.getElementById('matchOpponentList');
      const timerEl = document.getElementById('matchTimer');
      if (oppList) oppList.innerHTML = '';

      const totalSec = 1 + Math.floor(Math.random() * 10);
      if (timerEl) timerEl.textContent = '匹配中 1 秒';

      let sec = 1;
      matchSecInterval = setInterval(() => {
        sec++;
        if (timerEl) {
          if (sec <= totalSec) {
            timerEl.textContent = '匹配中 ' + sec + ' 秒';
          } else {
            timerEl.textContent = '匹配完成';
          }
        }
        if (sec > totalSec) {
          clearInterval(matchSecInterval);
          matchSecInterval = null;
          if (matchOpponentInterval) { clearInterval(matchOpponentInterval);
            matchOpponentInterval = null; }
          if (matchTimer) { clearTimeout(matchTimer);
            matchTimer = null; }
          startGeneralSelect(false);
        }
      }, 1000);

      let oppIdx = 1;
      const perOppTime = Math.max(500, Math.floor((totalSec * 1000) / Math.max(1, oppCount + 1)));
      matchOpponentInterval = setInterval(() => {
        if (oppIdx > oppCount) {
          clearInterval(matchOpponentInterval);
          matchOpponentInterval = null;
          return;
        }
        if (oppList) {
          const p = state.players[oppIdx];
          const firstChar = p.name.charAt(0);
          const item = document.createElement('div');
          item.className = 'match-opp-item';
          item.style.animationDelay = '0s';
          item.innerHTML = `
              <div class="match-opp-avatar">${firstChar}</div>
              <div class="match-opp-info">
                <div class="match-opp-name">${p.name}</div>
                <div class="match-opp-rank">${p.rank}　胜率${Math.round(p.wins/Math.max(1,p.wins+p.losses)*100)}%</div>
              </div>
              <div class="match-opp-status">加入对战</div>
            `;
          oppList.appendChild(item);
        }
        oppIdx++;
      }, perOppTime);

      matchTimer = setTimeout(() => {
        if (matchSecInterval) { clearInterval(matchSecInterval);
          matchSecInterval = null; }
        if (matchOpponentInterval) { clearInterval(matchOpponentInterval);
          matchOpponentInterval = null; }
        if (matchTimer) { clearTimeout(matchTimer);
          matchTimer = null; }
        startGeneralSelect(false);
      }, totalSec * 1000);
    }

document.getElementById('btnCancelMatch').onclick = () => {
      if (matchTimer) { clearTimeout(matchTimer);
        matchTimer = null; }
      if (matchSecInterval) { clearInterval(matchSecInterval);
        matchSecInterval = null; }
      if (matchOpponentInterval) { clearInterval(matchOpponentInterval);
        matchOpponentInterval = null; }
      switchView('modeSelect');
    };
