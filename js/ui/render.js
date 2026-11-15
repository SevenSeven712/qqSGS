/* ============================================================
 * render.js — 玩家区 / 手牌 / 按钮渲染
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function updateRoundDisplay() {
      const el = document.getElementById('roundNumberDisplay');
      if (el) el.textContent = `第${state.roundNumber}回合`;
      const subEl = document.getElementById('subRoundDisplay');
      if (subEl) {
        if (state.offlineMode) {
          const alive = state.players.filter(p => p.hp > 0).length;
          const acted = state.playersActedThisRound.size;
          subEl.textContent = `第${state.subRoundCount}轮/5轮 · 剩余${alive-acted}人未行动 · ${5-state.subRoundCount}轮后下一回合`;
        } else {
          subEl.textContent = `第${state.subRoundCount}轮`;
        }
      }
      const modal = document.getElementById('nextRoundModal');
      if (modal && state.phase !== 'nextRoundPrompt') {
        modal.style.display = 'none';
      }
    }

function renderPlayers() {
      const c = document.getElementById('playersContainer');
      if (!c) return;
      c.innerHTML = state.players.map((p, i) => {
        const d = p.hp <= 0;
        const a = i === state.currentIdx && !state.gameOver && !d ? 'active-turn' : '';
        const dc = d ? 'dead' : '';
        const tc = getTeamColor(i);
        const rc = RANK_COLORS[p.rank] || 'var(--gold)';
        let e = '';
        if (p.equip.weapon) e += `<span class="equip-tag" title="${p.equip.weapon.desc}">${svgIcon('sword')} ${p.equip.weapon.name}</span>`;
        if (p.equip.armor) e += `<span class="equip-tag" title="${p.equip.armor.desc}">盾 ${p.equip.armor.name}</span>`;
        if (p.equip.plus1) e += `<span class="equip-tag">+1 马</span>`;
        if (p.equip.minus1) e += `<span class="equip-tag">-1 马</span>`;
        const lockedStyle = p.locked ? 'border-color:#6a4a9a;box-shadow:0 0 15px rgba(106,74,154,0.28);' : '';
        const showHandCount = !state.offlineMode || i === state.currentIdx || p.hp <= 0;
        const av = (p.avatar && /^https?:\/\//.test(p.avatar)) ? p.avatar : '';
        const avatarContent = av
          ? '<img class="avatar-img" src="' + av.replace(/"/g, '%22') + '" alt="" onerror="this.remove()">'
          : String(p.name || 'U').charAt(0).toUpperCase();
        return `<div class="player-card ${a} ${dc}" id="player-${i}" onclick="showPlayerPopup(${i})" ${lockedStyle?'style="'+lockedStyle+'"':''}>
            <div class="turn-badge">行动中</div>
            <div class="player-avatar" style="background:${p.general?p.general.color:'#8a6f3e'};">${avatarContent}</div>
            <div class="player-rank">${p.rank}</div>
            <div class="player-name" style="color:${tc};">${d?p.name+' (阵亡)':p.name}</div>
            <div class="hp-bar">${Array.from({length:p.maxHp},(_,j)=>`<span class="hp-dot${j>=p.hp?' lost':''}"></span>`).join('')}</div>
            <div class="hand-count">${showHandCount?`牌 ${p.hand.length}张`:'?'}</div>
            ${e?`<div class="equip-area">${e}</div>`:''}
            ${p.locked?`<div class="buff-tag" style="color:#6a4a9a;">${svgIcon('lock')} 已锁定</div>`:''}
            ${p.goldenShield?`<div class="buff-tag" style="color:#b3362b;">金蝉护法</div>`:''}
            ${p.waterShield?`<div class="buff-tag" style="color:#4a90c8;">水护盾</div>`:''}
          </div>`;
      }).join('');
    }

window.showPlayerPopup = function(idx) {
      const p = state.players[idx];
      if (!p) return;
      const rc = RANK_COLORS[p.rank] || '#fff';
      const total = p.wins + p.losses;
      const winRate = total > 0 ? Math.round(p.wins / total * 100) + '%' : '-';
      document.getElementById('playerInfoContent').innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;text-align:center;">
            <div style="position:relative;">
              <div style="position:relative;overflow:hidden;width:80px;height:80px;border-radius:50%;background:${p.general.color};display:flex;align-items:center;justify-content:center;font-size:3em;border:3px solid ${rc};box-shadow:0 0 20px ${rc};">
                ${gIcon(p.general)}${avatarImg(p.general)}
              </div>
              <div style="position:absolute;top:-5px;right:-5px;background:${rc};color:#faf6ec;padding:2px 8px;border-radius:12px;font-size:0.75em;font-weight:bold;">
                ${p.rank}
              </div>
            </div>
            <div style="display:flex;align-items:baseline;gap:6px;margin:12px 0 4px 0;">
              <h3 style="color:var(--text);margin:0;font-size:1.3em;">${p.name}</h3>
              <span class="icn-stat-sm icn-rank" style="opacity:0.9;"></span>
              <span style="color:${rc};font-size:0.75em;font-weight:bold;opacity:0.9;">${p.rank}</span>
            </div>
            <div style="display:flex;gap:15px;margin-bottom:15px;">
              <div class="stat-item" style="flex-direction:column;">
                <span style="font-size:1.8em;">${svgIcon('heart')}</span>
                <span style="color:#6b6357;font-size:0.9em;">${p.hp}/${p.maxHp}</span>
              </div>
              <div class="stat-item" style="flex-direction:column;">
                <span style="font-size:1.8em;">牌</span>
                <span style="color:#6b6357;font-size:0.9em;">${p.hand.length}张</span>
              </div>
            </div>
            <div style="background:#faf6ec;padding:15px;border-radius:12px;width:100%;margin-bottom:15px;">
              <h4 style="color:var(--gold);margin-bottom:8px;">【${p.general.name}】</h4>
              <p><b>技能：</b><span style="color:#5a7d52;">${p.general.skill}</span></p>
              <p style="color:#6b6357;font-size:0.9em;margin-top:4px;">${p.general.desc}</p>
            </div>
            <div style="width:100%;">
              <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f6f0e2;">
                <span class="icn-stat icn-win"></span>
                <span style="color:#6b6357;font-size:0.85em;">胜利</span>
                <span style="margin-left:auto;font-weight:bold;color:#5a7d52;">${p.wins}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f6f0e2;">
                <span class="icn-stat icn-lose"></span>
                <span style="color:#6b6357;font-size:0.85em;">失败</span>
                <span style="margin-left:auto;font-weight:bold;color:#b3362b;">${p.losses}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f6f0e2;">
                <span class="icn-stat icn-rate"></span>
                <span style="color:#6b6357;font-size:0.85em;">胜率</span>
                <span style="margin-left:auto;font-weight:bold;color:var(--gold);">${winRate}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;padding:6px 0;">
                <span class="icn-stat icn-rank"></span>
                <span style="color:#6b6357;font-size:0.85em;">段位</span>
                <span style="margin-left:auto;font-weight:bold;color:${rc};">${p.rank}</span>
              </div>
            </div>
            ${!isLocal(idx)?`<div style="display:flex;gap:8px;margin-top:10px;"><button class="btn" style="flex:1;" onclick="sendFriendRequest(${idx});document.getElementById('playerInfoModal').style.display='none';"><span class="icn"></span>加好友</button><button class="btn btn-close-icon" style="flex:1;" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>关闭</button></div>`:`<button class="btn btn-close-icon" style="width:100%;margin-top:10px;" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>关闭</button>`}
          </div>
        `;
      document.getElementById('playerInfoModal').style.display = 'flex';
    }

function renderEquipArea() {
      const a = document.getElementById('myEquipArea');
      if (!a) return;
      const cur = getCur();
      if (!cur || !isLocal(state.currentIdx) || state.gameOver) { a.innerHTML = ''; return; }
      let h = '<span style="color:#6b6357;font-size:0.75em;">装备区：</span>';
      ['weapon', 'armor', 'plus1', 'minus1'].forEach(s => {
        if (cur.equip[s]) {
          h +=
            `<span class="equip-tag" style="cursor:pointer;" data-slot="${s}" title="点击卸下">${cur.equip[s].name}</span>`;
        } else {
          h +=
            `<span style="color:#d6cdb8;font-size:0.65em;">[${s==='weapon'?'武器':s==='armor'?'防具':s==='plus1'?'+1马':'-1马'}]</span>`;
        }
      });
      a.innerHTML = h;
      a.querySelectorAll('.equip-tag[data-slot]').forEach(el => {
        el.addEventListener('click', () => {
          const s = el.dataset.slot;
          if (cur.equip[s]) {
            const eq = cur.equip[s];
            cur.equip[s] = null;
            cur.hand.push(eq);
            addLog(`卸下了【${eq.name}】`);
            refreshUI();
          }
        });
      });
    }

function renderMyHand() {
      const a = document.getElementById('myHandArea');
      if (!a) return;
      const cur = getCur();
      if (!cur || !isLocal(state.currentIdx) || state.gameOver || state.phase !== 'play') {
        a.innerHTML = '<div style="color:#888;padding:15px;">等待你的回合...</div>';
        return;
      }
      if (cur.hp <= 0) { a.innerHTML = '<div style="color:#888;">你已阵亡</div>'; return; }
      if (cur.hand.length === 0) { a.innerHTML = '<div style="color:#888;padding:15px;">手牌为空</div>'; return; }
      a.innerHTML = cur.hand.map((c, i) => {
        let cl = 'card';
        if (c.cat === 'equip') cl += ' equip-card';
        if (SUIT_COLOR[c.suit] === 'red') cl += ' red-suit';
        else cl += ' black-suit';
        if (i === state.selectedCardIdx) cl += ' selected';
        return `<div class="${cl}" data-idx="${i}" title="${c.desc||''}"><span>${suitIcon(c.suit)}</span> ${c.name}</div>`;
      }).join('');
      a.querySelectorAll('.card').forEach(el => {
        el.addEventListener('click', () => {
          const i = parseInt(el.dataset.idx);
          if (state.phase === 'play' && isLocal(state.currentIdx) && !state.gameOver && cur.hp > 0) {
            state.selectedCardIdx = state.selectedCardIdx === i ? null : i;
            renderMyHand();
          }
        });
      });
    }

function updateButtons() {
      const ip = state.phase === 'play' && !state.gameOver;
      const cur = getCur();
      const lt = cur && isLocal(state.currentIdx) && ip;
      document.getElementById('btnUsePeach').disabled = !(lt && cur && cur.hand.some(c => c.type === CARD_TYPES.PEACH) && cur
        .hp < cur.maxHp);
      const endBtn = document.getElementById('btnEndPhase');
      const startBtn = document.getElementById('btnStartTurn');
      if (startBtn) startBtn.style.display = 'none';
      if (endBtn) endBtn.style.display = state.phase === 'play' ? 'inline-flex' : '';
    }
