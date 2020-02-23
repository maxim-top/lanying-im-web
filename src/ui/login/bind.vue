<!-- 
用来注册之后的绑定程序...
-->
<template>
  <div class="login">
    <p class="header">
      <span class="hint"> AppID: {{appid}}</span>
    </p>
    <span class="skip" @click="login">跳过</span>
    <div class="logo">
      <img src="/image/logob.png" />
    </div>
    <div class="iptFrame mt21">
      <input v-model="user.mobile" @keyup.enter="nameEnter" type="text" placeholder="手机号" autocomplete="false" />
    </div>

    <div class="cframe mt14">
      <div class="ipframe">
        <input v-model="user.captcha" @keyup.enter="submit" type="text" placeholder="图片验证码" autocomplete="false" />
      </div>
      <img v-if="codeImageSrc" :src="codeImageSrc" class="vm ml15 w150 h45  pointer" @click="timerImage" />
    </div>

    <div class="cframe mt14">
      <div class="ipframe">
        <input v-model="user.code" @keyup.enter="submit" type="text" placeholder="手机验证码" autocomplete="false" />
      </div>
      <div class="smallbtn" @click="sendSms">{{checkText}}</div>
    </div>
    <div class="loginBtn mt14" @click="submit">绑定</div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "bind",
  props: ["sdkok", "appid"],
  data() {
    return {
      user: {
        mobile: "",
        captcha: "",
        code: "",
        checkCodeTime: 0,
        checkCodeTimer: null
      }
    };
  },
  mounted() {
    this.timerImage();
  },

  computed: {
    ...mapGetters("login", ["getLoginInfo"]),
    codeImageSrc() {
      if (!this.user["image_captcha_id"]) return "";
      return `${
        this.$store.state.im.sysManage.getServers().ratel
      }/app/captcha/image?image_id=${
        this.user["image_captcha_id"]
      }&app_id=${this.$store.state.im.userManage.getAppid()}`;
    },
    checkText() {
      if (this.checkCodeTime > 0) {
        return `${this.checkCodeTime} 秒`;
      }
      return "获取验证码";
    }
  },
  methods: {
    submit() {
      if (!this.user.code || !this.user.mobile) {
        alert("请输入手机号和验证码");
        return;
      }
      const im = this.$store.state.im;
      im.userManage
        .asyncUserMobileLogin({
          captcha: this.user.code,
          mobile: this.user.mobile
        })
        .then(res => {
          if (res.username) {
            alert("该手机已被使用！");
          } else if (res.sign) {
            this.$store.dispatch("login/actionSetMobileSign", res.sign);
            this.$store.dispatch("login/actionSetSignMobile", this.user.mobile);
            this.login();
          }
        });
    },

    switchLogin(type) {
      this.$store.dispatch("login/actionChangeAppStatus", type);
    },
    getImageCode() {
      this.$store.state.im.userManage.asyncCaptchaImagePost().then(res => {
        const obj = Object.assign({}, this.user, { image_captcha_id: res });
        this.user = obj;
      });
    },
    timerImage() {
      this.imageTimer && clearInterval(this.timerImage);
      this.getImageCode();
      this.imageTimer = setInterval(() => {
        this.getImageCode();
      }, 3 * 60 * 1000);
    },
    sendSms() {
      if (!this.user.mobile) {
        this.$message.error("请输入手机号");
        return;
      }

      this.$store.state.im.userManage
        .asyncCaptchaSms({
          captcha: this.user.captcha,
          image_id: this.user.image_captcha_id,
          mobile: this.user.mobile
        })
        .then(() => {
          this.checkCodeTime = 60;
          this.checkCodeTimer = setInterval(() => {
            this.checkCodeTime -= 1;
            if (this.checkCodeTime == 0) {
              clearInterval(this.checkCodeTimer);
            }
          }, 1000);
        });
    },
    login() {
      this.$store.state.im.login({
        name: this.getLoginInfo.username,
        password: this.getLoginInfo.password
      });
    }
    //
  }
};
</script>

<style scoped>

</style>
