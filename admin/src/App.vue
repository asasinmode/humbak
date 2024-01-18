<script setup lang="ts">
import LayoutDefault from '~/layouts/LayoutDefault.vue';

const router = useRouter();
const api = useApi();
const { TheConfirm } = useConfirm();
const { logout, login } = useAuth(router);

const isVerifying = ref(false);

onMounted(async () => {
	const storedUsername = localStorage.getItem('username');
	const storedJwt = localStorage.getItem('jwt');
	if (!storedUsername || !storedJwt) {
		return;
	}

	isVerifying.value = true;
	try {
		await new Promise(resolve => setTimeout(resolve, 2000));
		// @ts-expect-error idk why types are wrong
		await api.auth.verify.$get();
		login(storedUsername, storedJwt);
	} catch (error) {
		console.error(error);
		logout();
	} finally {
		isVerifying.value = false;
	}
});
</script>

<template>
	<VLoading v-if="isVerifying" class="absolute inset-0 flex-center" :size="30" />
	<component :is="$route.meta.layout ?? LayoutDefault" v-else>
		<slot />
	</component>
	<TheConfirm />
	<TheToasts />
</template>
