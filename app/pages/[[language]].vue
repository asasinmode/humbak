<script setup lang="ts">
defineOptions({
	inheritAttrs: false,
});

const { data: languages } = useNuxtData<string[]>('languages');

if (!languages.value) {
	const { data, error: languagesError } = await useFetch('/api/public/languages', { key: 'languages' });
	if (languagesError.value || !data.value?.length) {
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'błąd przy ładowaniu języków', fatal: true });
	}
	languages.value = data.value;
}

const { language } = useRoute().params;

if (typeof language !== 'string') {
	console.error('language param is an array');
	throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'niespodziewana wartość otrzymana w parametrze :language', fatal: true });
}

if (!languages.value.includes(language)) {
	throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'nieznany język' });
}

const { data: languageData, error: languageDataError } = await useFetch(`/api/public/${language}` as '/api/public/:language');
if (languageDataError.value || !languageData.value) {
	console.error(languageDataError.value);
	throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'błąd przy ładowaniu danych strony', fatal: true });
}

let parsedMeta: Record<string, string>[] = [];

if (languageData.value.meta) {
	try {
		parsedMeta = JSON.parse(languageData.value.meta as unknown as string);
	} catch (e) {
		console.error('error parsing meta');
		console.error(e);
	}
}

useHead({
	htmlAttrs: { lang: language },
	meta: parsedMeta,
});

const transformedMenuLinks = transformMenuLinks((languageData.value?.menuLinks ?? []).slice());
</script>

<!-- eslint-disable vue/no-multiple-template-root -->
<template>
	<TheTrackingDialog />
	<TheNavigation
		:menu-links="transformedMenuLinks ?? []"
		:languages="languages ?? []"
		:language="language as string ?? useRuntimeConfig().public.defaultLanguage"
	/>
	<TheSlider
		:slides="languageData?.slides ?? [] as IPublicLanguageData['slides']"
		:aspect-ratio="languageData?.slideAspectRatio ?? '1 / 3'"
	/>
	<NuxtPage />
	<TheFooter :data="languageData?.footerContents ?? {} as IFooterContents" />
</template>
