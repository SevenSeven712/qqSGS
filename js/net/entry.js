/* ============================================================
 * entry.js — 联机入口：创建/加入房间弹窗、开始按钮
 * ============================================================ */

function netShowCreateForm() {
  document.getElementById('playerInfoContent').innerHTML = `
    <h3 style="color:var(--gold);text-align:center;">创建联机房间</h3>
    <p style="color:#6b6357;font-size:0.85em;text-align:center;margin:10px 0 14px 0;">创建后将生成 4 位房间码，分享给好友即可加入</p>
    <div class="btn-group" style="justify-content:center;margin-top:14px;">
      <button class="btn btn-attack" onclick="netDoCreate()"><span class="icn"></span>创建</button>
      <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>取消</button>
    </div>
  `;
  document.getElementById('playerInfoModal').style.display = 'flex';
}
window.netShowCreateForm = netShowCreateForm;

window.netOpenCreate = async function () {
  if (typeof netRequireLogin === 'function') {
    const ok = await netRequireLogin(netShowCreateForm);
    if (!ok) return;
  }
  netShowCreateForm();
};

function netShowRoomEntryForm() {
  document.getElementById('playerInfoContent').innerHTML = `
    <h3 style="color:var(--gold);text-align:center;">房间</h3>
    <p style="color:#6b6357;font-size:0.85em;text-align:center;margin:10px 0 14px 0;">创建房间或输入房间码加入</p>
    <div class="btn-group" style="justify-content:center;gap:10px;">
      <button class="btn btn-attack" style="flex:1;" onclick="document.getElementById('playerInfoModal').style.display='none';netShowCreateForm()"><span class="icn"></span>创建房间</button>
      <button class="btn" style="flex:1;" onclick="document.getElementById('playerInfoModal').style.display='none';netShowJoinForm()"><span class="icn"></span>加入房间</button>
    </div>
    <button class="btn btn-close-icon" style="margin-top:12px;width:100%;" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>取消</button>
  `;
  document.getElementById('playerInfoModal').style.display = 'flex';
}
window.netShowRoomEntryForm = netShowRoomEntryForm;

window.netOpenRoomEntry = async function () {
  const u = await netGetAuthUser(true);
  if (!u) { netShowAuthModal(netShowRoomEntryForm); return; }
  document.getElementById('playerInfoContent').innerHTML = `
    <h3 style="color:var(--gold);text-align:center;">房间</h3>
    <p style="color:#6b6357;font-size:0.85em;text-align:center;margin:10px 0 14px 0;">创建房间或输入房间码加入</p>
    <div class="btn-group" style="justify-content:center;gap:10px;">
      <button class="btn btn-attack" style="flex:1;" onclick="document.getElementById('playerInfoModal').style.display='none';netOpenCreate()"><span class="icn"></span>创建房间</button>
      <button class="btn" style="flex:1;" onclick="document.getElementById('playerInfoModal').style.display='none';netOpenJoin()"><span class="icn"></span>加入房间</button>
    </div>
    <button class="btn btn-close-icon" style="margin-top:12px;width:100%;" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>取消</button>
  `;
  document.getElementById('playerInfoModal').style.display = 'flex';
};

function netShowJoinForm() {
  document.getElementById('playerInfoContent').innerHTML = `
    <h3 style="color:var(--gold);text-align:center;">加入联机房间</h3>
    <p style="color:#6b6357;font-size:0.85em;text-align:center;margin:10px 0 14px 0;">输入 4 位房间码</p>
    <input id="netCodeInput" type="text" maxlength="6" placeholder="房间码（4 位）" style="width:100%;padding:10px;background:#fffdf7;color:#2a2520;border:1px solid #d6cdb8;border-radius:8px;font-size:1.1em;text-align:center;letter-spacing:4px;text-transform:uppercase;box-sizing:border-box;">
    <div class="btn-group" style="justify-content:center;margin-top:14px;">
      <button class="btn btn-attack" onclick="netDoJoin()"><span class="icn"></span>加入</button>
      <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>取消</button>
    </div>
  `;
  document.getElementById('playerInfoModal').style.display = 'flex';
}
window.netShowJoinForm = netShowJoinForm;

window.netOpenJoin = async function () {
  if (typeof netRequireLogin === 'function') {
    const ok = await netRequireLogin(netShowJoinForm);
    if (!ok) return;
  }
  netShowJoinForm();
};

window.netDoCreate = async function () {
  const u = await netGetAuthUser(true);
  if (!u) { netShowAuthModal(function () { netDoCreate(); }); return; }
  if (u.nickname) localStorage.setItem('qQiNick', u.nickname);
  document.getElementById('playerInfoModal').style.display = 'none';
  try {
    await netHostCreateRoom();
    showToast('联机', '房间已创建，房间码 ' + netRoom.code, 'success');
  } catch (e) {
    console.error(e);
    showToast('联机', '创建失败：' + (e && e.message ? e.message : e), 'error');
  }
};

window.netDoJoin = async function () {
  const codeEl = document.getElementById('netCodeInput');
  const code = codeEl && codeEl.value.trim().toUpperCase();
  if (!code || code.length < 4 || code.length > 6) { showToast('提示', '请输入正确的 4 位房间码', 'error'); return; }
  const u = await netGetAuthUser(true);
  if (!u) { netShowAuthModal(function () { netDoJoin(); }); return; }
  if (u.nickname) localStorage.setItem('qQiNick', u.nickname);
  document.getElementById('playerInfoModal').style.display = 'none';
  try {
    await netGuestJoinRoom(code);
  } catch (e) {
    console.error(e);
    showToast('联机', '加入失败：' + (e && e.message ? e.message : e), 'error');
  }
};

window.netStartGameClick = async function () {
  try {
    await netHostStartGame();
  } catch (e) {
    console.error(e);
    showToast('联机', '开局失败：' + (e && e.message ? e.message : e), 'error');
  }
};

window.netLeaveClick = async function () {
  if (netIsHost()) {
    const tip = netRoom.started
      ? '你是房主，离开将解散整个房间，所有玩家都会被移出并结束对局。\n\n确定要离开吗？'
      : '你是房主，离开将解散整个房间，其他玩家都会被移出。\n\n确定要离开吗？';
    netShowConfirm('解散房间', tip, async function () {
      await netLeaveRoom();
      switchView('mainMenu');
    });
    return;
  }
  await netLeaveRoom();
  switchView('mainMenu');
};

document.addEventListener('DOMContentLoaded', function () {
  const b1 = document.getElementById('btnNetCreate');
  if (b1) b1.onclick = window.netOpenCreate;
  const b2 = document.getElementById('btnNetJoin');
  if (b2) b2.onclick = window.netOpenJoin;
  const bRoom = document.getElementById('btnRoom');
  if (bRoom) bRoom.onclick = function () { netOpenRoomEntry(); };
  const b3 = document.getElementById('btnNetStart');
  if (b3) b3.onclick = window.netStartGameClick;
  const b4 = document.getElementById('btnNetLeave');
  if (b4) b4.onclick = window.netLeaveClick;
});

document.addEventListener('click', function (e) {
  const btn = e.target && e.target.closest ? e.target.closest('#netModeGrid .net-mode-btn') : null;
  if (!btn) return;
  if (btn.disabled) return;
  if (typeof netSetMode === 'function') netSetMode(btn.dataset.mode);
});
