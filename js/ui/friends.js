/* ============================================================
 * friends.js — 好友、房间、邀请
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function addFriendRequest(name) { if (!name || !name.trim()) return; const reqs = getFriendRequests(); if (reqs.find(
        r => r.name === name)) return; reqs.push({ name: name.trim(), wins: Math.floor(Math.random() * 30), losses: Math
          .floor(Math.random() * 20), rank: getRandomRank(), online: Math.random() > 0.3 });
      saveFriendRequests(reqs); }

function acceptFriendRequest(name) { const reqs = getFriendRequests(); const r = reqs.find(x => x.name === name); if (!
        r) return; const fs = getFriends(); if (!fs.find(f => f.name === name)) fs.push({ name: r.name, online: r
          .online || true, wins: r.wins || 0, losses: r.losses || 0, rank: r.rank || getRandomRank() });
      saveFriends(fs);
      saveFriendRequests(reqs.filter(x => x.name !== name));
      loadFriends(); }

function rejectFriendRequest(name) { saveFriendRequests(getFriendRequests().filter(x => x.name !== name));
      loadFriends(); }

function searchFriendByName(name) { if (!name || !name.trim()) return null; const trimmed = name.trim(); const
        existingAI = AI_NAMES.find(n => n === trimmed || n.indexOf(trimmed) >= 0 || trimmed.indexOf(n) >= 0); if (
        existingAI) return { name: existingAI, online: Math.random() > 0.3, wins: Math.floor(Math.random() * 60),
        losses: Math.floor(Math.random() * 40), rank: getRandomRank(), isNpc: true }; return { name: trimmed,
        online: Math.random() > 0.3, wins: Math.floor(Math.random() * 30), losses: Math.floor(Math.random() * 20),
        rank: getRandomRank(), isNpc: true }; }

function sendFriendRequest(targetName) {
      const name = typeof targetName === 'string' ? targetName : (state.players[targetName] && state.players[targetName]
        .name);
      if (!name) return;
      document.getElementById('playerInfoModal').style.display = 'none';
      const fs = getFriends();
      if (fs.find(f => f.name === name)) { showToast('提示', name + ' 已经是你的好友', 'info'); return; }
      const reqs = getFriendRequests();
      if (reqs.find(r => r.name === name)) { showToast('提示', '已向 ' + name + ' 发送过好友申请', 'info'); return; }
      showToast('好友申请', '已向 ' + name + ' 发出好友申请', 'info');
      setTimeout(() => {
        if (Math.random() < 0.6) {
          const target = searchFriendByName(name);
          const newFriend = { name: name, online: true, wins: (target && target.wins) || Math.floor(Math.random() *
              30), losses: (target && target.losses) || Math.floor(Math.random() * 20), rank: (target && target
              .rank) || getRandomRank() };
          const cur = getFriends();
          cur.push(newFriend);
          saveFriends(cur);
          showToast('好友申请', name + ' 同意了你的好友申请！', 'success');
        } else {
          showToast('好友申请', name + ' 拒绝了你的好友申请', 'error');
        }
      }, 2000 + Math.random() * 2000);
    }

function addToRoom(name) { if (!state.roomState) state.roomState = { members: [], invited: [] }; if (state.roomState
        .members.find(m => m.name === name)) return; if (state.roomState.members.length >= 4) { showToast('提示', '房间已满',
        'info'); return; } const friendData = getFriendData(name); const rank = friendData ? friendData.rank :
        getRandomRank();
      state.roomState.members.push({ name: name, rank: rank });
      renderRoom(); }

function removeFromRoom(name) { if (!state.roomState) return; state.roomState.members = state.roomState.members
        .filter(m => m.name !== name);
      state.roomState.invited = state.roomState.invited.filter(n => n !== name);
      renderRoom(); }

function renderRoom() { if (!state.roomState) return; const membersEl = document.getElementById('roomMembers');
      const invitedEl = document.getElementById('invitedMembers'); if (!membersEl || !invitedEl) return; const localName =
        localStorage.getItem('qQiNick') || '玩家'; const localRank = getPlayerRank(); const localRankColor = RANK_COLORS[
        localRank] || '#fff'; let membersHtml =
        `<div style="padding:6px 0;color:var(--gold);display:flex;justify-content:space-between;"><span>${svgIcon('crown')} ${localName}</span><span style="color:${localRankColor};font-size:0.8em;">${localRank}</span></div>`;
      state.roomState.members.forEach(m => { const rc = RANK_COLORS[m.rank] || '#fff'; membersHtml +=
          `<div style="padding:6px 0;display:flex;justify-content:space-between;align-items:center;"><span>${m.name}</span><div style="display:flex;gap:6px;align-items:center;"><span style="color:${rc};font-size:0.75em;">${m.rank}</span><button class="btn" style="padding:2px 8px;font-size:0.7em;" onclick="removeFromRoom('${m.name.replace(/'/g,"\\'")}')"><span class="icn"></span>移除</button></div></div>`; });
      membersEl.innerHTML = membersHtml || '<span style="color:#888;">暂无成员</span>';
      invitedEl.innerHTML = state.roomState.invited.length > 0 ? state.roomState.invited.map(n =>
        `<div style="padding:4px 0;color:#5a7d52;">${svgIcon('mail')} ${n} (已邀请)</div>`).join('') :
        '<span style="color:#888;">暂无邀请</span>'; }

function loadFriends() {
      const fl = getFriends();
      const reqs = getFriendRequests();
      const list = document.getElementById('friendsList');
      const reqList = document.getElementById('friendRequestsList');
      if (reqList) {
        if (reqs.length === 0) { reqList.innerHTML = ''; } else {
          reqList.innerHTML = '<div style="color:#ff9800;font-weight:bold;margin-bottom:6px;">待处理申请</div>' + reqs.map((
            r, i) => {
            const rc = RANK_COLORS[r.rank] || '#fff';
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#faf6ec;border-radius:6px;margin-bottom:4px;"><div><span>${r.name}</span><span style="color:${rc};font-size:0.75em;"> ${r.rank}</span></div><div style="display:flex;gap:4px;"><button class="btn" style="padding:4px 10px;font-size:0.7em;" onclick="acceptFriendRequest('${r.name.replace(/'/g,"\\'")}')"><span class="icn"></span>接受</button><button class="btn" style="padding:4px 10px;font-size:0.7em;" onclick="rejectFriendRequest('${r.name.replace(/'/g,"\\'")}')"><span class="icn"></span>拒绝</button></div></div>`;
          }).join('');
        }
      }
      if (!list) return;
      if (fl.length === 0) { list.innerHTML =
          '<div style="color:#888;padding:10px;text-align:center;">暂无好友，快去搜索添加吧</div>'; return; }
      list.innerHTML = fl.map((f, idx) => {
        const total = f.wins + f.losses;
        const winRate = total > 0 ? Math.round(f.wins / total * 100) + '%' : '-';
        const rc = RANK_COLORS[f.rank] || '#fff';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #f6f0e2;">
            <div>
              <span>${f.name}</span>
              <span style="color:${rc};font-size:0.75em;"> ${f.rank}</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <span style="color:${f.online?'#5a7d52':'#888'};font-size:0.75em;">${dotIcon(f.online)} ${f.online?'在线':'离线'}</span>
              <button class="btn" style="padding:4px 12px;font-size:0.7em;" onclick="viewFriendStats('${f.name.replace(/'/g,"\\'")}')"><span class="icn"></span>战绩</button>
              ${f.online?`<button class="btn" style="padding:4px 12px;font-size:0.7em;" onclick="inviteFriendToRoom('${f.name.replace(/'/g,"\\'")}')"><span class="icn"></span>邀请</button>`:''}
              <button class="btn" style="padding:4px 12px;font-size:0.7em;" onclick="removeFriend('${f.name.replace(/'/g,"\\'")}')"><span class="icn"></span>删除</button>
            </div>
          </div>`;
      }).join('');
    }

function removeFriend(name) { const cur = getFriends().filter(f => f.name !== name);
      saveFriends(cur);
      loadFriends();
      showToast('好友', '已删除好友 ' + name, 'info'); }

function viewFriendStats(name) {
      const f = getFriendData(name);
      if (!f) return;
      const total = f.wins + f.losses;
      const winRate = total > 0 ? Math.round(f.wins / total * 100) + '%' : '-';
      const rc = RANK_COLORS[f.rank] || '#fff';
      document.getElementById('playerInfoContent').innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:4px 0 8px 0;">
            <div style="display:flex;align-items:baseline;gap:8px;">
              <h3 style="color:var(--text);margin:0;font-size:1.3em;">${f.name}</h3>
              <span class="icn-stat icn-rank" style="opacity:0.9;"></span>
              <span style="color:${rc};font-size:0.8em;font-weight:bold;opacity:0.9;">${f.rank}</span>
            </div>
          </div>
          <div style="margin-top:4px;padding:0 4px;">
            <div style="display:flex;align-items:center;gap:8px;padding:8px 6px;border-bottom:1px solid #f6f0e2;">
              <span class="icn-stat icn-win"></span>
              <span style="color:#6b6357;font-size:0.9em;">胜利</span>
              <span style="margin-left:auto;font-weight:bold;color:#5a7d52;font-size:1.1em;">${f.wins}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px 6px;border-bottom:1px solid #f6f0e2;">
              <span class="icn-stat icn-lose"></span>
              <span style="color:#6b6357;font-size:0.9em;">失败</span>
              <span style="margin-left:auto;font-weight:bold;color:#b3362b;font-size:1.1em;">${f.losses}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px 6px;border-bottom:1px solid #f6f0e2;">
              <span class="icn-stat icn-rate"></span>
              <span style="color:#6b6357;font-size:0.9em;">胜率</span>
              <span style="margin-left:auto;font-weight:bold;color:#2a2520;font-size:1.1em;">${winRate}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px 6px;">
              <span class="icn-stat icn-rank"></span>
              <span style="color:#6b6357;font-size:0.9em;">当前段位</span>
              <span style="margin-left:auto;font-weight:bold;color:${rc};font-size:1.05em;">${f.rank}</span>
            </div>
          </div>
          <button class="btn" style="margin-top:10px;width:100%;" onclick="document.getElementById('playerInfoModal').style.display='none';loadFriends();switchView('friendsView');"><span class="icn"></span>关闭</button>
        `;
      document.getElementById('playerInfoModal').style.display = 'flex';
    }

function inviteFriendToRoom(name) {
      if (typeof netIsOnline === 'function' && netIsOnline() && typeof netIsHost === 'function' && netIsHost()) {
        showToast('联机', '房间码 ' + netRoom.code + '，请发给 ' + name, 'info');
        return;
      }
      showToast('联机', '请先点「创建房间」，再把房间码发给好友', 'info');
      return;
      // 以下旧逻辑保留（不可达），联机模式下由上方 return 拦截
      const f = getFriendData(name);
      if (!f) { showToast('提示', '未找到该好友', 'info'); return; }
      if (!f.online) { showToast('提示', '该好友不在线', 'info'); return; }
      if (!state.roomState) { createRoom(); }
      if (state.roomState.members.length >= 4) { showToast('提示', '房间已满', 'info'); return; }
      if (state.roomState.invited.indexOf(name) >= 0 || state.roomState.members.find(m => m.name === name)) { showToast(
          '提示', '该好友已在房间或已邀请', 'info'); return; }
      state.roomState.invited.push(name);
      renderRoom();
      setTimeout(() => {
        if (Math.random() < 0.6) {
          addToRoom(name);
          state.roomState.invited = state.roomState.invited.filter(n => n !== name);
          renderRoom();
          showToast('邀请', f.name + ' 同意了你的邀请，已加入房间！', 'success');
        } else {
          state.roomState.invited = state.roomState.invited.filter(n => n !== name);
          renderRoom();
          showToast('邀请', f.name + ' 拒绝了你的邀请', 'error');
        }
      }, 1500);
    }

function createRoom() {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      state.roomState = { members: [], invited: [], code: code };
      document.getElementById('roomCode').textContent = '房间码：' + code;
      renderRoom();
      switchView('roomView');
    }

function showInviteModal() {
      if (!state.roomState) { createRoom(); }
      const onlineFriends = getFriends().filter(f => f.online);
      if (onlineFriends.length === 0) {
        document.getElementById('inviteContent').innerHTML = `
            <h3 style="color:var(--gold);">邀请好友</h3>
            <p style="color:#6b6357;padding:10px;">暂无在线好友，快去添加吧！</p>
            <button class="btn" onclick="document.getElementById('inviteModal').style.display='none';switchView('friendsView');loadFriends();"><span class="icn"></span>前往添加</button>
            <button class="btn" style="margin-top:6px;" onclick="document.getElementById('inviteModal').style.display='none'"><span class="icn"></span>关闭</button>
          `;
        document.getElementById('inviteModal').style.display = 'flex';
        return;
      }
      let content = `
          <h3 style="color:var(--gold);">邀请好友</h3>
          <div style="max-height:300px;overflow-y:auto;">
        `;
      onlineFriends.forEach((f) => {
        const rc = RANK_COLORS[f.rank] || '#fff';
        const alreadyIn = state.roomState.members.find(m => m.name === f.name);
        const alreadyInvited = state.roomState.invited.indexOf(f.name) >= 0;
        content += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #f6f0e2;">
              <div>
                <span>${f.name}</span>
                <span style="color:${rc};font-size:0.75em;"> ${f.rank}</span>
              </div>
              ${alreadyIn?'<span style="color:#5a7d52;font-size:0.8em;">已在房间</span>':alreadyInvited?'<span style="color:#ff9800;font-size:0.8em;">已邀请</span>':`<button class="btn" style="padding:4px 12px;font-size:0.8em;" onclick="inviteToRoomFromModal('${f.name.replace(/'/g,"\\'")}')"><span class="icn"></span>邀请</button>`}
            </div>
          `;
      });
      content += `
          </div>
          <button class="btn" style="margin-top:10px;" onclick="document.getElementById('inviteModal').style.display='none'"><span class="icn"></span>关闭</button>
        `;
      document.getElementById('inviteContent').innerHTML = content;
      document.getElementById('inviteModal').style.display = 'flex';
    }

function inviteToRoomFromModal(name) { inviteFriendToRoom(name); }
