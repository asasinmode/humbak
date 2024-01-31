import { createApp } from 'vue';
import { router } from './router';
import App from './App.vue';

import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './assets/index.css';
import './assets/content.css';

const app = createApp(App);

app.use(router);
app.mount('body');
