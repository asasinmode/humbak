<script setup lang="ts">
const route = useRoute();
const { language, slug } = route.params;

if (typeof slug !== 'string') {
	console.error('slug is an array');
	throw createError({ message: 'server error', statusCode: 500 });
}

const { data: pageData, error: pageDataError } = await useFetch(
	`/api/public/pages/${slug || `${language}?isLanguage=true`}`,
);
if (pageDataError.value || !pageData.value) {
	console.error(pageDataError.value);
	throw createError({ statusCode: 404, message: 'strona nieznaleziona' });
}

let parsedMeta: Record<string, string>[] = [];

try {
	parsedMeta = JSON.parse(pageData.value.meta);
} catch (e) {
	console.error('error parsing meta');
	console.error(e);
}

parsedMeta.unshift(
	{ 'http-equiv': 'date', 'content': pageData.value.createdAt },
	{ 'http-equiv': 'last-modified', 'content': pageData.value.updatedAt },
);

useHead({
	title: `${pageData.value.title} - Humbak`,
	link: [
		{ id: 'globalCss', rel: 'stylesheet', type: 'text/css', href: '/stylesheets/global.css' },
		{ id: 'pageCss', rel: 'stylesheet', type: 'text/css', href: `/stylesheets/${pageData.value.id}.css` },
	],
	meta: parsedMeta,
});
</script>

<template>
	<main id="humbakContent" class="mx-auto max-w-360 scroll-m-12 py-8" v-html="pageData!.html" />
</template>

<style>
#humbakContent {
	width: min(1440px, 100% - clamp(1rem, 0rem + 3.3333vi, 3rem));
}
</style>
