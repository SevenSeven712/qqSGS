/* ============================================================
 * auth.js — 社区账号登录检查与跳转
 * 三国杀与社区共用同一个 Supabase 项目，auth token 自动共享
 * ============================================================ */

const COMMUNITY_LOGIN_URL = '../社区/liuyanban/index.html?login=1';
const COMMUNITY_REGISTER_URL = 'https://liuyanban.de5.net/';
const COMMUNITY_HOME_URL = 'https://liuyanban.de5.net/';

let _authUser = null;
let _authCheckedAt = 0;

async function netGetAuthUser(force) {
  if (!force && _authUser && Date.now() - _authCheckedAt < 30000) return _authUser;
  try {
    const sb = getSupabase();
    const s = await Promise.race([
      sb.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('会话读取超时')), 2000)),
    ]);
    if (!s || !s.data || !s.data.session) { _authUser = null; return null; }
    const user = s.data.session.user;
    const uid = user && user.id;
    if (!uid) { _authUser = null; return null; }
    // 排除匿名用户：Supabase 项目可能开启了匿名登录，
    // 未登录时会自动创建 is_anonymous === true 的 session
    if (user.is_anonymous === true) {
      _authUser = null;
      try { await sb.auth.signOut(); } catch (e) {}
      return null;
    }
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
    window._currentAvatarUrl = (profile.avatar_url && /^https?:\/\//.test(profile.avatar_url)) ? profile.avatar_url : '';
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
      <h3 style="color:var(--gold);margin:0 0 6px 0;">登录 Seven戚社区</h3>
      <p style="color:#6b6357;font-size:0.82em;line-height:1.6;margin:4px 0 16px 0;">
        登录后即可联机对战、创建房间、查看个人资料
      </p>
      <div style="text-align:left;">
        <input id="netAuthEmail" type="email" placeholder="邮箱账号" autocomplete="username"
          style="width:100%;padding:10px;background:#fffdf7;color:#2a2520;border:1px solid #d6cdb8;border-radius:8px;font-size:1em;box-sizing:border-box;margin-bottom:8px;outline:none;">
        <input id="netAuthPassword" type="password" placeholder="密码" autocomplete="current-password"
          style="width:100%;padding:10px;background:#fffdf7;color:#2a2520;border:1px solid #d6cdb8;border-radius:8px;font-size:1em;box-sizing:border-box;margin-bottom:4px;outline:none;">
        <div id="netAuthErr" style="color:#b3362b;font-size:0.82em;min-height:18px;margin:4px 0 10px 0;"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button class="btn btn-attack" id="netAuthSubmit" style="width:100%;" onclick="netDoInlineLogin()"><span class="icn"></span>登录</button>
        <button class="btn" style="width:100%;" onclick="netGoRegister()"><span class="icn"></span>没有账号？去注册</button>
        <button class="btn btn-close-icon" style="width:100%;" onclick="netCancelAuthModal()"><span class="icn"></span>取消</button>
      </div>
    </div>`;
  const box = document.getElementById('playerInfoContent');
  if (!box) return;
  box.innerHTML = html;
  document.getElementById('playerInfoModal').style.display = 'flex';
  window.__netAuthCallback = onSuccess || null;
  setTimeout(function () {
    const inp = document.getElementById('netAuthEmail');
    if (inp) inp.focus();
    const pw = document.getElementById('netAuthPassword');
    if (pw) pw.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); netDoInlineLogin(); }
    });
  }, 60);
}

async function netDoInlineLogin() {
  const emailEl = document.getElementById('netAuthEmail');
  const pwEl = document.getElementById('netAuthPassword');
  const errEl = document.getElementById('netAuthErr');
  const btn = document.getElementById('netAuthSubmit');
  const email = emailEl ? emailEl.value.trim() : '';
  const pw = pwEl ? pwEl.value : '';
  if (!email || !pw) { if (errEl) errEl.textContent = '请填写邮箱和密码'; return; }
  if (errEl) errEl.textContent = '';
  if (btn) { btn.disabled = true; btn.textContent = '登录中...'; }
  try {
    const sb = getSupabase();
    const res = await sb.auth.signInWithPassword({ email: email, password: pw });
    if (res.error) throw new Error(res.error.message || '邮箱或密码错误');
    netClearAuthCache();
    const u = await netGetAuthUser(true);
    if (!u) throw new Error('登录成功但读取账号信息失败');
    document.getElementById('playerInfoModal').style.display = 'none';
    if (typeof showToast === 'function') showToast('登录成功', '欢迎回来，' + (u.nickname || '玩家'), 'success');
    if (typeof netRenderAuthBar === 'function') netRenderAuthBar();
    const cb = window.__netAuthCallback;
    window.__netAuthCallback = null;
    if (typeof cb === 'function') setTimeout(function () { cb(u); }, 200);
  } catch (e) {
    if (errEl) errEl.textContent = (e && e.message) ? e.message : '登录失败';
    if (btn) { btn.disabled = false; btn.textContent = '登录'; }
  }
}

window.netDoInlineLogin = netDoInlineLogin;

window.netDoLogout = function () {
  netShowConfirm('退出登录', '确定要退出登录吗？下次联机需要重新登录。', async function () {
    try {
      const sb = getSupabase();
      await sb.auth.signOut();
    } catch (e) {}
    netClearAuthCache();
    try { localStorage.removeItem('qQiNick'); } catch (e) {}
    if (typeof netRenderAuthBar === 'function') netRenderAuthBar();
    if (typeof showToast === 'function') showToast('已退出登录', '下次联机需要重新登录', 'info');
  });
};

window.netShowConfirm = function (title, message, onConfirm) {
  const box = document.getElementById('playerInfoContent');
  if (!box) return;
  box.innerHTML = `
    <div style="text-align:center;padding:6px 4px;">
      <h3 style="color:var(--text);margin:0 0 12px 0;font-family:'STKaiti','KaiTi',serif;letter-spacing:2px;">${title || '提示'}</h3>
      <p style="color:var(--text-muted);font-size:0.9em;line-height:1.7;margin:10px 0 22px 0;white-space:pre-wrap;text-align:left;">${message || ''}</p>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button class="btn btn-attack" id="netConfirmOk" style="flex:1;">确定</button>
        <button class="btn" id="netConfirmCancel" style="flex:1;">取消</button>
      </div>
    </div>
  `;
  document.getElementById('playerInfoModal').style.display = 'flex';
  document.getElementById('netConfirmOk').onclick = function () {
    document.getElementById('playerInfoModal').style.display = 'none';
    if (typeof onConfirm === 'function') onConfirm();
  };
  document.getElementById('netConfirmCancel').onclick = function () {
    document.getElementById('playerInfoModal').style.display = 'none';
  };
};

window.netCancelAuthModal = function () {
  window.__netAuthCallback = null;
  const m = document.getElementById('playerInfoModal');
  if (m) m.style.display = 'none';
};

window.netGoLogin = function () { window.location.href = COMMUNITY_LOGIN_URL; };
window.netGoRegister = function () { window.__netAuthCallback = null; window.location.href = COMMUNITY_REGISTER_URL; };

async function netRequireLogin(callback) {
  const u = await netGetAuthUser(true);
  if (u) return true;
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
    if (btn) { btn.textContent = '去登录'; btn.onclick = function () { netShowAuthModal(); }; }
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
