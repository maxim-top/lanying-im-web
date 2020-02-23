<template>
  <div class="user_setting">

    <div class="avatar">
      <input type="file" ref="fileRef" @change="fileChangeHandler" />
      <img @click="touchedAvatar" class="av" :src="groupInfo.avatar" />
      <img v-if="groupInfo.member_invite" src="/image/qr.png" class="qrcode" @click="viewQrcode" />
    </div>

    <div class="line">
      <span class="ll">群名称</span>
      <p class="lr" @click="nameModifyHandler">{{groupInfo.name}}</p>
    </div>

    <div class="line">
      <span class="ll">群id</span>
      <p class="lr" >{{getSid}}</p>
    </div>

    <div class="line">
      <span class="ll">群描述</span>
      <p class="lr" @click="descriptionModifyHanderl">{{groupInfo.description}}</p>
    </div>

    <div class="line">
      <span class="ll">群名片</span>
      <p class="lr" @click="cardModifyHandler">{{cardName}}</p>
    </div>

    <div class="logout mt15" @click="destroyClickHandler">{{dismissMessage}}</div>

    <div class="logout mt15" @click="chatClickHandler">开始聊天</div>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "groupInfo",
  data() {
    return {
      groupInfo: {},
      cardName: ""
    };
  },
  mounted() {
    this.refreshGroupInfo(this.getSid);
  },
  watch: {
    getSid( newSid ){
      this.refreshGroupInfo(newSid);
    }
  },
  components: {},
  computed: {
    ...mapGetters("content", [
      "getGroupInfo",
      "getSid",
      "getAdminList",
      "getMemberList"
    ]),

    token() {
      return this.$store.getters.im.userManage.getToken();
    },

    group_id() {
      return this.getGroupInfo.group_id;
    },

    owner_id() {
      return this.getGroupInfo.owner_id;
    },
    isAdmin() {
      const uid = this.$store.getters.im.userManage.getUid();
      return (
        this.getAdminList.filter(x => x.user_id === uid).length > 0 ||
        this.getGroupInfo.member_modify
      );
    },
    isOwner() {
      const uid = this.$store.getters.im.userManage.getUid();
      return this.getGroupInfo.owner_id === uid;
    },
    dismissMessage() {
      return this.isOwner ? "解散" : "退出";
    }
  },
  methods: {
    refreshGroupInfo( newSid ){
      this.$store.getters.im.groupManage.asyncGetInfo({ group_id: newSid })
              .then( res => {
                res.avatar = this.$store.getters.im.sysManage.getImage({
                  avatar: res.avatar,
                  type: 'group'
                });
                this.groupInfo = res;
              })
              .catch(ex => {
                this.serr(ex);
              });

      const uid = this.$store.getters.im.userManage.getUid();
      const user = this.getMemberList.find(x => x.user_id === uid);
      this.cardName = (user && (user.display_name || user.name)) || "";
    },
    chatRemoveHandler() {
      this.$store.getters.im.rosterManage
        .asyncDeleteRoster({ user_id: this.getSid })
        .then(() => {
          alert("好友已删除");
        });
    },
    chatClickHandler() {
      this.$store.dispatch("header/actionChangeHeaderStatus", "conversation");
      this.$store.dispatch("content/actionSetType", {
        sid: this.getSid,
        type: "groupchat"
      });
    },
    touchedAvatar() {
      if (this.isAdmin) {
        this.$refs.fileRef.click();
      }
    },

    fileChangeHandler(e) {
      const file = e.target.files[0];

      this.$store.getters.im.sysManage
        .asyncFileUpload({
          file,
          toType: "groupAvatar",
          group_id: this.getSid
        })
        .then(res => {
          this.$refs.fileRef.value = "";
          this.updateAvatarUrl(res.url);
        })
        .catch(() => {
          this.$refs.fileRef.value = "";
        });
    },

    updateAvatarUrl(url) {
      this.$store.getters.im.groupManage
        .asyncUpdateAvatar({
          group_id: this.getSid,
          value: url
        })
        .then(() => {
          this.$store.dispatch("content/actionUpdateGroup");
          alert("更新头像完成");
        });
    },

    destroyClickHandler() {
      if (this.isOwner) {
        //dismiss
        this.$store.getters.im.groupManage
          .asyncDestroy({ group_id: this.getSid })
          .then(() => {
            alert("您已解散了此群。。");
          });
      } else {
        //leave
        this.$store.getters.im.groupManage
          .asyncLeave({ group_id: this.getSid })
          .then(() => {
            alert("您已退出了此群。。");
          });
      }
    },
    viewQrcode() {
      this.$store.dispatch("layer/actionSetShowmask", "true");
      this.$store.dispatch("layer/actionSetShowing", "qrgroup");
    },
    nameModifyHandler() {
      if (!this.isAdmin && !this.isOwner && !this.getGroupInfo.member_modify) {
        return;
      }
      this.$prompt("请输入群名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          if (!value) return;
          this.$store.getters.im.groupManage
            .asyncUpdateName({
              group_id: this.getSid,
              value
            })
            .then(() => {
              this.name = value;
              alert("修改成功");
            });
        })
        .catch(() => {});
    },
    descriptionModifyHanderl() {
      if (!this.isAdmin && !this.isOwner && !this.getGroupInfo.member_modify) {
        return;
      }
      this.$prompt("请输入群描述", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          if (!value) return;
          this.$store.getters.im.groupManage
            .asyncUpdateDescription({
              group_id: this.getSid,
              value
            })
            .then(() => {
              this.description = value;
              alert("修改成功");
            });
        })
        .catch(() => {});
    },
    cardModifyHandler() {
      if (!this.isAdmin && !this.isOwner && !this.getGroupInfo.member_modify) {
        return;
      }
      this.$prompt("请输入群名片", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          if (!value) return;
          this.$store.getters.im.groupManage
            .asyncUpdateDisplayName({
              group_id: this.getSid,
              value
            })
            .then(() => {
              this.$store.dispatch("content/actionUpdateMemberList");
              this.cardName = value;
              alert("修改成功");
            });
        })
        .catch(() => {});
    }
    //methods finish
  }
};
</script>

<style scoped>
.mt15 {
  margin-top: 15px !important;
}
</style>
