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
    skill: '等我喝完2L雪碧',
    desc: '使用【水】可回复1点体力',
    color: '#4a5a2a',
    faction: 'student',
    skills: [
      { name: '等我喝完2L雪碧', desc: '使用【水】时，为自身回复1点体力', type: 'passive' }
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
    skill: '免疫炸弹的攻击',
    desc: '炸弹判定命中时不受伤害',
    color: '#3a3a5a',
    faction: 'student',
    skills: [
      { name: '免疫炸弹的攻击', desc: '被炸弹判定命中（黑桃）时，不受3点伤害，炸弹立即熄灭，全场广播', type: 'passive' }
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

  /* ========== 肖学霸 ========== */
  xiaoxuebaImmuneBomb(idx) {
    const p = state.players[idx];
    if (!p || p.hp <= 0 || p.general.id !== 'xiaoxueba') return false;
    addLog(`【免疫炸弹的攻击】${p.name}免疫了炸弹伤害，炸弹当场熄灭！`);
    floatText(`player-${idx}`, '免疫', '#88ccff');
    return true;
  },

  /* ========== 技能可用性判定（按钮与面板共用） ========== */
  getMySkillState() {
    const cur = getCur();
    if (!cur || cur.hp <= 0 || state.gameOver || !cur.general) {
      return { hasActive: false, canUse: false, reason: '当前无法使用技能' };
    }
    const skills = cur.general.skills || [];
    const hasActive = skills.some(s => s.type === 'active');
    if (!hasActive) {
      return { hasActive: false, canUse: false, reason: '该武将只有被动技能' };
    }
    if (!isLocal(state.currentIdx)) {
      return { hasActive: true, canUse: false, reason: '只能在自己的回合使用' };
    }
    if (state.phase !== 'play') {
      return { hasActive: true, canUse: false, reason: '只能在出牌阶段使用' };
    }
    if (state.pending) {
      return { hasActive: true, canUse: false, reason: '正在结算响应，暂不可用' };
    }
    let ready = false;
    if (cur.general.id === 'qiyuyang') ready = cur.hand.length > 0;
    if (!ready) {
      return { hasActive: true, canUse: false, reason: '当前不满足使用条件' };
    }
    return { hasActive: true, canUse: true, reason: '' };
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
    if (cur.general.id === 'qiyuyang') {
      skillDesc =
        `${cur.general.desc}<br><br>· 水龙王：使用水回复1点体力（被动）<br>· 人有一手：弃所有手牌，摸等同于血量（上限4）的牌<br>· 聪明反被聪明误：摸牌上限4（被动）`;
      useSkill = 'useQiyuyangSkill()';
    } else if (cur.general.id === 'fuchenhao') {
      skillDesc =
        `${cur.general.desc}<br><br>· 点外卖：造成伤害后判定，杀/闪/水则获得该牌（被动）<br>· 藏起来我也能找到：被锁定时让对方弃1牌（被动）`;
    } else if (cur.general.id === 'maochenhao') {
      skillDesc =
        `${cur.general.desc}<br><br>· 不屈：受伤后血量上限变为4（被动）<br>· 满血之力：血量为5时全伤害翻倍；血量为4时仅杀翻倍（被动）`;
    } else if (cur.general.id === 'wangxiaoxi') {
      skillDesc = `${cur.general.desc}<br><br>· 等我喝完2L雪碧：使用【水】回复1点体力（被动）`;
    } else if (cur.general.id === 'xiaoming') {
      skillDesc = `${cur.general.desc}<br><br>· 济南捞子：无手牌时免疫杀和决斗（被动）`;
    } else if (cur.general.id === 'xiaoxueba') {
      skillDesc = `${cur.general.desc}<br><br>· 吸血：被炸弹击中时可弃3牌转移炸弹（被动）`;
    } else if (cur.general.id === 'jiahao') {
      skillDesc =
        `${cur.general.desc}<br><br>· 雨中之人：杀视为万箭齐发（被动）<br>· 防御万箭齐发2：第一回合免疫所有伤害（被动）`;
    }
    canUse = getMySkillState().canUse;
    document.getElementById('playerInfoContent').innerHTML = `
        <h3 style="color:${rc};">${gIcon(cur.general)} ${cur.general.name}</h3>
        <div style="background:#faf6ec;padding:10px;border-radius:12px;margin-bottom:10px;">
          <p><b>技能：</b>${cur.general.skill}</p>
          <p style="color:#6b6357;">${skillDesc}</p>
        </div>
        ${canUse?`<button class="btn" onclick="${useSkill};document.getElementById('playerInfoModal').style.display='none'">技 · 使用技能</button>`:''}
        <button class="btn" onclick="document.getElementById('playerInfoModal').style.display='none'">关闭</button>
      `;
    document.getElementById('playerInfoModal').style.display = 'flex';
  },


};

/* ------------------------------------------------------------
 * 3. 暴露到全局
 *    —— index.html 里的普通 <script> 能直接访问
 * ------------------------------------------------------------ */
window.GENERALS = GENERALS;
window.SKILLS = SKILLS;
Object.assign(window, SKILLS);