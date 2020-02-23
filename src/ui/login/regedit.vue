<template>
  <div class="login">
    <p class="header">
      <span class="hint" @click="changeAppID(appid)"> AppID: {{appid}}</span>
      <img class='edit_logo' @click="changeAppID(appid)" src='/image/edit.png' />
    </p>
    <div class="logo">
      <img src="/image/logob.png" />
    </div>
    <!-- <div class="tab">
      <span>登录</span>
      <span class="reg" @click="touchQrcode">二维码登录</span>
      <span class="reg" @click="touchReg">注册</span>
    </div> -->
    <div class="iptFrame mt21">
      <input v-model="user.username" type="text" placeholder="用户名" autocomplete="false" />
    </div>

    <div class="iptFrame mt14">
      <input v-model="user.password" @keyup.enter="submit" type="password" ref="password" placeholder="密码" autocomplete="false" />
    </div>
    <div class="loginBtn mt14" @click="submit">注册</div>
    <!-- <div class="log">
      <p v-for="(txt, index) in getLoginLog" :key="index">{{txt}}</p>
    </div> -->
    <p class="tab">
      <span class="mr5 colorb" @click="switchLogin('login')">已有账号，去登录</span></p>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "regedit",
  props: ["sdkok", "appid"],
  data() {
    return {
      user: {
        username: "",
        password: ""
      }
    };
  },

  computed: {
    ...mapGetters("login", ["getShowLayerFlag", "getLoginLog"])
  },
  methods: {
    changeAppID(presentAppID){
      this.$store.dispatch("layer/actionSetAppID", presentAppID);
      this.$store.dispatch("layer/actionSetShowing", "changeappid");
      this.$store.dispatch("layer/actionSetShowmask", "true");
    },

    nameEnter() {
      this.$refs.password.focus();
    },
    submit() {
      if (!this.user.username || !this.user.password) {
        this.$message.error("请输入用户名或密码");
        return;
      }
      const im = this.$store.state.im;
      im.rosterManage.asyncRegester(this.user).then(() => {
        this.$store.dispatch("login/actionSetLoginInfo", this.user);
        this.$store.dispatch("login/actionChangeAppStatus", "bind");
      });
    },
    switchLogin(type) {
      this.$store.dispatch("login/actionChangeAppStatus", type);
    }
  }
};
</script>

<style scoped>
</style>
