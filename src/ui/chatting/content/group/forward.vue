<template>
  <div
    v-if="getShowForwardList"
    class="forwardMemberList"
  >
    <div
      @click="cancelForward"
      class="closer"
    >X</div>
    <div class="sep">---好友---</div>
    <div
      v-for="roster in getRosterList"
      v-bind:key="roster.id"
      @click="clickMemberForwardMember(roster.id, 'roster')"
    >{{roster.name}}</div>
    <div class="sep">---群---</div>

    <div
      v-for="group in getGroupList"
      v-bind:key="group.id"
      @click="clickMemberForwardMember(group.id, 'group')"
    >{{group.name}}</div>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "RosterForward",
  mounted() {
    this.$store.dispatch("forward/actionGetForwardList");
  },
  data() {
    return {
      // status: "login"
    };
  },

  computed: {
    ...mapGetters("content", ["getSid", "getMessages", "getMessageTime"]),
    ...mapGetters("forward", [
      "getRosterList",
      "getGroupList",
      "getShowForwardList"
    ])
  },

  methods: {
    cancelForward() {
      this.$store.dispatch("forward/actionCancelForward", false);
    },

    clickMemberForwardMember(id, type) {
      this.$store.dispatch("forward/actionForwardMessage", {
        type,
        id
      });
    }
    //methods finish
  }
};
</script>

<style scoped>
</style>
