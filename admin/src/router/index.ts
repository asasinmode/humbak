import { createRouter, createWebHistory } from 'vue-router';
import Home from '~/pages/Home.vue';
import Error from '~/pages/Error.vue';
import Navigationless from '~/layouts/Navigationless.vue';

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home,
		},
		{
			path: '/404',
			name: 'notFound',
			component: Error,
			props: { status: 404, message: 'page not found' },
			meta: {
				layout: Navigationless,
			},
		},
	],
});

const routes = router.getRoutes();

router.beforeEach((to, _from) => {
	if (!routes.some(route => route.path === to.path)) {
		return router.push({ name: 'notFound' });
	}
});
