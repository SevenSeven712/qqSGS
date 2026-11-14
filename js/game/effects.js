/* ============================================================
 * effects.js — 炸弹 / 南蛮 / 万箭 / 金蝉 / 丰收 特效与飘字
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function showBombOverlay(targetIdx, callback) {
      const player = state.players[targetIdx];
      const overlay = document.createElement('div');
      overlay.id = 'bombOverlay';
      overlay.className = 'bomb-overlay';
      let goldenBtn = '';
      const hasGolden = player.hand.some(c => c.type === CARD_TYPES.GOLDEN);
      if (isLocal(targetIdx) && hasGolden) {
        goldenBtn =
          `<button class="btn" id="bombGoldenBtn" style="background:#ffd700;color:#5a3a00;margin-top:20px;font-size:1.2em;padding:12px 24px;">用金蝉护法</button>`;
      }
      overlay.innerHTML = `
          <div class="bomb-card-display">炸</div>
          <div class="bomb-text">炸弹判定</div>
          <div class="bomb-target-name">${player.name}</div>
          ${goldenBtn}
        `;
      document.body.appendChild(overlay);
      refreshUI();
      let goldenUsed = false;
      const goldenBtnEl = document.getElementById('bombGoldenBtn');
      if (goldenBtnEl) {
        goldenBtnEl.onclick = () => {
          goldenUsed = true;
          const gi = player.hand.findIndex(c => c.type === CARD_TYPES.GOLDEN);
          if (gi >= 0) {
            player.hand.splice(gi, 1);
            addLog(`【护】 ${player.name}打出【金蝉护法】免疫【炸弹】！`);
            floatText(`player-${targetIdx}`, '', '#ffd700');
          }
          hideBombOverlay();
          showGoldenEffect(targetIdx);
          if (state.pending && state.pending.type === 'transfer') {
            if (state.pending.originalIdx !== undefined) state.currentIdx = state.pending.originalIdx;
            state.pending = null;
          }
          refreshUI();
          checkVictory();
          if (!state.gameOver && state.phase === 'play' && !isLocal(state.currentIdx)) scheduleAi();
        };
      }
      const delay = isLocal(targetIdx) ? 1500 : 800;
      setTimeout(() => {
        if (goldenUsed) return;
        callback();
      }, delay);
    }

function showBombResult(judgeSuit, isExplode) {
      if (typeof netPushFx === 'function' && !window.__netReplaying) {
        netPushFx('bombResult', { judgeSuit: judgeSuit, isExplode: !!isExplode });
      }
      const overlay = document.getElementById('bombOverlay');
      if (!overlay) return;
      const suitColor = (judgeSuit === '♠' || judgeSuit === '♣') ? '#ff4444' : '#44ccff';
      overlay.innerHTML = `
          <div class="bomb-card-display" style="color:${suitColor};text-shadow:0 0 30px ${suitColor},0 0 60px ${suitColor};">${judgeSuit}</div>
          <div class="bomb-text" style="color:${isExplode?'#ff4444':'#88ccff'};">${isExplode?'爆炸！':svgIcon('check')+' 安全通过'}</div>
        `;
    }

function hideBombOverlay() {
      const overlay = document.getElementById('bombOverlay');
      if (overlay) overlay.remove();
    }

function showLockJudge(targetIdx, isTargetLocal) {
      const player = state.players[targetIdx];
      const overlay = document.createElement('div');
      overlay.id = 'lockOverlay';
      overlay.className = 'bomb-overlay';
      overlay.style.background = 'rgba(20,20,40,0.9)';
      overlay.innerHTML = `
          <div class="bomb-card-display" style="color:#aa88ff;text-shadow:0 0 30px #aa88ff,0 0 60px #aa66ff;">锁</div>
          <div class="bomb-text">锁定判定</div>
          <div class="bomb-target-name">${player.name}</div>
        `;
      document.body.appendChild(overlay);
      refreshUI();
      const judgeDelay = isTargetLocal ? 1500 : 800;
      setTimeout(() => {
        const judgeSuit = SUITS[Math.floor(Math.random() * 4)];
        const isRed = SUIT_COLOR[judgeSuit] === 'red';
        const suitColor = isRed ? '#ff4444' : '#44ccff';
        overlay.innerHTML = `
            <div class="bomb-card-display" style="color:${suitColor};text-shadow:0 0 30px ${suitColor},0 0 60px ${suitColor};">${judgeSuit}</div>
            <div class="bomb-text" style="color:${isRed?'#ff6666':'#88ccff'};">${isRed?'锁定成功！':svgIcon('check')+' 锁定失败'}</div>
          `;
        addLog(`  判定结果：${judgeSuit} ${isRed?'红色':'黑色'}`);
        if (typeof netPushFx === 'function' && !window.__netReplaying) {
          netPushFx('lockResult', { targetIdx: targetIdx, judgeSuit: judgeSuit, isRed: isRed });
        }
        if (isRed) {
          player.locked = true;
          player.hand.push(...drawCards(2));
          addLog(`  ${player.name}被锁定，本回合无法出牌，下回合无法摸牌，并获得2张牌`);
          floatText(`player-${targetIdx}`, '锁定', '#aa88ff');
        } else {
          addLog(`  ${player.name}未受影响`);
        }
        setTimeout(() => {
          overlay.remove();
          refreshUI();
          if (!state.gameOver && state.phase === 'play' && !isLocal(state.currentIdx)) scheduleAi();
        }, 1500);
      }, judgeDelay);
    }

function showExplosionEffect(targetIdx) {
      const targetEl = document.getElementById(`player-${targetIdx}`);
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const effect = document.createElement('div');
      effect.className = 'explosion-effect';
      effect.style.left = rect.left + rect.width / 2 + 'px';
      effect.style.top = rect.top + rect.height / 2 + 'px';
      const flash = document.createElement('div');
      flash.className = 'explosion-flash';
      effect.appendChild(flash);
      const ring = document.createElement('div');
      ring.className = 'explosion-ring';
      effect.appendChild(ring);
      for (let i = 0; i < 8; i++) {
        const spark = document.createElement('div');
        spark.className = 'explosion-spark';
        const angle = (i / 8) * Math.PI * 2;
        const dist = 60 + Math.random() * 40;
        spark.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        spark.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        effect.appendChild(spark);
      }
      document.body.appendChild(effect);
      setTimeout(() => effect.remove(), 1000);
      targetEl.style.animation = 'none';
      targetEl.offsetHeight;
      targetEl.style.animation = 'shake 0.5s ease';
    }

function showBombFadeOut() {
      const overlay = document.getElementById('bombOverlay');
      if (overlay) {
        overlay.querySelector('.bomb-card-display').style.animation = 'bombFadeOut 1.5s ease-out forwards';
        overlay.querySelector('.bomb-text').style.animation = 'bombFadeOut 1.5s ease-out forwards';
        overlay.querySelector('.bomb-target-name').style.animation = 'bombFadeOut 1.5s ease-out forwards';
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 1500);
      }
    }

function shakePlayerCard(i) {
      const el = document.getElementById(`player-${i}`);
      if (el) {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = 'shake 0.5s ease';
      }
    }

function showNanmanEffect(fi) {
      const overlay = document.createElement('div');
      overlay.className = 'aoe-overlay';
      overlay.innerHTML = `
          <div class="aoe-ripple"></div>
          <div class="warrior warrior-left"></div>
          <div class="warrior warrior-right"></div>
          <div class="impact-ring"></div>
          <div class="impact-ring" style="animation-delay:1.4s;"></div>
          <div class="nanman-title">南蛮入侵</div>
        `;
      document.body.appendChild(overlay);
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          if (!overlay.parentNode) return;
          const dust = document.createElement('div');
          dust.className = 'charge-dust';
          const side = i < 4 ? 'left' : 'right';
          dust.style.left = side === 'left' ? (30 + Math.random() * 20) + '%' : (50 + Math.random() * 20) + '%';
          dust.style.top = (45 + Math.random() * 20) + '%';
          dust.style.animation = `aoeTitlePop ${0.8+Math.random()*0.4}s ease forwards`;
          dust.style.animationDelay = (0.3 + Math.random() * 0.8) + 's';
          overlay.appendChild(dust);
        }, i * 100);
      }
      setTimeout(() => {
        state.players.forEach((p, i) => {
          if (i === fi || p.hp <= 0) return;
          setTimeout(() => shakePlayerCard(i), i * 80);
        });
      }, 800);
      setTimeout(() => overlay.remove(), 2300);
    }

function showArrowsEffect(fi) {
      const overlay = document.createElement('div');
      overlay.className = 'arrows-overlay';
      overlay.innerHTML = `<div class="arrows-title">万箭齐发</div>`;
      document.body.appendChild(overlay);
      for (let i = 0; i < 25; i++) {
        setTimeout(() => {
          if (!overlay.parentNode) return;
          const ar = document.createElement('div');
          ar.className = 'arrow-item';
          ar.innerHTML = svgIcon('arrow-down');
          ar.style.left = (Math.random() * 100) + '%';
          const dur = (1.1 + Math.random() * 0.6);
          ar.style.animationDuration = dur + 's';
          ar.style.fontSize = (1.6 + Math.random() * 1.2) + 'em';
          overlay.appendChild(ar);
          setTimeout(() => {
            const flash = document.createElement('div');
            flash.className = 'arrow-flash';
            const leftPct = parseFloat(ar.style.left);
            flash.style.left = leftPct + '%';
            flash.style.top = (70 + Math.random() * 30) + '%';
            overlay.appendChild(flash);
            setTimeout(() => flash.remove(), 400);
          }, dur * 800);
          setTimeout(() => ar.remove(), dur * 1000 + 200);
        }, i * 60);
      }
      setTimeout(() => {
        state.players.forEach((p, i) => {
          if (i === fi || p.hp <= 0) return;
          setTimeout(() => shakePlayerCard(i), i * 60);
        });
      }, 600);
      setTimeout(() => overlay.remove(), 2400);
    }

function showGoldenEffect(fi) {
      const overlay = document.createElement('div');
      overlay.className = 'golden-overlay';
      overlay.innerHTML = `
          <div class="golden-card">金蝉护法</div>
          <div class="golden-ring"></div>
          <div class="golden-ring" style="animation-delay:1.1s;"></div>
          <div class="golden-ring" style="animation-delay:1.5s; border-color:rgba(255,200,80,0.4);"></div>
          <div class="golden-text-shield">免疫</div>
        `;
      document.body.appendChild(overlay);
      const bgFlash = document.createElement('div');
      bgFlash.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(255,220,80,0.3) 0%,transparent 70%);pointer-events:none;opacity:0;';
      overlay.appendChild(bgFlash);
      [0.2, 0.8, 1.4].forEach((delay, idx) => {
        setTimeout(() => {
          if (!overlay.parentNode) return;
          bgFlash.style.transition = 'opacity 0.25s ease';
          bgFlash.style.opacity = '1';
          setTimeout(() => {
            bgFlash.style.opacity = '0';
          }, 250);
        }, delay * 1000);
      });
      for (let i = 0; i < 24; i++) {
        setTimeout(() => {
          if (!overlay.parentNode) return;
          const sp = document.createElement('div');
          const ang = (i / 24) * Math.PI * 2;
          const dist = 120 + Math.random() * 160;
          const tx = Math.cos(ang) * dist;
          const ty = Math.sin(ang) * dist;
          const size = (10 + Math.random() * 18);
          sp.style.cssText = `
              position:absolute;
              width:${size}px; height:${size}px;
              background:radial-gradient(circle,#fff8c0 0%,#ffd700 40%,rgba(255,200,60,0) 70%);
              border-radius:50%;
              left:calc(50% - ${size/2}px); top:calc(50% - ${size/2}px);
              pointer-events:none;
              animation:goldenSpark_v-gs-${i} 1.8s ease-out forwards;
            `;
          const style = document.createElement('style');
          style.id = 'gs-style-' + i;
          style.textContent = `
              @keyframes goldenSpark_v-gs-${i} {
                0%{transform:translate(0,0) scale(0); opacity:1;}
                40%{transform:translate(${tx*0.5}px,${ty*0.5}px) scale(1.5); opacity:1;}
                100%{transform:translate(${tx}px,${ty}px) scale(0.3); opacity:0;}
              }
            `;
          document.head.appendChild(style);
          overlay.appendChild(sp);
          setTimeout(() => { style.remove();
            sp.remove(); }, 1900);
        }, 300 + i * 60);
      }
      for (let i = 0; i < 16; i++) {
        setTimeout(() => {
          if (!overlay.parentNode) return;
          const star = document.createElement('div');
          const ang = (i / 16) * Math.PI * 2;
          const dist = 80 + Math.random() * 60;
          const tx = Math.cos(ang) * dist;
          const ty = Math.sin(ang) * dist;
          star.style.cssText = `
              position:absolute;
              left:calc(50% - 5px); top:calc(50% - 5px);
              font-size:${1.2+Math.random()*1.5}em;
              color:#ffd700;
              text-shadow:0 0 15px #ffaa00, 0 0 30px #ff8800;
              pointer-events:none;
              animation:starBurst gs-star-${i} 1.4s ease-out forwards;
            `;
          star.innerHTML = svgIcon('spark');
          const sstyle = document.createElement('style');
          sstyle.id = 'gs-star-' + i;
          sstyle.textContent = `
              @keyframes starBurst gs-star-${i} {
                0%{transform:translate(0,0) scale(0) rotate(0deg); opacity:1;}
                50%{transform:translate(${tx*0.6}px,${ty*0.6}px) scale(1.2) rotate(180deg); opacity:1;}
                100%{transform:translate(${tx}px,${ty}px) scale(0.2) rotate(360deg); opacity:0;}
              }
            `;
          document.head.appendChild(sstyle);
          overlay.appendChild(star);
          setTimeout(() => { sstyle.remove();
            star.remove(); }, 1500);
        }, 400 + i * 50);
      }
      setTimeout(() => overlay.remove(), 2500);
    }

function showHarvestEffect(fi) {
      const overlay = document.createElement('div');
      overlay.className = 'harvest-overlay';
      overlay.innerHTML = `<div class="harvest-title">丰收</div>`;
      document.body.appendChild(overlay);
      const symbols = ['sunflower'];
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          if (!overlay.parentNode) return;
          const g = document.createElement('div');
          g.className = 'harvest-grain';
          g.innerHTML = svgIcon(symbols[i % symbols.length]);
          g.style.left = (Math.random() * 95) + '%';
          const dur = (1.5 + Math.random() * 0.8);
          g.style.animationDuration = dur + 's';
          g.style.animationDelay = (Math.random() * 0.3) + 's';
          overlay.appendChild(g);
          setTimeout(() => g.remove(), dur * 1000 + 300);
        }, i * 80);
      }
      setTimeout(() => overlay.remove(), 2200);
    }

function floatText(id, tx, co) {
      const el = document.getElementById(id);
      if (!el) return;
      const d = document.createElement('div');
      let fontSize = '1.8em';
      let fontWeight = 'bold';
      let textShadow = '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.5)';
      let border = '';
      if (tx.includes('-1') || tx.includes('伤害') || tx.includes('-3')) {
        fontSize = '2.2em';
        border = '3px solid #ff0000';
        textShadow = '0 0 15px #ff0000, 0 0 30px rgba(255,0,0,0.6), 0 2px 4px rgba(0,0,0,0.8)';
      } else if (tx.includes('+1') || tx.startsWith('+')) {
        fontSize = '2.2em';
        border = '3px solid #00ff00';
        textShadow = '0 0 15px #00ff00, 0 0 30px rgba(0,255,0,0.6), 0 2px 4px rgba(0,0,0,0.8)';
      } else if (tx.includes('杀') || tx.includes('闪')) {
        fontSize = '1.6em';
        border = '2px solid #ffcc00';
        textShadow = '0 0 12px rgba(255,204,0,0.8), 0 2px 4px rgba(0,0,0,0.8)';
      }
      d.style.cssText =
        `position:absolute;font-weight:${fontWeight};font-size:${fontSize};color:${co};animation:floatUp 1.5s forwards;z-index:20;left:50%;top:0;pointer-events:none;text-shadow:${textShadow};border:${border};border-radius:6px;padding:2px 6px;background:rgba(0,0,0,0.6);transform:translateX(-50%);`;
      d.textContent = tx;
      el.style.position = 'relative';
      el.appendChild(d);
      setTimeout(() => d.remove(), 1500);
    }

function animateCard(fi, ti, nm) {
      const f = document.getElementById(fi);
      if (!f) return Promise.resolve();
      const r1 = f.getBoundingClientRect();
      const c = document.createElement('div');
      c.className = 'card';
      let cardBg = '#2a1a10';
      let cardBorder = '2px solid var(--gold)';
      let cardColor = 'var(--gold-light)';
      if (nm === '杀') { cardBg = 'linear-gradient(180deg,#4a1a1a 0%,#2a0a0a 100%)';
        cardBorder = '2px solid #c84a4a';
        cardColor = '#ff6666'; } else if (nm === '闪') { cardBg = 'linear-gradient(180deg,#1a2a4a 0%,#0a1a2a 100%)';
        cardBorder = '2px solid #4a90c8';
        cardColor = '#88ccff'; } else if (nm === '南蛮') { cardBg = 'linear-gradient(180deg,#4a2a1a 0%,#2a1508 100%)';
        cardBorder = '2px solid #c84a4a';
        cardColor = '#ff8888'; } else if (nm === '万箭') { cardBg = 'linear-gradient(180deg,#1a3a4a 0%,#0a2030 100%)';
        cardBorder = '2px solid #4a90c8';
        cardColor = '#88ddff'; } else if (nm === '桃') { cardBg = 'linear-gradient(180deg,#4a1a4a 0%,#2a0a2a 100%)';
        cardBorder = '2px solid #ff69b4';
        cardColor = '#ff99cc'; }
      c.style.cssText =
        `position:fixed;left:${r1.left+r1.width/2-32}px;top:${r1.top+r1.height/2-44}px;z-index:1000;pointer-events:none;width:64px;height:88px;background:${cardBg};border:${cardBorder};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.8em;color:${cardColor};font-weight:bold;box-shadow:0 6px 20px rgba(0,0,0,0.7),0 0 15px rgba(201,160,80,0.3);`;
      c.textContent = nm || '牌';
      document.getElementById('animationLayer').appendChild(c);
      if (ti) {
        const t = document.getElementById(ti);
        if (t) {
          const r2 = t.getBoundingClientRect();
          requestAnimationFrame(() => {
            c.style.transition = 'transform 1.2s cubic-bezier(0.4,0,0.2,1), opacity 1.0s ease';
            c.style.transform =
              `translate(${r2.left+r2.width/2-32-(r1.left+r1.width/2-32)}px,${r2.top+r2.height/2-44-(r1.top+r1.height/2-44)}px)`;
            c.style.opacity = '0.85';
          });
        }
      }
      setTimeout(() => c.remove(), 1300);
      return new Promise(r => setTimeout(r, 1300));
    }
