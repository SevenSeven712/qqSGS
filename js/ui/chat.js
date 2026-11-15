/* ============================================================
 * chat.js — 聊天面板与 AI 台词
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

let chatOpenByUser = false,
      chatHover = false,
      unreadCount = 0;

function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;' } [c])); }

function getPlayerTeamByName(name) {
      if (!state.players) return null;
      for (let i = 0; i < state.players.length; i++) {
        if (state.players[i].name === name) {
          if (state.mode === 'team' && state.teams !== undefined) return state.teams[i];
          return isLocal(i) ? 'host' : null;
        }
      }
      return null;
    }

function addChat(name, msg) {
      if (!name || !msg) return;
      const box = document.getElementById('chatMessages');
      if (!box) return;
      if (box.querySelector('.chat-empty')) box.innerHTML = '';
      const tm = (new Date()).toLocaleTimeString('zh-CN', { hour12: false }).slice(0, 5);
      let teamCls = '';
      const t = getPlayerTeamByName(name);
      if (t === 0) teamCls = 'team-0';
      else if (t === 1) teamCls = 'team-1';
      else if (t === 'host') teamCls = 'team-host';
      const isSystem = name === '系统' || name === 'system';
      if (isSystem) teamCls = 'system';
      const div = document.createElement('div');
      div.className = 'chat-msg ' + teamCls;
      div.innerHTML =
        `<div class="chat-msg-head"><span class="chat-msg-name">${escapeHtml(name)}</span><span class="chat-msg-time">${tm}</span></div><div class="chat-msg-body">${escapeHtml(msg)}</div>`;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
      while (box.children.length > 40) box.removeChild(box.firstChild);
      const panel = document.getElementById('chatPanel');
      const isPanelOpen = panel && panel.classList.contains('open');
      if (!isPanelOpen) {
        unreadCount++;
        const badge = document.getElementById('chatBadge');
        if (badge) { badge.style.display = 'flex';
          badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount); }
      }
    }

function openChat() {
      const p = document.getElementById('chatPanel');
      const fab = document.getElementById('chatFab');
      if (p) p.classList.add('open');
      if (fab) fab.style.opacity = '0.35';
      unreadCount = 0;
      const badge = document.getElementById('chatBadge');
      if (badge) { badge.style.display = 'none';
        badge.textContent = '0'; }
      const box = document.getElementById('chatMessages');
      if (box && box.children.length === 0) {
        box.innerHTML = '<div class="chat-empty">还没有消息，先说句话吧~</div>';
      }
    }

function closeChat() {
      const p = document.getElementById('chatPanel');
      const fab = document.getElementById('chatFab');
      if (p) p.classList.remove('open');
      if (fab) fab.style.opacity = '1';
      chatOpenByUser = false;
    }

function toggleChat() {
      const p = document.getElementById('chatPanel');
      if (!p) return;
      if (p.classList.contains('open')) { closeChat(); } else { chatOpenByUser = true;
        openChat(); }
    }

function isTouchDevice() { return ('ontouchstart' in window) || navigator.maxTouchPoints > 0; }

function sendChatMessage() {
      const input = document.getElementById('chatInput');
      if (!input) return;
      const v = input.value.trim();
      if (!v) return;
      const localName = localStorage.getItem('qQiNick') || '玩家';
      addChat(localName, v);
      input.value = '';
      if (Math.random() < 0.35 && state.players && state.phase === 'play') {
        const others = [];
        for (let i = 0; i < state.players.length; i++) {
          if (!isLocal(i) && state.players[i].hp > 0) others.push(state.players[i].name);
        }
        if (others.length > 0) {
          setTimeout(() => {
            const name = others[Math.floor(Math.random() * others.length)];
            const replies = ['好的', '加油', '看我的', '稳一点', '一起上', '好牌', '继续'];
            addChat(name, replies[Math.floor(Math.random() * replies.length)]);
          }, 800 + Math.random() * 1500);
        }
      }
    }

function setupChatUI() {
      const fab = document.getElementById('chatFab');
      const panel = document.getElementById('chatPanel');
      const closeBtn = document.getElementById('chatClose');
      const input = document.getElementById('chatInput');
      const sendBtn = document.getElementById('chatSend');
      if (!fab || !panel) return;
      // 统一逻辑：点击切换开关，不再用 hover 自动开（会和点击冲突）
      fab.onclick = () => {
        if (panel.classList.contains('open')) { closeChat(); }
        else { chatOpenByUser = true; openChat(); }
      };
      if (closeBtn) closeBtn.onclick = closeChat;
      // 鼠标移出面板时不自动关闭（由用户手动点 X 或 FAB）
      panel.onclick = function (e) { e.stopPropagation(); };
      if (input) {
        input.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault();
            sendChatMessage(); } });
      }
      if (sendBtn) sendBtn.onclick = sendChatMessage;
    }

window.addChat = addChat;
window.openChat = openChat;
window.closeChat = closeChat;

function aiTurnIntro(idx) { if (!state.players || !state.players[idx]) return; const p = state.players[idx]; if (
        isLocal(idx)) return; const pType = getAiPersonality(p.name); if (Math.random() < 0.45) { const c = AI_PERSONALITY[
          pType].chatPrefix;
        addChat(p.name, c[Math.floor(Math.random() * c.length)]); } }

function aiEventChat(evt, targetIdx, sourceIdx) { if (state.gameOver) return; const names = ['玩家', targetIdx !==
        undefined && state.players[targetIdx] ? state.players[targetIdx].name : '', sourceIdx !== undefined && state
        .players[sourceIdx] ? state.players[sourceIdx].name : ''
      ]; const talker = sourceIdx !== undefined && state.players[sourceIdx] ? sourceIdx : targetIdx; if (talker ===
        undefined || isLocal(talker) || !state.players[talker]) return; const p = state.players[talker]; const pType =
        getAiPersonality(p.name); let msgs; if (evt === 'kill') msgs = AI_PERSONALITY[pType].onKill; else if (evt ===
        'dodge') msgs = AI_PERSONALITY[pType].onDodge; else if (evt === 'hurt') msgs = AI_PERSONALITY[pType].onHurt;
      else if (evt === 'win') msgs = AI_PERSONALITY[pType].onWin; else if (evt === 'lose') msgs = AI_PERSONALITY[pType]
        .onLose; else return; if (Math.random() < 0.4) addChat(p.name, msgs[Math.floor(Math.random() * msgs.length)]); }

function randomAiChat() { if (state.gameOver || state.phase !== 'play') return; if (Math.random() > 0.08) return;
      const ais = []; for (let i = 0; i < state.players.length; i++) { if (!isLocal(i) && state.players[i].hp > 0) ais
          .push(i); } if (ais.length === 0) return; const idx = ais[Math.floor(Math.random() * ais.length)]; const p =
        state.players[idx]; const pType = getAiPersonality(p.name); const msgs = AI_PERSONALITY[pType].chatPrefix; if (
        Math.random() < 0.5) addChat(p.name, msgs[Math.floor(Math.random() * msgs.length)]); }

setInterval(randomAiChat, 6000);
