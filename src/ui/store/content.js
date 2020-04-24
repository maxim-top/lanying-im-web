//collection.js
import {toLong, toNumber} from '../third/tools';
// import axios from 'axios'

const state = {
  /**
   rosterinfo
   groupinfo

   rosterchat
   groupchat

   notice
   setting

   rosterNotice
   groupInviteNotice
   grpupApplyNotice
   */
  viewType: '',
  sid: -1, //selected roster/group id..
  messages: [],
  time: [], // 这个是，消息的时间，几分钟显示一下，按现在的逻辑..

  rosterMap: {},
  groupMap: {},

  memberlistMap: {},
  adminListMap: {},


  scroll: 0,

  queryHistoryMessageId: 0,
  queryHistoryRecords: {}, // map of sid:queryTimes
};

const getters = {
  getViewType(state) {
    return state.viewType;
  },

  getSid(state) {
    return state.sid;
  },

  getMessages(state) {
    return state.messages;
  },

  getMessageTime(state) {
    return state.time;
  },

  getRosterInfo(state) {
    return state.rosterMap[state.sid] || {};
  },

  getGroupInfo(state) {
    return state.groupMap[state.sid] || {};
  },

  getMemberList(state) {
    return state.memberlistMap[state.sid] || [];
  },
  getAdminList(state) {
    return state.adminListMap[state.sid] || [];
  },

  getScroll(state) {
    return state.scroll;
  },
};

const mutations = {
  setViewType(state, x) {
    state.viewType = x;
  },

  setSid(state, x) {
    state.sid = x;
    this.queryHistoryMessageId = 0;
  },

  setMessage(state, x) {
    state.messages = x;
  },

  addMessages(state, x = []) {
    state.messages.push(x);
  },

  setMessageTime(state, t) {
    const s = state.time;
    s.push(t);
    state.time = [].concat(s);
  },

  setRosterInfo(state, x) {
    const obj = Object.assign({}, state.rosterMap, { [state.sid]: x });
    state.rosterMap = obj;
    // state.rosterMap[state.sid] = x;
  },

  setGroupInfo(state, x) {
    const obj = Object.assign({}, state.groupMap, { [state.sid]: x });
    state.groupMap = obj;
    // state.groupMap[state.sid] = x;
  },

  setMemberList(state, x) {
    const obj = Object.assign({}, state.memberlistMap, { [state.sid]: x });
    state.memberlistMap = obj;
  },
  setAdminList(state, x) {
    const obj = Object.assign({}, state.adminListMap, { [state.sid]: x });
    state.adminListMap = obj;
  },
  setQud(state, x) {
    state.queryHistoryMessageId = x;
  },

  recordHistoryQuery(state) {
    let times = state.queryHistoryRecords[state.sid] || 0;
    times++;
    state.queryHistoryRecords[state.sid] = times;
  }
};

