/* ============================================================
 * card-effects.js — 单卡交互：试探、借刀杀人、炸弹转移判定
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function showProbeModal(fi, ti) {
      const t = state.players[ti];
      const content = `
          <h3>探试</h3>
          <p>${t.name}的手牌：</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0;">
            ${t.hand.map((c,i)=>`<div class="card" style="cursor:pointer;" onclick="probeSelectCard(${ti},${i})"><span>${c.suit}</span> ${c.name}</div>`).join('')}
          </div>
          <p style="font-size:0.85em;color:#6b6357;">选择1张牌进行交换（需丢弃2张手牌）</p>
          <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'">取消</button>
        `;
      document.getElementById('playerInfoContent').innerHTML = content;
      document.getElementById('playerInfoModal').style.display = 'flex';
    }

window.probeSelectCard = function(ti, cardIdx) {
      const fi = state.currentIdx;
      const f = state.players[fi];
      const t = state.players[ti];
      document.getElementById('playerInfoModal').style.display = 'none';
      window.probeTargetTi = ti;
      window.probeTargetCardIdx = cardIdx;
      const selectedCard = t.hand[cardIdx];
      showDiscardForProbe(fi, ti, selectedCard, cardIdx);
    };

function showDiscardForProbe(fi, ti, selectedCard, cardIdx) {
      const f = state.players[fi];
      if (f.hand.length < 2) {
        addLog(`${f.name}手牌不足，无法交换`);
        return;
      }
      let content = `
          <h3>探试 - 换取【${selectedCard.name}】</h3>
          <p>请选择2张手牌丢弃：</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0;" id="probeDiscardList">
            ${f.hand.map((c,i)=>`<div class="card" style="cursor:pointer;" onclick="probeToggleDiscard(${i})" id="probeCard-${i}"><span>${c.suit}</span> ${c.name}</div>`).join('')}
          </div>
          <p>已选择：<span id="probeSelectedCount">0</span>/2</p>
          <button class="btn" id="probeConfirmBtn" onclick="probeConfirmDiscard()" disabled>确认交换</button>
          <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'">取消</button>
        `;
      document.getElementById('playerInfoContent').innerHTML = content;
      document.getElementById('playerInfoModal').style.display = 'flex';
      window.probeDiscardIndices = [];
    }

;

window.probeToggleDiscard = function(cardIdx) {
      const idx = window.probeDiscardIndices.indexOf(cardIdx);
      if (idx >= 0) {
        window.probeDiscardIndices.splice(idx, 1);
        document.getElementById(`probeCard-${cardIdx}`).classList.remove('selected');
      } else {
        if (window.probeDiscardIndices.length < 2) {
          window.probeDiscardIndices.push(cardIdx);
          document.getElementById(`probeCard-${cardIdx}`).classList.add('selected');
        }
      }
      document.getElementById('probeSelectedCount').textContent = window.probeDiscardIndices.length;
      document.getElementById('probeConfirmBtn').disabled = window.probeDiscardIndices.length !== 2;
    };

function probeConfirmDiscard() {
      const fi = state.currentIdx;
      const ti = window.probeTargetTi;
      const f = state.players[fi];
      const t = state.players[ti];
      if (window.probeDiscardIndices.length !== 2) return;
      const discardCards = window.probeDiscardIndices.sort((a, b) => b - a).map(i => f.hand.splice(i, 1)[0]);
      discardCards.forEach(c => state.discard.push(c));
      addLog(`  ${f.name}丢弃了【${discardCards[0].name}】和【${discardCards[1].name}】`);
      const ti2 = window.probeTargetCardIdx;
      const gotCard = t.hand.splice(ti2, 1)[0];
      f.hand.push(gotCard);
      addLog(`  ${f.name}获得了${t.name}的【${gotCard.name}】`);
      document.getElementById('playerInfoModal').style.display = 'none';
      refreshUI();
    }

function showBorrowModal(fi, ti) {
      const t = state.players[ti];
      const hasKill = t.hand.some(c => c.type === CARD_TYPES.KILL);
      const equipSlots = ['plus1', 'minus1', 'weapon', 'armor'];
      const hasEquip = equipSlots.some(s => t.equip[s]);
      let content = `
          <h3>借刀杀人</h3>
          <p>${t.name}被要求出杀攻击指定目标，或丢弃1张装备牌</p>
        `;
      if (hasKill) {
        content += `<p>${t.name}有【杀】，可以选择出杀或弃装备牌</p>`;
      } else if (hasEquip) {
        content += `<p>${t.name}没有【杀】，必须丢弃1张装备牌</p>`;
      } else {
        content += `<p>${t.name}没有【杀】也没有装备牌，无需执行</p>`;
      }
      content += `<div style="margin-top:15px;">`;
      if (hasKill) content += `<button class="btn" onclick="borrowChooseKill(${ti})">出杀攻击</button> `;
      if (hasKill || hasEquip) content += `<button class="btn" onclick="borrowChooseDiscard(${ti})">丢弃装备牌</button> `;
      content += `<button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'">关闭</button></div>`;
      document.getElementById('playerInfoContent').innerHTML = content;
      document.getElementById('playerInfoModal').style.display = 'flex';
    }

window.borrowChooseKill = function(ti) {
      document.getElementById('playerInfoModal').style.display = 'none';
      showBorrowTargetPanel(ti);
    };

window.borrowChooseDiscard = function(ti) {
      const t = state.players[ti];
      document.getElementById('playerInfoModal').style.display = 'none';
      const equipSlots = ['plus1', 'minus1', 'weapon', 'armor'];
      for (const slot of equipSlots) {
        if (t.equip[slot]) {
          const discarded = t.equip[slot];
          state.discard.push(discarded);
          t.equip[slot] = null;
          addLog(`  ${t.name}丢弃了装备【${discarded.name}】`);
          floatText(`player-${ti}`, `-${discarded.name}`, '#b3362b');
          refreshUI();
          return;
        }
      }
      addLog(`  ${t.name}没有装备牌可丢弃`);
      refreshUI();
    };

function showBorrowTargetPanel(borrowerIdx) {
      const p = document.getElementById('targetPanel');
      const l = document.getElementById('targetList');
      const ts = state.players.map((_, i) => i).filter(i => i !== borrowerIdx && state.players[i].hp > 0 && !sameTeam(
        borrowerIdx, i));
      if (ts.length === 0) { addLog('没有合法目标'); return; }
      l.innerHTML = ts.map(i => {
        const pl = state.players[i];
        return `<div class="player-card" style="cursor:pointer;min-width:70px;" data-idx="${i}"><div class="player-avatar" style="background:${pl.general.color};">${gIcon(pl.general)}${avatarImg(pl.general)}</div><div>${pl.name}</div><div>${svgIcon('heart')}${pl.hp}/${pl.maxHp}</div></div>`;
      }).join('');
      l.querySelectorAll('.player-card').forEach(el => el.onclick = () => {
        const targetIdx = parseInt(el.dataset.idx);
        const borrower = state.players[borrowerIdx];
        const killIdx = borrower.hand.findIndex(c => c.type === CARD_TYPES.KILL);
        if (killIdx >= 0) {
          const killCard = borrower.hand.splice(killIdx, 1)[0];
          addLog(`  ${borrower.name}出杀攻击${state.players[targetIdx].name}`);
          useCard(killCard, borrowerIdx, targetIdx);
        }
        state.needTarget = null;
        p.style.display = 'none';
        state.selectedCardIdx = null;
        refreshUI();
      });
      document.getElementById('btnCancelTarget').onclick = () => { state.needTarget = null;
        p.style.display = 'none'; };
      p.style.display = 'block';
    }

function processTransfer(startIdx) {
      const targets = state.players.map((_, i) => i).filter(i => state.players[i].hp > 0);
      if (targets.length < 2) return;
      const startPos = targets.indexOf(startIdx);
      const orderedTargets = targets.slice(startPos + 1).concat(targets.slice(0, startPos + 1));
      state.pending = { type: 'transfer', targets: orderedTargets, currentIdx: 0, originalIdx: startIdx };
      state.currentIdx = orderedTargets[0];
      addLog(`  【炸】 炸弹传递给${state.players[orderedTargets[0]].name}！`);
      floatText(`player-${orderedTargets[0]}`, '炸弹', '#b3362b');
      doTransferJudge();
    }

function doTransferJudge() {
      if (!state.pending || state.pending.type !== 'transfer') return;
      const currentPlayer = state.players[state.currentIdx];
      if (currentPlayer.waterShield) {
        currentPlayer.waterShield = false;
        addLog(`【水】 ${currentPlayer.name}的【水】抵消了【炸弹】！`);
        floatText(`player-${state.currentIdx}`, '免疫', '#4a90c8');
        if (state.pending.originalIdx !== undefined) state.currentIdx = state.pending.originalIdx;
        state.pending = null;
        hideBombOverlay();
        refreshUI();
        checkVictory();
        if (!state.gameOver && state.phase === 'play' && !isLocal(state.currentIdx)) scheduleAi();
        return;
      }
      if (!isLocal(state.currentIdx)) {
        const goldenIdx = currentPlayer.hand.findIndex(c => c.type === CARD_TYPES.GOLDEN);
        if (goldenIdx >= 0) {
          currentPlayer.hand.splice(goldenIdx, 1);
          addLog(`【护】 ${currentPlayer.name}打出【金蝉护法】免疫【炸弹】！`);
          floatText(`player-${state.currentIdx}`, '', '#b3362b');
          showGoldenEffect(state.currentIdx);
          if (state.pending.originalIdx !== undefined) state.currentIdx = state.pending.originalIdx;
          state.pending = null;
          refreshUI();
          checkVictory();
          if (!state.gameOver && state.phase === 'play' && !isLocal(state.currentIdx)) scheduleAi();
          return;
        }
      }
      showBombOverlay(state.currentIdx, () => {
        let judgeSuit, isBlackSpade;
        if (state.transferForceHit) {
          judgeSuit = '♠';
          isBlackSpade = true;
        } else {
          judgeSuit = SUITS[Math.floor(Math.random() * 4)];
          isBlackSpade = judgeSuit === '♠';
        }
        addLog(`  ${currentPlayer.name}判定：${judgeSuit}`);
        showBombResult(judgeSuit, isBlackSpade);
        setTimeout(() => {
          if (isBlackSpade) {
            const bombImmune = xiaoxuebaImmuneBomb(state.currentIdx);
            if (!bombImmune) {
              showExplosionEffect(state.currentIdx);
              currentPlayer.hp = Math.max(0, currentPlayer.hp - 3);
              floatText(`player-${state.currentIdx}`, '-3伤害', '#ff4444');
              shakePlayerCard(state.currentIdx);
              addLog(`  【爆】 爆炸！${currentPlayer.name}受到3点伤害！`);
              if (currentPlayer.hp <= 0) eliminate(state.currentIdx);
              if (state.pending.originalIdx !== undefined) state.currentIdx = state.pending.originalIdx;
              state.pending = null;
              hideBombOverlay();
              refreshUI();
              checkVictory();
              if (!state.gameOver && state.phase === 'play' && !isLocal(state.currentIdx)) scheduleAi();
            } else {
              // 肖学霸免疫：炸弹当场熄灭，全屏广播
              hideBombOverlay();
              showBombExtinguishEffect(state.currentIdx);
              addLog(`  【炸】 炸弹在${currentPlayer.name}处熄灭，无人受伤`);
              if (state.pending.originalIdx !== undefined) state.currentIdx = state.pending.originalIdx;
              state.pending = null;
              refreshUI();
              checkVictory();
              if (!state.gameOver && state.phase === 'play' && !isLocal(state.currentIdx)) scheduleAi();
            }
          } else {
            state.pending.currentIdx++;
            if (state.pending.currentIdx >= state.pending.targets.length) {
              addLog(`  【炸】 炸弹在传递中熄灭，无人受伤`);
              if (state.pending.originalIdx !== undefined) state.currentIdx = state.pending.originalIdx;
              state.pending = null;
              hideBombOverlay();
              refreshUI();
              checkVictory();
              if (!state.gameOver && state.phase === 'play' && !isLocal(state.currentIdx)) scheduleAi();
            } else {
              state.currentIdx = state.pending.targets[state.pending.currentIdx];
              addLog(`  【炸】 炸弹传递给${state.players[state.currentIdx].name}！`);
              floatText(`player-${state.currentIdx}`, '炸弹', '#b3362b');
              hideBombOverlay();
              setTimeout(() => doTransferJudge(), 800);
            }
          }
        }, 1500);
      });
    }
