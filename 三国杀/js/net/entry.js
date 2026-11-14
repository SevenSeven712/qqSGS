/* ============================================================
 * entry.js — 联机入口：创建/加入房间弹窗、开始按钮
 * ============================================================ */

window.netOpenCreate = function () {
  const nick = localStorage.getItem('qQiNick') || '玩家';
  document.getElementById('playerInfoContent').innerHTML = `
    <h3 style="color:var(--gold);text-align:center;">创建联机房间</h3>
    <p style="color:#b8a080;font-size:0.85em;text-align:center;margin:10px 0 14px 0;">输入你的昵称</p>
    <input id="netNickInput" type="text" maxlength="12" value="${nick}" style="width:100%;padding:10px;background:#1a1008;color:#ffdd88;border:1px solid #4a3020;border-radius:8px;font-size:1em;text-align:center;box-sizing:border-box;">
    <div class="btn-group" style="justify-content:center;margin-top:14px;">
      <button class="btn btn-attack" onclick="netDoCreate()"><span class="icn"></span>创建</button>
      <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>取消</button>
    </div>
  `;
  document.getElementById('playerInfoModal').style.display = 'flex';
};

window.netOpenJoin = function () {
  const nick = localStorage.getItem('qQiNick') || '玩家';
  document.getElementById('playerInfoContent').innerHTML = `
    <h3 style="color:var(--gold);text-align:center;">加入联机房间</h3>
    <p style="color:#b8a080;font-size:0.85em;text-align:center;margin:10px 0 14px 0;">输入昵称与房间码</p>
    <input id="netNickInput" type="text" maxlength="12" value="${nick}" placeholder="昵称" style="width:100%;padding:10px;background:#1a1008;color:#ffdd88;border:1px solid #4a3020;border-radius:8px;font-size:1em;text-align:center;box-sizing:border-box;margin-bottom:8px;">
    <input id="netCodeInput" type="text" maxlength="6" placeholder="房间码（6 位）" style="width:100%;padding:10px;background:#1a1008;color:#ffdd88;border:1px solid #4a3020;border-radius:8px;font-size:1.1em;text-align:center;letter-spacing:4px;text-transform:uppercase;box-sizing:border-box;">
    <div class="btn-group" style="justify-content:center;margin-top:14px;">
      <button class="btn btn-attack" onclick="netDoJoin()"><span class="icn"></span>加入</button>
      <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>取消</button>
    </div>
  `;
  document.getElementById('playerInfoModal').style.display = 'flex';
};

window.netDoCreate = async function () {
  const nickEl = document.getElementById('netNickInput');
  const nick = nickEl && nickEl.value.trim();
  if (!nick) { showToast('提示', '请输入昵称', 'error'); return; }
  localStorage.setItem('qQiNick', nick);
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
  const nickEl = document.getElementById('netNickInput');
  const codeEl = document.getElementById('netCodeInput');
  const nick = nickEl && nickEl.value.trim();
  const code = codeEl && codeEl.value.trim().toUpperCase();
  if (!nick) { showToast('提示', '请输入昵称', 'error'); return; }
  if (!code || code.length < 4) { showToast('提示', '请输入正确的房间码', 'error'); return; }
  localStorage.setItem('qQiNick', nick);
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
  await netLeaveRoom();
  switchView('mainMenu');
};

document.addEventListener('DOMContentLoaded', function () {
  const b1 = document.getElementById('btnNetCreate');
  if (b1) b1.onclick = window.netOpenCreate;
  const b2 = document.getElementById('btnNetJoin');
  if (b2) b2.onclick = window.netOpenJoin;
  const b3 = document.getElementById('btnNetStart');
  if (b3) b3.onclick = window.netStartGameClick;
  const b4 = document.getElementById('btnNetLeave');
  if (b4) b4.onclick = window.netLeaveClick;
});
