<script setup lang="ts">
import LayoutDefault from '~/layouts/LayoutDefault.vue';
</script>

<template>
	<component :is="$route.meta.layout ?? LayoutDefault">
		<slot />
	</component>
	<TheToasts />
</template>
