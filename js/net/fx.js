/* ============================================================
 * fx.js — 联机特效通道：房主记录 → 快照带走 → 客机重放
 * 只播视觉，绝不改游戏状态
 * ============================================================ */

let netFxBuf = [];

function netPushFx(type, data) {
  if (typeof netIsHost === 'function' && !netIsHost()) return;
  netFxBuf.push({ type: type, data: data || {}, t: Date.now() });
  if (netFxBuf.length > 60) netFxBuf.shift();
}

function netTakeFx() {
  const out = netFxBuf.slice();
  netFxBuf.length = 0;
  return out;
}

window.__netReplaying = false;

function netReplayFx(type, data) {
  if (!type) return;
  window.__netReplaying = true;
  try {
    if (type === 'nanman') {
      if (typeof showNanmanEffect === 'function') showNanmanEffect(data.fi);
    } else if (type === 'arrows') {
      if (typeof showArrowsEffect === 'function') showArrowsEffect(data.fi);
    } else if (type === 'golden') {
      if (typeof showGoldenEffect === 'function') showGoldenEffect(data.fi);
    } else if (type === 'harvest') {
      if (typeof showHarvestEffect === 'function') showHarvestEffect(data.fi);
    } else if (type === 'explosion') {
      if (typeof showExplosionEffect === 'function') showExplosionEffect(data.targetIdx);
    } else if (type === 'shake') {
      if (typeof shakePlayerCard === 'function') shakePlayerCard(data.targetIdx);
    } else if (type === 'float') {
      if (typeof floatText === 'function') floatText('player-' + data.idx, data.text, data.color);
    } else if (type === 'card') {
      if (typeof animateCard === 'function') {
        animateCard('player-' + data.fi, data.ti === null || data.ti === undefined ? null : 'player-' + data.ti, data.nm);
      }
    } else if (type === 'lockResult') {
      netReplayLockResult(data);
    } else if (type === 'bombResult') {
      netReplayBombResult(data);
    }
  } catch (e) {
    console.warn('[net] fx replay failed', type, e);
  } finally {
    setTimeout(function () { window.__netReplaying = false; }, 20);
  }
}

function netReplayLockResult(data) {
  const player = state.players && state.players[data.targetIdx];
  const name = player ? player.name : '玩家';
  const overlay = document.createElement('div');
  overlay.className = 'bomb-overlay';
  overlay.style.background = 'rgba(20,20,40,0.9)';
  overlay.innerHTML = '<div class="bomb-card-display" style="color:#aa88ff;text-shadow:0 0 30px #aa88ff,0 0 60px #6a4a9a;">锁</div>' +
    '<div class="bomb-text">' + name + ' 锁定判定</div>';
  document.body.appendChild(overlay);
  setTimeout(function () {
    const suitColor = data.isRed ? '#ff4444' : '#44ccff';
    overlay.innerHTML = '<div class="bomb-card-display" style="color:' + suitColor + ';text-shadow:0 0 30px ' + suitColor + ',0 0 60px ' + suitColor + ';">' + data.judgeSuit + '</div>' +
      '<div class="bomb-text" style="color:' + (data.isRed ? '#ff6666' : '#88ccff') + ';">' + (data.isRed ? '锁定成功！' : svgIcon('check') + ' 锁定失败') + '</div>';
    setTimeout(function () { overlay.remove(); }, 1600);
  }, 900);
}

function netReplayBombResult(data) {
  const overlay = document.createElement('div');
  overlay.className = 'bomb-overlay';
  overlay.innerHTML = '<div class="bomb-card-display">炸</div><div class="bomb-text">炸弹判定</div>';
  document.body.appendChild(overlay);
  setTimeout(function () {
    const suitColor = (data.judgeSuit === '♠' || data.judgeSuit === '♣') ? '#ff4444' : '#44ccff';
    overlay.innerHTML = '<div class="bomb-card-display" style="color:' + suitColor + ';text-shadow:0 0 30px ' + suitColor + ',0 0 60px ' + suitColor + ';">' + data.judgeSuit + '</div>' +
      '<div class="bomb-text" style="color:' + (data.isExplode ? '#ff4444' : '#88ccff') + ';">' + (data.isExplode ? '爆炸！' : svgIcon('check') + ' 安全通过') + '</div>';
    setTimeout(function () { overlay.remove(); }, 1600);
  }, 700);
}
