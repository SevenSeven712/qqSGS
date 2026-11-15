/* ============================================================
 * pages.js — 卡牌图鉴 / 武将图鉴页
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

let currentCardTab = 'all';
let currentEquipSub = 'weapon';

function renderCardsInfo(tab = 'all', sub = 'weapon') {
      currentCardTab = tab;
      currentEquipSub = sub;
      const all = createDeck();
      const cats = {};
      all.forEach(c => {
        let ct = c.cat;
        let sb = c.sub || '';
        let k = c.name;
        if (!cats[ct]) cats[ct] = {};
        if (ct === 'equip') {
          if (!cats[ct][sb]) cats[ct][sb] = {};
          if (!cats[ct][sb][k]) cats[ct][sb][k] = { card: c, count: 0 };
          cats[ct][sb][k].count++;
        } else {
          if (!cats[ct][k]) cats[ct][k] = { card: c, count: 0 };
          cats[ct][k].count++;
        }
      });
      const cn = { basic: '基本牌', trick: '锦囊牌', equip: '装备牌' };
      const sn = { weapon: '武器', armor: '防具', plus1: '+1马', minus1: '-1马' };

      document.querySelectorAll('#cardTabsMain .tab-btn').forEach(el => {
        el.classList.toggle('tab-active', el.dataset.tab === tab);
      });
      document.querySelectorAll('#cardTabsSub .tab-btn').forEach(el => {
        el.classList.toggle('tab-active', el.dataset.sub === sub);
      });
      const subTabs = document.getElementById('cardTabsSub');
      if (subTabs) subTabs.style.display = tab === 'equip' ? 'flex' : 'none';

      const cardStyle =
        'background:linear-gradient(180deg,#faf6ec 0%,#180a05 100%);padding:12px 10px;border-radius:14px;width:140px;text-align:center;border:1px solid #d6cdb8;box-shadow:0 4px 12px rgba(0,0,0,0.5),inset 0 1px 0 rgba(201,160,80,0.15);transition:transform 0.2s;';
      const cardHover =
        'onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'translateY(0)\'"';

      let h = '';
      if (tab === 'all') {
        for (const ct of ['basic', 'trick', 'equip']) {
          if (!cats[ct]) continue;
          h += `<div class="ellipse-cat">${cn[ct]}</div>`;
          h += `<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:8px 0 18px;">`;
          if (ct === 'equip') {
            for (const sb of ['weapon', 'armor', 'plus1', 'minus1']) {
              if (!cats[ct][sb]) continue;
              h +=
                `<div style="width:100%;"><div style="color:var(--gold);font-weight:bold;margin:6px 0;letter-spacing:2px;">${sn[sb]||sb}</div><div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">`;
              for (const nm in cats[ct][sb]) {
                const { card: c, count } = cats[ct][sb][nm];
                const suitColor = SUIT_COLOR[c.suit] === 'red' ? '#e74c3c' : '#ddd';
                h +=
                  `<div style="${cardStyle}" ${cardHover}><b style="color:var(--gold-light);font-size:1.05em;">${c.name}</b> <span style="color:${suitColor};font-weight:bold;">${suitIcon(c.suit)}</span><br><small style="color:#c8a070;display:block;margin-top:6px;line-height:1.4;">${c.desc||''}</small><div style="color:var(--gold);margin-top:6px;font-weight:bold;">x${count}</div></div>`;
              }
              h += `</div></div>`;
            }
          } else {
            for (const nm in cats[ct]) {
              const { card: c, count } = cats[ct][nm];
              const suitColor = SUIT_COLOR[c.suit] === 'red' ? '#e74c3c' : '#ddd';
              h +=
                `<div style="${cardStyle}" ${cardHover}><b style="color:var(--gold-light);font-size:1.05em;">${c.name}</b> <span style="color:${suitColor};font-weight:bold;">${suitIcon(c.suit)}</span><br><small style="color:#c8a070;display:block;margin-top:6px;line-height:1.4;">${c.desc||''}</small><div style="color:var(--gold);margin-top:6px;font-weight:bold;">x${count}</div></div>`;
            }
          }
          h += `</div>`;
        }
      } else if (tab === 'equip') {
        if (cats['equip'] && cats['equip'][sub]) {
          h += `<div class="ellipse-cat">${sn[sub]||sub}</div>`;
          h += `<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:10px 0;">`;
          for (const nm in cats['equip'][sub]) {
            const { card: c, count } = cats['equip'][sub][nm];
            const suitColor = SUIT_COLOR[c.suit] === 'red' ? '#e74c3c' : '#ddd';
            h +=
              `<div style="${cardStyle}" ${cardHover}><b style="color:var(--gold-light);font-size:1.05em;">${c.name}</b> <span style="color:${suitColor};font-weight:bold;">${suitIcon(c.suit)}</span><br><small style="color:#c8a070;display:block;margin-top:6px;line-height:1.4;">${c.desc||''}</small><div style="color:var(--gold);margin-top:6px;font-weight:bold;">x${count}</div></div>`;
          }
          h += `</div>`;
        } else {
          h += '<div style="color:#6b6357;text-align:center;padding:20px;">暂无此类型卡牌</div>';
        }
      } else {
        if (cats[tab]) {
          h += `<div class="ellipse-cat">${cn[tab]}</div>`;
          h += `<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:10px 0;">`;
          for (const nm in cats[tab]) {
            const { card: c, count } = cats[tab][nm];
            const suitColor = SUIT_COLOR[c.suit] === 'red' ? '#e74c3c' : '#ddd';
            h +=
              `<div style="${cardStyle}" ${cardHover}><b style="color:var(--gold-light);font-size:1.05em;">${c.name}</b> <span style="color:${suitColor};font-weight:bold;">${suitIcon(c.suit)}</span><br><small style="color:#c8a070;display:block;margin-top:6px;line-height:1.4;">${c.desc||''}</small><div style="color:var(--gold);margin-top:6px;font-weight:bold;">x${count}</div></div>`;
          }
          h += `</div>`;
        }
      }
      document.getElementById('cardsList').innerHTML = h;
    }

function renderHeroInfo() {
      const s = getStats();
      const my = s.mastery || {};
      let h = '<div style="max-width:650px;margin:0 auto;">';
      GENERALS.forEach(g => {
        const m = my[g.id];
        const use = m ? m.used : 0;
        const wins = m ? m.wins : 0;
        const rate = use > 0 ? Math.round(wins / use * 100) + '%' : '-';
        h += `<div class="general-card" style="margin:6px;padding:12px;cursor:pointer;" onclick="showDetail('${g.id}')">
            <div style="display:flex;align-items:center;gap:10px;justify-content:flex-start;text-align:left;">
              <div style="position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;background:${g.color};border:2px solid var(--gold);font-size:1.8em;">${gIcon(g)}${avatarImg(g)}</div>
              <div style="flex:1;">
                <div style="color:var(--gold);font-size:1.15em;font-weight:bold;">${g.name} · ${svgIcon('heart')}${g.hp}</div>
                <div style="color:#c8a070;font-size:0.9em;margin-top:4px;">【${g.skill}】 ${g.desc}</div>
                <div style="color:#7a6550;font-size:0.75em;margin-top:6px;">本地使用：${use}次 | 胜：${wins} | 胜率：${rate}</div>
              </div>
            </div>
          </div>`;
      });
      h += '</div>';
      document.getElementById('heroList').innerHTML = h;
    }
