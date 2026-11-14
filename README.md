# 七七三国杀 · 烽火连天

纯前端单页卡牌对战游戏。原生 HTML / CSS / JavaScript，**无框架、无打包依赖**，双击 `index.html` 就能玩。

历史上它是一个 6358 行的单文件 `index.html`，现已按职责拆成 `css/` + `js/` 共 37 个源文件（详见下方结构表）。拆分是**纯搬迁**：251 条顶层语句、387 条 CSS 规则逐条对应，五个界面的截图与原版像素级一致（差异 0.000%）。

所有图标（46 个）都是内联 SVG 精灵图，**不依赖 Emoji 字体、不依赖 CDN**，离线打开也不会变形或变成豆腐块。

---

## 快速开始

```bash
# 方式一：直接打开（无需服务器，脚本是经典 <script>，不受 file:// 限制）
open index.html

# 方式二：起个静态服务器（改代码后热刷新更顺手）
python3 -m http.server 8080

# 方式三：需要单文件分发时，打包回一个 html
node tools/build.js          # → dist/index.html（CSS/JS 全部内联）
```

`dist/index.html` 是构建产物，**不要直接改它**，改 `css/`、`js/` 下的源文件后重新 build。

---

## 目录结构

```
qqsg/
├── index.html              677 行  唯一入口：head 引样式 + body 骨架 + 27 个 <script>
├── css/                            9 个文件，2023 行
│   ├── base.css            122    CSS 变量(:root)、重置、body 底色与纹理、#app
│   ├── menu.css            365    主菜单：标题、段位条、主/副按钮、场景装饰
│   ├── game.css            266    对局界面：玩家区、手牌、装备、回合条、日志、选将网格
│   ├── components.css      246    通用组件：按钮、Tab、卡片容器、设置项、弹窗基座
│   ├── icons.css           292    按钮图标 .icn 系列（SVG data-uri 作背景图）
│   ├── chat.css            133    聊天悬浮球与面板
│   ├── match.css            67    匹配动画
│   ├── overlays.css        312    模态框、Toast、炸弹/南蛮/万箭/金蝉/丰收特效
│   └── animations.css      220    全部 @keyframes，集中管理
├── js/                             27 个文件
│   ├── data/
│   │   ├── constants.js     35    AI 昵称、段位、CARD_TYPES 卡牌类型枚举
│   │   ├── deck.js          54    createDeck()：牌堆构成（数量/花色/描述都在这里调）
│   │   └── generals.js     526    武将数据 GENERALS + 技能 SKILLS（加武将只改这个文件）
│   ├── core/
│   │   ├── state.js         38    全局 state、drawCards()、getCur()/isLocal()、refreshUI()
│   │   ├── storage.js       17    好友与好友申请的 localStorage 读写
│   │   └── rank.js          67    随机昵称、随机段位、AI 强度（getRankBonus/aiCanSeeAllHands）
│   ├── game/
│   │   ├── cards.js        307    useCard()：出牌主流程，按牌型分派结算
│   │   ├── card-effects.js 272    单卡交互：探试、借刀杀人、炸弹转移判定
│   │   ├── turn.js         365    响应面板、出牌阶段、回合推进、轮次结算与弃牌
│   │   ├── combat.js       198    群体结算、决斗、阵亡、胜负判定、dealDamage()
│   │   ├── effects.js      413    炸弹/南蛮/万箭/金蝉/丰收 的 DOM 特效与飘字
│   │   └── ai.js           394    AI 性格、出牌决策 aiTakeTurn()、响应、调度 scheduleAi()
│   ├── ui/
│   │   ├── icons.js        143    SVG 图标库：46 个 symbol 的精灵图 + svgIcon()/gIcon()/suitIcon()
│   │   ├── render.js       189    renderPlayers()/renderMyHand()/renderEquipArea()/updateButtons()
│   │   ├── log.js           23    战斗日志与完整日志弹窗
│   │   ├── toast.js         23    showToast() 轻提示
│   │   ├── offline.js      149    线下多人：选将轮转、交接屏、弃牌
│   │   ├── chat.js         171    聊天面板、AI 台词、定时吐槽
│   │   ├── profile.js      153    战绩、积分、段位、武将熟练度
│   │   ├── pages.js        126    卡牌图鉴 / 武将图鉴
│   │   ├── general-select.js 178  选将界面与武将详情
│   │   ├── friends.js      231    好友、房间、邀请
│   │   ├── matchmaking.js  115    匹配流程（假匹配动画 + 随机对手）
│   │   ├── settings.js     234    设置页：音量、规则、昵称、调试开关
│   │   ├── bindings.js     254    所有 DOM 事件绑定（按钮 → 函数）
│   │   ├── views.js         29    switchView() 视图切换、resetGame() 重置对局
│   │   └── debug.js        212    调试面板（加牌/清牌/强制 AI 出牌等）
│   └── main.js              40    启动入口：初始化聊天、切视图、恢复昵称、公告
├── tools/build.js           42    打包脚本：读取 index.html，把 css/js 内联成 dist/index.html
└── dist/index.html                构建产物（350 KB 单文件）
```

