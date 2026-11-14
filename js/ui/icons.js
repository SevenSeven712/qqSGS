/* ============================================================
 * icons.js — 全站 SVG 图标库
 *
 * 用法：
 *   svgIcon('check')               → <svg class="svg-i"><use href="#i-check"/></svg>
 *   svgIcon('lock', 'buff-ico')    → 追加自定义 class
 *   gIcon(general)                 → 武将徽记（传 general 对象）
 *   suitIcon('♠')                  → 扑克花色（数据层仍是 ♠♥♣♦ 字符）
 *
 * 约定：
 *   · viewBox 统一 24×24，尺寸交给 CSS（1em，跟随字号）
 *   · 线性图标 stroke-width 1.8，圆角端点；实心图标在 path 上显式 fill
 *   · 颜色一律 currentColor，跟随所在容器的文字色
 *   · 所有图标挂在页面内的 <symbol> 精灵图上，用 <use> 引用，不重复渲染
 * ============================================================ */

const ICON_SPRITE_ID = 'svg-icon-sprite';

/* 线性图标：<g> 统一使用 currentColor 描边 */
const ICON_STROKE = {
  /* ---------- 通用操作 ---------- */
  'chevron-right': '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
  'chevron-down': '<path d="M5.5 9.5L12 16l6.5-6.5"/>',
  'close': '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  'check': '<path d="M4.5 12.5l4.8 4.8L19.5 7"/>',
  'refresh': '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4.6V10h-5.4"/>',
  'plus': '<path d="M12 5v14"/><path d="M5 12h14"/>',
  'minus': '<path d="M5 12h14"/>',
  'search': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',

  /* ---------- 状态与提示 ---------- */
  'circle-filled': '<circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none"/>',
  'circle-outline': '<circle cx="12" cy="12" r="4.2"/>',
  'diamond': '<path d="M12 2.8l9.2 9.2-9.2 9.2L2.8 12z" fill="currentColor" stroke="none"/>',
  'diamond-outline': '<path d="M12 2.8l9.2 9.2-9.2 9.2L2.8 12z"/>',
  'warning': '<path d="M12 3.4L21.2 19.6H2.8z"/><path d="M12 9.4v4.4"/><circle cx="12" cy="16.9" r="1" fill="currentColor" stroke="none"/>',
  'hourglass': '<path d="M7 3.5h10"/><path d="M7 20.5h10"/><path d="M8.5 3.5c0 4 3.5 5.2 3.5 8.5s-3.5 4.5-3.5 8.5"/><path d="M15.5 3.5c0 4-3.5 5.2-3.5 8.5s3.5 4.5 3.5 8.5"/>',
  'megaphone': '<path d="M4 10.2v3.6h3.2l6.3 3.9V6.3L7.2 10.2z"/><path d="M17.6 8.6a5 5 0 0 1 0 6.8"/><path d="M6.5 14.4l1.2 4.4"/>',
  'spark': '<path d="M12 3l1.9 6.3L20 11l-6.1 1.7L12 19l-1.9-6.3L4 11l6.1-1.7z" fill="currentColor" stroke="none"/>',
  'arrow-down': '<path d="M12 3.5v14"/><path d="M6.6 12.2L12 17.6l5.4-5.4"/>',

  /* ---------- 玩家 / 战斗 ---------- */
  'heart': '<path d="M12 20.3l-1.4-1.3C5.7 14.7 3 12.3 3 9.2A4.2 4.2 0 0 1 7.2 5c1.9 0 3.4 1 4.8 2.8C13.4 6 14.9 5 16.8 5A4.2 4.2 0 0 1 21 9.2c0 3.1-2.7 5.5-7.6 9.8z" fill="currentColor" stroke="none"/>',
  'shield': '<path d="M12 2.8l7.5 3v5.7c0 4.6-3.2 7.6-7.5 8.7-4.3-1.1-7.5-4.1-7.5-8.7V5.8z"/>',
  'bolt': '<path d="M13.4 2.6L5 13.6h5.4L9.6 21.4 19 10.4h-5.5z" fill="currentColor" stroke="none"/>',
  'sword': '<path d="M20.6 3.4l-.9 3.6-8.4 8.4-2.7-2.7 8.4-8.4z"/><path d="M7.6 12.2l4.2 4.2"/><path d="M8.6 15.8L4.4 20"/><path d="M4 15.8l4.2 4.2"/>',
  'lock': '<rect x="6.2" y="10.4" width="11.6" height="9.6" rx="1.6"/><path d="M8.8 10.4V8a3.2 3.2 0 0 1 6.4 0v2.4"/><circle cx="12" cy="15.2" r="1.1" fill="currentColor" stroke="none"/>',
  'flag': '<path d="M6 21V3.4"/><path d="M6 4.4h11.6l-2.2 4.2 2.2 4.2H6z"/>',
  'trophy': '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.5a2.5 2.5 0 0 0 2.5 5"/><path d="M16 5.5h2.5a2.5 2.5 0 0 1-2.5 5"/><path d="M12 13v4"/><path d="M8.5 20.5h7"/><path d="M10 17h4l.8 3.5h-5.6z"/>',
  'eye': '<path d="M2.6 12S6.4 6 12 6s9.4 6 9.4 6-3.8 6-9.4 6S2.6 12 2.6 12z"/><circle cx="12" cy="12" r="2.6"/>',
  'mail': '<rect x="3.4" y="6" width="17.2" height="12" rx="1.6"/><path d="M3.8 7.2L12 13l8.2-5.8"/>',
  'crown': '<path d="M3.4 8.2l3.6 3.2 5-6.4 5 6.4 3.6-3.2v10.4H3.4z" fill="currentColor" stroke="none"/>',

  /* ---------- 内容页 ---------- */
  'scroll': '<path d="M5 4.4h9.6l4.4 4.4v10.8H5z"/><path d="M14.2 4.4v4.4h4.4"/><path d="M8.2 13h7"/><path d="M8.2 16.2h5"/>',
  'star': '<path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9z" fill="currentColor" stroke="none"/>',
  'star-outline': '<path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9z"/>',

  /* ---------- 武将徽记 ---------- */
  'blade': '<path d="M19.4 3.4L7.8 15l1.6 1.6L21 5z"/><path d="M6.4 13.2l4.4 4.4"/><path d="M4 19.6l2.8-2.8"/>',
  'paw': '<circle cx="12" cy="16.4" r="3.4" fill="currentColor" stroke="none"/><circle cx="7.2" cy="11.2" r="1.9" fill="currentColor" stroke="none"/><circle cx="16.8" cy="11.2" r="1.9" fill="currentColor" stroke="none"/><circle cx="9.6" cy="6.6" r="1.7" fill="currentColor" stroke="none"/><circle cx="14.4" cy="6.6" r="1.7" fill="currentColor" stroke="none"/>',
  'horseshoe': '<path d="M5.6 20.4v-6.2a6.4 6.4 0 0 1 12.8 0v6.2"/><path d="M9.4 20.4v-3.8a2.6 2.6 0 0 1 5.2 0v3.8"/>',
  'anchor': '<circle cx="12" cy="5.4" r="2.2"/><path d="M12 7.6V21"/><path d="M8 10.6h8"/><path d="M4.4 15.4c0 3.4 2.6 5.6 7.6 5.6s7.6-2.2 7.6-5.6"/>',
  'flame': '<path d="M12 2.8c3.4 3.2 5.6 6.4 5.6 9.6a5.6 5.6 0 0 1-11.2 0c0-2.2 1-4 2.2-5.2 0 2.2.9 3.2 1.4 3.2.6 0 1-.8 1-2 0-1.8-.4-3.6 1-5.6z" fill="currentColor" stroke="none"/>',
  'wave': '<path d="M3 9.2c1.8-2 3.6-2 5.4 0s3.6 2 5.4 0 3.6-2 5.4 0"/><path d="M3 14c1.8-2 3.6-2 5.4 0s3.6 2 5.4 0 3.6-2 5.4 0"/><path d="M3 18.8c1.8-2 3.6-2 5.4 0s3.6 2 5.4 0 3.6-2 5.4 0"/>',
  'burger': '<path d="M4 9.4c0-3.2 3.6-5.4 8-5.4s8 2.2 8 5.4"/><path d="M4 13.2h16"/><path d="M4 16.6h16"/><path d="M5.4 19.4h13.2"/>',
  'dumbbell': '<path d="M7.4 8.2v7.6"/><path d="M16.6 8.2v7.6"/><path d="M4.6 10.2v3.6"/><path d="M19.4 10.2v3.6"/><path d="M7.4 12h9.2"/>',
  'sleep': '<path d="M4 8h4.6L4 12.8h4.6"/><path d="M12.4 3.6h4.2l-4.2 5h4.2"/><path d="M15.4 14.4h3.6l-3.6 4.2h3.6"/>',
  'books': '<path d="M3.8 6.4h5v13.2h-5z"/><path d="M9.6 4.4h5v15.2h-5z"/><path d="M15.6 7.2l4.2 1.2-3.4 11.2-4.2-1.2z"/>',
  'sunflower': '<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M12 2.6v2.8M12 18.6v2.8M2.6 12h2.8M18.6 12h2.8"/><path d="M5.2 5.2l2 2M16.8 16.8l2 2M18.8 5.2l-2 2M7.2 16.8l-2 2"/>',
  'umbrella': '<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v6.2a2.6 2.6 0 0 0 5.2 0"/><path d="M12 3v1.4"/>',
};

