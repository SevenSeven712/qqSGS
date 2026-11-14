/* ============================================================
 * toast.js — 轻提示
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function showToast(title, message, type = 'info', duration = 0) {
      const icons = { 'success': 'check', 'error': 'close', 'info': 'diamond' };
      const box = document.getElementById('toastContent');
      box.className = `toast-box toast-${type}`;
      box.innerHTML = `
          <div class="toast-icon">${svgIcon(icons[type] || 'megaphone')}</div>
          <div class="toast-title">${title}</div>
          <div class="toast-message">${message}</div>
          <button class="toast-btn" id="toastCloseBtn">确定</button>
        `;
      document.getElementById('toastModal').style.display = 'flex';
      document.getElementById('toastCloseBtn').onclick = function() {
        document.getElementById('toastModal').style.display = 'none';
      };
      if (duration > 0) {
        setTimeout(() => { document.getElementById('toastModal').style.display = 'none'; }, duration);
      }
    }
