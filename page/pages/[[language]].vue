<script setup lang="ts">
definePageMeta({
	middleware: (route) => {
		if (!route.params.language) {
			return navigateTo('/pl');
		}
	},
});

const { public: { apiUrl } } = useRuntimeConfig();

const { data: languages, error: languagesError } = await useFetch<string[]>(`${apiUrl}/public/languages`);

if (languagesError.value || !languages.value?.length) {
	console.error(languagesError.value);
	throw createError({ message: 'server error', statusCode: 500 });
}

const route = useRoute();
const { language } = route.params;

console.log('language setup', route, language);
</script>

<template>
	<main>
		hello {{ languages }}
		<NuxtPage />
	</main>
</template>
