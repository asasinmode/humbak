import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from './router';
import { createToast } from './plugins/toast';
import App from './App.vue';

import '@unocss/reset/tailwind.css';
import 'uno.css';
import './assets/index.css';

const pinia = createPinia();
const toast = createToast();
const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(toast);
app.mount('body');
