<template>
  <div>
    <Login v-if="sappStatus=='login'" :sdkok="sdkok" :appid="appid"/>
    <Regedit v-if="sappStatus=='regedit'" :sdkok="sdkok" :appid="appid"/>

    <Bindacc v-if="sappStatus=='bindacc'" :sdkok="sdkok" :appid="appid" />
    <Bindreg v-if="sappStatus=='bindreg'" :sdkok="sdkok" :appid="appid"/>
    <Codelogin v-if="sappStatus =='codelogin'" :sdkok="sdkok" :appid="appid"/>
    <Qrlogin v-if="sappStatus=='qrlogin'" :sdkok="sdkok" :appid="appid"/>
    <Bind v-if="sappStatus=='bind'" :sdkok="sdkok" :appid="appid"/>
  </div>
</template>

<script>
import Login from "./login.vue";
import Regedit from "./regedit.vue";

import Bindacc from "./bindacc.vue";
import Bindreg from "./bindreg.vue";
import Codelogin from "./codelogin.vue";
import Qrlogin from "./qrlogin.vue";
import Bind from "./bind.vue";

import { mapGetters } from "vuex";
export default {
  name: "index",
  props: ["sdkok", "appid"],
  data() {
    return {};
  },
  components: {
    Login,
    Regedit,
    Bindacc,
    Bindreg,
    Codelogin,
    Qrlogin,
    Bind
  },
  computed: {
    ...mapGetters("login", ["getAppStatus"]),

    sappStatus() {
      return this.getAppStatus;
    }
  },
  methods: {
    changeAppID(presentAppID){
      this.$store.dispatch("layer/actionSetAppID", presentAppID);
      this.$store.dispatch("layer/actionSetShowing", "changeappid");
      this.$store.dispatch("layer/actionSetShowmask", "true");
    },
    // ...mapActions("login", ["alertName"])
  },
  watch: {}
};
</script>

<style scoped>
</style>
