<script setup lang="ts">
import Default from '~/layouts/Default.vue';
</script>

<template>
	<component :is="$route.meta.layout ?? Default">
		<slot />
	</component>
</template>
