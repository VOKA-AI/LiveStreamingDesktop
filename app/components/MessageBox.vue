<template>
<div class="message_box_container">
    {{ message }}
</div>
</template>

<script lang="ts" src="./MessageBox.vue.ts"></script>

<style lang="less" scoped>
.message_box_container {
    padding: 10px 20px;
    margin: 20px;
    background-color: white;
    border-radius: 20px;
    border-width: 1px;
    border-color: black;
    text-align: left;
    word-break: break-all;
    word-wrap: break-word;
    color: black;
}

</style>
