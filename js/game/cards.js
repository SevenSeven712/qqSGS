/* ============================================================
 * cards.js — 出牌主流程：useCard（按牌型分派结算）
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function useCard(card, fi, ti) {
      const f = state.players[fi],
        t = state.players[ti];
      if (!f || !t || f.hp <= 0 || t.hp <= 0) return false;
      const ci = f.hand.indexOf(card);
      if (ci === -1) return false;
      state.playersPlayedThisRound.add(fi);

      if (card.cat === 'equip') {
        if (card.sub === 'plus1') {
          if (f.equip.plus1) state.discard.push(f.equip.plus1);
          f.equip.plus1 = card;
          f.hand.splice(ci, 1);
          addLog(`【马】 ${f.name}装备【加一马】，接下来对局多摸1张牌`);
        } else if (card.sub === 'minus1') {
          if (f.equip.minus1) state.discard.push(f.equip.minus1);
          f.equip.minus1 = card;
          f.hand.splice(ci, 1);
          addLog(`【马】 ${f.name}装备【减一马】，接下来对局对方少摸1张牌`);
        } else {
          if (f.equip[card.sub]) state.discard.push(f.equip[card.sub]);
          f.equip[card.sub] = card;
          f.hand.splice(ci, 1);
          addLog(`${f.name}装备【${card.name}】`);
        }
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.WATER) {
        f.hand.splice(ci, 1);
        let removed = false;
        addLog(`【水】 ${f.name}使用【水】！`);
        animateCard(`player-${fi}`, null, '水');
        if (f.equip.minus1) {
          state.discard.push(f.equip.minus1);
          addLog(`  ${f.name}的【减一马】被丢弃`);
          floatText(`player-${fi}`, '-马', '#4a90c8');
          f.equip.minus1 = null;
          removed = true;
        }
        state.players.forEach((p, i) => {
          if (i === fi || p.hp <= 0) return;
          if (sameTeam(fi, i)) return;
          if (p.equip.plus1) {
            state.discard.push(p.equip.plus1);
            addLog(`  ${p.name}的【加一马】被丢弃`);
            floatText(`player-${i}`, '-马', '#4a90c8');
            p.equip.plus1 = null;
            removed = true;
          }
          if (p.locked) {
            p.locked = false;
            addLog(`  ${p.name}的【锁定】被解除`);
            floatText(`player-${i}`, '解除', '#4a90c8');
            removed = true;
          }
        });
        if (!removed) {
          addLog(`  场上没有可清除的效果`);
        }
        if (f.general && (f.general.id === 'qiyuyang' || f.general.id === 'wangxiaoxi') && f.hp < f.maxHp) {
          f.hp = Math.min(f.hp + 1, f.maxHp);
          const waterSkillName = f.general.id === 'qiyuyang' ? '水龙王' : '等我喝完2L雪碧';
          addLog(`【${waterSkillName}】${f.name}使用水回复1点体力`);
          floatText(`player-${fi}`, '+1', '#66cc66');
        }
        refreshUI();
        checkVictory();
        return true;
      }

      if (card.type === CARD_TYPES.PEACH) {
        if (f.hp >= f.maxHp) {
          addLog(`【桃】 ${f.name}体力已满，无法使用【桃】`);
          return false;
        }
        f.hand.splice(ci, 1);
        f.hp++;
        addLog(`【桃】 ${f.name}使用【桃】回复1点体力`);
        floatText(`player-${fi}`, '+1', '#44ff44');
        animateCard(`player-${fi}`, null, '桃');
        refreshUI();
        checkVictory();
        return true;
      }

      if (card.type === CARD_TYPES.KILL) {
        if (f.general && f.general.id === 'jiahao') {
          f.hand.splice(ci, 1);
          addLog(`【雨中之人】${f.name}将【杀】转为【万箭齐发】`);
          state.playersPlayedThisRound.add(fi);
          processAoe(CARD_TYPES.ARROWS, fi);
          refreshUI();
          return true;
        }
        f.hand.splice(ci, 1);
        addLog(`【杀】 ${f.name}对${t.name}使用【杀】`);
        animateCard(`player-${fi}`, `player-${ti}`, '杀');
        if (isLocal(ti) || (typeof netIsRemoteSeat === 'function' && netIsRemoteSeat(ti))) {
          const oi = state.currentIdx;
          state.currentIdx = ti;
          state.pending = { type: 'respond_kill', from: fi, to: ti, originalIdx: oi };
        } else aiRespondKill(ti, fi);
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.HARVEST) {
        f.hand.splice(ci, 1);
        addLog(`【丰】 ${f.name}使用【丰收】！全场各获得1张牌`);
        showHarvestEffect(fi);
        state.players.forEach((p, i) => {
          if (p.hp > 0) {
            const drawn = drawCards(1);
            if (drawn.length > 0) {
              p.hand.push(...drawn);
              addLog(`  ${p.name}摸了1张牌`);
              floatText(`player-${i}`, '+1张', '#2a2520');
            }
          }
        });
        refreshUI();
        checkVictory();
        return true;
      }

      if (card.type === CARD_TYPES.PROBE) {
        f.hand.splice(ci, 1);
        addLog(`【探】 ${f.name}对${t.name}使用【探试】！`);
        animateCard(`player-${fi}`, `player-${ti}`, '探');
        if (isLocal(fi)) {
          showProbeModal(fi, ti);
        } else {
          if (t.hand.length > 0) {
            const randomIdx = Math.floor(Math.random() * t.hand.length);
            const stolenCard = t.hand.splice(randomIdx, 1)[0];
            f.hand.push(stolenCard);
            addLog(`  ${f.name}获得了${t.name}的【${stolenCard.name}】`);
          }
        }
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.LOCK) {
        if (!fuchenhaoLockProtect(fi, ti)) {
          f.hand.splice(ci, 1);
          state.discard.push(card);
          refreshUI();
          return true;
        }
        f.hand.splice(ci, 1);
        addLog(`【锁】 ${f.name}对${t.name}使用【锁定】！`);
        animateCard(`player-${fi}`, `player-${ti}`, '锁');
        showLockJudge(ti, isLocal(ti));
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.STEAL) {
        f.hand.splice(ci, 1);
        addLog(`【偷】 ${f.name}对${t.name}使用【偷】！`);
        animateCard(`player-${fi}`, `player-${ti}`, '偷');
        if (t.hand.length > 0) {
          const randomIdx = Math.floor(Math.random() * t.hand.length);
          const stolenCard = t.hand.splice(randomIdx, 1)[0];
          f.hand.push(stolenCard);
          addLog(`  ${f.name}偷走了${t.name}的【${stolenCard.name}】`);
        } else {
          addLog(`  ${t.name}没有手牌，偷取失败`);
        }
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.SOUTH) {
        f.hand.splice(ci, 1);
        addLog('【南】 南蛮入侵！');
        processAoe('south', fi);
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.ARROWS) {
        f.hand.splice(ci, 1);
        addLog('【万】 万箭齐发！');
        processAoe('arrows', fi);
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.JUESHI) {
        f.hand.splice(ci, 1);
        addLog(`【园】 ${f.name}使用【桃园三结义】！全体玩家恢复1点体力`);
        animateCard(`player-${fi}`, null, '桃园');
        state.players.forEach((p, i) => {
          if (p.hp > 0 && p.hp < p.maxHp) {
            p.hp++;
            floatText(`player-${i}`, '+1', '#44ff44');
            addLog(`  ${p.name}恢复了1点体力`);
          }
        });
        refreshUI();
        checkVictory();
        return true;
      }

      if (card.type === CARD_TYPES.DUEL) {
        f.hand.splice(ci, 1);
        addLog(`【杀】 ${f.name}对${t.name}使用【决斗】！`);
        animateCard(`player-${fi}`, `player-${ti}`, '斗');
        resolveDuel(fi, ti);
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.BORROW) {
        f.hand.splice(ci, 1);
        addLog(`【借】 ${f.name}对${t.name}使用【借刀杀人】！`);
        animateCard(`player-${fi}`, `player-${ti}`, '借刀');
        floatText(`player-${ti}`, '借刀', '#c84a4a');
        const hasKill = t.hand.some(c => c.type === CARD_TYPES.KILL);
        if (isLocal(ti)) {
          showBorrowModal(fi, ti);
        } else {
          if (hasKill) {
            const targetIdx = state.players.findIndex((p, i) => i !== ti && p.hp > 0 && !sameTeam(ti, i));
            if (targetIdx >= 0) {
              const killIdx = t.hand.findIndex(c => c.type === CARD_TYPES.KILL);
              if (killIdx >= 0) {
                const killCard = t.hand.splice(killIdx, 1)[0];
                addLog(`  ${t.name}出【杀】攻击${state.players[targetIdx].name}`);
                floatText(`player-${ti}`, '杀', '#c84a4a');
                useCard(killCard, ti, targetIdx);
              }
            }
          } else {
            const equipSlots = ['plus1', 'minus1', 'weapon', 'armor'];
            let equipped = null;
            for (const slot of equipSlots) {
              if (t.equip[slot]) {
                equipped = slot;
                break;
              }
            }
            if (equipped) {
              const discarded = t.equip[equipped];
              state.discard.push(discarded);
              t.equip[equipped] = null;
              addLog(`  ${t.name}丢弃了装备【${discarded.name}】`);
              floatText(`player-${ti}`, `-${discarded.name}`, '#b3362b');
            } else {
              addLog(`  ${t.name}没有装备牌可丢弃`);
            }
          }
        }
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.GOLDEN) {
        f.hand.splice(ci, 1);
        f.goldenShield = true;
        addLog(`【护】 ${f.name}使用【金蝉护法】，免疫下次伤害或负面效果`);
        showGoldenEffect(fi);
        refreshUI();
        return true;
      }

      if (card.type === CARD_TYPES.TRANSFER) {
        f.hand.splice(ci, 1);
        if (f.waterShield) {
          f.waterShield = false;
          addLog(`【水】 ${f.name}的【水】抵消了【炸弹】效果！`);
          floatText(`player-${fi}`, '免疫', '#4a90c8');
          refreshUI();
          return true;
        }
        const isAi = !isLocal(fi);
        const cardSuit = card.suit || '';
        const cardIsBlack = cardSuit === '♠' || cardSuit === '♣';
        const forceHit = isAi && getMatchLevel() >= 4 && cardIsBlack;
        if (forceHit) {
          addLog(`【炸】 ${f.name}使用【炸弹】！（精准命中）`);
          animateCard(`player-${fi}`, null, '炸弹');
          state.transferForceHit = true;
          processTransfer(fi);
          refreshUI();
          return true;
        }
        addLog(`【炸】 ${f.name}使用【炸弹】！炸弹开始传递！`);
        animateCard(`player-${fi}`, null, '炸弹');
        state.transferForceHit = false;
        processTransfer(fi);
        refreshUI();
        return true;
      }

      refreshUI();
      checkVictory();
      return true;
    }
