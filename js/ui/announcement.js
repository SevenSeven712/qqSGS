/* ============================================================
 * announcement.js — 首页公告栏
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

const ANNOUNCEMENTS = [
  { date: '11-20', text: '经典阵营武将（关羽、张飞、赵云、曹操、孙权、周瑜）已下架，选将池与武将图鉴不再显示。' },
  { date: '11-14', text: '联机对战正式上线：好友 → 创建房间，把 6 位房间码发给朋友即可开战。' },
  { date: '11-14', text: '首页改版：精简入口，新增公告栏。' },
  { date: '11-10', text: '新增同学派武将：戚雨杨、付晨浩、毛晨浩、王小西、小明、肖学霸、家豪。' },
  { date: '11-08', text: '修复若干出牌结算问题，优化回合推进流程。' }
];

function renderAnnouncements() {
  const list = document.getElementById('announceList');
  if (!list) return;
  list.innerHTML = ANNOUNCEMENTS.map(a =>
    '<div class="announce-item"><span class="date">[' + a.date + ']</span><span>' + a.text + '</span></div>'
  ).join('');
}

function toggleAnnounce() {
  const board = document.getElementById('announceBoard');
  const btn = document.getElementById('announceToggle');
  if (!board) return;
  board.classList.toggle('expanded');
  if (btn) btn.textContent = board.classList.contains('expanded') ? '收起' : '展开';
}

(function () {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderAnnouncements);
  else renderAnnouncements();
})();
