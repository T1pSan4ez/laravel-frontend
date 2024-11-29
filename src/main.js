import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@mdi/font/css/materialdesignicons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';


import App from './App.vue';
import router from './router/index.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);


app.mount('#app');
