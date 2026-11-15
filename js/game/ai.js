/* ============================================================
 * ai.js — AI 性格、思考、出牌、响应
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function aiRespondKill(ti, fi) {
      const p = state.players[ti];
      if (p.hp <= 0) return;
      if (p.goldenShield) {
        p.goldenShield = false;
        addLog(`【护】 ${p.name}的【金蝉护法】免疫了杀！`);
        refreshUI();
        return;
      }
      if (!p.goldenShield) {
        const hasDodge = p.hand.some(c => c.type === CARD_TYPES.DODGE);
        if (!hasDodge) {
          const gi = p.hand.findIndex(c => c.type === CARD_TYPES.GOLDEN);
          if (gi >= 0) {
            p.hand.splice(gi, 1);
            addLog(`【护】 ${p.name}打出【金蝉护法】免疫！`);
            floatText(`player-${ti}`, '', '#b3362b');
            showGoldenEffect(ti);
            refreshUI();
            return;
          }
        }
      }
      const i = p.hand.findIndex(c => c.type === CARD_TYPES.DODGE);
      if (i >= 0) {
        p.hand.splice(i, 1);
        addLog(`  ${p.name}打出【闪】免疫`);
        floatText(`player-${ti}`, '闪', '#4a90c8');
        if (fi !== undefined) animateCard(`player-${ti}`, `player-${fi}`, '闪');
      } else {
        if (fi !== undefined) {
          if (xiaomingImmune(ti, 'kill')) { refreshUI(); return; }
          if (jiahaoProtect(ti)) { refreshUI(); return; }
        }
        let dmg = 1;
        if (fi !== undefined) {
          const mult = maochenhaoDmgMultiplier(fi, 'kill');
          dmg *= mult;
        }
        p.hp = Math.max(0, p.hp - dmg);
        addLog(`  ${p.name}未打出【闪】，受到${dmg}点伤害`);
        floatText(`player-${ti}`, `-${dmg}`, '#ff4444');
        shakePlayerCard(ti);
        if (p.hp <= 0) eliminate(ti);
        if (fi !== undefined) fuchenhaoJudge(fi);
        maochenhaoAfterDamage(ti);
      }
      refreshUI();
    }

const AI_PERSONALITY = {
      aggressive: { chatPrefix: ['这把看我的', '让我出手', '你们都挡不住'], onKill: ['拿命来！', '一张杀！', '接受命运吧'],
        onDodge: ['想杀我？', '没那么容易', '闪开！'], onHurt: ['这点伤害不算什么', '再来！', '你们等着'], onWin: ['承让！', '赢了', '不愧是我'],
        onLose: ['这把输了', '下把再战', '服气了'] },
      defensive: { chatPrefix: ['先稳住', '小心为上', '我观察一下'], onKill: ['抱歉了', '不得不出手', '失礼了'], onDodge: ['闪过', '没事的',
          '躲掉了'
        ], onHurt: ['还好', '小伤而已', '稳住'], onWin: ['运气好', '侥幸赢了'], onLose: ['技不如人', '甘拜下风', '下局再来'] },
      friendly: { chatPrefix: ['大家加油！', '一起玩得开心', '有好牌吗'], onKill: ['不好意思~', '哈哈别怪我', '出招啦'], onDodge: ['险啊险啊', '嘿嘿',
          '虚晃一招'
        ], onHurt: ['呜呜好痛', '哎', '小心点嘛'], onWin: ['太棒了！', '开心！', '大家玩得真好'], onLose: ['好可惜', '下次努力', '555~'] },
      normal: { chatPrefix: ['好的', '继续', '嗯...'], onKill: ['出牌', '来一招', '用张杀'], onDodge: ['闪躲', '嗯', '没事'],
        onHurt: ['...', '继续'], onWin: ['拿下！'], onLose: ['输了'] }
    };

function getAiPersonality(name) { if (!name) return 'normal'; if (name.indexOf('张飞') >= 0 || name.indexOf('曹操') >= 0 ||
        name.indexOf('马超') >= 0 || name.indexOf('许褚') >= 0 || name.indexOf('典韦') >= 0 || name.indexOf('徐晃') >= 0 ||
        name.indexOf('夏侯') >= 0) return 'aggressive'; if (name.indexOf('刘备') >= 0 || name.indexOf('孙权') >= 0 || name
        .indexOf('鲁肃') >= 0 || name.indexOf('吕蒙') >= 0 || name.indexOf('周瑜') >= 0) return 'friendly'; if (name
        .indexOf('赵云') >= 0 || name.indexOf('诸葛亮') >= 0 || name.indexOf('司马懿') >= 0 || name.indexOf('陆逊') >= 0 || name
        .indexOf('姜维') >= 0 || name.indexOf('关羽') >= 0 || name.indexOf('黄忠') >= 0 || name.indexOf('张辽') >= 0 || name
        .indexOf('张郃') >= 0 || name.indexOf('魏延') >= 0) return 'defensive'; return 'normal'; }

function scheduleAi() {
      if (state.gameOver || state.phase !== 'play' || isLocal(state.currentIdx)) return;
      if (state.aoeJustResolved) { state.aoeJustResolved = false;
        advanceTurn(); return; }
      if (state.aiCooldown) { setTimeout(() => scheduleAi(), 100); return; }
      state.aiCooldown = true;
      const cur = getCur();
      if (!cur || cur.hp <= 0 || !cur.hand || cur.hand.length === 0) {
        setTimeout(() => {
          addLog(`${cur.name}无牌，跳过`);
          state.aiCooldown = false;
          advanceTurn();
        }, 1000);
        return;
      }
      const bonus = getRankBonus(cur ? cur.rank || '青铜' : '青铜');
      const randomDelay = 500 + Math.random() * 2500;
      aiTurnIntro(state.currentIdx);
      setTimeout(() => { aiTakeTurn().finally(() => { state.aiCooldown = false; }); }, randomDelay);
    }

async function aiTakeTurn() {
      if (state.gameOver || state.phase !== 'play' || isLocal(state.currentIdx)) return;
      const cur = getCur();
      if (!cur || cur.hp <= 0) { endTurn(); return; }
      if (cur.locked) {
        addLog(`【锁】 ${cur.name}被锁定，回合跳过`);
        floatText(`player-${state.currentIdx}`, '锁定', '#6a4a9a');
        cur.locked = false;
        endTurn();
        return;
      }
      const aiLevel = getAiRankLevel(state.currentIdx);
      const bonus = getRankBonus(cur.rank);
      await new Promise(r => setTimeout(r, 500 + Math.random() * 2000));

      const enemies = state.players.map((_, i) => i).filter(i => i !== state.currentIdx && state.players[i].hp > 0 && !
        sameTeam(state.currentIdx, i));
      const allies = state.players.map((_, i) => i).filter(i => i !== state.currentIdx && state.players[i].hp > 0 &&
        sameTeam(state.currentIdx, i));

      const aiAnalysis = aiAnalyzeBestPlay(state.currentIdx);
      const isHighLevel = aiLevel >= 4;

      let playCount = 0;
      const maxPlays = cur.hand.length + 2;

      while (playCount < maxPlays) {
        if (state.gameOver) break;
        const hand = cur.hand;
        if (!hand || hand.length === 0) break;

        {
          const equipCards = hand.filter(c => c.cat === 'equip');
          for (const c of equipCards) {
            if (!cur.hand.includes(c)) continue;
            if ((c.sub === 'plus1' || c.sub === 'minus1') && cur.equip[c.sub]) continue;
            if (cur.equip[c.sub]) continue;
            if (useCard(c, state.currentIdx, state.currentIdx)) {
              await animateCard(`player-${state.currentIdx}`, null, c.name);
              playCount++;
              await new Promise(r => setTimeout(r, 300));
              break;
            }
          }
        }

        if (!cur.goldenShield) {
          const dangerousTypes = [CARD_TYPES.KILL, CARD_TYPES.DUEL, CARD_TYPES.STEAL, CARD_TYPES.SOUTH, CARD_TYPES
            .ARROWS, CARD_TYPES.BORROW, CARD_TYPES.LOCK
          ];
          const enemyHasThreat = enemies.some(i => state.players[i].hand.some(c => dangerousTypes.includes(c.type)));
          const lowHp = (cur.hp <= 2) || (aiLevel >= 2 && cur.hp <= 3);
          const highCards = cur.hand.length >= 5;
          if (lowHp || enemyHasThreat || highCards) {
            const g = cur.hand.find(c => c.type === CARD_TYPES.GOLDEN);
            if (g) {
              useCard(g, state.currentIdx, state.currentIdx);
              await showGoldenEffect(state.currentIdx);
              playCount++;
              await new Promise(r => setTimeout(r, 300));
              continue;
            }
          }
        }

        const harvest = cur.hand.find(c => c.type === CARD_TYPES.HARVEST);
        if (harvest) {
          useCard(harvest, state.currentIdx, state.currentIdx);
          await animateCard(`player-${state.currentIdx}`, null, '丰');
          playCount++;
          await new Promise(r => setTimeout(r, 300));
          continue;
        }

        const jueshi = cur.hand.find(c => c.type === CARD_TYPES.JUESHI);
        if (jueshi && cur.hp < cur.maxHp) {
          const alliesNeedHp = allies.length === 0 || allies.some(i => state.players[i].hp < state.players[i].maxHp);
          if (alliesNeedHp || aiLevel >= 1) {
            useCard(jueshi, state.currentIdx, state.currentIdx);
            await animateCard(`player-${state.currentIdx}`, null, '杰');
            playCount++;
            await new Promise(r => setTimeout(r, 300));
            continue;
          }
        }

        let attacked = false;

        if (cur.hp < cur.maxHp) {
          const peach = cur.hand.find(c => c.type === CARD_TYPES.PEACH);
          if (peach) {
            const savePeach = (aiLevel >= 3 && cur.hp >= 3) || (cur.hp <= 1 && Math.random() < bonus);
            if (!savePeach) {
              useCard(peach, state.currentIdx, state.currentIdx);
              await animateCard(`player-${state.currentIdx}`, null, '桃');
              playCount++;
              await new Promise(r => setTimeout(r, 300));
              continue;
            }
          }
        }

        const duel = cur.hand.find(c => c.type === CARD_TYPES.DUEL && cur.hand.includes(c));
        if (duel && enemies.length > 0) {
          let target;
          if (isHighLevel && aiAnalysis) {
            const noKillEnemy = aiAnalysis.enemies.filter(e => !e.hasKill).sort((a, b) => a.hp - b.hp)[0];
            if (noKillEnemy) {
              target = noKillEnemy.idx;
              addLog(`【智】${cur.name}：${state.players[target].name}无杀，决斗必胜`);
            }
          }
          if (target === undefined) {
            const lowHp = enemies.find(i => state.players[i].hp <= 2);
            target = lowHp || enemies[Math.floor(Math.random() * enemies.length)];
          }
          if (useCard(duel, state.currentIdx, target)) {
            await animateCard(`player-${state.currentIdx}`, `player-${target}`, '斗');
            playCount++;
            await new Promise(r => setTimeout(r, 300));
            attacked = true;
          }
        }

        if (!attacked) {
          for (const c of [...cur.hand]) {
            if (!cur.hand.includes(c)) continue;
            if (c.type === CARD_TYPES.SOUTH && enemies.length >= 2 && (aiLevel >= 2 || Math.random() < bonus)) {
              const target = enemies[Math.floor(Math.random() * enemies.length)];
              if (useCard(c, state.currentIdx, target)) {
                await animateCard(`player-${state.currentIdx}`, `player-${target}`, '南');
                playCount++;
                await new Promise(r => setTimeout(r, 300));
                attacked = true;
                break;
              }
            }
            if (c.type === CARD_TYPES.ARROWS && enemies.length >= 2 && (aiLevel >= 2 || Math.random() < bonus)) {
              const target = enemies[Math.floor(Math.random() * enemies.length)];
              if (useCard(c, state.currentIdx, target)) {
                await animateCard(`player-${state.currentIdx}`, `player-${target}`, '箭');
                playCount++;
                await new Promise(r => setTimeout(r, 300));
                attacked = true;
                break;
              }
            }
          }
        }

        const steal = cur.hand.find(c => c.type === CARD_TYPES.STEAL && cur.hand.includes(c));
        if (steal && enemies.length > 0) {
          let target;
          if (isHighLevel && aiAnalysis && aiAnalysis.richEnemy) {
            target = aiAnalysis.richEnemy.idx;
          } else {
            target = enemies[Math.floor(Math.random() * enemies.length)];
          }
          if (useCard(steal, state.currentIdx, target)) {
            await animateCard(`player-${state.currentIdx}`, `player-${target}`, '偷');
            playCount++;
            await new Promise(r => setTimeout(r, 300));
            attacked = true;
          }
        }

        const borrow = cur.hand.find(c => c.type === CARD_TYPES.BORROW && cur.hand.includes(c));
        if (borrow && enemies.length > 0 && aiLevel >= 2) {
          const hasWeapon = enemies.find(i => state.players[i].equip?.weapon);
          const target = hasWeapon || enemies[Math.floor(Math.random() * enemies.length)];
          if (useCard(borrow, state.currentIdx, target)) {
            await animateCard(`player-${state.currentIdx}`, `player-${target}`, '借');
            playCount++;
            await new Promise(r => setTimeout(r, 300));
            attacked = true;
          }
        }

        const lock = cur.hand.find(c => c.type === CARD_TYPES.LOCK && cur.hand.includes(c));
        if (lock && enemies.length > 0 && aiLevel >= 2) {
          let target;
          if (isHighLevel && aiAnalysis) {
            target = aiAnalysis.enemies.sort((a, b) => b.handCount - a.handCount)[0]?.idx;
          }
          if (target === undefined) {
            const highThreat = enemies.find(i => state.players[i].hand.length >= 3);
            target = highThreat || enemies[Math.floor(Math.random() * enemies.length)];
          }
          if (useCard(lock, state.currentIdx, target)) {
            await animateCard(`player-${state.currentIdx}`, `player-${target}`, '锁');
            playCount++;
            await new Promise(r => setTimeout(r, 300));
            attacked = true;
          }
        }

        const probe = cur.hand.find(c => c.type === CARD_TYPES.PROBE && cur.hand.includes(c));
        if (probe && enemies.length > 0) {
          const target = enemies[Math.floor(Math.random() * enemies.length)];
          if (useCard(probe, state.currentIdx, target)) {
            await animateCard(`player-${state.currentIdx}`, `player-${target}`, '探');
            playCount++;
            await new Promise(r => setTimeout(r, 300));
            attacked = true;
          }
        }

        const killCards = cur.hand.filter(c => c.type === CARD_TYPES.KILL);
        if (killCards.length > 0 && enemies.length > 0) {
          let bestTarget;
          if (isHighLevel && aiAnalysis) {
            if (aiAnalysis.vulnerableEnemy) {
              bestTarget = aiAnalysis.vulnerableEnemy.idx;
              addLog(`【智】${cur.name}：${state.players[bestTarget].name}无闪低血，精准击杀`);
            } else if (aiAnalysis.peachEnemy && aiAnalysis.peachEnemy.hp <= 2) {
              bestTarget = aiAnalysis.peachEnemy.idx;
            } else {
              bestTarget = aiAnalysis.enemies.sort((a, b) => a.hp - b.hp)[0]?.idx;
            }
          } else {
            const lowHp = enemies.filter(i => state.players[i].hp <= 2);
            bestTarget = (lowHp.length > 0 ? lowHp : enemies)[Math.floor(Math.random() * (lowHp.length > 0 ? lowHp :
            enemies).length)];
          }
          const kill = killCards[0];
          if (useCard(kill, state.currentIdx, bestTarget)) {
            await animateCard(`player-${state.currentIdx}`, `player-${bestTarget}`, '杀');
            playCount++;
            await new Promise(r => setTimeout(r, 300));
            attacked = true;
          }
        }

        const transfer = cur.hand.find(c => c.type === CARD_TYPES.TRANSFER && cur.hand.includes(c));
        if (transfer && enemies.length > 0 && aiLevel >= 5) {
          const target = enemies[Math.floor(Math.random() * enemies.length)];
          if (useCard(transfer, state.currentIdx, target)) {
            await animateCard(`player-${state.currentIdx}`, `player-${target}`, '炸');
            playCount++;
            await new Promise(r => setTimeout(r, 300));
          }
        }

        if (!attacked && cur.hand.length === hand.length) {
          break;
        }

        if (cur.hand.length === 0) {
          addLog(`${cur.name}手牌已打完`);
          break;
        }
      }

      if (state.pending) {
        return;
      }
      const delay = 300 + Math.random() * 700;
      setTimeout(() => endTurn(), delay);
    }

function getCardValue(card, level) {
      if (!card) return 0;
      const type = card.type;
      const base = {
        'kill': 3, 'dodge': 2, 'peach': 5, 'water': 2, 'harvest': 4, 'probe': 3, 'lock': 4, 'steal': 4,
        'south': 5, 'arrows': 5, 'jueshi': 6, 'duel': 5, 'borrow': 4, 'golden': 8, 'transfer': 7,
        'equip_weapon': 2, 'equip_armor': 2, 'equip_plus1': 1, 'equip_minus1': 1
      };
      let v = base[type] || base[type + '|' + card.sub] || 1;
      if (level >= 3 && type === CARD_TYPES.PEACH) v += 3;
      if (level >= 4 && type === CARD_TYPES.KILL) v += 2;
      return v;
    }

function showTargetPanel(card) {
      const p = document.getElementById('targetPanel');
      const l = document.getElementById('targetList');
      const fi = state.currentIdx;
      const ts = state.players.map((_, i) => i).filter(i => i !== fi && state.players[i].hp > 0 && !sameTeam(fi, i));
      if (ts.length === 0) { addLog('没有合法目标'); return; }
      l.innerHTML = ts.map(i => {
        const p = state.players[i];
        return `<div class="player-card" style="cursor:pointer;min-width:70px;border-color:${getTeamColor(i)}" data-idx="${i}"><div class="player-avatar" style="background:${p.general.color};">${gIcon(p.general)}${avatarImg(p.general)}</div><div style="color:${getTeamColor(i)}">${p.name}</div><div>${svgIcon('heart')}${p.hp}/${p.maxHp}</div></div>`;
      }).join('');
      l.querySelectorAll('.player-card').forEach(el => el.onclick = () => {
        const ti = parseInt(el.dataset.idx);
        useCard(card, fi, ti);
        state.needTarget = null;
        p.style.display = 'none';
        state.selectedCardIdx = null;
        refreshUI();
      });
      document.getElementById('btnCancelTarget').onclick = () => { state.needTarget = null;
        p.style.display = 'none'; };
      p.style.display = 'block';
    }
