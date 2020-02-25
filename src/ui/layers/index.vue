<template>
  <div class="layer_frame">
    <Addfriend v-if="getShowing=='addfriend'"/>
    <ChangeAppID v-if="getShowing=='changeappid'"/>
    <CreateGroup v-if="getShowing=='creategroup'"/>
    <JoinGroup v-if="getShowing=='joingroup'"/>
    <GroupSetting v-if="getShowing=='groupsetting'"/>
    <Qrcode v-if="getShowing=='qrlogin'"/>
    <Qrcode v-if="getShowing=='qrprofile'"/>
    <Qrcode v-if="getShowing=='qrgroup'"/>
    <Searcher/>
    <AddPop v-if="getShowing=='addpop'"/>
    <Video v-if="getShowing=='video'"/>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

import AddPop from "./addpop";
import ChangeAppID from "./changeappid";
import CreateGroup from "./creategroup";
import JoinGroup from "./joingroup";
import Addfriend from "./addfriend";
import GroupSetting from "./groupsetting";
import Searcher from "./search";
import Qrcode from "./qrcode";
import Video from "./video";

export default {
  name: "contentIndex",
  mounted() {
  },
  components: {
    AddPop,
    Addfriend,
    ChangeAppID,
    CreateGroup,
    JoinGroup,
    GroupSetting,
    Searcher,
    Qrcode,
    Video
  },
  computed: {
    ...mapGetters("layer", ["getShowing"])
  },
  methods: {}
};
</script>

<style scoped>
</style>
