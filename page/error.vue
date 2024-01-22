<script setup lang="ts">
defineProps<{
	error?: {
		statusCode: string;
		message: string;
	};
}>();

useHead({
	title: 'error',
});
</script>

<template>
	<main class="col-span-full row-span-full flex-center flex-col gap-4">
		<h1 class="text-6xl font-bold">
			{{ error?.statusCode }}
		</h1>
		<h2 class="text-center text-3xl">
			{{ error?.message }}
		</h2>
		<NuxtLink to="/" class="text-xl text-link" @click="clearError">
			go back
		</NuxtLink>
	</main>
</template>
