/* ============================================================
 * settings.js — 设置页：音量、规则、昵称、调试开关
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function loadSettingsPage() {
      const nick = localStorage.getItem('qQiNick') || '玩家';
      const stats = getStats();
      const rank = getPlayerRank();
      const total = stats.wins + stats.losses;
      const rate = total > 0 ? Math.round(stats.wins / total * 100) + '%' : '0%';
      const el = document.getElementById('settingsNickname');
      const el2 = document.getElementById('settingsRankInfo');
      if (el) el.textContent = nick;
      if (el2) el2.textContent = '段位：' + rank + ' | 胜率：' + rate;
      const mv = parseInt(localStorage.getItem('musicVolume') || '60');
      const sv = parseInt(localStorage.getItem('sfxVolume') || '80');
      const muted = localStorage.getItem('muteAll') === '1';
      const mvEl = document.getElementById('musicVolume');
      const svEl = document.getElementById('sfxVolume');
      const mvvEl = document.getElementById('musicVolumeVal');
      const svvEl = document.getElementById('sfxVolumeVal');
      const muteEl = document.getElementById('muteIcon');
      if (mvEl) { mvEl.value = mv; if (mvvEl) mvvEl.textContent = mv + '%'; }
      if (svEl) { svEl.value = sv; if (svvEl) svvEl.textContent = sv + '%'; }
      if (muteEl) muteEl.className = 'icn-stat ' + (muted ? 'icn-sound-off' : 'icn-sound-on');
      const mpEl = document.getElementById('musicPlayIcon');
      if (mpEl) mpEl.className = 'icn-stat ' + (bgMusicPlaying ? 'icn-music-pause' : 'icn-music-play');
      const debugEnabled = localStorage.getItem('debugModeEnabled') === '1';
      const sw = document.getElementById('debugToggle');
      const st = document.getElementById('debugStatus');
      const dh = document.getElementById('debugHint');
      if (sw) sw.checked = debugEnabled;
      if (st) st.textContent = debugEnabled ? '已开启' : '已关闭';
      if (dh) dh.style.display = debugEnabled ? 'block' : 'none';
    }

window.saveSetting = function(key, value) {
      try { localStorage.setItem(key, typeof value === 'boolean' ? (value ? '1' : '0') : value); } catch (e) {}
      if (key === 'aiSpeed') {}
      if (key === 'showEnemyHand') {}
    };

window.applyMusicVolume = function(v) {
      const el = document.getElementById('musicVolumeVal');
      if (el) el.textContent = v + '%';
      localStorage.setItem('musicVolume', v);
    };

window.applySfxVolume = function(v) {
      const el = document.getElementById('sfxVolumeVal');
      if (el) el.textContent = v + '%';
      localStorage.setItem('sfxVolume', v);
    };

window.toggleMuteAll = function() {
      const muted = localStorage.getItem('muteAll') === '1';
      const newMute = muted ? '0' : '1';
      localStorage.setItem('muteAll', newMute);
      const el = document.getElementById('muteIcon');
      if (el) {
        el.className = 'icn-stat ' + (newMute === '1' ? 'icn-sound-off' : 'icn-sound-on');
      }
      showToast('音效', newMute === '1' ? '已静音' : '已取消静音', 'info');
    };

window.toggleGameRulesContent = function() {
      const c = document.getElementById('gameRulesContent');
      const a = document.getElementById('gameRulesArrow');
      if (c) {
        const isExpanded = c.classList.contains('expanded');
        if (isExpanded) {
          c.classList.remove('expanded');
          if (a) a.classList.remove('rotated');
        } else {
          c.classList.add('expanded');
          if (a) a.classList.add('rotated');
        }
      }
    };

let bgMusicPlaying = false;

window.toggleMusicPlay = function() {
      bgMusicPlaying = !bgMusicPlaying;
      const el = document.getElementById('musicPlayIcon');
      if (el) {
        el.className = 'icn-stat ' + (bgMusicPlaying ? 'icn-music-pause' : 'icn-music-play');
      }
      showToast('背景音乐', bgMusicPlaying ? '琴声悠扬，已播放' : '已暂停', 'info');
    };

window.toggleAboutContent = function() {
      const c = document.getElementById('aboutContent');
      const a = document.getElementById('aboutArrow');
      if (c) {
        const isExpanded = c.classList.contains('expanded');
        if (isExpanded) {
          c.classList.remove('expanded');
          if (a) a.classList.remove('rotated');
        } else {
          c.classList.add('expanded');
          if (a) a.classList.add('rotated');
        }
      }
    };

window.showEditNicknameModal = function() {
      const nick = localStorage.getItem('qQiNick') || '玩家';
      document.getElementById('playerInfoContent').innerHTML = `
          <h3 style="color:var(--gold);text-align:center;">修改昵称</h3>
          <p style="color:#b8a080;font-size:0.85em;text-align:center;margin:10px 0 14px 0;">当前昵称：<b style="color:#ffe9b5;">${nick}</b></p>
          <input type="text" id="editNickInput" value="${nick}" maxlength="12" style="width:100%;padding:10px;background:#1a1008;color:#ffdd88;border:1px solid #4a3020;border-radius:8px;font-size:1em;text-align:center;box-sizing:border-box;" placeholder="请输入新昵称">
          <div class="btn-group" style="justify-content:center;margin-top:14px;">
            <button class="btn" onclick="confirmEditNickname()"><span class="icn"></span>确认修改</button>
            <button class="btn btn-close-icon" onclick="document.getElementById('playerInfoModal').style.display='none'"><span class="icn"></span>取消</button>
          </div>
        `;
      document.getElementById('playerInfoModal').style.display = 'flex';
    };

window.confirmEditNickname = function() {
      const v = document.getElementById('editNickInput');
      if (!v) return;
      const n = v.value.trim();
      if (!n || n.length < 1) { showToast('提示', '昵称不能为空', 'error'); return; }
      if (n.length > 12) { showToast('提示', '昵称不能超过12字', 'error'); return; }
      localStorage.setItem('qQiNick', n);
      document.getElementById('playerInfoModal').style.display = 'none';
      loadSettingsPage();
      showToast('成功', '昵称已修改为：' + n, 'success');
    };

window.onDebugToggleChange = function(checked) {
      const st = document.getElementById('debugStatus');
      const dh = document.getElementById('debugHint');
      if (checked) {
        showDebugPasswordModal();
      } else {
        localStorage.setItem('debugModeEnabled', '0');
        if (st) st.textContent = '已关闭';
        if (dh) dh.style.display = 'none';
        if (window.__syncDebugEntryBtn) window.__syncDebugEntryBtn(false);
        if (window.__closeDebugModal) window.__closeDebugModal();
        showToast('调试', '调试模式已关闭', 'info');
      }
    };

window.showDebugPasswordModal = function() {
      const modal = document.getElementById('debugPwdModal') || createDebugPwdModal();
      modal.style.display = 'flex';
      const input = document.getElementById('debugPwdInput');
      if (input) { input.value = '';
        input.focus(); }
    };

function createDebugPwdModal() {
      const div = document.createElement('div');
      div.id = 'debugPwdModal';
      div.className = 'modal-overlay';
      div.style.display = 'none';
      div.innerHTML = `
          <div class="modal" style="max-width:320px;text-align:center;">
            <h3 style="color:var(--gold);margin:0 0 16px 0;">调试密码</h3>
            <p style="color:#b8a080;font-size:0.9em;margin-bottom:16px;">请输入调试密码</p>
            <div style="position:relative;margin-bottom:16px;">
              <input type="password" id="debugPwdInput" maxlength="20" style="width:100%;padding:12px 40px 12px 12px;background:#1a1008;color:#ffdd88;border:1px solid #4a3020;border-radius:8px;font-size:1em;box-sizing:border-box;" placeholder="请输入密码">
              <button onclick="toggleDebugPwdVisibility()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:#888;cursor:pointer;font-size:1.1em;padding:4px;">${svgIcon('eye')}</button>
            </div>
            <div id="debugPwdError" style="color:#f44336;font-size:0.85em;margin-bottom:12px;display:none;"></div>
            <div style="display:flex;gap:8px;justify-content:center;">
              <button class="btn" onclick="confirmDebugPassword()" style="flex:1;"><span class="icn"></span>确认</button>
              <button class="btn btn-close-icon" onclick="closeDebugPwdModal()" style="flex:1;"><span class="icn"></span>取消</button>
            </div>
          </div>
        `;
      document.body.appendChild(div);
      const inp = document.getElementById('debugPwdInput');
      if (inp) inp.addEventListener('keypress', (e) => { if (e.key === 'Enter') confirmDebugPassword(); });
      return div;
    }

window.toggleDebugPwdVisibility = function() {
      const inp = document.getElementById('debugPwdInput');
      if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
    };

window.confirmDebugPassword = function() {
      const v = document.getElementById('debugPwdInput');
      const err = document.getElementById('debugPwdError');
      if (!v || !v.value.trim()) {
        if (err) { err.textContent = '请输入密码';
          err.style.display = 'block'; }
        return;
      }
      if (v.value === '7592') {
        localStorage.setItem('debugModeEnabled', '1');
        const st = document.getElementById('debugStatus');
        const dh = document.getElementById('debugHint');
        const sw = document.getElementById('debugToggle');
        if (st) st.textContent = '已开启';
        if (dh) dh.style.display = 'block';
        if (sw) sw.checked = true;
        if (window.__syncDebugEntryBtn) window.__syncDebugEntryBtn(true);
        closeDebugPwdModal();
        showToast('调试', '调试模式已开启，右上角出现调试按钮', 'success');
      } else {
        if (err) { err.textContent = '密码错误，请重试';
          err.style.display = 'block'; }
        const sw = document.getElementById('debugToggle');
        if (sw) sw.checked = false;
      }
    };

window.closeDebugPwdModal = function() {
      const modal = document.getElementById('debugPwdModal');
      if (modal) modal.style.display = 'none';
    };

document.getElementById('btnSettingsPage').onclick = () => { loadSettingsPage();
      switchView('settingsView'); };

document.getElementById('btnBackSettings').onclick = () => switchView('mainMenu');

document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        if (localStorage.getItem('debugModeEnabled') !== '1') {
          showToast('提示', '调试模式未开启，请在设置页面开启', 'info');
          return;
        }
        e.preventDefault();
        if (window.__openDebugModal) window.__openDebugModal();
      }
    });
