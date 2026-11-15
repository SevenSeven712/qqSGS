/* ============================================================
 * debug.js — 调试面板
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

(function() {
      var _debugCards = ['杀', '闪', '水', '桃', '丰收', '试探', '锁定', '偷', '南蛮入侵', '万箭齐发', '桃园三结义', '决斗', '借刀杀人',
        '金蝉护法', '炸弹'
      ];
      var _debugEquips = ['武器', '防具', '+1马', '-1马'];

      window.__fillDebugSelects = function() {
        _fillDebugSelects();
        _refreshDebugHand();
      };
      window.__openDebugModal = function() {
        var dM = document.getElementById('debugModal');
        if (dM) { _fillDebugSelects();
          _refreshDebugHand();
          dM.style.display = 'flex'; }
      };
      window.__closeDebugModal = function() {
        var dM = document.getElementById('debugModal');
        if (dM) dM.style.display = 'none';
      };
      window.__syncDebugEntryBtn = function(enabled) {
        var deb = document.getElementById('debugEntryBtn');
        if (!deb) return;
        if (enabled) {
          deb.style.display = 'inline-flex';
          deb.onclick = window.__openDebugModal;
        } else {
          deb.style.display = 'none';
        }
      };
      setTimeout(function() {
        if (localStorage.getItem('debugModeEnabled') === '1') {
          window.__syncDebugEntryBtn(true);
        }
      }, 200);

      setTimeout(function() {
        var dModal = document.getElementById('debugModal');

        var dcb = document.getElementById('debugCloseBtn');
        if (dcb) dcb.onclick = function() { if (dModal) dModal.style.display = 'none'; };

        var dps = document.getElementById('debugPlayerSelect');
        if (dps) dps.onchange = _refreshDebugHand;

        var dgc = document.getElementById('debugGiveCard');
        if (dgc) dgc.onclick = function() {
          var pi2 = parseInt(document.getElementById('debugPlayerSelect').value, 10);
          var ci = parseInt(document.getElementById('debugCardSelect').value, 10);
          var cnt = Math.max(1, parseInt(document.getElementById('debugCardCount').value, 10) || 1);
          if (!state || !state.players || isNaN(pi2) || !state.players[pi2]) { _dlog('请先开始游戏并选择玩家');
            return; }
          var card = _makeDebugCard(ci);
          for (var i = 0; i < cnt; i++) state.players[pi2].hand.push(JSON.parse(JSON.stringify(card)));
          _dlog('已给【' + state.players[pi2].name + '】发 ' + cnt + ' 张【' + card.name + '】');
          if (typeof refreshUI === 'function') refreshUI();
          _fillDebugSelects();
        };
        var dga = document.getElementById('debugGiveAllCard');
        if (dga) dga.onclick = function() {
          var ci = parseInt(document.getElementById('debugCardSelect').value, 10);
          var cnt = Math.max(1, parseInt(document.getElementById('debugCardCount').value, 10) || 1);
          if (!state || !state.players || state.players.length === 0) { _dlog('请先开始游戏'); return; }
          var card = _makeDebugCard(ci);
          for (var i = 0; i < state.players.length; i++) {
            if (state.players[i] && state.players[i].hp > 0)
              for (var j = 0; j < cnt; j++) state.players[i].hand.push(JSON.parse(JSON.stringify(card)));
          }
          _dlog('已给所有存活玩家发 ' + cnt + ' 张【' + card.name + '】');
          if (typeof refreshUI === 'function') refreshUI();
          _fillDebugSelects();
        };
        var dch = document.getElementById('debugClearHand');
        if (dch) dch.onclick = function() {
          var pi2 = parseInt(document.getElementById('debugPlayerSelect').value, 10);
          if (!state || isNaN(pi2) || !state.players[pi2]) { _dlog('请先开始游戏'); return; }
          state.players[pi2].hand = [];
          _dlog('已清空【' + state.players[pi2].name + '】的手牌');
          if (typeof refreshUI === 'function') refreshUI();
          _fillDebugSelects();
        };
        var dcah = document.getElementById('debugClearAllHand');
        if (dcah) dcah.onclick = function() {
          if (!state || !state.players) return;
          for (var i = 0; i < state.players.length; i++)
            if (state.players[i]) state.players[i].hand = [];
          _dlog('已清空所有玩家手牌');
          if (typeof refreshUI === 'function') refreshUI();
          _fillDebugSelects();
        };
        var dfh = document.getElementById('debugFillHand');
        if (dfh) dfh.onclick = function() {
          var pi2 = parseInt(document.getElementById('debugPlayerSelect').value, 10);
          if (!state || isNaN(pi2) || !state.players[pi2]) { _dlog('请先开始游戏'); return; }
          var p = state.players[pi2];
          var maxH = p.maxHp || 0;
          var curH = p.hand ? p.hand.length : 0;
          var need = Math.max(0, maxH - curH);
          if (need === 0) { _dlog('【' + p.name + '】手牌已满'); return; }
          if (typeof drawCards === 'function') { var drawn = drawCards(need); for (var i = 0; i < drawn.length; i++)
              p.hand.push(drawn[i]); } else
            for (var i = 0; i < need; i++) p.hand.push({ type: 'kill', cat: 'basic', name: '杀', suit: '♠',
              desc: '调试补牌' });
          _dlog('已给【' + p.name + '】补 ' + need + ' 张牌');
          if (typeof refreshUI === 'function') refreshUI();
          _fillDebugSelects();
        };
        var dfah = document.getElementById('debugFillAllHand');
        if (dfah) dfah.onclick = function() {
          if (!state || !state.players) return;
          for (var i = 0; i < state.players.length; i++) {
            var p = state.players[i];
            if (p && p.hp > 0) {
              var maxH = p.maxHp || 0;
              var curH = p.hand ? p.hand.length : 0;
              var need = Math.max(0, maxH - curH);
              if (typeof drawCards === 'function') { var drawn = drawCards(need); for (var j = 0; j < drawn
                  .length; j++) p.hand.push(drawn[j]); } else
                for (var j = 0; j < need; j++) p.hand.push({ type: 'kill', cat: 'basic', name: '杀', suit: '♠',
                  desc: '调试补牌' });
            }
          }
          _dlog('已把所有存活玩家手牌补满');
          if (typeof refreshUI === 'function') refreshUI();
          _fillDebugSelects();
        };
        var dmap = document.getElementById('debugMakeAiPlay');
        if (dmap) dmap.onclick = function() {
          if (!state || !state.players) { _dlog('请先开始游戏'); return; }
          if (typeof scheduleAi === 'function') { state.aiCooldown = false;
            scheduleAi();
            _dlog('强制 AI 立即出牌'); } else _dlog('AI 函数未就绪');
        };
        var dsa = document.getElementById('debugSkipAi');
        if (dsa) dsa.onclick = function() {
          if (typeof endTurn === 'function') { endTurn();
            _dlog('跳过当前行动者回合'); }
        };
        var dta = document.getElementById('debugToggleAi');
        var _aiPaused = false;
        if (dta) dta.onclick = function() {
          _aiPaused = !_aiPaused;
          if (_aiPaused) { if (state) state.aiCooldown = true;
            _dlog('AI 已暂停'); } else { if (state) state.aiCooldown = false;
            _dlog('AI 已恢复'); }
        };
      }, 800);

      function _makeDebugCard(ci) {
        var types = ['kill', 'dodge', 'water', 'peach', 'harvest', 'probe', 'lock', 'steal', 'south', 'arrows',
          'jueshi', 'duel', 'borrow', 'golden', 'transfer'
        ];
        if (ci < types.length) return { type: types[ci], cat: 'basic', name: _debugCards[ci], suit: '♠',
          desc: '调试发牌' };
        var subs = ['weapon', 'armor', 'plus1', 'minus1'];
        var si = ci - types.length;
        return { type: 'equip', cat: 'equip', sub: subs[si] || 'weapon', name: _debugEquips[si] || '装备',
          suit: '♠', desc: '调试装备' };
      }

      function _fillDebugSelects() {
        var ps = document.getElementById('debugPlayerSelect');
        if (!ps) return;
        if (!state || !state.players || state.players.length === 0) { ps.innerHTML = '<option value="-1">请先开始游戏</option>';
          return; }
        ps.innerHTML = state.players.map(function(p, i) {
          if (!p) return '';
          var hp = p.hp || 0;
          var maxHp = p.maxHp || 0;
          var hLen = p.hand ? p.hand.length : 0;
          return '<option value="' + i + '">' + (i === 0 ? '【玩家】' : '【AI】') + (p.name || '玩家' + i) +
            ' (HP' + hp + '/' + maxHp + ', 牌' + hLen + ')' + '</option>';
        }).join('');
        var cs = document.getElementById('debugCardSelect');
        if (!cs) return;
        var html = '';
        for (var i = 0; i < _debugCards.length; i++) html += '<option value="' + i + '">' + _debugCards[i] +
          '</option>';
        for (var j = 0; j < _debugEquips.length; j++) html += '<option value="' + (_debugCards.length + j) +
          '">' + _debugEquips[j] + '</option>';
        cs.innerHTML = html;
        _refreshDebugHand();
      }

      function _refreshDebugHand() {
        var list = document.getElementById('debugHandList');
        if (!list) return;
        var sel = document.getElementById('debugPlayerSelect');
        if (!sel || !state || !state.players || state.players.length === 0) { list.textContent = '（请先开始游戏）';
          return; }
        var pi2 = parseInt(sel.value, 10);
        if (isNaN(pi2) || !state.players[pi2] || !state.players[pi2].hand) { list.textContent = '（请先选择玩家）';
          return; }
        var p = state.players[pi2];
        if (!p.hand || p.hand.length === 0) { list.innerHTML = '<div style="color:#888;">（空）</div>'; return; }
        list.innerHTML = p.hand.map(function(c, i) {
          return '<span style="display:inline-block;margin:2px 4px;padding:3px 8px;background:#faf6ec;border:1px solid #d6cdb8;border-radius:4px;color:#b3362b;">[' +
            i + '] ' + (c.name || c.type || '牌') + '</span>';
        }).join('');
      }

      function _dlog(msg) {
        var el = document.getElementById('debugLog');
        if (!el) return;
        el.innerHTML = '<div>' + msg + '</div>' + el.innerHTML;
      }
    })();
