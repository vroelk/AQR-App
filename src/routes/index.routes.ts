import { createMemoryHistory, createRouter } from 'vue-router';

import HomePage from '@/views/pages/home.page.vue';
import SelectVaultPage from '@/views/pages/selectVault.page.vue';
import EditSessionPage from '@/views/pages/editSession.page.vue';
import MainLayout from '@/views/layouts/main.layout.vue';

const routes = [
	{
		path: '/',
		component: MainLayout,
		children: [
			{ path: '/', component: HomePage },
			{ path: '/select-vault', component: SelectVaultPage },
			{ path: '/edit-session', component: EditSessionPage }
		]
	}
];

export const router = createRouter({
	history: createMemoryHistory(),
	routes
});
