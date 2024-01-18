<script setup lang="ts">
import LayoutDefault from '~/layouts/LayoutDefault.vue';

const router = useRouter();
const { TheConfirm } = useConfirm();
const { init } = useAuth();

onMounted(async () => init(router));
</script>

<template>
	<component :is="$route.meta.layout ?? LayoutDefault">
		<slot />
	</component>
	<TheConfirm />
	<TheToasts />
</template>
