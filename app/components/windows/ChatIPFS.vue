<template>
  <div class="container">
      <div class="chat_list" ref="chat_list">
          <chat-box v-for="msg in messages" :message="msg"></chat-box>
      </div>
      <div class="interact">
          <textarea class="message_input" ref="message" placeholder="add multiple lines"></textarea>
          <button class="message_btn" @click="send_message">发送</button>
      </div>
  </div>
</template>

<script lang="ts" src="./ChatIPFS.vue.ts"></script>

<style lang="less" scoped>
.container {
  height: 100%;
}

.chat_list {
  background-color: var(--background);
  height: 80%;
  overflow-y: scroll;
  overflow-x: hidden;
}


.interact {
  display: flex;
  justify-content: space-between;
  width: 90%;
  padding-left: 5%;
}
.message_input {
  border-radius: 10px;
  width: 80%;
  height: 5em;
}

.message_btn {
  border-radius: 10px;
  width: 10%;
  height: 2em;
}
</style>
