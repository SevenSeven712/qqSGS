/* ============================================================
 * generals.js — 七七三国杀 · 武将数据 + 技能
 *
 * 加武将 / 改技能 / 调平衡：只改这个文件
 * index.html 里所有同名调用会自动找到 window 上的函数
 * ============================================================ */

/* ------------------------------------------------------------
 * 基础常量（原来在 index.html 的 IIFE 里，现在搬到这里）
 * ------------------------------------------------------------ */
const SUITS = ['♠', '♥', '♣', '♦'];
const SUIT_COLOR = { '♠': 'black', '♥': 'red', '♣': 'black', '♦': 'red' };

function generalImg(prompt) {
  return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
    encodeURIComponent(prompt) + '&image_size=square_hd';
}

/* ------------------------------------------------------------
 * 1. 武将数据
 * ------------------------------------------------------------ */
const GENERALS = [
  {
    id: 'guanyu',
    name: '关羽',
    icon: 'blade',
    img: generalImg(
      'Portrait of Guan Yu, Chinese three kingdoms general, red face, long black beard, green robe, holding Green Dragon Crescent Blade, traditional Chinese painting style, epic, dramatic lighting, character portrait'
    ),
    hp: 4,
    skill: '武圣',
    desc: '红色手牌可当【杀】使用',
    color: '#6a2a20',
    faction: 'classic'
  },
  {
    id: 'zhangfei',
    name: '张飞',
    icon: 'paw',
    img: generalImg(
      'Portrait of Zhang Fei, Chinese three kingdoms fierce general, black face, round eyes, leopard head, dark armor, holding Snake Spear, traditional Chinese ink painting style, powerful, dramatic'
    ),
    hp: 4,
    skill: '咆哮',
    desc: '出杀无次数限制',
    color: '#5a1a10',
    faction: 'classic'
  },
  {
    id: 'zhaoyun',
    name: '赵云',
    icon: 'horseshoe',
    img: generalImg(
      'Portrait of Zhao Yun, Chinese three kingdoms general, handsome face, white armor, silver spear, riding white horse, traditional Chinese painting, heroic, noble, epic lighting'
    ),
    hp: 4,
    skill: '龙胆',
    desc: '杀当闪，闪当杀',
    color: '#3a3a6a',
    faction: 'classic'
  },
  {
    id: 'caocao',
    name: '曹操',
    icon: 'crown',
    img: generalImg(
      'Portrait of Cao Cao, Chinese three kingdoms warlord, cunning eyes, short beard, dark red imperial robe, holding a sword, traditional Chinese painting, authoritative, ambitious, dramatic'
    ),
    hp: 3,
    skill: '奸雄',
    desc: '受伤得伤害牌',
    color: '#2a4a6a',
    faction: 'classic'
  },
  {
    id: 'sunquan',
    name: '孙权',
    icon: 'anchor',
    img: generalImg(
      'Portrait of Sun Quan, Chinese three kingdoms emperor, young face, purple beard, blue imperial robe, standing by river, traditional Chinese painting, noble, calm, majestic'
    ),
    hp: 4,
    skill: '制衡',
    desc: '弃牌摸等量',
    color: '#3a6a3a',
    faction: 'classic'
  },
  {
    id: 'zhouyu',
    name: '周瑜',
    icon: 'flame',
    img: generalImg(
      'Portrait of Zhou Yu, Chinese three kingdoms strategist, handsome elegant face, white robe, holding a fan, traditional Chinese painting, scholarly, intelligent, dramatic lighting'
    ),
    hp: 3,
    skill: '英姿',
    desc: '摸牌多一张',
    color: '#4a3a20',
    faction: 'classic'
  },
  {
    id: 'qiyuyang',
    name: '戚雨杨',
    icon: 'wave',
    img: './assets/generals/qiyuyang.png',
    hp: 4,
    skill: '水龙王 / 人有一手',
    desc: '水回血；血量转手牌(上限4)',
    color: '#1a4a6a',
    faction: 'student',
    skills: [
      { name: '水龙王', desc: '使用【水】可以为自身回复1点体力', type: 'passive' },
      { name: '人有一手', desc: '将剩余血量转化为等量手牌（手牌上限4张）', type: 'active' },
      { name: '聪明反被聪明误', desc: '摸牌上限只能为4张', type: 'passive' }
    ]
  },
  {
    id: 'fuchenhao',
    name: '付晨浩',
    icon: 'burger',
    img: generalImg(
      'Portrait of a young Chinese student named Fu Chenhao, food delivery theme, holding a takeout box, casual hoodie, snack beside him, cute anime style, warm lighting, street food background'
    ),
    hp: 3,
    skill: '点外卖 / 藏起来我也能找到',
    desc: '伤害后判定得牌；锁敌需弃牌',
    color: '#6a5a1a',
    faction: 'student',
    skills: [
      { name: '点外卖', desc: '对一名玩家造成伤害后进行判定，若判定牌为杀/闪/水，可获得该判定牌', type: 'passive' },
      { name: '藏起来我也能找到', desc: '敌方对你使用【锁定】必须丢弃1张牌', type: 'passive' }
    ]
  },
  {
    id: 'maochenhao',
    name: '毛晨浩',
    icon: 'dumbbell',
    img: generalImg(
      'Portrait of a muscular young Chinese student named Mao Chenhao, strong physique, workout clothes, determined face, full power aura, anime style, dynamic pose, dramatic lighting'
    ),
    hp: 5,
    skill: '满血之力',
    desc: '受伤后上限变4；满血伤害翻倍',
    color: '#5a2a4a',
    faction: 'student',
    skills: [
      { name: '不屈', desc: '受到伤害后血量上限变为4', type: 'passive' },
      { name: '满血之力', desc: '血量为5时所有牌伤害翻倍；血量为4时仅【杀】伤害翻倍', type: 'passive' }
    ]
  },
  {
    id: 'wangxiaoxi',
    name: '王小西',
    icon: 'sleep',
    img: generalImg(
      'Portrait of a lazy young Chinese student named Wang Xiaoxi, sleepy eyes, yawning, messy hair, pajamas, lying on desk, anime style, relaxed atmosphere, soft lighting'
    ),
    hp: 5,
    skill: '懒',
    desc: '杀被闪后可弃2牌强制命中',
    color: '#4a5a2a',
    faction: 'student',
    skills: [
      { name: '懒', desc: '若你的【杀】被闪抵消，可丢弃2张牌令该杀强制命中', type: 'passive' }
    ]
  },
  {
    id: 'xiaoming',
    name: '小明',
    icon: 'shield',
    img: generalImg(
      'Portrait of a young Chinese student named Xiao Ming, shield bearer, defensive stance, holding a large shield, calm expression, anime style, metal armor, protective aura, blue lighting'
    ),
    hp: 5,
    skill: '济南捞子',
    desc: '无手牌时免疫杀和决斗',
    color: '#2a5a4a',
    faction: 'student',
    skills: [
      { name: '济南捞子', desc: '若你没有手牌，其他玩家对你使用的【杀】和【决斗】都不能造成伤害', type: 'passive' }
    ]
  },
  {
    id: 'xiaoxueba',
    name: '肖学霸',
    icon: 'books',
    img: generalImg(
      'Portrait of a studious young Chinese student named Xiao Xueba, wearing glasses, holding books, serious academic look, library background, anime style, intelligent focused expression, warm lighting'
    ),
    hp: 3,
    skill: '弃牌反制 / 吸血',
    desc: '受伤可弃敌2牌；炸弹可传',
    color: '#3a3a5a',
    faction: 'student',
    skills: [
      { name: '弃牌反制', desc: '当你被一名玩家造成伤害时，可打出一张【拆】，令其丢弃2张牌', type: 'active' },
      { name: '吸血', desc: '被炸弹击中时，可丢弃3张牌将炸弹传给下家并重新判定', type: 'active' }
    ]
  },
  {
    id: 'jiahao',
    name: '家豪',
    icon: 'umbrella',
    img: generalImg(
      'Portrait of a young Chinese student named Jia Hao, rain theme, holding an umbrella, raincoat, standing in rain, water splashing around, anime style, mysterious expression, blue-gray moody lighting'
    ),
    hp: 4,
    skill: '雨中之人 / 防御万箭齐发2',
    desc: '杀=万箭；首回合免疫',
    color: '#2a3a5a',
    faction: 'student',
    skills: [
      { name: '雨中之人', desc: '你打出【杀】都视为打出【万箭齐发】', type: 'passive' },
      { name: '防御万箭齐发2', desc: '开局第一回合，没有人能攻击并对你造成伤害', type: 'passive' }
    ]
  }
];

