<script setup lang="ts">
const { public: { apiUrl } } = useRuntimeConfig();

const { data: languages, error: languagesError } = await useFetch<string[]>(`${apiUrl}/public/languages`);

if (!languages.value || languagesError.value) {
	console.error(languagesError.value);
	throw createError({ message: 'server error', statusCode: 500 });
}
</script>

<template>
	<main>
		hello {{ languages }}
	</main>
</template>
