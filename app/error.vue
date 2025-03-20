<script setup lang="ts">
const props = defineProps<{
	error?: {
		statusCode: string;
		statusMessage?: string;
		message: string;
	};
}>();

useHead({
	title: `Błąd ${props.error?.statusCode} - Humbak`,
});

const { public: { defaultLanguage } } = useRuntimeConfig();
</script>

<template>
	<main class="min-h-screen flex-center flex-col gap-4">
		<h1 class="relative text-6xl text-humbak-6 font-bold">
			<span v-if="error?.statusMessage" class="absolute left-1/2 top-0 whitespace-nowrap text-sm -translate-x-1/2 -translate-y-full"> {{ error.statusMessage }} </span>
			{{ error?.statusCode }}
		</h1>
		<p class="max-w-xl text-center text-3xl">
			{{ error?.message }}
		</p>
		<a :href="`/${defaultLanguage}`" class="text-xl text-link" @click.prevent="clearError({ redirect: `/${defaultLanguage}` })">
			wróć
		</a>
	</main>
</template>
