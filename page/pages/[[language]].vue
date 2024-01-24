<script setup lang="ts">
import { transformMenuLinks } from '@humbak/shared';
import type { ILanguagePageData } from '~/types/api';

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

if (typeof language !== 'string') {
	console.error('language param is an array');
	throw createError({ message: 'server error', statusCode: 500 });
}

if (!languages.value.includes(language)) {
	throw createError({ message: 'nieznany język', statusCode: 404 });
}

const { data: languageData, error: languageDataError } = await useFetch<ILanguagePageData>(`${apiUrl}/public/${language}`);
if (languagesError.value || !languageData.value) {
	console.error(languageDataError.value);
	throw createError({ statusCode: 500, message: 'błąd przy ładowaniu danych strony' });
}

useHead({
	htmlAttrs: { lang: language },
	link: [
		{ rel: 'stylesheet', type: 'text/css', href: '/stylesheets/global.css' },
	],
});

const transformedMenuLinks = transformMenuLinks(languageData.value.menuLinks.slice());
</script>

<template>
	<TheNavigation :menu-links="transformedMenuLinks" />
	{{ languageData!.slides }} <br>
	<br>
	<NuxtPage />
	<br>
	{{ languageData!.footerContents }}
</template>
