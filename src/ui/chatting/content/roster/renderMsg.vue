<template>
  <div>
    <!-- <div v-if="messageType===1"> -->
    <div v-if="timeMessage!=''" class="timeline">{{timeMessage}}</div>
    <div :class="{messageFrame:true, self:isSelf, roster:!isSelf}">
      <div class="rosterInfo">
        <img :src="userObj.avatar" />
      </div>
      <div class="contentFrame">
        <p class="username" v-if="!isSelf">{{userObj.username}}</p>
        <div class="c_content">
          <div v-if="message.type === 'text'">{{message.content}}</div>
          <div v-if="message.type === 'image'">
            <img v-if="attachImage!==''" :src="attachImage" @click="touchImage" />
          </div>
          <div v-if="message.type === 'audio'" class="audio_frame" @click="playAudio">
            <img class="audio" src="/image/audio.png" />
          </div>
          <div v-if="message.type === 'video'" class="video_frame" @click="playVideo">
              <img class="preview" :src="videoImage" />
              <img class="play" src="/image/play.png" />
          </div>
          <div v-if="message.type === 'file'" class="loc_frame">
            <img class="loc" src="/image/file2.png" />
            <span class="loc_txt" @click="downloadFile">{{attachName}}</span>
          </div>
          <div v-if="message.type === 'location'" @click="openLocation" class="loc_frame">
            <img class="loc" src="/image/loc.png" />
            <span class="loc_txt">{{attachLocation.addr}}</span>
          </div>

          <el-popover :placement="isSelf? 'left':'right'" width="70" trigger="hover">
            <div class="messageExt">
              <div v-if="!message.h" class="item delete" @click="deleteMessage">删除</div>
              <div class="recall item" @click="forwardMessage">转发</div>
              <div class="recall item" v-if="isSelf && !message.h" @click="recallMessage">撤回</div>

              <div class="msgStatus item item" v-if="isSelf && !ackStatus && !message.h">未读</div>
              <div class="msgStatus item" v-if="isSelf && ackStatus===1  && !message.h">送达</div>
              <div class="msgStatus item" v-if="isSelf && ackStatus===2  && !message.h">已读</div>

              <div class="unread item" v-if="ackStatus===3 && !isSelf  && !message.h">未读</div>
              <div class="set_unread item" v-if="ackStatus!==3 && !isSelf  && !message.h" @click="unreadMessage">设置未读</div>
            </div>
            <div class="h_image" slot="reference">
              <img src="/image/more.png" />
            </div>

          </el-popover>
        </div>

      </div>
    </div>
    <!-- </div> -->
    <!-- <div v-if="messageType===3">
      renderRosterNotice
    </div>
    <div v-if="messageType===4">
      renderUserNotice
    </div> -->
  </div>
</template>

<script>
// import Chat from "./chat.vue";
// import Inputer from "./inputer.vue";
import moment from "moment";
import { toNumber, numToString } from "../../../third/tools";
import { mapGetters } from "vuex";