/* 实心花色（卡牌用） */
const ICON_SUIT = {
  '♠': '<path d="M12 3c3 3.8 6 6 6 9a3.2 3.2 0 0 1-5.3 2.4c.6 2 1.7 3.4 3.3 4.4H8c1.6-1 2.7-2.4 3.3-4.4A3.2 3.2 0 0 1 6 12c0-3 3-5.2 6-9z" fill="currentColor" stroke="none"/>',
  '♥': '<path d="M12 20.4C7.2 16.1 4 13.7 4 10.2A4.4 4.4 0 0 1 8.4 5.8c1.9 0 3.1.9 3.6 2.2.5-1.3 1.7-2.2 3.6-2.2A4.4 4.4 0 0 1 20 10.2c0 3.5-3.2 5.9-8 10.2z" fill="currentColor" stroke="none"/>',
  '♣': '<circle cx="12" cy="8.6" r="3.4" fill="currentColor" stroke="none"/><circle cx="7.4" cy="14.4" r="3.4" fill="currentColor" stroke="none"/><circle cx="16.6" cy="14.4" r="3.4" fill="currentColor" stroke="none"/><path d="M12 15.4c.4 2 .4 3.4-.8 5.2h1.6c-1.2-1.8-1.2-3.2-.8-5.2z" fill="currentColor" stroke="none"/>',
  '♦': '<path d="M12 3l7 9-7 9-7-9z" fill="currentColor" stroke="none"/>',
};

