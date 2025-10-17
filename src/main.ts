import { createApp } from 'vue';

import './style.css';
import App from './app.vue';
import { router } from '@/routes/index.routes';
import { pinia } from '@store/index.store';
import { i18n } from '@/features/internationalization/index.internationalization';

createApp(App).use(pinia).use(i18n).use(router).mount('#app');
