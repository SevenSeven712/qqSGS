/* ============================================================
 * log.js — 战斗日志与完整日志弹窗
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function addLog(m) {
      const b = document.getElementById('logBox');
      if (b) { b.innerHTML += `<div>${m}</div>`; b.scrollTop = b.scrollHeight; }
      state.fullLogHistory.push({ time: new Date().toLocaleTimeString(), msg: m });
    }

function showFullLogModal() {
      const c = document.getElementById('fullLogContent');
      if (!c) return;
      if (state.fullLogHistory.length === 0) { c.innerHTML = '<div style="text-align:center;color:#888;">暂无战斗日志</div>'; } else {
        c.innerHTML = state.fullLogHistory.map(l =>
          `<div style="padding:4px 0;border-bottom:1px solid #2a1a10;"><span style="color:#6a5a40;font-size:0.8em;">[${l.time}]</span> ${l.msg}</div>`
          ).join('');
      }
      document.getElementById('fullLogModal').style.display = 'flex';
    }

window.showFullLogModal = showFullLogModal;