---

## 三个必须知道的约定

**1. 全部是经典 `<script>`，共享同一个全局作用域，不要改成 `type="module"`。**

HTML 里有大量 `onclick="window.xxx()"`、`onclick="useCard(...)"` 这类内联调用，一旦模块化就全部失效。`const state`、`const CARD_TYPES` 这些顶层声明落在全局词法环境里，任何文件都能直接引用——这也是各模块之间不需要 `import/export` 的原因。

**2. 加载顺序就是执行顺序，`index.html` 末尾的 script 列表是唯一权威。**

```
ui/icons.js → data → core → game → ui → main.js
```

- `icons.js` 必须第一个加载：别的模块在渲染时随时会调用 `svgIcon()`。
- 前面只定义、不执行；`main.js` 最后跑初始化。
- 有加载期副作用的只有三处：`icons.js` 注入精灵图、`bindings.js` 里的 DOM 事件绑定、`chat.js` 里的 `setInterval` 定时吐槽、`main.js` 的启动逻辑。新增文件时如果要在加载期执行代码，注意它依赖的东西必须已经加载。
- 新增模块：在对应目录建文件 → 在 `index.html` 里按依赖位置插一行 `<script src="./js/...">`。

**3. 样式有加载顺序，跨文件的同名选择器会互相覆盖。**

`base → menu → game → components → icons → chat → match → overlays → animations`，顺序与原单文件中的出现顺序一致。改样式时优先改对应模块，不要在 `base.css` 里覆盖别处的规则。

---

## 运行时数据模型

全局只有一份 `state`（`js/core/state.js`），所有逻辑读写它，`refreshUI()` 负责把状态刷到界面。

| 字段 | 说明 |
| --- | --- |
| `mode` | `duel` 单挑 / `team` 组队 / `chaos` 混战 / `lord` 主公 |
| `players[]` | 玩家数组，每项含 `name / hp / maxHp / hand / equip / general / rank / wins / losses / locked / goldenShield` |
| `localIndices[]` | 本地玩家下标（线下多人时多个，AI 局只有 0） |
| `currentIdx` | 当前行动玩家 |
| `phase` | `waiting` → `draw` → `play` → `endTurn` → `nextRoundPrompt` → 下一回合 |
| `pending` | 等待响应的牌（`{type, from}`），响应面板据此显示 |
| `deck` / `discard` | 牌堆与弃牌堆；`drawCards()` 会在牌堆空时自动洗回弃牌堆 |
| `roundNumber` / `subRoundCount` | 大回合 / 小轮（默认 5 小轮一轮） |
| `playersActedThisRound` / `playersPlayedThisRound` | 本轮的 Set，用于判断「无人出牌直接进下一轮」 |

单个回合的走向：

```
startTurn()            → 摸 2 张，phase = play
  ↳ 出牌（useCard）     → 需要响应时置 state.pending，弹响应面板
  ↳ 结束（endTurn）     → 无人出牌或全员行动完 → showNextRoundPrompt() 弃牌/结算
  ↳ advanceTurn()       → currentIdx 后移，跳过阵亡者，触发 AI 或交接屏
```

AI 出手由 `scheduleAi()` 调度，`aiTakeTurn()` 里按手牌价值（`getCardValue`）与当前局势决策；线下多人模式则走 `ui/offline.js` 的交接屏。

---

## 图标系统

整套图标是**一个 SVG 精灵图**：`js/ui/icons.js` 里用 `ICON_STROKE` 表声明 46 个 24×24 的图形，启动时注入 `<svg id="svg-icon-sprite">`，页面各处用 `<use href="#i-xxx">` 引用，同一图标重复出现也只渲染一次。

```js
svgIcon('lock')            // <svg class="svg-i"><use href="#i-lock"/></svg>
svgIcon('lock', 'extra')   // 追加 class
gIcon(general)             // 武将徽记（读 general.icon 里的语义名）
suitIcon('♠')              // 扑克花色（数据层仍是 ♠♥♣♦ 字符，渲染时才转图形）
dotIcon(true)              // 在线/可用状态点：实心 / 空心
avatarImg(general)         // 头像图：加载失败会自动移除，露出底层徽记
```

约定：

