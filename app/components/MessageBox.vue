<template>
<div class="message_box_container">
    <h1>{{ message }}</h1>
</div>
</template>

<script lang="ts" src="./MessageBox.vue.ts"></script>

<style lang="less" scoped>
.message_box_container {
    padding: 20px 20px;
    margin: 20px;
    background-color: red;
    border-radius: 20px;
    border-width: 1px;
    border-color: black;
    text-align: left;
    word-break: break-all;
    word-wrap: break-word;
}

</style>
