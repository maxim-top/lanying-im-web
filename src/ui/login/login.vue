<template>
  <div class="login">
    <p class="header">
      <span class="hint" @click="changeAppID(appid)"> AppID: {{appid}}</span>
      <img class='edit_logo' @click="changeAppID(appid)" src='/image/edit.png' />
      <img src="/image/qr.png" class="qrcode" title="扫码登录" @click="switchLogin('qrlogin')" />
    </p>
    <div class="logo">
      <img src="/image/logob.png" />
    </div>
    <div class="iptFrame mt21">
      <input v-model="user.name" @keyup.enter="nameEnter" type="text" placeholder="用户名" autocomplete="false" />
    </div>

    <div class="iptFrame mt14">
      <input v-model="user.password" @keyup.enter="submit" type="password" ref="password" placeholder="密码" autocomplete="false" />
    </div>
    <div class="loginBtn mt14" @click="submit">{{sdkok? '登录' : '加载中...'}}</div>
    <p class="tab">
      <span class="mr5 colorb" @click="switchLogin('codelogin')" >手机验证码登录</span>|<span class="ml5" @click="switchLogin('regedit')">注册</span>
    </p>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "login",
  props: ["sdkok", "appid"],
  data() {
    return {
      user: {
        name: "",
        password: ""
      }
    };
  },

  computed: {
    ...mapGetters("login", ["getShowLayerFlag", "getLoginLog"]),

  },
  methods: {
    nameEnter() {
      this.$refs.password.focus();
    },
    submit() {
      if (this.sdkok) {
        this.$store.state.im.login(this.user);
      }
    },

    changeAppID(presentAppID){
      this.$store.dispatch("layer/actionSetAppID", presentAppID);
      this.$store.dispatch("layer/actionSetShowing", "changeappid");
      this.$store.dispatch("layer/actionSetShowmask", "true");
    },

    switchLogin(type) {
      if (this.sdkok) {
        this.$store.dispatch("login/actionChangeAppStatus", type);
      }
    }
  }
};
</script>

<style scoped>
</style>
