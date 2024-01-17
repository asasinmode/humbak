import { createRouter, createWebHistory } from 'vue-router';
import PageHome from '~/pages/PageHome.vue';
import PageLogin from '~/pages/PageLogin.vue';
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
			path: '/menu',
			name: 'menu',
			component: () => import('~/pages/PageMenu.vue'),
		},
		{
			path: '/pliki',
			name: 'Files',
			component: () => import('~/pages/PageFiles.vue'),
		},
		{
			path: '/css',
			name: 'Css',
			component: () => import('~/pages/PageCss.vue'),
		},
		{
			path: '/slider',
			name: 'Slider',
			component: () => import('~/pages/PageSlider.vue'),
		},
		{
			path: '/stopka',
			name: 'Footer',
			component: () => import('~/pages/PageFooter.vue'),
		},
		{
			path: '/ustawienia',
			component: () => import('~/pages/PageSettings.vue'),
			name: 'Settings',
		},
		{
			path: '/404',
			name: 'notFound',
			component: () => import('~/pages/PageError.vue'),
			props: { status: 404, message: 'page not found' },
			meta: {
				layout: LayoutNavigationless,
				noAuth: true,
			},
		},
		{
			path: '/login',
			name: 'login',
			component: PageLogin,
			meta: {
				layout: LayoutNavigationless,
				noAuth: true,
			},
		},
	],
});

const routes = router.getRoutes();
const { loggedIn } = useAuth();

router.beforeEach((to, _from) => {
	if (!routes.some(route => route.path === to.path)) {
		return { name: 'notFound' };
	}

	const noAuth = to.meta.noAuth ?? false;
	if (!noAuth && !loggedIn.value) {
		return { name: 'login' };
	}
});
