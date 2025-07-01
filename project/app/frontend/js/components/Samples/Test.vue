<template>
  <div class="p-4 border rounded bg-gray-100 text-gray-800">
    読み込み確認
    {{ message }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

console.log('Test.vue')

const message = ref('これはサンプルのメッセージです。')
</script>