/* ---------- 精灵图 ---------- */
function mountIconSprite() {
  if (document.getElementById(ICON_SPRITE_ID)) return;
  const symbols = Object.entries(ICON_STROKE)
    .map(([name, inner]) => `<symbol id="i-${name}" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</g></symbol>`)
    .concat(Object.entries(ICON_SUIT).map(([ch, inner]) => {
      const name = { '♠': 'spade', '♥': 'heart', '♣': 'club', '♦': 'diamond' }[ch];
      return `<symbol id="i-suit-${name}" viewBox="0 0 24 24">${inner}</symbol>`;
    }))
    .join('');
  const host = document.createElement('div');
  host.innerHTML = `<svg id="${ICON_SPRITE_ID}" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">${symbols}</svg>`;
  document.body.insertBefore(host.firstChild, document.body.firstChild);
}

/* ---------- 渲染函数 ---------- */
function svgIcon(name, cls) {
  if (!name) return '';
  if (!ICON_STROKE[name]) return '';
  return `<svg class="svg-i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
}

function suitIcon(suit, cls) {
  const name = { '♠': 'spade', '♥': 'heart', '♣': 'club', '♦': 'diamond' }[suit];
  if (!name) return suit || '';
  return `<svg class="svg-i svg-suit${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-suit-${name}"/></svg>`;
}

/* 武将徽记：general.icon 存的是图标语义名（见 data/generals.js） */
function gIcon(general, cls) {
  if (!general) return '';
  return svgIcon(ICON_STROKE[general.icon] ? general.icon : 'crown', cls);
}

/* 武将头像图片：加载失败自动移除，露出底层的 SVG 徽记 */
function avatarImg(general) {
  if (!general || !general.img) return '';
  return `<img class="avatar-img" src="${general.img}" alt="" loading="lazy" onerror="this.remove()">`;
}

/* 在线/可用状态点：true 实心、false 空心 */
function dotIcon(on, cls) {
  return svgIcon(on ? 'circle-filled' : 'circle-outline', cls);
}

/* 兜底：DOM 里残留的 data-icon="xxx" 占位符自动替换成 <use> */
function hydrateIcons(root) {
  (root || document).querySelectorAll('[data-icon]').forEach(el => {
    const name = el.getAttribute('data-icon');
    el.removeAttribute('data-icon');
    el.innerHTML = svgIcon(name);
  });
}

/* 启动：注入精灵图 + 替换 HTML 里的 data-icon 占位符 */
function initIcons() {
  mountIconSprite();
  hydrateIcons();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initIcons);
else initIcons();
