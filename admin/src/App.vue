<script setup lang="ts">
import LayoutDefault from '~/layouts/LayoutDefault.vue';

const router = useRouter();
const route = useRoute();
const api = useApi();
const { TheConfirm } = useConfirm();
const { logout, login, username, jwt, isVerifying, isLoggedIn } = useAuth();

onMounted(async () => {
	console.log('mounted');
	const storedUsername = localStorage.getItem('username');
	const storedJwt = localStorage.getItem('jwt');
	if (!storedUsername || !storedJwt) {
		addRouterGuards();
		return;
	}

	username.value = storedUsername;
	jwt.value = storedJwt;
	isVerifying.value = true;

	try {
		// @ts-expect-error idk why types are wrong
		await api.auth.verify.$get();
		login(storedUsername, storedJwt);
		const pathname = window.location.pathname;
		await router.push(pathname !== '/login' ? pathname : '/');
	} catch (error) {
		console.error(error);
		logout();
		console.log('route', route);
		await router.push('/login');
	} finally {
		isVerifying.value = false;
		addRouterGuards();
	}
});

const routes = router.getRoutes();
function addRouterGuards() {
	router.beforeEach((to) => {
		if (!routes.some(route => route.path === to.path)) {
			return { name: 'notFound' };
		}

		const noAuth = to.meta.noAuth ?? false;
		if (!noAuth && !isLoggedIn.value) {
			return { name: 'login' };
		}
	});
}
</script>

<template>
	<component :is="$route.meta.layout ?? LayoutDefault">
		<slot />
	</component>
	<TheConfirm />
	<TheToasts />
</template>
