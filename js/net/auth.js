/* ============================================================
 * auth.js — 社区账号登录检查与跳转
 * 三国杀与社区共用同一个 Supabase 项目，auth token 自动共享
 * ============================================================ */

const COMMUNITY_LOGIN_URL = '../社区/liuyanban/index.html?login=1';
const COMMUNITY_REGISTER_URL = '../社区/liuyanban/index.html';
const COMMUNITY_HOME_URL = '../社区/liuyanban/posts.html';

let _authUser = null;
let _authCheckedAt = 0;

async function netGetAuthUser(force) {
  if (!force && _authUser && Date.now() - _authCheckedAt < 30000) return _authUser;
  try {
    const sb = getSupabase();
    const s = await sb.auth.getSession();
    if (!s || !s.data || !s.data.session) { _authUser = null; return null; }
    const uid = s.data.session.user && s.data.session.user.id;
    if (!uid) { _authUser = null; return null; }
    let profile = null;
    try {
      const r = await sb.from('users').select('id,nickname,avatar_url,coins,is_admin').eq('id', uid).single();
      if (r && r.data) profile = r.data;
    } catch (e) {}
    if (!profile) {
      const meta = s.data.session.user.user_metadata || {};
      profile = { id: uid, nickname: meta.nickname || (s.data.session.user.email || '').split('@')[0] || '玩家' };
    }
    _authUser = profile;
    _authCheckedAt = Date.now();
    return profile;
  } catch (e) {
    _authUser = null;
    return null;
  }
}

function netClearAuthCache() { _authUser = null; _authCheckedAt = 0; }

function netShowAuthModal(onSuccess) {
  const html = `
    <div style="text-align:center;">
      <h3 style="color:var(--gold);margin:0 0 8px 0;">需要登录</h3>
      <p style="color:#b8a080;font-size:0.9em;line-height:1.7;margin:10px 0 20px 0;">
        联机对战与房间功能需要 <b style="color:#ffd700;">Seven戚社区</b> 账号<br>
        未注册的用户请先去社区注册
      </p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button class="btn btn-attack" style="width:100%;" onclick="netGoLogin()"><span class="icn"></span>去登录</button>
        <button class="btn" style="width:100%;" onclick="netGoRegister()"><span class="icn"></span>去注册</button>
        <button class="btn btn-close-icon" style="width:100%;" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>取消</button>
      </div>
    </div>`;
  const box = document.getElementById('playerInfoContent');
  if (!box) return;
  box.innerHTML = html;
  document.getElementById('playerInfoModal').style.display = 'flex';
  window.__netAuthCallback = onSuccess || null;
}

window.netGoLogin = function () { window.location.href = COMMUNITY_LOGIN_URL; };
window.netGoRegister = function () { window.location.href = COMMUNITY_REGISTER_URL; };

async function netRequireLogin(callback) {
  const u = await netGetAuthUser(true);
  if (u) { if (typeof callback === 'function') callback(u); return true; }
  netShowAuthModal(callback);
  return false;
}

async function netRenderAuthBar() {
  const bar = document.getElementById('mainAuthBar');
  if (!bar) return;
  const u = await netGetAuthUser(true);
  const txt = document.getElementById('mainAuthText');
  const btn = document.getElementById('mainAuthBtn');
  bar.style.display = 'flex';
  if (u) {
    bar.classList.add('is-logged');
    if (txt) txt.textContent = '已登录：' + (u.nickname || '玩家');
    if (btn) { btn.textContent = '个人中心'; btn.onclick = function () { window.location.href = COMMUNITY_HOME_URL; }; }
  } else {
    bar.classList.remove('is-logged');
    if (txt) txt.textContent = '未登录（联机需登录）';
    if (btn) { btn.textContent = '去登录'; btn.onclick = function () { window.location.href = COMMUNITY_LOGIN_URL; }; }
  }
}

// 页面加载时如有 OAuth 回调（社区登录后跳回），自动刷新一次 auth
(function () {
  const boot = function () {
    netGetAuthUser(true).then(function () { netRenderAuthBar(); });
    setTimeout(netRenderAuthBar, 1500);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
