<template>
  <div class="login">
    <p class="header">
      <span class="hint" > AppID: {{appid}}</span>
    </p>
    <div class="logo">
      <img src="/image/logo4.png" />
    </div>
    <p class="tab">绑定已有账户</p>
    <div class="iptFrame mt21">
      <input v-model="user.username" type="text" placeholder="用户名" autocomplete="false" />
    </div>

    <div class="iptFrame mt14">
      <input v-model="user.password" @keyup.enter="submit" type="password" ref="password" placeholder="密码" autocomplete="false" />
    </div>
    <div class="loginBtn mt14" @click="submit">绑定</div>
    <p class="tab">
      <span class="mr5 colorb" @click="switchLogin('bindreg')">注册并绑定</span></p>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "bindacc",
  props: ["sdkok", "appid"],
  data() {
    return {
      user: {
        username: "",
        password: ""
      }
    };
  },
  mounted() {},

  computed: {
    ...mapGetters("login", ["getMobileSign", "getSignMobile"])
  },
  methods: {
    nameEnter() {
      this.$refs.password.focus();
    },
    submit() {
      if (!this.user.username || !this.user.password) {
        this.$message.error("请输入用户名或密码");
        return;
      }
      const im = this.$store.state.im;
      im.rosterManage
        .asyncRegester(this.user)
        .then(() => {
          im.userManage
            .asyncUserMobileBindSign({
              mobile: this.getSignMobile,
              sign: this.getMobileSign
            })
            .then(() => {
              im.login({
                name: this.user.username,
                password: this.user.password
              });
            });
        })
        .catch(ex => {
          this.serr(ex);
          im.login({
            name: this.user.username,
            password: this.user.password
          });
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
