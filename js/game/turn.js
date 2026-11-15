/* ============================================================
 * turn.js — 响应、出牌阶段、回合推进、轮次结算
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function showResponsePanel() {
      const p = document.getElementById('responsePanel');
      if (!state.pending || !isLocal(state.currentIdx) || getCur()?.hp <= 0) { p.style.display = 'none'; return; }
      const cur = getCur();
      let h = '';
      const hasDodge = cur.hand.some(c => c.type === CARD_TYPES.DODGE);
      const hasKill = cur.hand.some(c => c.type === CARD_TYPES.KILL);
      const hasGolden = cur.hand.some(c => c.type === CARD_TYPES.GOLDEN) && !cur.goldenShield;
      const goldenBtn = hasGolden ? `<button class="btn" style="background:#b3362b;color:#fdf6e8;" id="respGolden"><span class="icn"></span>用金蝉护法</button> ` :
        '';
      const pendingType = state.pending.type;
      let autoAction = null;
      if (pendingType === 'respond_kill' && hasDodge) autoAction = 'dodge';
      else if (pendingType === CARD_TYPES.SOUTH && hasKill) autoAction = 'kill';
      else if (pendingType === CARD_TYPES.ARROWS && hasDodge) autoAction = 'dodge';
      if (autoAction) {
        const label = { 'dodge': '闪', 'kill': '杀' } [autoAction];
        h =
          `<p>${pendingType==='respond_kill'?'对手对你使用【杀】！':pendingType===CARD_TYPES.SOUTH?'南蛮入侵！需出【杀】':'万箭齐发！需出【闪】'}</p><p style="color:#88dd88;font-size:0.85em;">${svgIcon('hourglass')} 自动打出【${label}】</p>`;
        p.innerHTML = h;
        p.style.display = 'block';
        setTimeout(() => respondPending(autoAction), 600);
        return;
      }
      if (pendingType === 'respond_kill') {
        h =
          `<p>对手对你使用【杀】！</p>${goldenBtn}<button class="btn btn-peach" id="respDodge" disabled><span class="icn"></span>出闪</button> <button class="btn" id="respHurt"><span class="icn"></span>扣血</button>`;
      } else if (pendingType === CARD_TYPES.SOUTH) {
        h =
          `<p>南蛮入侵！需出【杀】</p>${goldenBtn}<button class="btn btn-attack" id="respKill" disabled><span class="icn"></span>出杀</button> <button class="btn" id="respNo"><span class="icn"></span>不出</button>`;
      } else if (pendingType === CARD_TYPES.ARROWS) {
        h =
          `<p>万箭齐发！需出【闪】</p>${goldenBtn}<button class="btn btn-peach" id="respDodge" disabled><span class="icn"></span>出闪</button> <button class="btn" id="respNo"><span class="icn"></span>不出</button>`;
      }
      p.innerHTML = h;
      p.style.display = 'block';
      if (document.getElementById('respGolden')) document.getElementById('respGolden').onclick = () => respondPending(
      'golden');
      if (document.getElementById('respDodge')) document.getElementById('respDodge').onclick = () => respondPending(
        'dodge');
      if (document.getElementById('respHurt')) document.getElementById('respHurt').onclick = () => respondPending(
        'hurt');
      if (document.getElementById('respKill')) document.getElementById('respKill').onclick = () => respondPending(
        'kill');
      if (document.getElementById('respNo')) document.getElementById('respNo').onclick = () => respondPending('no');
    }

function respondPending(ch) {
      document.getElementById('responsePanel').style.display = 'none';
      const cur = getCur();
      if (!cur || cur.hp <= 0) return;
      if (cur.goldenShield) {
        cur.goldenShield = false;
        addLog(`【护】 ${cur.name}的【金蝉护法】免疫了效果！`);
        state.pending = null;
        refreshUI();
        return;
      }
      if (ch === 'golden') {
        const gi = cur.hand.findIndex(c => c.type === CARD_TYPES.GOLDEN);
        if (gi >= 0) {
          cur.hand.splice(gi, 1);
          addLog(`【护】 ${cur.name}打出【金蝉护法】免疫！`);
          const isAoe = state.pending.type === CARD_TYPES.SOUTH || state.pending.type === CARD_TYPES.ARROWS;
          const delay = isAoe ? 2500 : 0;
          setTimeout(() => {
            floatText(`player-${state.currentIdx}`, '', '#b3362b');
            showGoldenEffect(state.currentIdx);
          }, delay);
        }
        if (state.pending.type === 'respond_kill') { if (state.pending.originalIdx !== undefined) state.currentIdx =
            state.pending.originalIdx;
          state.pending = null; } else { handleAoe(); }
        refreshUI();
        checkVictory();
        if (!state.gameOver && state.phase === 'play' && !isLocal(state.currentIdx) && !state.pending) {
          state.aoeJustResolved = true;
          scheduleAi();
        }
        return;
      }
      if (state.pending.type === 'respond_kill') {
        if (ch === 'dodge') {
          const i = cur.hand.findIndex(c => c.type === CARD_TYPES.DODGE);
          if (i >= 0) { cur.hand.splice(i, 1);
            addLog(`${cur.name}打出【闪】免疫`);
            floatText(`player-${state.currentIdx}`, '闪', '#4a90c8');
            const fi = state.pending.from; if (fi !== undefined) animateCard(`player-${state.currentIdx}`, `player-${fi}`,
              '闪'); } else { addLog(`${cur.name}没有闪，受到1点伤害`);
            dealDamage(state.pending.from, state.currentIdx, 'kill'); }
        } else { addLog(`${cur.name}放弃出闪，受到1点伤害`);
          dealDamage(state.pending.from, state.currentIdx, 'kill'); }
        if (state.pending.originalIdx !== undefined) state.currentIdx = state.pending.originalIdx;
        state.pending = null;
      } else if (state.pending.type === CARD_TYPES.SOUTH) {
        const i = cur.hand.findIndex(c => c.type === CARD_TYPES.KILL);
        if (i >= 0 && ch === 'kill') { cur.hand.splice(i, 1);
          addLog(`${cur.name}打出杀`);
          floatText(`player-${state.currentIdx}`, '杀', '#c84a4a');
          const fi = state.pending.from; if (fi !== undefined) animateCard(`player-${state.currentIdx}`, `player-${fi}`,
            '杀'); } else { if (!jiahaoProtect(state.currentIdx)) { let dmg = 1;
            const mult = maochenhaoDmgMultiplier(state.pending.from, CARD_TYPES.SOUTH);
            dmg *= mult; if (dmg > 1) addLog(`  伤害翻倍！`);
            cur.hp = Math.max(0, cur.hp - dmg);
            floatText(`player-${state.currentIdx}`, `-${dmg}`, '#ff4444'); if (cur.hp <= 0) eliminate(state
              .currentIdx);
            maochenhaoAfterDamage(state.currentIdx);
            fuchenhaoJudge(state.pending.from); } } handleAoe();
      } else if (state.pending.type === CARD_TYPES.ARROWS) {
        if (ch === 'dodge') { const i = cur.hand.findIndex(c => c.type === CARD_TYPES.DODGE); if (i >= 0) { cur.hand
              .splice(i, 1);
            addLog(`${cur.name}打出闪`);
            floatText(`player-${state.currentIdx}`, '闪', '#4a90c8');
            const fi = state.pending.from; if (fi !== undefined) animateCard(`player-${state.currentIdx}`, `player-${fi}`,
              '闪'); } else { if (!jiahaoProtect(state.currentIdx)) { let dmg = 1;
              const mult = maochenhaoDmgMultiplier(state.pending.from, CARD_TYPES.ARROWS);
              dmg *= mult; if (dmg > 1) addLog(`  伤害翻倍！`);
              cur.hp = Math.max(0, cur.hp - dmg);
              floatText(`player-${state.currentIdx}`, `-${dmg}`, '#ff4444'); if (cur.hp <= 0) eliminate(state
                .currentIdx);
              maochenhaoAfterDamage(state.currentIdx);
              fuchenhaoJudge(state.pending.from); } } } else if (ch === 'no') { if (!jiahaoProtect(state
              .currentIdx)) { let dmg = 1;
            const mult = maochenhaoDmgMultiplier(state.pending.from, CARD_TYPES.ARROWS);
            dmg *= mult; if (dmg > 1) addLog(`  伤害翻倍！`);
            cur.hp = Math.max(0, cur.hp - dmg);
            floatText(`player-${state.currentIdx}`, `-${dmg}`, '#ff4444'); if (cur.hp <= 0) eliminate(state
              .currentIdx);
            maochenhaoAfterDamage(state.currentIdx);
            fuchenhaoJudge(state.pending.from); } } handleAoe();
      }
      refreshUI();
      checkVictory();
      if (!state.gameOver && state.phase === 'play' && !isLocal(state.currentIdx) && !state.pending) {
        state.aoeJustResolved = true;
        scheduleAi();
      }
    }

function handleAoe() {
      if (state.pending && state.pending.targets && state.pending.targets.length > 1) {
        state.pending.targets.shift();
        if (state.pending.targets.length > 0) state.currentIdx = state.pending.targets[0];
        else { if (state.pending.originalIdx !== undefined) state.currentIdx = state.pending.originalIdx;
          state.pending = null; }
      } else { if (state.pending && state.pending.originalIdx !== undefined) state.currentIdx = state.pending
          .originalIdx;
        state.pending = null; }
    }

function advanceTurn() {
      if (state.gameOver) return;
      state.playersActedThisRound.add(state.currentIdx);
      const aliveIndices = state.players.map((p, i) => i).filter(i => state.players[i].hp > 0);
      const allActed = aliveIndices.every(i => state.playersActedThisRound.has(i));
      if (allActed) {
        state.subRoundCount++;
        const noOnePlayed = state.playersPlayedThisRound.size === 0;
        addLog(`━━━ 第${state.subRoundCount}轮/共5轮 ━━━`);
        if (noOnePlayed) {
          addLog(`${svgIcon('warning')} 一轮内无人出牌`);
          showNoPlayPrompt();
          return;
        }
        if (state.subRoundCount >= 5) {
          showNextRoundPrompt();
          return;
        }
        state.playersActedThisRound.clear();
        state.playersPlayedThisRound.clear();
      }
      let nextIdx = (state.currentIdx + 1) % state.players.length;
      let count = 0;
      while (count < state.players.length * 2) {
        if (state.players[nextIdx].hp > 0 && !state.playersActedThisRound.has(nextIdx)) {
          break;
        }
        nextIdx = (nextIdx + 1) % state.players.length;
        count++;
      }
      state.currentIdx = nextIdx;
      state.phase = 'draw';
      state.selectedCardIdx = null;
      const cur = getCur();
      if (cur.locked) {
        addLog(`【锁】 ${cur.name}被锁定，回合跳过`);
        floatText(`player-${state.currentIdx}`, '锁定', '#6a4a9a');
        cur.locked = false;
        state.phase = 'endTurn';
        refreshUI();
        setTimeout(() => advanceTurn(), 700);
        return;
      }
      state.firstTurnDone = true;
      state.phase = 'play';
      if (state.offlineMode) { showHandoff(state.currentIdx); } else if (!isLocal(state.currentIdx)) { state
          .aiTimerActive = true;
        scheduleAi(); }
      refreshUI();
    }

function endTurn() {
      if (state.gameOver) return;
      const cur = getCur();
      state.phase = 'endTurn';
      state.aiTimerActive = false;
      refreshUI();
      setTimeout(() => advanceTurn(), 700);
    }

function showNextRoundPrompt() {
      state.phase = 'nextRoundPrompt';
      state.selectedDiscardIndices.clear();
      const modal = document.getElementById('nextRoundModal');
      const infoEl = document.getElementById('nextRoundMsg');
      const discardArea = document.getElementById('discardArea');
      const nextRoundBtns = document.getElementById('nextRoundBtns');
      const btnRedo = document.getElementById('btnRedoRound');
      if (btnRedo) btnRedo.style.display = 'none';
      infoEl.textContent = `已进行${state.subRoundCount}轮，即将进入下一回合`;
      const hasLocalPlayer = state.localIndices.some(i => state.players[i] && state.players[i].hp > 0);
      if (!hasLocalPlayer) {
        discardArea.style.display = 'none';
        nextRoundBtns.style.display = 'flex';
        setTimeout(() => enterNextRound(), 1000);
        return;
      }
      const localPlayerIdx = state.localIndices.find(i => state.players[i] && state.players[i].hp > 0);
      const localPlayer = state.players[localPlayerIdx];
      const maxCards = localPlayer.hp + (localPlayer.equip.plus1 ? 1 : 0);
      const needDiscard = localPlayer.hand.length - maxCards;
      if (needDiscard > 0) {
        infoEl.textContent = '手牌超过血量上限，必须弃牌后才能进入下一回合';
        nextRoundBtns.style.display = 'none';
        discardArea.style.display = 'block';
        document.getElementById('discardCards').innerHTML = localPlayer.hand.map((card, idx) => {
          return `<div onclick="toggleDiscardCard(${idx})" id="dcard-${idx}" style="width:62px;height:88px;background:linear-gradient(145deg,#f6f0e2,#faf6ec);border:2px solid #d6cdb8;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px;font-size:0.72em;color:#ddd;transition:all 0.15s;user-select:none;"><div style="line-height:1.3;"><div style="color:#b3362b;font-size:1.1em;">${card.name}</div><div style="color:#8a6f3e;font-size:0.85em;margin-top:3px;">${card.suit||''}</div></div></div>`;
        }).join('');
        document.getElementById('discardHint').textContent =
          `手牌 ${localPlayer.hand.length} 张 > 血量上限 ${maxCards} 张，需丢弃 ${needDiscard} 张`;
        updateDiscardUI(needDiscard);
      } else {
        infoEl.textContent = `已进行${state.subRoundCount}轮，即将进入下一回合`;
        discardArea.style.display = 'none';
        nextRoundBtns.style.display = 'flex';
      }
      refreshUI();
      modal.style.display = 'flex';
    }

window.startTurn = function() {
      state.phase = 'draw';
      state.selectedCardIdx = null;
      const cur = getCur();
      if (!cur || cur.hp <= 0) {
        addLog(`${cur?cur.name:'已阵亡玩家'}已阵亡，跳过`);
        state.phase = 'endTurn';
        refreshUI();
        setTimeout(() => advanceTurn(), 500);
        return;
      }
      if (cur.locked) {
        addLog(`【锁】 ${cur.name}被锁定，回合跳过`);
        floatText(`player-${state.currentIdx}`, '锁定', '#6a4a9a');
        cur.locked = false;
        state.phase = 'endTurn';
        refreshUI();
        setTimeout(() => advanceTurn(), 700);
        return;
      }
      if (state.deck.length >= 2) {
        const drawn = drawCards(2);
        cur.hand.push(...drawn);
        addLog(`【摸牌】 ${cur.name}摸2张牌`);
      } else {
        addLog(`【摸牌】 牌堆不足，仅摸${state.deck.length}张`);
        cur.hand.push(...drawCards(state.deck.length));
      }
      state.firstTurnDone = true;
      state.phase = 'play';
      refreshUI();
      if (state.pending && isLocal(state.currentIdx)) {
        showResponsePanel();
      }
    };

window.confirmEnterNextRound = function() { enterNextRound(); };

function enterNextRound() {
      const modal = document.getElementById('nextRoundModal');
      if (modal) modal.style.display = 'none';
      state.roundNumber++;
      state.subRoundCount = 1;
      state.playersActedThisRound.clear();
      state.playersPlayedThisRound.clear();
      addLog(`━━━ 第${state.roundNumber}回合 ━━━`);
      state.players.forEach((p, i) => {
        if (p.hp <= 0) return;
        if (p.hand.length > 0) {
          const cards = p.hand.splice(0, p.hand.length);
          cards.forEach(c => state.discard.push(c));
          addLog(`【弃】 ${p.name}丢弃所有手牌（${cards.length}张）`);
        }
      });
      state.players.forEach((p, i) => {
        if (p.hp <= 0) return;
        let drawCount = p.hp;
        drawCount = qiyuyangDrawLimit(i, drawCount);
        p.hand.push(...drawCards(drawCount));
        addLog(`【摸】${p.name}摸${drawCount}张牌（血量${p.hp}）`);
      });
      state.phase = 'play';
      let firstAliveIdx = state.players.findIndex(p => p.hp > 0);
      state.currentIdx = firstAliveIdx;
      if (state.offlineMode) {
        showHandoff(state.currentIdx);
        refreshUI();
      } else if (isLocal(state.currentIdx)) {
        refreshUI();
      } else {
        state.aiTimerActive = true;
        scheduleAi();
        refreshUI();
      }
    }

function showNoPlayPrompt() {
      state.phase = 'nextRoundPrompt';
      state.selectedDiscardIndices.clear();
      const modal = document.getElementById('nextRoundModal');
      const infoEl = document.getElementById('nextRoundMsg');
      const discardArea = document.getElementById('discardArea');
      const nextRoundBtns = document.getElementById('nextRoundBtns');
      const btnRedo = document.getElementById('btnRedoRound');
      infoEl.textContent = '一轮内无人出牌，自动进入下一回合';
      discardArea.style.display = 'none';
      if (btnRedo) btnRedo.style.display = 'none';
      nextRoundBtns.style.display = 'flex';
      refreshUI();
      modal.style.display = 'flex';
    }

window.redoRound = function() {
      const modal = document.getElementById('nextRoundModal');
      if (modal) modal.style.display = 'none';
      state.selectedDiscardIndices.clear();
      state.playersActedThisRound.clear();
      state.playersPlayedThisRound.clear();
      state.phase = 'play';
      let firstAliveIdx = state.players.findIndex(p => p.hp > 0);
      state.currentIdx = firstAliveIdx;
      addLog(`━━━ 再来一轮 ━━━`);
      if (isLocal(state.currentIdx)) {
        refreshUI();
      } else {
        state.aiTimerActive = true;
        scheduleAi();
        refreshUI();
      }
    };
