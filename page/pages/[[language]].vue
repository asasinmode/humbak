<script setup lang="ts">
import { transformMenuLinks } from '@humbak/shared';
import type { ILanguagePageData } from '~/types/api';

defineOptions({
	inheritAttrs: false,
});

definePageMeta({
	middleware: (route) => {
		if (!route.params.language) {
			return navigateTo(`/${useRuntimeConfig().public.defaultLanguage}`);
		}
	},
});

const { public: { apiUrl } } = useRuntimeConfig();

const languages = computed(() => useAttrs().languages as string[]);

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
if (languageDataError.value || !languageData.value) {
	console.error(languageDataError.value);
	throw createError({ statusCode: 500, message: 'błąd przy ładowaniu danych strony' });
}

let parsedMeta: Record<string, string>[] = [];

if (languageData.value.meta) {
	try {
		parsedMeta = JSON.parse(languageData.value.meta);
	} catch (e) {
		console.error('error parsing meta');
		console.error(e);
	}
}

useHead({
	htmlAttrs: { lang: language },
	meta: parsedMeta,
});

const transformedMenuLinks = transformMenuLinks(languageData.value.menuLinks.slice());
</script>

<template>
	<TheTrackingDialog />
	<TheNavigation :menu-links="transformedMenuLinks" :languages :language />
	<TheSlider :slides="languageData!.slides" :aspect-ratio="languageData!.slideAspectRatio" />
	<NuxtPage />
	<TheFooter :data="languageData!.footerContents" />
</template>
