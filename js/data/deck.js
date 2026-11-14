/* ============================================================
 * deck.js — 牌堆构建
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function createDeck() {
      const c = [];
      for (let i = 0; i < 18; i++) c.push({ type: CARD_TYPES.KILL, name: '杀', suit: SUITS[i % 4], cat: 'basic',
        desc: '对敌方阵营造成1点伤害' });
      for (let i = 0; i < 12; i++) c.push({ type: CARD_TYPES.DODGE, name: '闪', suit: SUITS[i % 4], cat: 'basic',
        desc: '免疫1次敌方杀造成的伤害' });
      for (let i = 0; i < 8; i++) c.push({ type: CARD_TYPES.WATER, name: '水', suit: SUITS[i % 4], cat: 'basic',
        desc: '抵消1次负面效果（决斗、探试、锁定、偷、南蛮入侵、万箭齐发、借刀杀人、减一马）' });
      for (let i = 0; i < 6; i++) c.push({ type: CARD_TYPES.PEACH, name: '桃', suit: SUITS[i % 4], cat: 'basic',
        desc: '回复1点体力' });
      c.push({ type: CARD_TYPES.HARVEST, name: '丰收', suit: '♠', cat: 'trick', desc: '全场所有玩家各获得1张牌' });
      c.push({ type: CARD_TYPES.HARVEST, name: '丰收', suit: '♥', cat: 'trick', desc: '全场所有玩家各获得1张牌' });
      c.push({ type: CARD_TYPES.PROBE, name: '探试', suit: '♠', cat: 'trick', desc: '命令1名玩家展示手牌，可丢弃2张己方手牌换取对方其中1张' });
      c.push({ type: CARD_TYPES.PROBE, name: '探试', suit: '♥', cat: 'trick', desc: '命令1名玩家展示手牌，可丢弃2张己方手牌换取对方其中1张' });
      c.push({ type: CARD_TYPES.LOCK, name: '锁定', suit: '♠', cat: 'trick',
        desc: '进行判定，若为红色，被使用者本回合无法出牌，下回合也无法摸牌，且获得2张牌' });
      c.push({ type: CARD_TYPES.LOCK, name: '锁定', suit: '♥', cat: 'trick',
        desc: '进行判定，若为红色，被使用者本回合无法出牌，下回合也无法摸牌，且获得2张牌' });
      for (let i = 0; i < 3; i++) c.push({ type: CARD_TYPES.STEAL, name: '偷', suit: SUITS[i % 4], cat: 'trick',
        desc: '随机获取1张他人的牌' });
      c.push({ type: CARD_TYPES.SOUTH, name: '南蛮入侵', suit: '♠', cat: 'trick',
        desc: '所有玩家需打出杀，未打出则受到1点伤害（出牌人除外）' });
      c.push({ type: CARD_TYPES.SOUTH, name: '南蛮入侵', suit: '♣', cat: 'trick',
        desc: '所有玩家需打出杀，未打出则受到1点伤害（出牌人除外）' });
      c.push({ type: CARD_TYPES.ARROWS, name: '万箭齐发', suit: '♥', cat: 'trick',
        desc: '所有玩家需打出闪，未打出则受到1点伤害（出牌人除外）' });
      c.push({ type: CARD_TYPES.ARROWS, name: '万箭齐发', suit: '♦', cat: 'trick',
        desc: '所有玩家需打出闪，未打出则受到1点伤害（出牌人除外）' });
      c.push({ type: CARD_TYPES.JUESHI, name: '桃园三结义', suit: '♥', cat: 'trick', desc: '全体玩家恢复1点体力' });
      c.push({ type: CARD_TYPES.JUESHI, name: '桃园三结义', suit: '♦', cat: 'trick', desc: '全体玩家恢复1点体力' });
      c.push({ type: CARD_TYPES.DUEL, name: '决斗', suit: '♠', cat: 'trick', desc: '从对方开始，双方互相出杀，首先不出杀者扣1点体力' });
      c.push({ type: CARD_TYPES.DUEL, name: '决斗', suit: '♦', cat: 'trick', desc: '从对方开始，双方互相出杀，首先不出杀者扣1点体力' });
      c.push({ type: CARD_TYPES.BORROW, name: '借刀杀人', suit: '♠', cat: 'trick', desc: '使被使用者出1张杀攻击指定目标，或使其丢弃1张装备牌' });
      c.push({ type: CARD_TYPES.BORROW, name: '借刀杀人', suit: '♥', cat: 'trick', desc: '使被使用者出1张杀攻击指定目标，或使其丢弃1张装备牌' });
      c.push({ type: CARD_TYPES.GOLDEN, name: '金蝉护法', suit: '♠', cat: 'trick', desc: '免疫1张牌的任何Buff与伤害' });
      c.push({ type: CARD_TYPES.GOLDEN, name: '金蝉护法', suit: '♥', cat: 'trick', desc: '免疫1张牌的任何Buff与伤害' });
      c.push({ type: CARD_TYPES.TRANSFER, name: '炸弹', suit: '♣', cat: 'trick', desc: '在所有玩家间交替传递，黑色方片造成3点伤害' });
      c.push({ type: CARD_TYPES.TRANSFER, name: '炸弹', suit: '♦', cat: 'trick', desc: '在所有玩家间交替传递，黑色方片造成3点伤害' });
      c.push({ type: 'equip', name: '加一马', suit: '♥', cat: 'equip', sub: 'plus1', desc: '接下来的对局中多摸1张牌' });
      c.push({ type: 'equip', name: '加一马', suit: '♦', cat: 'equip', sub: 'plus1', desc: '接下来的对局中多摸1张牌' });
      c.push({ type: 'equip', name: '减一马', suit: '♠', cat: 'equip', sub: 'minus1', desc: '对方接下来的对局中少摸1张牌' });
      c.push({ type: 'equip', name: '减一马', suit: '♣', cat: 'equip', sub: 'minus1', desc: '对方接下来的对局中少摸1张牌' });
      c.push({ type: 'equip', name: '青龙刀', suit: '♠', cat: 'equip', sub: 'weapon', range: 2, desc: '攻击范围2' });
      c.push({ type: 'equip', name: '丈八蛇矛', suit: '♠', cat: 'equip', sub: 'weapon', range: 3, desc: '攻击范围3' });
      c.push({ type: 'equip', name: '方天画戟', suit: '♠', cat: 'equip', sub: 'weapon', range: 4, desc: '攻击范围4' });
      c.push({ type: 'equip', name: '八卦阵', suit: '♣', cat: 'equip', sub: 'armor', desc: '需出闪时可判定' });
      c.push({ type: 'equip', name: '藤甲', suit: '♦', cat: 'equip', sub: 'armor', desc: '免疫南蛮和万箭的伤害' });
      return c;
    }
