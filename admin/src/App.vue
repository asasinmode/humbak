<script setup lang="ts">
import LayoutDefault from '~/layouts/LayoutDefault.vue';

const { TheConfirm } = useConfirm();
</script>

<template>
	<component :is="$route.meta.layout ?? LayoutDefault">
		<slot />
	</component>
	<TheConfirm />
	<TheToasts />
</template>
