/* ============================================================
 * constants.js — 全局常量：AI 昵称、段位、卡牌类型
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

const AI_NAMES = ['乱世枭雄', '桃园豪杰', '江东猛虎', '卧龙先生', '凤雏庞统', '常山赵子龙', '西凉锦马超', '燕人张翼德', '美髯公关羽', '小霸王孙策', '周公瑾', '司马懿',
      '陆逊', '姜维', '魏延', '黄忠', '典韦', '许褚', '张辽', '徐晃', '张郃', '夏侯惇', '夏侯渊', '曹仁', '吕蒙', '甘宁', '太史慈', '周泰', '凌统', '鲁肃'
    ];

const RANKS = ['青铜', '白银', '黄金', '铂金', '钻石', '王者'];

const RANK_COLORS = { '青铜': '#cd7f32', '白银': '#c0c0c0', '黄金': '#ffd700', '铂金': '#e5e4e2', '钻石': '#b9f2ff',
      '王者': '#ff4500' };

const DEFAULT_FRIENDS = [];

const CARD_TYPES = {
      KILL: 'kill',
      DODGE: 'dodge',
      WATER: 'water',
      PEACH: 'peach',
      HARVEST: 'harvest',
      PROBE: 'probe',
      LOCK: 'lock',
      STEAL: 'steal',
      SOUTH: 'south',
      ARROWS: 'arrows',
      JUESHI: 'jueshi',
      DUEL: 'duel',
      BORROW: 'borrow',
      GOLDEN: 'golden',
      TRANSFER: 'transfer',
      PLUS1: 'plus1',
      MINUS1: 'minus1',
    };
