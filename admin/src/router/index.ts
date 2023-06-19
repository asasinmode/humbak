import { createRouter, createWebHistory } from 'vue-router';
import Home from '~/pages/Home.vue';
import Files from '~/pages/Files.vue';
import Css from '~/pages/Css.vue';
import Slider from '~/pages/Slider.vue';
import Footer from '~/pages/Footer.vue';
import Settings from '~/pages/Footer.vue';
import Error from '~/pages/Error.vue';
import Navigationless from '~/layouts/Navigationless.vue';

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'pages',
			component: Home,
		},
		{
			path: '/pliki',
			name: 'Files',
			component: Files,
		},
		{
			path: '/css',
			name: 'Css',
			component: Css,
		},
		{
			path: '/slider',
			name: 'Slider',
			component: Slider,
		},
		{
			path: '/stopka',
			name: 'Footer',
			component: Footer,
		},
		{
			path: '/ustawienia',
			component: Settings,
			name: 'Settings',
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
