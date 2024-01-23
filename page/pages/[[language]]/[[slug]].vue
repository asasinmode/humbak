<script setup lang="ts">
const route = useRoute();
const { slug } = route.params;
console.log('slug setup', slug, route.params);
</script>

<template>
	<div>
		hello from slug
	</div>
</template>
