/* ============================================================
 * bindings.js — DOM 事件绑定
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

document.getElementById('btnStartGame').onclick = () => switchView('modeSelect');

document.getElementById('btnHeroPage').onclick = () => { switchView('heroInfoView');
      renderHeroInfo(); };

document.getElementById('btnCardsInfo').onclick = () => { switchView('cardsInfoView');
      renderCardsInfo(); };

document.getElementById('btnBackHero').onclick = () => switchView('mainMenu');

document.getElementById('btnProfile').onclick = async () => {
      if (typeof netRequireLogin === 'function') {
        const ok = await netRequireLogin(function () { document.getElementById('btnProfile').click(); });
        if (!ok) return;
      }
      switchView('profileView');
      updateProfileRankDisplay();
      if (typeof renderProfileHeader === 'function') renderProfileHeader();
    };

document.getElementById('btnBackMenu2').onclick = () => switchView('mainMenu');
document.getElementById('btnBackOffline').onclick = () => switchView('mainMenu');
document.getElementById('btnBackCards').onclick = () => switchView('mainMenu');

document.querySelectorAll('#cardTabsMain .tab-btn').forEach(el => {
      el.onclick = () => renderCardsInfo(el.dataset.tab, 'weapon');
    });

document.querySelectorAll('#cardTabsSub .tab-btn').forEach(el => {
      el.onclick = () => renderCardsInfo('equip', el.dataset.sub);
    });

document.getElementById('btnBackActivity').onclick = () => switchView('mainMenu');
document.getElementById('btnLogout').onclick = () => { if (typeof netDoLogout === 'function') netDoLogout(); };
document.getElementById('btnBackProfile').onclick = () => switchView('mainMenu');
document.getElementById('btnBackStats').onclick = () => switchView('profileView');
document.getElementById('btnBackHistory').onclick = () => switchView('profileView');
document.getElementById('btnBackMastery').onclick = () => switchView('profileView');

document.getElementById('btnFriends').onclick = async () => {
      if (typeof netRequireLogin === 'function') {
        const ok = await netRequireLogin(function () { document.getElementById('btnFriends').click(); });
        if (!ok) return;
      }
      loadFriends();
      switchView('friendsView'); };

document.getElementById('btnCreateRoom').onclick = () => {
      if (typeof netOpenCreate === 'function') netOpenCreate();
      else createRoom();
    };

document.getElementById('btnJoinRoom').onclick = () => {
      if (typeof netOpenJoin === 'function') netOpenJoin();
      else showToast('提示', '联机模块未加载', 'error');
    };
document.getElementById('btnBackFriends').onclick = () => switchView('mainMenu');
document.getElementById('btnLeaveRoom').onclick = () => switchView('friendsView');
document.getElementById('btnInviteFriend').onclick = () => showInviteModal();
const btnSearchFriend = document.getElementById('btnSearchFriend');
const friendSearchInput = document.getElementById('friendSearchInput');

if (btnSearchFriend) btnSearchFriend.onclick = () => { const v = friendSearchInput ? friendSearchInput.value : '';
        if (!v || !v.trim()) { showToast('提示', '请输入玩家昵称', 'info'); return; } const target = searchFriendByName(v
          .trim());
        const fs = getFriends(); if (fs.find(f => f.name === target.name)) { showToast('提示', target.name + ' 已经是你的好友',
            'info'); return; } const reqs = getFriendRequests(); if (reqs.find(r => r.name === target.name)) { showToast(
            '提示', '已向 ' + target.name + ' 发送过好友申请', 'info'); return; } showToast('好友申请', '已向 ' + target.name + ' 发出好友申请',
            'info');
        setTimeout(() => { if (Math.random() < 0.6) { const cur = getFriends();
            cur.push({ name: target.name, online: true, wins: target.wins, losses: target.losses, rank: target
                .rank });
            saveFriends(cur);
            showToast('好友申请', target.name + ' 同意了你的好友申请！', 'success');
            loadFriends(); } else { showToast('好友申请', target.name + ' 拒绝了你的好友申请', 'error'); } }, 2000 + Math
            .random() * 2000); };

if (friendSearchInput) friendSearchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' &&
        btnSearchFriend) btnSearchFriend.click(); });

document.getElementById('btnStartRoom').onclick = () => {
      const need = { duel: 2, team: 4, chaos: 4 } [state.mode] || 2;
      if (!state.roomState) state.roomState = { members: [], invited: [] };
      const roomMembers = [{ name: localStorage.getItem('qQiNick') || '玩家', isLocal: true, rank: getPlayerRank(),
        wins: getStats().wins, losses: getStats().losses
      }].concat(state.roomState.members.map(m => ({ name: m.name, rank: m.rank, wins: Math.floor(Math.random() *
          40), losses: Math.floor(Math.random() * 30) })));
      let i = 0;
      while (roomMembers.length < need) {
        const f = getFriends().filter(fr => fr.online && !roomMembers.find(rm => rm.name === fr.name))[i % Math.max(1,
          getFriends().filter(fr => fr.online).length
        )];
        if (f) { roomMembers.push({ name: f.name, rank: f.rank, wins: f.wins, losses: f.losses }); } else { roomMembers
            .push({ name: getRandomName(), rank: getOpponentRank(getPlayerRank()), wins: Math.floor(Math.random() *
                40), losses: Math.floor(Math.random() * 30) }); }
        i++;
      }
      state.players = roomMembers.slice(0, need).map((p, idx) => ({ id: idx, name: p.name, general: null, hp: 0,
        maxHp: 0, hand: [], equip: {}, rank: p.rank, wins: p.wins, losses: p.losses }));
      state.localIndices = [0];
      state.teams = [];
      if (state.mode === 'team') for (let j = 0; j < state.players.length; j++) state.teams[j] = (j % 2 === 0) ? 0 :
        1;
      state.offlineMode = false;
      startGeneralSelect(false);
    };

document.querySelectorAll('.room-mode-btn').forEach(b => b.onclick = e => { document.querySelectorAll(
        '.room-mode-btn').forEach(btn => btn.classList.remove('selected'));
      e.target.classList.add('selected');
      state.mode = e.target.dataset.mode; });

// 昵称由社区账号同步，不再本地保存（旧输入框已移除）

document.getElementById('btnViewStats').onclick = () => showStats();
document.getElementById('btnViewHistory').onclick = () => showHistory();
document.getElementById('btnViewMastery').onclick = () => showMastery();

document.getElementById('btnExitGame').onclick = () => { resetGame();
      switchView('mainMenu'); };

document.querySelectorAll('.mode-btn').forEach(b => b.onclick = e => { document.querySelectorAll('.mode-btn')
        .forEach(btn => btn.classList.remove('selected'));
      e.target.classList.add('selected');
      state.mode = e.target.dataset.mode; });

document.querySelectorAll('.offline-mode-btn').forEach(b => b.onclick = e => { document.querySelectorAll(
        '.offline-mode-btn').forEach(btn => btn.classList.remove('selected'));
      e.target.classList.add('selected');
      state.mode = e.target.dataset.mode; });

document.getElementById('btnStartMatch').onclick = () => startMatch();

window._onOnlineClick = async () => {
  console.log('[联机] 点击联机对战');
  if (typeof netRequireLogin === 'function') {
    console.log('[联机] 检查登录状态...');
    const ok = await netRequireLogin();
    console.log('[联机] 登录检查结果:', ok);
    if (!ok) return;
  }
  if (typeof netOpenRoomEntry === 'function') {
    netOpenRoomEntry();
    return;
  }
  document.getElementById('playerInfoContent').innerHTML = `
    <h3 style="color:var(--gold);text-align:center;">联机对战</h3>
    <p style="color:#6b6357;font-size:0.85em;text-align:center;margin:10px 0 14px 0;">创建房间让好友加入，或输入房间码加入</p>
    <div class="btn-group" style="justify-content:center;gap:10px;margin-top:8px;">
      <button class="btn btn-attack" style="flex:1;" onclick="netOpenCreate()"><span class="icn"></span>创建房间</button>
      <button class="btn" style="flex:1;" onclick="netOpenJoin()"><span class="icn"></span>加入房间</button>
    </div>
    <button class="btn" style="margin-top:12px;width:100%;" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>关闭</button>
  `;
  document.getElementById('playerInfoModal').style.display = 'flex';
};
document.getElementById('btnOnlineMatch').onclick = window._onOnlineClick;

document.getElementById('btnStartOffline').onclick = () => {
      const total = { lord: 6, team: 4, chaos: 4, duel: 2 } [state.mode] || 2;
      state.players = Array.from({ length: total }, (_, i) => ({
        id: i,
        name: i === 0 ? (localStorage.getItem('qQiNick') || '玩家') : getRandomName(),
        general: null,
        hp: 0,
        maxHp: 0,
        hand: [],
        equip: {},
        rank: i === 0 ? getPlayerRank() : getOpponentRank(getPlayerRank()),
        wins: i === 0 ? getStats().wins : Math.floor(Math.random() * 50),
        losses: i === 0 ? getStats().losses : Math.floor(Math.random() * 30)
      }));
      state.localIndices = [0];
      state.teams = [];
      if (state.mode === 'team') for (let i = 0; i < total; i++) state.teams[i] = (i % 2 === 0) ? 0 : 1;
      state.offlineMode = true;
      for (let i = 0; i < total; i++) { const g = GENERALS[i % GENERALS.length];
        state.players[i].general = g;
        state.players[i].maxHp = g.hp;
        state.players[i].hp = g.hp; }
      state.deck = shuffle(createDeck());
      state.discard = [];
      state.players.forEach(p => { p.hand = drawCards(4); });
      state.currentIdx = total - 1;
      state.gameOver = false;
      state.pending = null;
      state.needTarget = null;
      state.firstTurnDone = true;
      state.roundNumber = 1;
      state.subRoundCount = 1;
      state.playersActedThisRound.clear();
      state.playersPlayedThisRound.clear();
      document.getElementById('gameModeTitle').textContent = { lord: '主公模式', duel: '1v1单挑', team: '2v2合作',
        chaos: '4人大乱斗' } [state.mode];
      addLog('线下模式开始！');
      switchView('gameView');
      advanceTurn();
    };

document.getElementById('btnUseCard').onclick = () => {
      if (state.pending) return;
      if (state.selectedCardIdx === null) { addLog('请先选择手牌'); return; }
      const cur = getCur();
      if (!cur || cur.hp <= 0) return;
      const card = cur.hand[state.selectedCardIdx];
      const nt = [CARD_TYPES.KILL, CARD_TYPES.DUEL, CARD_TYPES.STEAL, CARD_TYPES.SOUTH, CARD_TYPES.ARROWS, CARD_TYPES
        .PROBE, CARD_TYPES.LOCK, CARD_TYPES.BORROW, CARD_TYPES.TRANSFER, CARD_TYPES.HARVEST, CARD_TYPES.JUESHI,
        CARD_TYPES.GOLDEN
      ].includes(card.type);
      if (nt) { state.needTarget = card;
        showTargetPanel(card); } else { useCard(card, state.currentIdx, state.currentIdx);
        state.selectedCardIdx = null;
        refreshUI(); }
    };

document.getElementById('btnDiscard').onclick = () => {
      if (state.selectedCardIdx === null) return;
      const cur = getCur();
      if (!cur || cur.hp <= 0) return;
      const card = cur.hand.splice(state.selectedCardIdx, 1)[0];
      state.discard.push(card);
      addLog(`【弃】 弃置【${card.name}】`);
      state.selectedCardIdx = null;
      refreshUI();
    };

document.getElementById('btnEndPhase').onclick = () => {
      if (state.phase === 'play' && isLocal(state.currentIdx) && !state.pending && !state.needTarget) endTurn();
      else addLog('无法结束出牌');
    };

document.getElementById('btnStartTurn').onclick = null;
document.getElementById('btnConfirmNextRound').onclick = () => { confirmEnterNextRound(); };
document.getElementById('btnRedoRound').onclick = () => { redoRound(); };
document.getElementById('btnConfirmDiscard').onclick = () => { confirmDiscard(); };
document.getElementById('btnConfirmHandoff').onclick = window.confirmHandoff;

document.getElementById('btnOfflineMode').onclick = () => {
      switchView('offlineSetupView');
      renderOfflineNameInputs(4);
    };

document.getElementById('btnBackOfflineSetup').onclick = () => { switchView('friendsView'); };

document.querySelectorAll('#playerCountBtns .count-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('#playerCountBtns .count-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        renderOfflineNameInputs(parseInt(btn.dataset.count));
      };
    });

document.getElementById('btnStartOfflineGame').onclick = () => {
      const count = parseInt(document.querySelector('#playerCountBtns .selected')?.dataset.count || '4');
      const names = [];
      for (let i = 0; i < count; i++) {
        const inp = document.getElementById(`oname-${i}`);
        names.push(inp ? inp.value.trim() || `玩家${i+1}` : `玩家${i+1}`);
      }
      state.players = Array.from({ length: count }, (_, i) => ({
        id: i,
        name: names[i],
        general: null,
        hp: 4,
        maxHp: 4,
        hand: [],
        equip: {},
        rank: '青铜',
        wins: 0,
        losses: 0
      }));
      state.takenGenerals = [];
      state.deck = shuffle(createDeck());
      state.discard = [];
      state.offlineMode = false;
      switchView('gameView');
      state.currentIdx = 0;
      startOfflinePick(0);
    };

document.getElementById('btnUsePeach').onclick = () => {
      const cur = getCur();
      const i = cur.hand.findIndex(c => c.type === CARD_TYPES.PEACH);
      if (i >= 0 && cur.hp < cur.maxHp) { useCard(cur.hand[i], state.currentIdx, state.currentIdx);
        refreshUI(); }
    };

document.getElementById('btnSkill').onclick = () => { showMySkillPanel(); };