import {} from "vuex";
export default {
  name: "RosterChat",
  data() {
    return {};
  },
  mounted() {
    let { timestamp } = this.message;
    timestamp = toNumber(timestamp);
    const savedMessageTime = this.getMessageTime;
    const last =
      (savedMessageTime.length &&
        savedMessageTime[savedMessageTime.length - 1]) ||
      0;
    if (timestamp - last > 5 * 60 * 1000) {
      this.$store.dispatch("content/actionUpdateMessageTime", timestamp);
    }
  },
  components: {
    // Chat,
    // Inputer
  },
  props: ["message"],
  computed: {
    ...mapGetters("content", ["getSid", "getMessageTime"]),
    timeMessage() {
      let { timestamp } = this.message;
      timestamp = toNumber(timestamp);
      if (this.getMessageTime.indexOf(timestamp) >= 0) {
        return moment(timestamp).calendar("", {
          sameDay: "HH:mm",
          lastDay: "HH:mm",
          sameElse: "YYYY-MM-DD HH:mm"
        });
      }
      return "";
    },
    im() {
      return this.$store.state.im;
    },
    token() {
      return this.im.userManage.getToken();
    },

    isSelf() {
      const uid = this.$store.getters.uid;
      const cid = numToString(this.message.from);
      return cid + "" === uid + "";
    },
    userObj() {
      const cuid = this.im.userManage.getUid();
      const umaps = this.im.rosterManage.getAllRosterDetail();
      const fromUid = toNumber(this.message.from);
      const fromUserObj = umaps[fromUid] || {};
      let username = fromUserObj.username || "";
      let avatar = this.im.sysManage.getImage({ avatar: fromUserObj.avatar });

      if (fromUid === cuid) {
        username = "我自己";
      }
      return { username, avatar };
    },

    attachUrl() {
      const attach = this.message.attach || {};
      const { url = "" } = attach;

     if (url) {
        return ( url +
                "&access-token=" +
                this.im.userManage.getToken() +
                "&app_id=" +
                this.im.userManage.getAppid()
        );
      }else{
       return url;
     }
    },

    attachImage() {
      const image = this.im.sysManage.getImage({ avatar: this.attachUrl });
      return image;
    },

    attachAudio() {
      let attachUrl = this.attachUrl;
      if (attachUrl) {
        return attachUrl + "&format=mp3";
      }
      return "";
    },
    attachVideo() {
      return this.attachUrl;
    },
    attachFile() {
      return this.attachUrl;
    },
    videoImage() {
      const attachment = this.message.attach || "{}";
      const { url, tUrl } = attachment;
      if (tUrl && tUrl.length) {
        return (
          tUrl +
          "&access-token=" +
          this.im.userManage.getToken() +
          "&app_id=" +
          this.im.userManage.getAppid() +
          "&image_type=2"
        );
      } else if (url) {
        return (
          url +
          "&access-token=" +
          this.im.userManage.getToken() +
          "&app_id=" +
          this.im.userManage.getAppid() +
          "&image_type=3"
        );
      }
      return url;
    },
    attachLocation() {
      const attachment = this.message.attach || "{}";
      let attachObj = {};
      try {
        attachObj = JSON.parse(attachment);
      } catch (ex) {
        //
      }
      let loc = {};
      if (attachObj.lat) {
        loc.addr = attachObj.addr;
        // attachObj.lat = 39.9087;
        // attachObj.lon = 116.3975;
        //"lat":39.90374,"lon":116.397827,"addr":"天安门广场
        //title必须跟坐标对应，否则不出东西。。
        //url = 'http://map.baidu.com/?latlng=' + attachObj.lat + ',' + attachObj.lon + '&title=' + attachObj.addr + '&content=' + attachObj.addr + '&autoOpen=true';
        loc.url =
          "http://map.baidu.com/?latlng=" + attachObj.lat + "," + attachObj.lon;
      }
      return loc;
    },
    attachName() {
      const attachment = this.message.attach || "{}";
      let attachObj = {};
      try {
        attachObj = JSON.parse(attachment);
      } catch (ex) {
        //
      }
      if (attachObj.dName) {
        return attachObj.dName;
      }
      return "文件附件";
    },

    ackStatus() {
      const idStr = numToString(this.message.id).toString();
      const allAcks = this.im.sysManage.getAllMessageStatus() || {};
      const ackStatus = allAcks[idStr] || 0;
      return ackStatus - 0;
    }
    // computed over...
  },

  methods: {
    touchImage() {
      if (this.attachUrl) {
        const image = this.im.sysManage.getImage({
          avatar: this.attachUrl,
          thumbnail: false
        });
        window.open(image);
      } else {
        alert("附件错误..");
      }
    },
    playAudio() {
      let url = this.message.attach.url;

      url =
        url +
        "&access-token=" +
        this.im.userManage.getToken() +
        "&app_id=" +
        this.im.userManage.getAppid() +
        "&format=mp3"; // 4 === web

      if (!url) {
        alert("url为空，不能播放");
        return;
      }
      const au = document.querySelector("#xawfkjawefawefafwefawfe");
      au.src = url;
      au.play();
    },
    downloadFile() {
      if (this.attachUrl) {
        window.open(this.attachUrl);
      } else {
        alert("附件错误..");
      }
    },
    openLocation() {
      this.attachLocation.url && window.open(this.attachLocation.url);
    },
    //
    deleteMessage() {
      const idStr = numToString(this.message.id).toString();
      this.im.rosterManage.deleteMessage(this.getSid, idStr);
    },
    forwardMessage() {
      this.$store.dispatch("forward/actionRecordForwardMessage", this.message);
    },
    recallMessage() {
      const idStr = numToString(this.message.id).toString();
      this.im.rosterManage.recallMessage(this.getSid, idStr);
    },
    unreadMessage() {
      const idStr = numToString(this.message.id).toString();
      this.im.rosterManage.unreadMessage(this.getSid, idStr);
    },
    playVideo() {
      let attachUrl = this.attachUrl;
      this.$store.dispatch("layer/actionSetShowing", "video");
      this.$store.dispatch("layer/actionSetShowmask", true);
      this.$store.dispatch("layer/actionSetVideoUrl", attachUrl);
    }
  }
};
</script>