const actions = {

  actionOpenGroup(context) {
    const { rootState, state } = context;
    rootState.im.groupManage.openGroup(state.sid);
    rootState.im.groupManage.readGroupMessage(state.sid);

    rootState.im.groupManage.asyncGetAdminList({ group_id: state.sid }).then(res => {
      context.commit('setAdminList', res);
    }).catch((err) => {
      console.error("Failed to GetAdminList, error:", err);
    });

    rootState.im.groupManage.asyncGetGroupInfo(state.sid, true).then(res => {
      context.commit('setGroupInfo', res);
    }).catch((err) => {
      console.error("Failed to GetGroupInfo, error:", err);
    });
  },

  actionSetType(context, x) {
    const { state } = context;
    if ( typeof x.sid === "undefined" || x.sid < 0 ) {
      x.type && context.commit('setViewType', x.type);
    }
    if (state.sid !== x.sid || state.viewType !== x.type) {
      context.commit('setSid', x.sid);
      x.type && context.commit('setViewType', x.type);
      x.sid && context.commit('setMessage', []);
      state.time = [];
    }
  },

  actionUpdateRoster(context) {
    const { rootState, state } = context;
    rootState.im.rosterManage.asyncGetRosterInfo(state.sid).then(res => {
      context.commit('setRosterInfo', res);
    })
  },

  actionUpdateGroup(context) {
    const { rootState, state } = context;
    rootState.im.groupManage.asyncGetGroupInfo(state.sid).then(res => {
      context.commit('setGroupInfo', res);
    });
  },

  actionUpdateMemberList(context) {
    const { rootState, state } = context;
    const members = rootState.im.groupManage.getGroupMembers(state.sid);
    context.commit('setMemberList', members);
  },

  actionRequireMessage(context) {
    // eslint-disable-next-line no-unused-vars
    const { rootState, state } = context;

    let localMessages = undefined;
    if (state.viewType === "rosterchat") {
      localMessages = rootState.im.rosterManage.getRosterMessageByRid(state.sid);
    } else if (state.viewType === "groupchat") {
      localMessages = rootState.im.groupManage.getGruopMessage(state.sid);
    } else ; //undefined type

    if (localMessages) {
      context.dispatch('actionAppendMessage', { messages: localMessages });
    }

    const historyQueryTimes = state.queryHistoryRecords[state.sid] || 0;
    if (historyQueryTimes === 0 && (!localMessages || localMessages.length <= 3)) {
      context.dispatch('queryHistory');
    }
  },

  actionAppendMessage(context, data = {}) {
    const newMessages = data.messages || [];
    const isHistory = data.history;
    if (isHistory) {
      this.queryHistoryMessageId = data.next;
    }
    const { state, rootState } = context;
    const uid = rootState.im.userManage.getUid();
    const oldMessages = state.messages || [];
    newMessages.filter(meta => {
      // ignore input status messages
      if (meta.ext && meta.ext.input_status) return false;
      else return true;
    }).forEach(meta => {
      const { from, to } = meta;
      const fromUid = toNumber(from);
      const toUid = toNumber(to);
      let saveUid = fromUid === uid ? toUid : fromUid;
      if (saveUid + '' !== state.sid + '' && state.viewType === 'rosterchat') {
        return; // rosterchat, 必须有一个id是 sid
      }
      if (toUid + '' !== state.sid + '' && state.viewType === 'groupchat') { // 群消息 to 是 群 id。。
        return; //group，to 必须是sid
      }

      if (oldMessages.length > 0) {
        const firstItem = oldMessages[0];
        const lastItem = oldMessages[oldMessages.length - 1];
        const compFirst = toLong(meta.id).comp(toLong(firstItem.id) || 0);
        const compLast = toLong(meta.id).comp(toLong(lastItem.id) || 0);

        if (compFirst === -1) { // 比第一个小
          oldMessages.unshift(meta);
        } else if (compLast === 1) {
          oldMessages.push(meta);
        } else {
          let index = -1;
          for (var i = 0; i < oldMessages.length - 2; i += 1) {
            const compCurr = toLong(meta.id).comp(toLong(oldMessages[i].id));
            const compNext = toLong(meta.id).comp(toLong(oldMessages[i + 1].id));
            if (compCurr === 1 && compNext === -1) {
              index = i;
            }
          }
          if (index > -1) {
            oldMessages.splice(index, 0, meta); // 插入到这里
          }
        }
      } else { // 数组为空
        oldMessages.push(meta);
      }
    });
    // foreach over...
    context.commit('setMessage', [].concat(oldMessages));
    if (!isHistory && oldMessages.length !== state.messages.length) {
      state.scroll = state.scroll + 1;
    }
  },

  queryHistory(context) {
    const { rootState, state } = context;
    const mid = this.queryHistoryMessageId || 0; // messageid, 第一条，最早的一个
    rootState.im.sysManage.requireHistoryMessage(state.sid, mid);

    context.commit('recordHistoryQuery');
  },

  actionUpdateMessageTime(context, time) {
    context.commit('setMessageTime', time);
  },

  actionUpdateQueryMessageId() {

  }
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