/* ------------------------------------------------------------
 * 2. 技能实现
 *    —— 这里的函数会被挂到 window 上，
 *       index.html 里所有同名调用会自动生效
 * ------------------------------------------------------------ */
const SKILLS = {

  /* ========== 毛晨浩 ========== */
  maochenhaoDmgMultiplier(idx, cardType) {
    const p = state.players[idx];
    if (!p || p.hp <= 0 || p.general.id !== 'maochenhao') return 1;
    if (p.hp === 5) return 2;
    if (p.hp === 4 && cardType === 'kill') return 2;
    return 1;
  },

  maochenhaoAfterDamage(idx) {
    const p = state.players[idx];
    if (!p || p.hp <= 0 || p.general.id !== 'maochenhao') return;
    if (p.maxHp > 4) {
      p.maxHp = 4;
      if (p.hp > 4) p.hp = 4;
      addLog(`【不屈】${p.name}的血量上限变为4`);
    }
  },

  /* ========== 付晨浩 ========== */
  fuchenhaoJudge(fromIdx) {
    const f = state.players[fromIdx];
    if (!f || f.hp <= 0 || f.general.id !== 'fuchenhao') return;
    if (state.deck.length === 0) return;
    const judgeCard = state.deck.pop();
    addLog(`【点外卖】判定牌：${judgeCard.name}(${judgeCard.suit})`);
    if (judgeCard.type === 'kill' || judgeCard.type === 'dodge' || judgeCard.type === 'water') {
      f.hand.push(judgeCard);
      addLog(`  ${f.name}获得判定牌【${judgeCard.name}】`);
    } else {
      state.discard.push(judgeCard);
    }
  },

  fuchenhaoLockProtect(attackerIdx, targetIdx) {
    const t = state.players[targetIdx];
    if (!t || t.hp <= 0 || t.general.id !== 'fuchenhao') return true;
    const f = state.players[attackerIdx];
    if (f.hand.length === 0) {
      addLog(`【藏起来我也能找到】${f.name}没有牌可弃，锁定${t.name}失败`);
      return false;
    }
    const discardCard = f.hand.splice(0, 1)[0];
    state.discard.push(discardCard);
    addLog(`【藏起来我也能找到】${f.name}弃置1张牌才能锁定${t.name}`);
    return true;
  },

  /* ========== 小明 ========== */
  xiaomingImmune(idx, cardType) {
    const p = state.players[idx];
    if (!p || p.hp <= 0 || p.general.id !== 'xiaoming') return false;
    if (p.hand.length === 0) {
      addLog(`【济南捞子】${p.name}无手牌，免疫此${cardType === 'kill' ? '杀' : '决斗'}`);
      return true;
    }
    return false;
  },

  /* ========== 家豪 ========== */
  jiahaoProtect(idx) {
    const p = state.players[idx];
    if (!p || p.hp <= 0 || p.general.id !== 'jiahao') return false;
    if (state.roundNumber <= 1) {
      addLog(`【防御万箭齐发2】${p.name}首回合免疫伤害`);
      floatText(`player-${idx}`, '免疫', '#88ccff');
      return true;
    }
    return false;
  },

  /* ========== 戚雨杨 ========== */
  qiyuyangDrawLimit(idx, n) {
    const p = state.players[idx];
    if (!p || p.hp <= 0 || p.general.id !== 'qiyuyang') return n;
    return Math.min(n, 4);
  },

  useQiyuyangSkill() {
    const cur = getCur();
    if (!cur || cur.hp <= 0) return;
    const drawCount = Math.min(cur.hp, 4);
    const discarded = cur.hand.splice(0, cur.hand.length);
    discarded.forEach(c => state.discard.push(c));
    addLog(`【人有一手】${cur.name}弃置所有手牌，摸${drawCount}张牌`);
    cur.hand.push(...drawCards(drawCount));
    refreshUI();
  },

  /* ========== 王小西 ========== */
  wangxiaoxiLazyForce(attackerIdx, targetIdx) {
    const f = state.players[attackerIdx];
    if (!f || f.hp <= 0 || f.general.id !== 'wangxiaoxi') return;
    if (f.hand.length < 2) {
      addLog(`【懒】${f.name}手牌不足2张，无法强制命中`);
      return;
    }
    const discarded = f.hand.splice(0, 2);
    discarded.forEach(c => state.discard.push(c));
    addLog(`【懒】${f.name}弃置2张牌，杀强制命中！`);
    const t = state.players[targetIdx];
    if (!t || t.hp <= 0) return;
    let dmg = 1;
    const mult = maochenhaoDmgMultiplier(attackerIdx, 'kill');
    dmg *= mult;
    t.hp = Math.max(0, t.hp - dmg);
    floatText(`player-${targetIdx}`, `-${dmg}`, '#ff4444');
    shakePlayerCard(targetIdx);
    addLog(`  ${t.name}受到${dmg}点伤害`);
    if (t.hp <= 0) eliminate(targetIdx);
    fuchenhaoJudge(attackerIdx);
    maochenhaoAfterDamage(targetIdx);
  },

  /* ========== 肖学霸 ========== */
  xiaoxuebaCounter(damagerIdx, damagedIdx) {
    const damaged = state.players[damagedIdx];
    if (!damaged || damaged.hp <= 0 || damaged.general.id !== 'xiaoxueba') return;
    const chaiIdx = damaged.hand.findIndex(c => c.type === 'chai');
    if (chaiIdx < 0) return;
    damaged.hand.splice(chaiIdx, 1);
    state.discard.push({ type: 'chai', name: '拆' });
    const attacker = state.players[damagerIdx];
    if (attacker && attacker.hand.length > 0) {
      const toDiscard = attacker.hand.splice(0, Math.min(2, attacker.hand.length));
      toDiscard.forEach(c => state.discard.push(c));
      addLog(`【弃牌反制】${damaged.name}让${attacker.name}丢弃${toDiscard.length}张牌`);
      floatText(`player-${damagedIdx}`, '反制', '#ff8844');
    }
  },

  xiaoxuebaVampire(idx) {
    const p = state.players[idx];
    if (!p || p.hp <= 0 || p.general.id !== 'xiaoxueba') return false;
    if (p.hand.length < 3) {
      addLog(`【吸血】${p.name}手牌不足3张，无法转移炸弹`);
      return false;
    }
    const discarded = p.hand.splice(0, 3);
    discarded.forEach(c => state.discard.push(c));
    addLog(`【吸血】${p.name}丢弃3张牌，将炸弹传给下家`);
    floatText(`player-${idx}`, '吸血', '#cc44ff');
    return true;
  },

  /* ========== 主动技能面板 ========== */
  showMySkillPanel() {
    const cur = getCur();
    if (!cur || cur.hp <= 0) {
      addLog('你已阵亡，无法使用技能');
      return;
    }
    const rc = RANK_COLORS[cur.rank] || '#fff';
    let skillDesc = '';
    let canUse = false;
    let useSkill = '';
    if (cur.general.id === 'guanyu') {
      const hasRed = cur.hand.some(c => SUIT_COLOR[c.suit] === 'red' && c.type !== 'kill');
      canUse = hasRed;
      useSkill = 'useGuanyuSkill()';
      skillDesc = `${cur.general.desc}<br><br>当前可使用：${hasRed?dotIcon(true)+' 有红色手牌':dotIcon(false)+' 无红色手牌'}`;
    } else if (cur.general.id === 'zhangfei') {
      canUse = true;
      useSkill = 'useZhangfeiSkill()';
      skillDesc = `${cur.general.desc}<br><br>当前可使用：${dotIcon(true)} 你的【杀】无次数限制`;
    } else if (cur.general.id === 'zhaoyun') {
      const hasCard = cur.hand.some(c => c.type === 'kill' || c.type === 'dodge');
      canUse = hasCard;
      useSkill = 'useZhaoyunSkill()';
      skillDesc = `${cur.general.desc}<br><br>当前可使用：${hasCard?dotIcon(true)+' 有杀或闪':dotIcon(false)+' 无杀无闪'}`;
    } else if (cur.general.id === 'caocao') {
      canUse = false;
      skillDesc = `${cur.general.desc}<br><br>被动技能：受伤时自动获得伤害牌`;
    } else if (cur.general.id === 'sunquan') {
      const hasCard = cur.hand.length > 0;
      canUse = hasCard;
      useSkill = 'useSunquanSkill()';
      skillDesc = `${cur.general.desc}<br><br>当前可使用：${hasCard?dotIcon(true)+' 有手牌可弃':dotIcon(false)+' 手牌为空'}`;
    } else if (cur.general.id === 'zhouyu') {
      canUse = false;
      skillDesc = `${cur.general.desc}<br><br>被动技能：摸牌阶段多摸一张`;
    } else if (cur.general.id === 'qiyuyang') {
      skillDesc =
        `${cur.general.desc}<br><br>· 水龙王：使用水回复1点体力（被动）<br>· 人有一手：弃所有手牌，摸等同于血量（上限4）的牌<br>· 聪明反被聪明误：摸牌上限4（被动）`;
      canUse = cur.hand.length > 0;
      useSkill = 'useQiyuyangSkill()';
    } else if (cur.general.id === 'fuchenhao') {
      canUse = false;
      skillDesc =
        `${cur.general.desc}<br><br>· 点外卖：造成伤害后判定，杀/闪/水则获得该牌（被动）<br>· 藏起来我也能找到：被锁定时让对方弃1牌（被动）`;
    } else if (cur.general.id === 'maochenhao') {
      canUse = false;
      skillDesc =
        `${cur.general.desc}<br><br>· 不屈：受伤后血量上限变为4（被动）<br>· 满血之力：血量为5时全伤害翻倍；血量为4时仅杀翻倍（被动）`;
    } else if (cur.general.id === 'wangxiaoxi') {
      canUse = false;
      skillDesc = `${cur.general.desc}<br><br>· 懒：杀被闪后可弃2牌强制命中（被动）`;
    } else if (cur.general.id === 'xiaoming') {
      canUse = false;
      skillDesc = `${cur.general.desc}<br><br>· 济南捞子：无手牌时免疫杀和决斗（被动）`;
    } else if (cur.general.id === 'xiaoxueba') {
      canUse = false;
      skillDesc =
        `${cur.general.desc}<br><br>· 弃牌反制：受伤时可打出一张拆让攻击者弃2牌（被动）<br>· 吸血：被炸弹击中时可弃3牌转移炸弹（被动）`;
    } else if (cur.general.id === 'jiahao') {
      canUse = false;
      skillDesc =
        `${cur.general.desc}<br><br>· 雨中之人：杀视为万箭齐发（被动）<br>· 防御万箭齐发2：第一回合免疫所有伤害（被动）`;
    }
    document.getElementById('playerInfoContent').innerHTML = `
        <h3 style="color:${rc};">${gIcon(cur.general)} ${cur.general.name}</h3>
        <div style="background:#2a1a10;padding:10px;border-radius:12px;margin-bottom:10px;">
          <p><b>技能：</b>${cur.general.skill}</p>
          <p style="color:#b8a080;">${skillDesc}</p>
        </div>
        ${canUse?`<button class="btn" onclick="${useSkill};document.getElementById('playerInfoModal').style.display='none'">技 · 使用技能</button>`:''}
        <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'">关闭</button>
      `;
    document.getElementById('playerInfoModal').style.display = 'flex';
  },

  useGuanyuSkill() {
    const cur = getCur();
    const redCards = cur.hand.filter(c => SUIT_COLOR[c.suit] === 'red' && c.type !== 'kill');
    if (redCards.length === 0) { addLog('无红色手牌'); return; }
    if (redCards.length === 1) {
      useGuanyuSkillWithCard(redCards[0]);
      return;
    }
    document.getElementById('playerInfoContent').innerHTML = `
        <h3>选择一张红色牌当作【杀】</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:15px 0;">
          ${redCards.map((c,i)=>{
            const cl=SUIT_COLOR[c.suit]==='red'?'red-suit':'black-suit';
            return `<div class="card ${cl}" style="cursor:pointer;" onclick="useGuanyuSkillWithCardIndex(${i})">
              <span>${c.suit}</span> ${c.name}
            </div>`;
          }).join('')}
        </div>
        <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'">取消</button>
      `;
    document.getElementById('playerInfoModal').style.display = 'flex';
  },

  useGuanyuSkillWithCardIndex(idx) {
    const cur = getCur();
    const redCards = cur.hand.filter(c => SUIT_COLOR[c.suit] === 'red' && c.type !== 'kill');
    if (idx >= 0 && idx < redCards.length) {
      useGuanyuSkillWithCard(redCards[idx]);
    }
    document.getElementById('playerInfoModal').style.display = 'none';
  },

  useGuanyuSkillWithCard(card) {
    const cur = getCur();
    const ts = state.players.map((_, i) => i).filter(i => i !== state.currentIdx && state.players[i].hp > 0 && !sameTeam(
      state.currentIdx, i));
    if (ts.length === 0) { addLog('无目标'); return; }
    useCard({ ...card, type: 'kill' }, state.currentIdx, ts[0]);
    addLog(`${cur.name}发动【武圣】，将${card.suit}${card.name}当作【杀】使用`);
    refreshUI();
  },

  useZhangfeiSkill() {
    addLog('张飞【咆哮】技能已激活，本回合出杀无次数限制');
  },

  useZhaoyunSkill() {
    const cur = getCur();
    const kill = cur.hand.find(c => c.type === 'kill');
    const dodge = cur.hand.find(c => c.type === 'dodge');
    const ts = state.players.map((_, i) => i).filter(i => i !== state.currentIdx && state.players[i].hp > 0 && !sameTeam(
      state.currentIdx, i));
    if (ts.length === 0) { addLog('无目标'); return; }
    if (kill) {
      useCard({ ...kill, type: 'dodge' }, state.currentIdx, state.currentIdx);
      addLog(`${cur.name}发动【龙胆】，将【杀】当作【闪】使用`);
    } else if (dodge) {
      useCard({ ...dodge, type: 'kill' }, state.currentIdx, ts[0]);
      addLog(`${cur.name}发动【龙胆】，将【闪】当作【杀】使用`);
    }
    refreshUI();
  },

  useSunquanSkill() {
    const cur = getCur();
    const n = Math.min(cur.hand.length, 3);
    if (n === 0) { addLog('手牌为空'); return; }
    for (let i = 0; i < n; i++) state.discard.push(cur.hand.pop());
    cur.hand.push(...drawCards(n));
    addLog(`${cur.name}发动【制衡】，弃${n}摸${n}`);
    refreshUI();
  }
};

/* ------------------------------------------------------------
 * 3. 暴露到全局
 *    —— index.html 里的普通 <script> 能直接访问
 * ------------------------------------------------------------ */
window.GENERALS = GENERALS;
window.SKILLS = SKILLS;
Object.assign(window, SKILLS);