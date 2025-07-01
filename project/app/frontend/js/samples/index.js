import { createApp } from 'vue';
import Message from "@components/Samples/Test.vue";
import "@css/samples/index.css";

console.log('samples.index!');

const app = createApp({});
app.component('sample-message', Message);
app.mount('#app-vue');