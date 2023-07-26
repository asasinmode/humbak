import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from './router';
import App from './App.vue';
import './workers/editorWorker';

import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './assets/index.css';

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);
app.mount('body');
