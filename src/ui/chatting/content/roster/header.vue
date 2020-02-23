<template>
  <div class="header">
    <span @click="touchUserNameHandler">{{rosterName}}</span>
    <span v-if="status" class="typing" style="padding-left:10px;color:#DDD;font-size:10px;">正在输入...</span>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "RosterChat",
  data() {
    return {
      status: false
    };
  },
  mounted() {
    this.$store.getters.im.on("onInputStatusMessage", message => {
      const { from, ext } = message;
      if (from == this.getSid) {
        const { input_status } = ext;
        if (input_status == "nothing") {
          this.status = false;
        } else {
          this.status = true;
        }
      }
    });
  },
  components: {},
  computed: {
    ...mapGetters("content", ["getRosterInfo", "getSid"]),
    rosterName() {
      return this.getRosterInfo.nick_name || this.getRosterInfo.username;
    }
  },
  methods: {
    touchUserNameHandler() {
      this.$store.dispatch("content/actionSetType", {
        sid: this.getSid,
        type: "rosterinfo"
      });
    }
  }
};
</script>

<style scoped>
</style>
