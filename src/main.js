import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@mdi/font/css/materialdesignicons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';


import App from './App.vue';
import router from './router/index.js';

const app = createApp(App);

app.use(createPinia());
app.use(router);


app.mount('#app');
