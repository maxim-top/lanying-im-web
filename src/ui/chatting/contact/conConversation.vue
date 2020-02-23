<template>
  <div class="l_conversation" ref="imgContainer">
    <div class="item" :class="{sel:getSid==conversation.sid}" v-for="(conversation, index) in getConversationList"
         v-bind:key="index" @click="touchConversation(index)">
      <span :class="{'none' : conversation.unread === 0 }" class="unread_number">{{conversation.unread}}</span>
      <img class="avatar" :src="conversation.avatar" />
      <div class="name">{{conversation.name}}</div>
      <div class="last_msg_time">{{formatTimeString(conversation.timestamp)}}</div>
      <div class="last_msg">{{conversation.content}}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {toNumber} from "../../third/tools";
import moment from "moment";
export default {
  mounted() {
    this.$store.dispatch("contact/actionGetConversationList");
  },

  computed: {
    ...mapGetters("contact", ["getConversationList"]),
    ...mapGetters("content", ["getSid"]),
    token() {
      return this.$store.getters.im.userManage.getToken();
    }
  },

  methods: {
    formatTimeString( timestamp ) {
      if( !timestamp ) return "";

      const timestampNumber = toNumber(timestamp);
      return moment(timestampNumber).calendar("", {
          sameDay: "HH:mm",
          lastDay: "HH:mm",
          lastWeek: "YY/MM/DD",
          sameElse: "YY/MM/DD"
      });
    },

    touchConversation(index) {
      const conversation = this.getConversationList[index];
      this.$store.dispatch("header/actionChangeHeaderStatus", "conversation");
      this.$store.dispatch("content/actionSetType", {
        sid: conversation.sid,
        type: conversation.type === "group" ? "groupchat" : "rosterchat"
      });
    }
  }
};
</script>

<style scoped>
</style>
