/* ============================================================
 * profile.js — 战绩、积分、段位、熟练度
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function getStats() {
      const d = '{"wins":0,"losses":0,"score":0,"history":[],"mastery":{},"rank":"青铜"}';
      try { const v = localStorage.getItem('qQiStats'); if (!v) return JSON.parse(d); const obj = JSON.parse(v); if (
          typeof obj !== 'object' || obj === null) return JSON.parse(d); if (obj.wins === undefined) obj.wins = 0; if (
          obj.losses === undefined) obj.losses = 0; if (obj.score === undefined) obj.score = 0; if (!obj.history) obj
          .history = []; if (!obj.mastery) obj.mastery = {}; if (!obj.rank) obj.rank = '青铜'; return obj; } catch (
        e) { return JSON.parse(d); }
    }

function getPlayerRank() {
      const s = getStats();
      return s.rank || '青铜';
    }

function getPlayerScore() {
      const s = getStats();
      return s.score || 0;
    }

function updatePlayerRank(statsObj) {
      const s = statsObj || getStats();
      const score = s.score || 0;
      if (score >= 30) s.rank = '王者';
      else if (score >= 20) s.rank = '钻石';
      else if (score >= 10) s.rank = '铂金';
      else if (score >= 5) s.rank = '黄金';
      else if (score >= 2) s.rank = '白银';
      else s.rank = '青铜';
      localStorage.setItem('qQiStats', JSON.stringify(s));
    }

function updateStats(w) {
      const s = getStats();
      if (w) s.wins++;
      else s.losses++;
      s.score = (s.score || 0) + (w ? 1 : -1);
      s.score = Math.max(0, s.score);
      const rec = { date: new Date().toLocaleString(), mode: state.mode || '', result: w ? '胜' : '负', score: w ? '+1' :
          '-1' };
      s.history.unshift(rec);
      if (s.history.length > 50) s.history.pop();
      const gn = state.players && state.players[0] ? state.players[0].general && state.players[0].general.id : null;
      if (gn) {
        if (!s.mastery[gn]) s.mastery[gn] = { used: 0, wins: 0 };
        s.mastery[gn].used++;
        if (w) s.mastery[gn].wins++;
      }
      const score = s.score || 0;
      if (score >= 30) s.rank = '王者';
      else if (score >= 20) s.rank = '钻石';
      else if (score >= 10) s.rank = '铂金';
      else if (score >= 5) s.rank = '黄金';
      else if (score >= 2) s.rank = '白银';
      else s.rank = '青铜';
      localStorage.setItem('qQiStats', JSON.stringify(s));
    }

function showStats() {
      const s = getStats();
      const t = s.wins + s.losses;
      document.getElementById('statsContent').innerHTML =
        `<div class="stat-item"><span>胜 胜利</span><span class="stat-value">${s.wins}</span></div><div class="stat-item"><span>败 失败</span><span class="stat-value">${s.losses}</span></div><div class="stat-item"><span>战 · 胜率</span><span class="stat-value">${t>0?Math.round(s.wins/t*100)+'%':'-'}</span></div><div class="stat-item"><span>${svgIcon('star')} 分数</span><span class="stat-value">${s.score}</span></div>`;
      switchView('statsView');
    }

function showHistory() {
      const s = getStats();
      let h = '';
      const modeMap = { duel: '1v1', team: '2v2', chaos: '乱斗', lord: '主公' };
      if (s.history.length === 0) h =
        `<div style="text-align:center;padding:40px 0;color:#888;"><div style="font-size:2.5em;margin-bottom:10px;">${svgIcon('scroll')}</div><p>暂无游戏记录</p></div>`;
      else {
        s.history.forEach((r, i) => {
          const isWin = r.result === '胜';
          const bgColor = isWin ? 'rgba(76,175,80,0.08)' : 'rgba(244,67,54,0.08)';
          const modeName = modeMap[r.mode] || r.mode || '排位';
          h +=
            `<div style="background:${bgColor};border-radius:8px;padding:10px 12px;margin-bottom:8px;border-left:3px solid ${isWin?'#5a7d52':'#b3362b'};"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:0.8em;color:#888;">${r.date||'未知时间'}</span><span style="font-size:0.8em;color:#666;">${modeName}</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:1.1em;color:${isWin?'#5a7d52':'#b3362b'};font-weight:bold;">${isWin?'胜':'败'}</span><span style="color:#8a6f3e;font-size:0.9em;">${r.score>0?'+'+r.score:r.score}分</span></div></div>`;
        });
      }
      document.getElementById('historyContent').innerHTML = h;
      switchView('historyView');
    }

function showMastery() {
      const s = getStats();
      let h = '';
      const ms = s.mastery || {};
      if (Object.keys(ms).length === 0) h = '<p>暂无记录</p>';
      else GENERALS.forEach(g => {
        const m = ms[g.id];
        if (m) {
          const r = m.used > 0 ? Math.round(m.wins / m.used * 100) + '%' : '-';
          h += `<div class="stat-item"><span>${gIcon(g)} ${g.name}</span><span>使用${m.used}次 | 胜率${r}</span></div>`;
        }
      });
      if (!h) h = '<p>暂无记录</p>';
      document.getElementById('masteryContent').innerHTML = h;
      switchView('masteryView');
    }

function updateRankDisplay() {
      const rank = getPlayerRank();
      const color = RANK_COLORS[rank] || '#fff';
      const score = getPlayerScore();
      const nextRankInfo = getNextRankInfo(score);
      const rd = document.getElementById('rankDisplay');
      if (rd) { rd.textContent = rank;
        rd.style.color = color; }
      const rp = document.getElementById('rankProgress');
      if (rp) rp.textContent = `积分: ${score}分 · ${nextRankInfo.progress}`;
      const ri = document.getElementById('rankIntro');
      if (ri) ri.textContent = getRankDescription(rank);
    }

function getNextRankInfo(score) {
      if (score >= 50) return { next: '王者', needed: 0, progress: '已达最高段位' };
      if (score >= 40) return { next: '王者', needed: 10, progress: `距离王者还需 ${50-score} 分` };
      if (score >= 30) return { next: '钻石', needed: 10, progress: `距离钻石还需 ${40-score} 分` };
      if (score >= 20) return { next: '铂金', needed: 10, progress: `距离铂金还需 ${30-score} 分` };
      if (score >= 10) return { next: '黄金', needed: 10, progress: `距离黄金还需 ${20-score} 分` };
      return { next: '白银', needed: 10, progress: `距离白银还需 ${10-score} 分` };
    }

function getRankDescription(rank) {
      const desc = {
        '青铜': '初出茅庐，征战四方',
        '白银': '崭露头角，小有名气',
        '黄金': '身经百战，实力不凡',
        '铂金': '名将风范，威震一方',
        '钻石': '盖世无双，万人敬仰',
        '王者': '天下无双，傲视群雄'
      };
      return desc[rank] || '';
    }

async function renderProfileHeader() {
  const avEl = document.getElementById('profileAvatar');
  const nickEl = document.getElementById('profileNickname');
  if (!avEl || !nickEl) return;
  let user = null;
  try {
    if (typeof netGetAuthUser === 'function') user = await netGetAuthUser(true);
  } catch (e) {}
  if (!user) {
    avEl.style.backgroundImage = '';
    avEl.textContent = '?';
    nickEl.textContent = '未登录';
    return;
  }
  const nick = user.nickname || '玩家';
  const av = user.avatar_url || '';
  if (av && /^https?:\/\//.test(av)) {
    avEl.textContent = '';
    avEl.style.backgroundImage = 'url("' + av.replace(/"/g, '%22') + '")';
  } else {
    avEl.style.backgroundImage = '';
    avEl.textContent = String(nick).charAt(0).toUpperCase();
  }
  nickEl.textContent = nick;
  // 联机也用社区昵称
  try { localStorage.setItem('qQiNick', nick); } catch (e) {}
}

function updateProfileRankDisplay() {
      const rank = getPlayerRank();
      const color = RANK_COLORS[rank] || '#fff';
      const score = getPlayerScore();
      const nextRankInfo = getNextRankInfo(score);
      const prd = document.getElementById('profileRankDisplay');
      if (prd) prd.innerHTML = `<span style="color:${color};">${rank}</span> <span style="font-size:0.7em;">(${score}分)</span>`;
      const prp = document.getElementById('profileRankProgress');
      if (prp) prp.innerHTML = nextRankInfo.progress;
      const pri = document.getElementById('profileRankIntro');
      if (pri) pri.textContent = getRankDescription(rank);
    }
