<script setup lang="ts">
import type { IPageData } from '~/types/api';

const { public: { apiUrl } } = useRuntimeConfig();

const route = useRoute();
const { language, slug } = route.params;

if (typeof slug !== 'string') {
	console.error('slug is an array');
	throw createError({ message: 'server error', statusCode: 500 });
}

const { data: pageData, error: pageDataError } = await useFetch<IPageData>(
	`${apiUrl}/public/pages/${slug || `${language}?isLanguage=true`}`
);
if (pageDataError.value || !pageData.value) {
	console.error(pageDataError.value);
	throw createError({ statusCode: 500, message: 'błąd przy ładowaniu strony' });
}
</script>

<template>
	<div>
		{{ pageData }}
	</div>
</template>
