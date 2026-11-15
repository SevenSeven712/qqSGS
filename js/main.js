/* ============================================================
 * main.js — 启动入口
 * 依赖：全部模块以经典 <script> 顺序加载，共享同一全局作用域
 * ============================================================ */

if (typeof netInit === 'function') { try { netInit(); } catch (e) { console.warn('[net] init failed', e); } }
setupChatUI();
addChat('系统', '欢迎来到战场！点击左下角图标打开聊天。');
switchView('mainMenu');
updateRankDisplay();

// 昵称由社区账号同步，启动时不再写 nicknameInput

if (!localStorage.getItem('qQiBetaShown')) {
      setTimeout(() => {
        showToast('内测公告', '本软件内测中\n本次内测人名单：茆ch  付ch', 'info');
        localStorage.setItem('qQiBetaShown', 'true');
      }, 500);
    }

window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;
window.removeFriend = removeFriend;
window.inviteFriendToRoom = inviteFriendToRoom;
window.inviteToRoomFromModal = inviteToRoomFromModal;
window.viewFriendStats = viewFriendStats;
window.sendFriendRequest = sendFriendRequest;
window.addToRoom = addToRoom;
window.removeFromRoom = removeFromRoom;
window.createRoom = createRoom;
window.showInviteModal = showInviteModal;
window.loadFriends = loadFriends;
window.switchView = switchView;
window.showDetail = showDetail;
window.useGuanyuSkillWithCardIndex = useGuanyuSkillWithCardIndex;
window.probeConfirmDiscard = probeConfirmDiscard;

try { if (!localStorage.getItem('qQiFriendsReset')) { localStorage.removeItem('qQiFriends');
        localStorage.removeItem('qQiFriendRequests');
        localStorage.setItem('qQiFriendsReset', 'true'); } } catch (e) {}
