<template>
  <div class="header">
    <span @click="touchUserNameHandler">{{groupName}}</span>
    <div class="mention_title" v-if="this.mentionMessage!==''">
      <span @click="closeMention" class=closer>x</span>
      <span class="text">{{mentionMessage}}</span>
    </div>
    <span class="typing" style="padding-left:20px;color:#DDD;"></span>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { toNumber } from "../../../third/tools";
export default {
  name: "GroupChat",
  data() {
    return {
      mentionMessage: ""
    };
  },
  mounted() {
    this.$store.getters.im.on("onMentionMessage", messages => {
      const { from, config } = messages;
      const gid = this.getSid;
      const toUid = toNumber(messages.to);
      if (gid === toUid) {
        if (config && config.mentionList && config.mentionList.length) {
          // 如果有mention的
          const uid = this.$store.getters.im.userManage.getUid();
          const hasIndex = config.mentionList.findIndex(
            x => x + "" === uid + ""
          );
          if (hasIndex > -1) {
            const umaps = this.$store.getters.im.rosterManage.getAllRosterDetail();
            const str = umaps[from].username + " 在群中提到了您!";
            this.mentionMessage = str;
          }
        }
        ////
      }
    });
  },
  components: {},
  computed: {
    ...mapGetters("content", ["getGroupInfo", "getSid"]),
    groupName() {
      return this.getGroupInfo.name;
    }
  },
  methods: {
    touchUserNameHandler() {
      this.$store.dispatch("content/actionSetType", {
        sid: this.getSid,
        type: "groupinfo"
      });
    },
    closeMention() {
      this.mentionMessage = "";
    }
    //finish
  }
};
</script>

<style scoped>
</style>
