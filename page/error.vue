<script setup lang="ts">
const props = defineProps<{
	error?: {
		statusCode: string;
		message: string;
	};
}>();

useHead({
	title: `Błąd ${props.error?.statusCode} - Humbak`,
});
</script>

<template>
	<main class="min-h-screen flex-center flex-col gap-4">
		<h1 class="text-6xl font-bold text-humbak-6">
			{{ error?.statusCode }}
		</h1>
		<h2 class="text-center text-3xl">
			{{ error?.message }}
		</h2>
		<NuxtLink to="/" class="text-xl text-link" @click="clearError">
			wróć
		</NuxtLink>
	</main>
</template>
