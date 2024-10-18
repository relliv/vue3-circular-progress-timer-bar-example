import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

import veProgress from 'vue-ellipse-progress';

const app = createApp(App);

app.use(veProgress);

app.mount('#app');
