/* ============================================================
 * offline.js — 离线模式：选将、交接屏、弃牌
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function renderOfflineNameInputs(count) {
      const container = document.getElementById('playerNameList');
      container.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
        div.innerHTML =
          `<span style="color:var(--gold);min-width:30px;font-weight:bold;">P${i+1}</span>
            <input id="oname-${i}" type="text" maxlength="8" value="玩家${i+1}" style="flex:1;background:#fffdf7;border:1px solid #d6cdb8;border-radius:6px;padding:8px 10px;color:#2a2520;font-size:0.95em;text-align:center;">
            <span style="color:#7a6550;font-size:0.8em;">武</span>`;
        container.appendChild(div);
      }
    }

function showHandoff(nextIdx) {
      state.phase = 'handoff';
      const p = state.players[nextIdx];
      if (!p) return;
      const overlay = document.getElementById('handoffOverlay');
      const nameEl = document.getElementById('handoffPlayerName');
      nameEl.textContent = p.name;
      overlay.style.display = 'flex';
    }

window.confirmHandoff = function() {
      const overlay = document.getElementById('handoffOverlay');
      overlay.style.display = 'none';
      startTurn();
    };

function startOfflinePick(playerIdx) {
      const p = state.players[playerIdx];
      state.offlinePickIdx = playerIdx;
      const grid = document.getElementById('generalGrid');
      if (grid) {
        grid.innerHTML = GENERALS.filter(g => !state.takenGenerals.includes(g.id)).map(g =>
          `<div class="general-card" data-id="${g.id}" onclick="selectOfflineGeneral('${g.id}',${playerIdx})">
              <div class="general-img" style="background-image:url('${g.img}')"></div>
              <div class="general-name">${g.name}</div>
              <div class="general-skill" style="font-size:0.8em;">【${g.skill}】</div>
            </div>`
        ).join('');
      }
      document.getElementById('btnConfirmGeneral').style.display = 'none';
      switchView('generalSelectView');
    }

window.selectOfflineGeneral = function(gid, playerIdx) {
      if (state.takenGenerals.includes(gid)) return;
      const g = GENERALS.find(gg => gg.id === gid);
      if (!g) return;
      state.takenGenerals.push(gid);
      const p = state.players[playerIdx];
      p.general = g;
      p.hp = g.hp;
      p.maxHp = g.hp;
      p.rank = getPlayerRank();
      const nextPick = playerIdx + 1;
      if (nextPick < state.players.length && state.players[nextPick].hp > 0) {
        switchView('gameView');
        showOfflinePickHandoff(nextPick);
      } else {
        addLog(`${svgIcon('refresh')} === 线下模式开始 ===`);
        state.offlineMode = true;
        state.localIndices = state.players.map((_, i) => i);
        state.currentIdx = 0;
        state.phase = 'draw';
        state.roundNumber = 1;
        state.subRoundCount = 1;
        state.playersActedThisRound.clear();
        state.playersPlayedThisRound.clear();
        state.players.forEach(p => {
          for (let i = 0; i < 4; i++) p.hand.push(state.deck.pop());
        });
        state.selectedCardIdx = null;
        switchView('gameView');
        showHandoff(0);
      }
    };

function showOfflinePickHandoff(nextPick) {
      const p = state.players[nextPick];
      const overlay = document.getElementById('handoffOverlay');
      document.getElementById('handoffPlayerName').textContent = p.name;
      document.getElementById('btnConfirmHandoff').textContent = '我已选好，下一位选将';
      overlay.style.display = 'flex';
      document.getElementById('btnConfirmHandoff').onclick = function() {
        overlay.style.display = 'none';
        document.getElementById('btnConfirmHandoff').textContent = '我已准备好，开始出牌';
        document.getElementById('btnConfirmHandoff').onclick = window.confirmHandoff;
        startOfflinePick(nextPick);
      };
    }

window.toggleDiscardCard = function(idx) {
      const el = document.getElementById(`dcard-${idx}`);
      if (!el) return;
      if (state.selectedDiscardIndices.has(idx)) {
        state.selectedDiscardIndices.delete(idx);
        el.style.borderColor = '#d6cdb8';
        el.style.transform = 'scale(1)';
        el.style.boxShadow = 'none';
      } else {
        state.selectedDiscardIndices.add(idx);
        el.style.borderColor = '#b3362b';
        el.style.transform = 'scale(1.08)';
        el.style.boxShadow = '0 0 10px rgba(255,102,68,0.6)';
      }
      const pIdx = state.localIndices.find(i => state.players[i] && state.players[i].hp > 0);
      if (pIdx === undefined) return;
      const p = state.players[pIdx];
      updateDiscardUI(p.hand.length - (p.hp + (p.equip.plus1 ? 1 : 0)));
    };

function updateDiscardUI(needDiscard) {
      const countEl = document.getElementById('discardCount');
      const btn = document.getElementById('btnConfirmDiscard');
      if (!countEl) return;
      const selected = state.selectedDiscardIndices.size;
      countEl.textContent = selected < needDiscard ? `已选 ${selected}/${needDiscard} 张（还需丢弃 ${needDiscard-selected} 张）` :
        `已选 ${selected} 张（可以丢弃）`;
      countEl.style.color = selected < needDiscard ? '#ff6666' : '#66cc66';
      if (btn) btn.disabled = selected < needDiscard;
    }

window.confirmDiscard = function() {
      const pIdx = state.localIndices.find(i => state.players[i] && state.players[i].hp > 0);
      if (pIdx === undefined) return;
      const p = state.players[pIdx];
      const need = p.hand.length - (p.hp + (p.equip.plus1 ? 1 : 0));
      if (state.selectedDiscardIndices.size < need) return;
      const names = [];
      [...state.selectedDiscardIndices].sort((a, b) => b - a).forEach(idx => {
        if (p.hand[idx]) {
          const card = p.hand[idx];
          p.hand.splice(idx, 1);
          state.discard.push(card);
          names.push(card.name);
        }
      });
      if (names.length > 0) addLog(`【弃】 ${p.name}弃置了${names.length}张牌：${names.join('、')}`);
      state.selectedDiscardIndices.clear();
      enterNextRound();
    };
