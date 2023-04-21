import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import ChatBox from 'components/MessageBox.vue';
//import { IPFSConnect } from "./IPFS-connect";
import { IPFSConnect } from 'services/IPFS-streaming';

@Component({
  components: {
    ChatBox
  },
})

export default class ChatIPFS extends Vue {
  ipfs_conn: IPFSConnect;
  $refs: {
    message: HTMLTextAreaElement;
    chat_list: HTMLDivElement;
  };

  messages: String[] = [
    ]

  send_message() {
      if(this.$refs.message.value.length === 0)  {
        return;
      }
      this.ipfs_conn.pubsub_send("test_topic", this.$refs.message.value);
      this.messages.push(this.$refs.message.value)
      this.$refs.message.value = ""
      setTimeout(() => {
        this.$refs.chat_list.scrollTop = this.$refs.chat_list.scrollHeight;
      }, 100);
  }

  mounted() {
        this.ipfs_conn = new IPFSConnect();
        this.ipfs_conn.pubsub_sub("test_topic", (msg: String) => {
          this.messages.push(msg)
          const divHeight = this.$refs.chat_list.offsetHeight
          console.log("scrollTop", this.$refs.chat_list.scrollTop)
          console.log("scrollHeight", this.$refs.chat_list.scrollHeight)
          if(this.$refs.chat_list.scrollHeight - this.$refs.chat_list.scrollTop - divHeight < 300) {
              setTimeout(() => {
                this.$refs.chat_list.scrollTop = this.$refs.chat_list.scrollHeight;
              }, 100);
          }
        })
  }
}
