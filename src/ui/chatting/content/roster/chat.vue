<template>
  <div class="list" ref="rlist">
    <div @click="requestHistory" id="roster_history_btn">{{queryingHistory ? '正在拉取历史消息，请稍候' : '点击拉取历史消息'}}</div>
    <Message :message="message" v-bind:key="aid" v-for="(message, aid) in allMessages"/>
  </div>
</template>

<script>
// import Chat from "./chat.vue";
import Message from "./renderMsg.vue";
import {numToString, toNumber} from "../../../third/tools";

import {mapGetters} from "vuex";

export default {
  name: "RosterChat",
  mounted() {
    this.requireMessage();
    this.scroll();
    this.$store.getters.im.rosterManage.readRosterMessage(this.getSid);

    this.$store.getters.im.on("onRosterMessage", message => {
      this.reloadMessage(message);
    });

    this.$store.getters.im.on("onReceiveHistoryMsg", messages => {
      this.queryingHistory = false;
      this.$store.dispatch("content/actionAppendMessage", {
        history: true,
        messages: messages.messages,
        next: messages.next
      });
      !this.getMessages.length && this.scroll();
    });

    this.$store.getters.im.on("onMessageStatusChanged", () => {
      this.requireMessage();
    });

    this.$store.getters.im.on("onMessageRecalled", () => {
      this.requireMessage();
    });

    this.$store.getters.im.on("onMessageDeleted", message => {
      const uid = this.$store.getters.im.userManage.getUid();
      if (uid + "" === message.uid + "") {
        this.requireMessage();
      }
    });

    this.$store.getters.im.on("onMessageCanceled", message => {
      const uid = this.$store.getters.im.userManage.getUid();
      if (uid + "" === message.uid + "") {
        this.requireMessage();
      }
    });
  },

  data() {
    return {
      queryingHistory: false
    };
  },

  components: {
    Message
  },

  computed: {
    ...mapGetters("content", [
      "getSid",
      "getMessages",
      "getMessageTime",
      "getScroll"
    ]),
    allMessages() {
      const msgs = this.getMessages || [];
      msgs.forEach(x => {
        x.aid = numToString(x.id);
      });
      return msgs;
    }
  },
  watch: {
    getSid(a, b) {
      if (a !== b) {
        this.$store.getters.im.rosterManage.readRosterMessage(this.getSid);
        this.requireMessage();
        this.scroll();
      }
    },
    getScroll() {
      this.scroll();
    }
  },
  methods: {
    requireMessage() {
      setTimeout(() => {
        this.$store.dispatch("content/actionRequireMessage");
      }, 200);
    },
    reloadMessage(message) {
      const uid = this.$store.getters.im.userManage.getUid();
      const toUid = toNumber(message.to);
      const fromUid = toNumber(message.from);
      const pid = this.getSid;
      if (
        (uid === toUid && fromUid === pid) ||
        (uid === fromUid && toUid === pid)
      ) {
        this.$store.getters.im.rosterManage.readRosterMessage(this.getSid);
        this.requireMessage();
        this.scroll();
      }
    },

    requestHistory() {
      if (this.queryingHistory) {
        return;
      }
      this.queryingHistory = true;
      this.queryHistoryTimer && clearTimeout(this.queryHistoryTimer);
      this.queryHistoryTimer = setTimeout(() => {
        this.queryingHistory = false;
      }, 10000);
      this.$store.dispatch("content/queryHistory");
    },

    scroll() {
      setTimeout(() => {
        this.$refs.rlist &&
        (this.$refs.rlist.scrollTop = this.$refs.rlist.scrollHeight);
      }, 200);
    }
    //methods finish ...
  }
};
</script>

<style scoped>
</style>
