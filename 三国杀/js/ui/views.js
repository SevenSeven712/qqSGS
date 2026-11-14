/* ============================================================
 * views.js — 视图切换、对局重置
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function switchView(id) { document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(id).classList.add('active'); }

function resetGame() {
      state.players = [];
      state.deck = [];
      state.discard = [];
      state.gameOver = false;
      state.pending = null;
      state.needTarget = null;
      state.phase = 'waiting';
      state.aiTimerActive = false;
      state.aiCooldown = false;
      state.takenGenerals = [];
      state.fullLogHistory = [];
      const logBox = document.getElementById('logBox');
      if (logBox) logBox.innerHTML = '';
      const chatMsgs = document.getElementById('chatMessages');
      if (chatMsgs) {
        const welcomeMsg = chatMsgs.querySelector('.chat-msg.system');
        chatMsgs.innerHTML = '';
        if (welcomeMsg) chatMsgs.appendChild(welcomeMsg);
      }
    }
