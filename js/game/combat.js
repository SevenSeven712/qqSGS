/* ============================================================
 * combat.js — 群体结算、决斗、阵亡、胜负、伤害
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function processAoe(tp, fi) {
      const lt = [];
      const cardName = tp === CARD_TYPES.SOUTH ? '南蛮入侵' : '万箭齐发';
      const needCard = tp === CARD_TYPES.SOUTH ? '杀' : '闪';
      addLog(`【杀】 ${state.players[fi].name}使用【${cardName}】！其他玩家需打出【${needCard}】`);
      if (tp === CARD_TYPES.SOUTH) {
        showNanmanEffect(fi);
      } else {
        showArrowsEffect(fi);
      }
      floatText(`player-${fi}`, cardName, tp === CARD_TYPES.SOUTH ? '#b3362b' : '#88ccff');
      const goldenPlayers = [];
      state.players.forEach((p, i) => {
        if (i === fi || p.hp <= 0) return;
        if (p.waterShield) {
          p.waterShield = false;
          addLog(`【水】 ${p.name}的【水】抵消了【${cardName}】效果！`);
          floatText(`player-${i}`, '免疫', '#4a90c8');
          return;
        }
        if (p.goldenShield) {
          p.goldenShield = false;
          addLog(`【护】 ${p.name}的【金蝉护法】免疫了【${cardName}】！`);
          return;
        }
        if (isLocal(i) || (typeof netIsRemoteSeat === 'function' && netIsRemoteSeat(i))) {
          lt.push(i);
          return;
        }
        const needType = tp === CARD_TYPES.SOUTH ? CARD_TYPES.KILL : CARD_TYPES.DODGE;
        const hasNeedCard = p.hand.some(c => c.type === needType);
        if (!hasNeedCard) {
          const gi = p.hand.findIndex(c => c.type === CARD_TYPES.GOLDEN);
          if (gi >= 0) {
            p.hand.splice(gi, 1);
            addLog(`【护】 ${p.name}打出【金蝉护法】免疫！`);
            goldenPlayers.push(i);
            return;
          }
        }
        if (tp === CARD_TYPES.SOUTH) {
          const killIdx = p.hand.findIndex(c => c.type === CARD_TYPES.KILL);
          if (killIdx >= 0) {
            p.hand.splice(killIdx, 1);
            addLog(`  ${p.name}打出【杀】`);
            floatText(`player-${i}`, '杀', '#c84a4a');
            animateCard(`player-${i}`, `player-${fi}`, '杀');
            if (!isLocal(i)) aiEventChat('kill', i, fi);
          } else {
            if (jiahaoProtect(i)) { if (!isLocal(i)) aiEventChat('hurt', i, fi); return; }
            let dmg = 1;
            const mult = maochenhaoDmgMultiplier(fi, tp);
            dmg *= mult;
            p.hp = Math.max(0, p.hp - dmg);
            floatText(`player-${i}`, `-${dmg}`, '#ff4444');
            addLog(`  ${p.name}未打出【杀】，受到${dmg}点伤害`);
            if (!isLocal(i)) aiEventChat('hurt', i, fi);
            if (p.hp <= 0) eliminate(i);
            maochenhaoAfterDamage(i);
            fuchenhaoJudge(fi);
          }
        } else {
          const dodgeIdx = p.hand.findIndex(c => c.type === CARD_TYPES.DODGE);
          if (dodgeIdx >= 0) {
            p.hand.splice(dodgeIdx, 1);
            addLog(`  ${p.name}打出【闪】`);
            floatText(`player-${i}`, '闪', '#4a90c8');
            animateCard(`player-${i}`, `player-${fi}`, '闪');
            if (!isLocal(i)) aiEventChat('dodge', i, fi);
          } else {
            if (jiahaoProtect(i)) { if (!isLocal(i)) aiEventChat('hurt', i, fi); return; }
            let dmg = 1;
            const mult = maochenhaoDmgMultiplier(fi, tp);
            dmg *= mult;
            p.hp = Math.max(0, p.hp - dmg);
            floatText(`player-${i}`, `-${dmg}`, '#ff4444');
            addLog(`  ${p.name}未打出【闪】，受到${dmg}点伤害`);
            if (!isLocal(i)) aiEventChat('hurt', i, fi);
            if (p.hp <= 0) eliminate(i);
            maochenhaoAfterDamage(i);
            fuchenhaoJudge(fi);
          }
        }
      });
      if (goldenPlayers.length > 0) {
        setTimeout(() => {
          goldenPlayers.forEach((idx, j) => {
            setTimeout(() => {
              floatText(`player-${idx}`, '', '#b3362b');
              showGoldenEffect(idx);
            }, j * 500);
          });
        }, 2500);
      }
      if (lt.length > 0) {
        state.pending = { type: tp, targets: lt, originalIdx: state.currentIdx };
        state.currentIdx = lt[0];
      } else state.pending = null;
      refreshUI();
    }

function resolveDuel(a, b) {
      let t = 0;
      while (true) {
        const cur = t % 2 === 0 ? state.players[a] : state.players[b];
        const curIdx = state.players.indexOf(cur);
        const i = cur.hand.findIndex(c => c.type === CARD_TYPES.KILL);
        if (i >= 0) {
          cur.hand.splice(i, 1);
          addLog(`  ${cur.name}出杀`);
        } else {
          if (cur.general && cur.general.id === 'xiaoming' && cur.hand.length === 0) {
            addLog(`【济南捞子】${cur.name}无手牌，免疫决斗伤害`);
            break;
          }
          let dmg = 1;
          if (t % 2 === 0) {
            const mult = maochenhaoDmgMultiplier(a, 'duel');
            dmg *= mult;
            if (mult > 1) addLog(`  满血之力！伤害翻倍`);
          }
          cur.hp = Math.max(0, cur.hp - dmg);
          floatText(`player-${curIdx}`, `-${dmg}`, '#ff4444');
          addLog(`  ${cur.name}受到${dmg}点伤害`);
          if (cur.hp <= 0) eliminate(curIdx);
          if (t % 2 === 0) fuchenhaoJudge(a);
          maochenhaoAfterDamage(curIdx);
          break;
        }
        t++;
      }
    }

function eliminate(i) {
      if (state.gameOver) return;
      state.players[i].hp = 0;
      addLog(`【亡】 ${state.players[i].name}阵亡`);
      checkVictory();
    }

function checkVictory() {
      if (state.gameOver) return;
      const a = state.players.filter(p => p.hp > 0);
      if (a.length === 0) { state.gameOver = true;
        showResult(false); return; }
      if (state.mode === 'team') {
        const ta = new Set(a.map(p => state.teams[state.players.indexOf(p)]));
        if (ta.size <= 1) { state.gameOver = true;
          let pw = false; if (ta.size === 1) pw = state.localIndices.some(i => state.teams[i] === [...ta][0]);
          showResult(pw); }
      } else if (a.length <= 1) { state.gameOver = true;
        const w = a[0];
        showResult(w && isLocal(state.players.indexOf(w))); }
    }

function showResult(w) {
      if (typeof netHostBroadcastSnapshot === 'function') netHostBroadcastSnapshot();
      const m = document.getElementById('resultModal');
      const c = document.getElementById('resultContent');
      c.innerHTML =
        `${w?'<div class="big-result win">胜</div>':'<div class="big-result lose">败</div>'}${state.offlineMode?'<div style="color:#6b6357;font-size:0.85em;margin:10px;">（线下模式，不计入战绩与积分）</div>':''}<button class="btn btn-attack" id="btnEndGame">结束游戏</button>`;
      m.style.display = 'flex';
      document.getElementById('btnEndGame').onclick = () => { m.style.display = 'none';
        resetGame();
        switchView('mainMenu'); };
      if (state.players) state.players.forEach((p, i) => {
        if (!isLocal(i)) {
          const isWin = w;
          const alive = p.hp > 0;
          if (isWin && alive) aiEventChat('win', i, i);
          else if (!isWin && alive) aiEventChat('lose', i, i);
          else if (!alive) aiEventChat('lose', i, i);
        }
      });
      if (!state.offlineMode) updateStats(w);
    }

function dealDamage(fromIdx, toIdx, cardType) {
      const t = state.players[toIdx];
      if (!t || t.hp <= 0) return;
      if ((cardType === 'kill' || cardType === 'duel') && xiaomingImmune(toIdx, cardType)) return;
      if (jiahaoProtect(toIdx)) return;
      let dmg = 1;
      const mult = maochenhaoDmgMultiplier(fromIdx, cardType);
      dmg *= mult;
      t.hp = Math.max(0, t.hp - dmg);
      floatText(`player-${toIdx}`, `-${dmg}`, '#ff4444');
      shakePlayerCard(toIdx);
      addLog(`  ${t.name}受到${dmg}点伤害`);
      if (t.hp <= 0) eliminate(toIdx);
      fuchenhaoJudge(fromIdx);
      maochenhaoAfterDamage(toIdx);
    }