- **颜色一律 `currentColor`**，跟着容器的 `color` 走，不需要为每个场景单独配色；
- **尺寸用 `1em`**（`.svg-i` 基类），跟着字号缩放；需要固定尺寸时单独写 `.xxx .svg-i { width: 18px }`；
- 线性图标 `stroke-width` 统一 1.8、圆角端点；实心图标在 path 上显式写 `fill`；
- HTML 里只能用静态标签，所以用 `data-icon="名字"` 占位，`icons.js` 启动时自动替换成 `<use>`。

新增一个图标：在 `ICON_STROKE` 里加一行 `'名字': '<path d="..."/>'` 即可，无需改 CSS。武将徽记则在 `generals.js` 里把 `icon` 写成该名字（如 `icon: 'flame'`）。

## 扩展指南

### 加一个武将

只改 `js/data/generals.js`：

```js
{
  id: 'guanyu',            // 唯一 id，技能里用它判断
  name: '关羽',
  icon: '🐉',
  img: generalImg('...'),  // 或 './assets/generals/guanyu.png'
  hp: 4,
  skill: '武圣',
  desc: '红色手牌可当【杀】使用',
  color: '#6a2a20',
  faction: 'classic'       // classic 三国 / student 同学梗，图鉴按此分组
}
```

需要技能就在同文件的 `SKILLS` 里加方法，文件末尾的 `Object.assign(window, SKILLS)` 会把它挂到全局，`index.html` 侧直接按函数名调用即可。目前 13 个武将分两派：`classic` 6 个、`student` 7 个。

### 加一张卡牌

1. `js/data/constants.js` → `CARD_TYPES` 加枚举；
2. `js/data/deck.js` → `createDeck()` 里 push 进牌堆（张数、花色、`cat`、`desc`）；
3. `js/game/cards.js` → `useCard()` 里加分支结算（`cat` 为 `basic` / `trick` / `equip`，装备牌走 `equip` 分支）；
4. 图鉴会自动收录（`pages.js` 直接遍历 `createDeck()` 聚合），无需额外改；
5. 要专属动画就放 `js/game/effects.js`，样式放 `css/overlays.css`。

### 加一个界面

`index.html` 里加 `<div id="xxxView" class="view">` → `js/ui/bindings.js` 绑按钮 → `js/ui/views.js` 的 `switchView('xxxView')` 切换。视图容器必须有 `view` 类，激活靠 `active` 类（`.view.active` 才有进场动画）。

### 调 AI 强度

`js/core/rank.js`：`getRankBonus()`（各段位强度系数）、`aiCanSeeAllHands()`（高段位 AI 偷看手牌）、`aiAnalyzeBestPlay()`（决策倾向）。`js/game/ai.js` 里还有 `AI_PERSONALITY` 按武将名匹配激进/保守。

---

## 本地存储键

| 键 | 内容 |
| --- | --- |
| `qQiNick` | 玩家昵称 |
| `qQiStats` | 战绩（局数、胜负、武将熟练度） |
| `qQiFriends` / `qQiFriendRequests` | 好友列表 / 待处理申请 |
| `qQiBetaShown` | 内测公告只弹一次 |
| `musicVolume` / `sfxVolume` / `muteAll` | 音量设置 |
| `debugModeEnabled` | 调试面板开关 |

清档：浏览器控制台执行 `localStorage.clear()`。

---

## 已知问题

- **部分武将头像空白**：`generals.js` 里有几条 `img` 指向 `./assets/generals/*.png`，但仓库里没有 `assets/` 目录。其余武将走远程 `generalImg()` 生成，断网时会退化成纯色块。
- **两个超大函数**：`useCard()`（307 行，按牌型一整个 if/else 链）和 `aiTakeTurn()`（259 行）。要再拆的话，建议按牌型切成 `card-kill.js` / `card-trick.js` / `card-equip.js`，AI 那边按「评估 → 出牌 → 响应」三段切。
- **真实联机未实现**：匹配是本地假动画（`ui/matchmaking.js`），房间里的「邀请好友」只写本地数据，没有网络层。
- **武将头像依赖远程生成服务**：`generalImg()` 指向第三方 text-to-image 接口，断网时头像位会退化成武将徽记（SVG），这也是设计上的兜底。

---

## 改动后自检清单

这套拆分是脚本化完成并逐项校验过的，后续大改时可复用同样的验证思路：

```bash
# 1. 语法
for f in $(find js -name "*.js"); do node --check "$f"; done

# 2. 渲染与运行
#    打开 index.html → F12 Console 应无报错 → 开一局线下 4 人局
#    走到出牌阶段，确认【杀】能被【闪】响应、AI 正常推进回合

# 3. 若改了结构，建议对比改动前后的截图（固定 Math.random 种子可保证牌面一致）
node tools/build.js && open dist/index.html
```
