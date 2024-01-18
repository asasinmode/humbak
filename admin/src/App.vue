<script setup lang="ts">
import LayoutDefault from '~/layouts/LayoutDefault.vue';

const router = useRouter();
const api = useApi();
const { TheConfirm } = useConfirm();
const { logout, login, username, jwt, isVerifying } = useAuth();

onMounted(async () => {
	const storedUsername = localStorage.getItem('username');
	const storedJwt = localStorage.getItem('jwt');
	if (!storedUsername || !storedJwt || router.currentRoute.value.name === 'notFound') {
		return;
	}

	username.value = storedUsername;
	jwt.value = storedJwt;
	isVerifying.value = true;

	try {
		// @ts-expect-error idk why types are wrong
		await api.auth.verify.$get();
		login(storedUsername, storedJwt);
		router.push('/');
	} catch (error) {
		console.error(error);
		logout();
	} finally {
		isVerifying.value = false;
	}
});
</script>

<template>
	<component :is="$route.meta.layout ?? LayoutDefault">
		<slot />
	</component>
	<TheConfirm />
	<TheToasts />
</template>
