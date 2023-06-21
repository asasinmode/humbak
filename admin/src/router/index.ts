import { createRouter, createWebHistory } from 'vue-router';
import PageHome from '~/pages/PageHome.vue';
import PageFiles from '~/pages/PageFiles.vue';
import PageCss from '~/pages/PageCss.vue';
import PageSlider from '~/pages/PageSlider.vue';
import PageFooter from '~/pages/PageFooter.vue';
import PageSettings from '~/pages/PageSettings.vue';
import PageError from '~/pages/PageError.vue';
import LayoutNavigationless from '~/layouts/LayoutNavigationless.vue';

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'pages',
			component: PageHome,
		},
		{
			path: '/pliki',
			name: 'Files',
			component: PageFiles,
		},
		{
			path: '/css',
			name: 'Css',
			component: PageCss,
		},
		{
			path: '/slider',
			name: 'Slider',
			component: PageSlider,
		},
		{
			path: '/stopka',
			name: 'Footer',
			component: PageFooter,
		},
		{
			path: '/ustawienia',
			component: PageSettings,
			name: 'Settings',
		},
		{
			path: '/404',
			name: 'notFound',
			component: PageError,
			props: { status: 404, message: 'page not found' },
			meta: {
				layout: LayoutNavigationless,
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
