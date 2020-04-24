<template>
  <div class="ui-index">
    <div class="layer_mask" v-if="getShowmask"></div>
    <Chatting v-if="getAppStatus=='chatting'"/>
    <Login :appid="appid" :sdkok="sdkok" v-else/>
    <Layers/>
  </div>
</template>

<script>
import Login from "./login/index.vue";
import Chatting from "./chatting/index.vue";
import Layers from "./layers/index.vue";
import {mapGetters} from "vuex";

// 您有两种方式使用 flooim：
// 1. script 模式，你可以直接 import 后，使用 window.flooIM()
// 这种方式主要为支持浏览器中使用 script 标签引用，但会存在初始化并发问题，所以要用 try-catch-retry，具体使用方法见下文。
// import '../im/floo-2.0.0';
// 2. module 方式，import flooim 后，使用 flooim()
import flooim from '../im/floo-2.0.0';

export default {
  name: "index",
  components: {
    Login,
    Chatting,
    Layers
  },
  data() {
    return {
      appid: '',
      sdkok: false
    };
  },
  mounted() {
    this.appid = this.$parent.appid;
    this.$store.dispatch("actionChangeAppID", this.appid);
    // this.prepare(this.appid);
  },
  watch: {
    getAppID: {
      handler(newAppID) {
        this.prepare(newAppID);
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters("login", ["getAppStatus", "getMobileSign", "getSignMobile"]),
    ...mapGetters("layer", ["getShowmask"]),
    ...mapGetters(["getAppID"]),

    showLogin() {
      return this.getAppStatus != "chatting";
    },

    showChatting() {
      return this.getAppStatus === "chatting";
    }
  },
  methods: {
    prepare(newAppID) {
      // not prepare for same appid except the previous preparation is aborted;
      if (newAppID && (newAppID !== this.appid || !this.sdkok)) {
        this.appid = newAppID;
        this.sdkok = false;
        setTimeout(() => {
          this.init_flooIM();
        }, 100);
      } else {
        console.log("Invalid AppID", newAppID);
      }
    },

    init_flooIM() {
      const config = {
        dnsServer: "https://dns.maximtop.com/app_dns",
        appid: this.appid,
        ws: false,
        autoLogin: true
      };
      console.log("Init floo IM for ", this.appid);

      // 1. 使用 flooim script 方式
      // try {
      //   // const im = new window.flooIM(config);
      //   this.$store.dispatch("actionSaveIm", im);
      //   this.sdkok = true;
      // } catch (ex) {
      //   // sdk not ready, should retry later
      //   console.log(ex);
      //   setTimeout(() => {
      //     this.init_flooIM();
      //   }, 500);
      // }

      // 2. 使用 flooim module 模式
      const im = flooim(config);
      this.$store.dispatch("actionSaveIm", im);
      this.sdkok = true;

      if (this.sdkok) {
        this.$store.state.im.on({
          loginMessage: msg => {
            this.$store.dispatch("login/actionAddLoginLog", msg);
          },
          loginSuccess: () => {
            this.$store.dispatch("login/actionChangeAppStatus", "chatting");
            this.bindMobile();
          },
          logout: () => {
            this.$store.dispatch("login/actionChangeAppStatus", "login");
          },
          loginUnnormal: () => {
            window.location.reload();
          },
          onReloginRequired: () => {
            window.location.reload();
          },
          dnsError: () => {
            window.alert("dns服务器错误，请刷新重试");
          }
        });
      }
    },
    bindMobile() {
      if (this.getMobileSign && this.getSignMobile) {
        this.$store.state.im.userManage
          .asyncUserMobileBindSign({
            mobile: this.getSignMobile,
            sign: this.getMobileSign
          })
          .then(() => {
            this.$store.dispatch("login/actionSetMobileSign", "");
            this.$store.dispatch("login/actionSetSignMobile", "");
          });
      }
    }
  }
};
</script>

<style scoped>
</style>
