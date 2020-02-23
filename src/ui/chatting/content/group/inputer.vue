<template>
  <div class="inputer_frame">
    <div class="attach">
      <div class="mentionList" v-if="this.filteredMentionRosters.length > 0">
        <div v-for="roster in this.filteredMentionRosters" :key="roster.user_id" @click="clickMemberListHander(roster.user_id)" class="mentionItem">{{roster.display_name}}</div>
      </div>
      <input type="file" ref="fileRef" @change="fileChangeHandler" />
      <span @click="imageUploadClickHandler" class="ico image"></span>
      <span @click="fileUploadClickHandler" class="ico file"></span>
    </div>
    <div class="input">
      <textarea class="input_text" placeholder="Type a message!" wrap="hard" @keydown="textareaKeyDown" @keyup="textKeyUp" v-model="message"></textarea>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "rosterInputer",
  data() {
    return {
      message: "",
      fileType: "",
      mentionSelectedUids: [],
      willsendMessage: "",
      filteredMentionRosters: []
    };
  },
  components: {},
  computed: {
    ...mapGetters("content", ["getSid", "getMemberList"]),
    im() {
      return this.$store.state.im;
    }
  },
  methods: {
    textareaKeyDown(evt) {
      if (evt.keyCode === 13 && !evt.shiftKey) {
        this.handleSendMessage();
        if (evt && evt.stopPropagation) {
          evt.preventDefault();
        } else {
          window.event.cancelBubble = true;
          return false;
        }
      }
    },
    textKeyUp() {
      const varr = (this.message.split && this.message.split("@")) || [];
      if (varr.length >= 2) {
        const str = varr[varr.length - 1];
        if (str.indexOf(" ") == -1) {
          //不包含空格，表示@状态
          this.filterMemberList(str);
        } else {
          //包含空格，表示被截断，非@状态
          this.filteredMentionRosters = [];
          this.calcMentionIds();
        }
      } else {
        this.filteredMentionRosters = [];
      }
    },
    filterMemberList(str) {
      let ret = [];
      if (!str) {
        ret = [].concat(this.getMemberList);
      } else {
        ret = this.getMemberList.filter(x => {
          return x.display_name.indexOf(str) >= 0;
        });
      }
      this.filteredMentionRosters = [].concat(ret);
    },
    calcMentionIds() {
      if (!this.message) return;
      let mentionArr = (this.message.split && this.message.split(" ")) || [];
      // mentionArr = mentionArr.filter(x => x.indexOf('@') !== -1);
      const selArray = [];
      let retStr = "";
      mentionArr.forEach(mention => {
        if (mention.indexOf("@") === -1) {
          if (mention) {
            retStr += mention + " ";
          }
        } else {
          const marr = mention.split("@");
          const nickName = marr[marr.length - 1];
          const rosters = this.getMemberList.filter(
            x => x.display_name === nickName
          );
          if (!rosters || rosters.length <= 0) {
            retStr += mention + " ";
          } else {
            const realRoster =
              rosters.find(
                x => this.mentionSelectedUids.indexOf(x.user_id + "") > -1
              ) || rosters[0];
            marr[marr.length - 1] = "{" + realRoster.user_id + "}";
            retStr += marr.join("@") + " ";
            selArray.push(realRoster.user_id);
          }
        }
      });
      this.willsendMessage = retStr;
      this.mentionSelectedUids = [].concat(selArray);
    },

    imageUploadClickHandler() {
      this.fileType = "image";
      this.$refs.fileRef.click();
    },
    fileUploadClickHandler() {
      this.fileType = "file";
      this.$refs.fileRef.click();
    },
    handleSendMessage() {
      const txt = this.message;
      if (/^\s*$/.test(txt)) {
        this.message = "";
        return;
      }
      if (this.willsendMessage && this.mentionSelectedUids.length) {
        //mention消息
        /**
           static const std::string kMentionAll = “mentionAll”;              // bool
          static const std::string kMentionList = “mentionList”;            // vector<int64_t>
          static const std::string kMentionedMessage = “mentionedMessage”;  // string
          static const std::string kPushMessage = “pushMessage”;            // string
          static const std::string kSenderNickname = “senderNickname”;      // string
           */
        const mentionAll = false;
        const mentionList = this.mentionSelectedUids.map(x => x - 0);
        const mentionedMessage = "";
        const pushMessage = "";
        const uid = this.im.userManage.getUid();
        const rInfo = this.im.rosterManage.getRosterInfo(uid);
        const senderNickname = rInfo.username || rInfo.user_id + "";
        this.im.sysManage.sendMentionMessage({
          gid: this.getSid,
          // txt: this.willsendMessage,
          txt: this.message,
          mentionAll,
          mentionList,
          mentionedMessage,
          pushMessage,
          senderNickname
        });
      } else {
        if (!txt) return;
        this.im.sysManage.sendGroupMessage({
          // type: 'text', // image , file， 默认 text， 可省略
          content: txt,
          gid: this.getSid
        });
      }
      setTimeout(() => {
        this.message = [];
        this.willsendMessage = "";
        this.mentionSelectedUids = [];
        this.filteredMentionRosters = [];
      }, 200);
    },

    fileChangeHandler(e) {
      const file = e.target.files[0];
      this.im.sysManage
        .asyncFileUpload({
          file,
          fileType: this.fileType,
          to_id: this.getSid,
          toType: "chat",
          chatType: "group"
        })
        .then(res => {
          const fileInfo = {
            dName: file.name,
            fLen: file.size,
            width: 0,
            height: 0
          };
          fileInfo.url = res.url;
          this.im.sysManage.sendGroupMessage({
            type: this.fileType,
            gid: this.getSid,
            content: "",
            attachment: fileInfo
          });
          this.$refs.fileRef.value = "";
        })
        .catch(() => {
          this.$refs.fileRef.value = "";
        });
    },
    clickMemberListHander(uid) {
      const set = new Set(this.mentionSelectedUids);
      set.add(uid);
      const arr = Array.from(set);
      if (arr.length !== this.mentionSelectedUids.length) {
        this.mentionSelectedUids = [].concat(arr);
        const roster = this.getMemberList.find(
          x => x.user_id + "" === uid + ""
        );
        const sarr = (this.message.split && this.message.split("@")) || [];
        sarr[sarr.length - 1] = roster.display_name;
        this.message = sarr.join("@") + " ";
        this.textKeyUp();
      }
    }
    //methods finish
  }
};
</script>

<style scoped>
</style>
