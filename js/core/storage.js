/* ============================================================
 * storage.js — 好友/申请的本地存储读写
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

function getFriends() { try { const v = localStorage.getItem('qQiFriends'); return v ? JSON.parse(v) :
        DEFAULT_FRIENDS.slice(); } catch (e) { return DEFAULT_FRIENDS.slice(); } }

function saveFriends(data) { localStorage.setItem('qQiFriends', JSON.stringify(data || getFriends())); }

function getFriendRequests() { try { const v = localStorage.getItem('qQiFriendRequests'); return v ? JSON.parse(v) :
        []; } catch (e) { return []; } }

function saveFriendRequests(data) { localStorage.setItem('qQiFriendRequests', JSON.stringify(data ||
      getFriendRequests())); }

function getFriendData(name) { const fs = getFriends(); return fs.find(f => f.name === name); }
