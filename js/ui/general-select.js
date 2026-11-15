/* ============================================================
 * general-select.js — 选将界面与武将详情
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function startGeneralSelect(isOffline) {
      state.takenGenerals = [];
      const grid = document.getElementById('generalGrid');
      grid.innerHTML = GENERALS.map(g =>
          `<div class="general-card" data-id="${g.id}"><div class="detail-btn" data-id="${g.id}">?</div><div class="general-img" style="background-image:url('${g.img}')"></div><div class="general-name">${g.name}</div><div class="general-skill">【${g.skill}】${g.desc}</div></div>`
        )
        .join('');
      const confirmBtn = document.getElementById('btnConfirmGeneral');
      confirmBtn.disabled = true;
      confirmBtn.textContent = '请选择武将';
      let selectedCount = 0;
      const totalPlayers = state.players.length;
      grid.querySelectorAll('.general-card').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.classList.contains('detail-btn')) { showDetail(el.dataset.id); return; }
          if (el.classList.contains('taken') || state.takenGenerals.includes(el.dataset.id)) { return; }
          grid.querySelectorAll('.general-card').forEach(c => c.classList.remove('selected'));
          el.classList.add('selected');
          confirmBtn.disabled = false;
        });
      });
      grid.querySelectorAll('.detail-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation();
        showDetail(b.dataset.id); }));
      for (let i = 1; i < state.players.length; i++) {
        const delay = 200 + Math.random() * 4800;
        setTimeout(() => {
          if (state.gameOver || state.players[i].general) return;
          const rem = GENERALS.filter(g => !state.takenGenerals.includes(g.id));
          if (rem.length === 0) return;
          const aiGen = rem.splice(Math.floor(Math.random() * rem.length), 1)[0];
          if (!aiGen) return;
          state.players[i].general = aiGen;
          state.players[i].maxHp = aiGen.hp;
          state.players[i].hp = aiGen.hp;
          state.takenGenerals.push(aiGen.id);
          const card = grid.querySelector(`.general-card[data-id="${aiGen.id}"]`);
          if (card) { card.classList.add('taken');
            card.style.opacity = '0.5'; }
          addLog(`${state.players[i].name}选择了【${aiGen.name}】`);
          selectedCount++;
          checkAllSelected();
        }, delay);
      }
      confirmBtn.onclick = () => {
        const sel = grid.querySelector('.general-card.selected');
        if (!sel) { showToast('提示', '请先选择一位武将！', 'info'); return; }
        if (state.takenGenerals.includes(sel.dataset.id)) { showToast('提示', '此武将已被其他玩家选择！', 'info');
          sel.classList.remove('selected'); return; }
        const gen = GENERALS.find(g => g.id === sel.dataset.id);
        state.players[0].general = gen;
        state.players[0].maxHp = gen.hp;
        state.players[0].hp = gen.hp;
        state.takenGenerals.push(gen.id);
        sel.classList.add('taken');
        sel.style.opacity = '0.5';
        confirmBtn.disabled = true;
        confirmBtn.textContent = '已选择，无法更改';
        addLog(`【确】 你选择了【${gen.name}】`);
        const waitMsg = document.createElement('div');
        waitMsg.id = 'waitSelectMsg';
        waitMsg.style.cssText = 'color:#8a6f3e;text-align:center;margin-top:8px;font-size:0.85em;animation:blink 1.5s infinite;';
        waitMsg.textContent = '请等待对方选择...';
        confirmBtn.parentNode.appendChild(waitMsg);
        selectedCount++;
        for (let i = 1; i < state.players.length; i++) {
          if (state.players[i].general) continue;
          const rem = GENERALS.filter(g => !state.takenGenerals.includes(g.id));
          if (rem.length === 0) break;
          const aiGen = rem[Math.floor(Math.random() * rem.length)];
          state.players[i].general = aiGen;
          state.players[i].maxHp = aiGen.hp;
          state.players[i].hp = aiGen.hp;
          state.takenGenerals.push(aiGen.id);
          const card = grid.querySelector(`.general-card[data-id="${aiGen.id}"]`);
          if (card) { card.classList.add('taken');
            card.style.opacity = '0.5'; }
          addLog(`${state.players[i].name}选择了【${aiGen.name}】`);
          selectedCount++;
        }
        checkAllSelected();
      };

      function checkAllSelected() {
        const wm = document.getElementById('waitSelectMsg');
        if (wm) wm.remove();
        if (selectedCount >= totalPlayers) startGameAfterSelect();
      }
      switchView('generalSelectView');
    }

function startGameAfterSelect() {
      state.deck = shuffle(createDeck());
      state.discard = [];
      state.players.forEach(p => { p.hand = drawCards(4); });
      state.currentIdx = state.players.length - 1;
      state.gameOver = false;
      state.pending = null;
      state.needTarget = null;
      state.firstTurnDone = true;
      state.roundNumber = 1;
      state.subRoundCount = 1;
      state.playersActedThisRound.clear();
      state.playersPlayedThisRound.clear();
      addLog('全部选将完成，游戏开始！');
      switchView('gameView');
      advanceTurn();
    }

function showDetail(gid) {
      const g = GENERALS.find(g => g.id === gid);
      if (!g) return;
      const factionLabel = { 'classic': '经典', 'student': '学生', 'other': '其他' };
      const skillsHtml = (g.skills && g.skills.length > 0) ? g.skills.map(s =>
        `<div style="background:#faf6ec;border:1px solid #d6cdb8;border-radius:8px;padding:10px;margin-bottom:8px;text-align:left;"><div style="color:#b3362b;font-weight:bold;font-size:0.95em;">${s.type==='active'?svgIcon('bolt'):svgIcon('shield')} ${s.name}</div><div style="color:#6b6357;font-size:0.85em;margin-top:4px;">${s.desc}</div></div>`
      ).join('') :
        `<div style="color:#7a6550;font-size:0.9em;">暂无详细技能描述</div>`;
      document.getElementById('detailContent').innerHTML =
        `<div style="text-align:center;"><div style="position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;width:90px;height:90px;border-radius:50%;margin:0 auto 10px;background:${g.color};border:3px solid var(--gold);font-size:2.4em;">${gIcon(g)}${avatarImg(g)}</div><h3 style="color:#b3362b;margin:6px 0;">${g.name}</h3><div style="display:flex;justify-content:center;gap:15px;margin:8px 0;font-size:0.9em;"><span>${svgIcon('heart')} ${g.hp} 体力</span><span style="color:${g.faction==='student'?'#4a90c8':'#8a6f3e'};">${svgIcon('flag')} ${factionLabel[g.faction]||'其他'}</span></div><div style="background:#faf6ec;border-radius:8px;padding:12px;margin:12px 0;"><div style="color:#8a6f3e;font-weight:bold;font-size:1em;margin-bottom:6px;">技能 - ${g.skill}</div><div style="color:#6b6357;font-size:0.9em;">${g.desc}</div></div>${skillsHtml}<button class="btn" onclick="document.getElementById('detailModal').style.display='none'" style="margin-top:8px;"><span class="icn"></span>关闭</button></div>`;
      document.getElementById('detailModal').style.display = 'flex';
    }

function showPlayerInfo(playerIdx) {
      const p = state.players[playerIdx];
      if (!p) return;
      const total = p.wins + p.losses;
      const winRate = total > 0 ? Math.round(p.wins / total * 100) + '%' : '-';
      const rankColor = RANK_COLORS[p.rank] || '#fff';
      let moreBtn = '';
      if (!isLocal(playerIdx)) {
        moreBtn = `
            <button class="btn" style="margin:4px;" onclick="showPlayerMoreInfo(${playerIdx})"><span class="icn"></span>更多</button>
            <button class="btn" style="margin:4px;" onclick="sendFriendRequest(${playerIdx})"><span class="icn"></span>加好友</button>
          `;
      }
      let content = `
          <h3 style="color:${rankColor};">${p.rank} ${p.name}</h3>
          <div style="margin:10px 0;">
            ${p.general?`
              <div style="background:#faf6ec;padding:10px;border-radius:12px;margin-bottom:10px;">
                <div style="position:relative;overflow:hidden;width:60px;height:60px;border-radius:50%;background:${p.general.color};display:flex;align-items:center;justify-content:center;font-size:2em;margin:0 auto 5px;">${gIcon(p.general)}${avatarImg(p.general)}</div>
                <h4>${p.general.name}</h4>
                <p><b>技能：</b>${p.general.skill}</p>
                <p>${p.general.desc}</p>
              </div>
            `:'<p>暂未选择武将</p>'}
          </div>
          ${moreBtn}
          <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'">关闭</button>
        `;
      document.getElementById('playerInfoContent').innerHTML = content;
      document.getElementById('playerInfoModal').style.display = 'flex';
    }

function showPlayerMoreInfo(playerIdx) {
      const p = state.players[playerIdx];
      if (!p) return;
      const total = p.wins + p.losses;
      const winRate = total > 0 ? Math.round(p.wins / total * 100) + '%' : '-';
      const rankColor = RANK_COLORS[p.rank] || '#fff';
      let content = `
          <h3 style="color:${rankColor};">${p.rank} ${p.name}</h3>
          <div style="margin:10px 0;">
            <div class="stat-item"><span>胜 · 胜利</span><span class="stat-value">${p.wins}</span></div>
            <div class="stat-item"><span>败 · 失败</span><span class="stat-value">${p.losses}</span></div>
            <div class="stat-item"><span>战 · 胜率</span><span class="stat-value">${winRate}</span></div>
            <div class="stat-item"><span>级 · 段位</span><span style="color:${rankColor};">${p.rank}</span></div>
          </div>
          <button class="btn" onclick="showPlayerInfo(${playerIdx})"><span class="icn"></span>返回</button>
          <button class="btn" onclick="sendFriendRequest(${playerIdx})"><span class="icn"></span>加好友</button>
          <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>关闭</button>
        `;
      document.getElementById('playerInfoContent').innerHTML = content;
    }

function startNetGeneralSelect() {
  state.selectedCardIdx = null;
  const grid = document.getElementById('generalGrid');
  if (!grid) return;
  
  const confirmBtn = document.getElementById('btnConfirmGeneral');
  if (confirmBtn) {
    confirmBtn.style.display = 'inline-flex';
    confirmBtn.disabled = true;
    confirmBtn.textContent = '请选择武将';
    confirmBtn.onclick = () => {
      const sel = grid.querySelector('.general-card.selected');
      if (!sel) return;
      const generalId = sel.dataset.id;
      
      confirmBtn.disabled = true;
      confirmBtn.textContent = '已确认，等待中...';
      
      if (netIsHost()) {
        if (typeof netHostHandleSelectGeneral === 'function') netHostHandleSelectGeneral(0, generalId);
        window.updateNetGrid();
      } else {
        if (typeof netGuestSendIntent === 'function') netGuestSendIntent(NET_INTENT.SELECT_GENERAL, { generalId: generalId });
        const mySeat = netRoom.seat;
        const gen = GENERALS.find(g => g.id === generalId);
        if (state.players[mySeat]) {
          state.players[mySeat].general = gen;
        }
        window.updateNetGrid();
      }
    };
  }

  window.updateNetGrid = function () {
    const isHost = netIsHost();
    const mySeat = isHost ? 0 : netRoom.seat;
    const me = state.players[mySeat];
    
    // 如果我已经选了武将，直接显示等待
    if (me && me.general) {
      grid.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:1.2em;">你已选择【' + me.general.name + '】，等待其他玩家...</div>';
      if (confirmBtn) confirmBtn.style.display = 'none';
      return;
    }

    // 如果第一次渲染
    if (!grid.querySelector('.general-card')) {
      grid.innerHTML = GENERALS.map(g => {
        const isTaken = state.takenGenerals.includes(g.id);
        return `<div class="general-card ${isTaken ? 'taken' : ''}" data-id="${g.id}">
          <div class="detail-btn" data-id="${g.id}">?</div>
          <div class="general-img" style="background-image:url('${g.img}')"></div>
          <div class="general-name">${g.name}</div>
          <div class="general-skill">【${g.skill}】${g.desc}</div>
        </div>`;
      }).join('');
      
      grid.querySelectorAll('.general-card').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.classList.contains('detail-btn')) { showDetail(el.dataset.id); return; }
          if (el.classList.contains('taken')) return;
          grid.querySelectorAll('.general-card').forEach(c => c.classList.remove('selected'));
          el.classList.add('selected');
          if (confirmBtn) confirmBtn.disabled = false;
        });
      });
      grid.querySelectorAll('.detail-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); showDetail(b.dataset.id); }));
    } else {
      // 局部更新 taken 状态
      grid.querySelectorAll('.general-card').forEach(el => {
        const gid = el.dataset.id;
        if (state.takenGenerals.includes(gid)) {
          el.classList.add('taken');
          if (el.classList.contains('selected')) {
            el.classList.remove('selected');
            if (confirmBtn) confirmBtn.disabled = true;
          }
        }
      });
    }
  };

  window.updateNetGrid();
}
