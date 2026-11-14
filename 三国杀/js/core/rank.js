/* ============================================================
 * rank.js — 随机昵称、段位生成、AI 强度推导
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function getRandomName() {
      return AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
    }

function getRandomRank() {
      const weights = [30, 25, 20, 15, 8, 2];
      const r = Math.random() * 100;
      let sum = 0;
      for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (r < sum) return RANKS[i];
      }
      return '青铜';
    }

function getOpponentRank(playerRank) {
      const pIdx = RANKS.indexOf(playerRank);
      if (pIdx === -1) return playerRank;
      const min = Math.max(0, pIdx - 2);
      const max = Math.min(RANKS.length - 1, pIdx + 2);
      if (Math.random() < 0.7 && pIdx >= min && pIdx <= max) return RANKS[pIdx];
      const idx = min + Math.floor(Math.random() * (max - min + 1));
      return RANKS[idx];
    }

function getMatchLevel() {
      return Math.max(0, RANKS.indexOf(getPlayerRank()));
    }

function getAiRankLevel(aiIdx) {
      if (!state.players || !state.players[aiIdx]) return 0;
      const rank = state.players[aiIdx].rank || '青铜';
      return Math.max(0, RANKS.indexOf(rank));
    }

function aiCanSeeAllHands(aiIdx) {
      return getAiRankLevel(aiIdx) >= 4;
    }

function aiAnalyzeBestPlay(aiIdx) {
      if (!aiCanSeeAllHands(aiIdx)) return null;
      const cur = state.players[aiIdx];
      const enemies = state.players.map((p, i) => ({
        idx: i,
        hp: p.hp,
        hand: p.hand,
        hasDodge: p.hand.some(c => c.type === CARD_TYPES.DODGE),
        hasPeach: p.hand.some(c => c.type === CARD_TYPES.PEACH),
        hasKill: p.hand.some(c => c.type === CARD_TYPES.KILL),
        handCount: p.hand.length,
        isEnemy: i !== aiIdx && p.hp > 0 && !sameTeam(aiIdx, i)
      })).filter(e => e.isEnemy);
      const vulnerableEnemy = enemies.filter(e => !e.hasDodge && e.hp <= 2).sort((a, b) => a.hp - b.hp)[0];
      const richEnemy = enemies.sort((a, b) => b.handCount - a.handCount)[0];
      const peachEnemy = enemies.filter(e => e.hasPeach)[0];
      return { vulnerableEnemy, richEnemy, peachEnemy, enemies };
    }

function getRankBonus(rank) {
      const bonuses = { '青铜': 0.8, '白银': 0.9, '黄金': 1.0, '铂金': 1.1, '钻石': 1.2, '王者': 1.3 };
      return bonuses[rank] || 1.0;
    }
