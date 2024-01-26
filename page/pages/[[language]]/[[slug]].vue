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
	throw createError({ statusCode: 404, message: 'strona nieznaleziona' });
}

useHead({
	title: `${pageData.value.title} - Humbak`,
	link: [
		{ rel: 'stylesheet', type: 'text/css', href: `/stylesheets/${pageData.value.id}.css` },
	],
});
</script>

<template>
	<main id="content" class="max-w-360 mx-auto scroll-m-12">
		{{ pageData }}
	</main>
</template>
