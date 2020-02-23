<template>
  <div class="inputer_frame">
    <div class="attach">
      <input type="file" ref="fileRef" @change="fileChangeHandler" />
      <span @click="imageUploadClickHandler" class="ico image"></span>
      <span @click="fileUploadClickHandler" class="ico file"></span>
    </div>
    <div class="input">
      <textarea class="input_text" placeholder="Type a message!" wrap="hard" @keydown="textareaKeyDown" v-model="message" @focus="inputFocusHandler" @blur="inputBlurHandler"></textarea>
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
      fileType: ""
    };
  },
  components: {},
  computed: {
    ...mapGetters("content", ["getSid"]),
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
    imageUploadClickHandler() {
      this.fileType = "image";
      this.$refs.fileRef.click();
    },
    fileUploadClickHandler() {
      this.fileType = "file";
      this.$refs.fileRef.click();
    },
    handleSendMessage() {
      if (/^\s*$/.test(this.message)) {
        this.message = "";
        return;
      }
      this.im.sysManage.sendRosterMessage({
        content: this.message,
        uid: this.getSid
      });
      setTimeout(() => {
        this.message = "";
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
          chatType: "roster"
        })
        .then(res => {
          const fileInfo = {
            dName: file.name,
            fLen: file.size,
            width: 0,
            height: 0
          };
          fileInfo.url = res.url;
          this.im.sysManage.sendRosterMessage({
            type: this.fileType,
            uid: this.getSid,
            content: "",
            attachment: fileInfo
          });
          this.$refs.fileRef.value = "";
        })
        .catch(() => {
          this.$refs.fileRef.value = "";
        });
    },
    inputFocusHandler() {
      this.im.sysManage.sendInputStatusMessage(this.getSid, "typing");
    },

    inputBlurHandler() {
      this.im.sysManage.sendInputStatusMessage(this.getSid, "nothing");
    }
    //methods finish
  }
};
</script>

<style scoped>
</style>
