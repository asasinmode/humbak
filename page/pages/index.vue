<script setup lang="ts">
const { public: { apiUrl } } = useRuntimeConfig();

const { data } = await useFetch(`${apiUrl}/public/menuLinks?language=pl`);
console.log('data', data);
</script>

<template>
	<main>
		hello
	</main>
</template>
