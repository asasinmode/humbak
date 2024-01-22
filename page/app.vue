<script setup lang="ts">
useHead({
	title: 'nuxt starter',
});
</script>

<template>
	<NuxtLayout>
		<NuxtPage class="col-span-full my-12 h-33rem flex-center" />
	</NuxtLayout>
</template>

<style>
#__nuxt {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 4rem auto 4rem;
	column-gap: 1rem;
}
</style>
