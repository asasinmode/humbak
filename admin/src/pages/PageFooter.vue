<script setup lang="ts">
import type { IUniqueLanguage } from '~/composables/useApi';

const { toast, toastGenericError } = useToast();
const api = useApi();

const isLoadingLanguages = ref(false);
const languages = ref<IUniqueLanguage[]>([]);
const selectedLanguage = ref<string>();
let previousSelectedLanguage: string | undefined;

const isLoading = ref(false);
const isSaving = ref(false);

onMounted(async () => {
	isLoadingLanguages.value = true;
	try {
		languages.value = await api.pages.uniqueLanguages.query();

		if (!languages.value.length) {
			return;
		}

		selectedLanguage.value = languages.value[0];
		getFooterContent();
	} catch (e) {
		toast('błąd przy ładowaniu języków', 'error');
		console.error(e);
	} finally {
		isLoadingLanguages.value = false;
	}
});

async function getFooterContent() {
	if (!selectedLanguage.value) {
		toastGenericError();
		throw new Error('calling get footer content without selected language');
	}

	if (previousSelectedLanguage === selectedLanguage.value) {
		return;
	}

	isLoading.value = true;
	try {
		await new Promise(resolve => setTimeout(resolve, 500));
		previousSelectedLanguage = selectedLanguage.value;
	} catch (e) {
		toast('błąd przy ładowaniu stopki', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
}

function saveChanges() {
	toast('zapisano zmiany');
}
</script>

<template>
	<main id="content" class="grid grid-cols-[1fr_min-content] mx-auto max-w-360 gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<VCombobox
			id="footerLanguage"
			v-model="selectedLanguage"
			class="menu-footer-controls-padding-left footer-language-select !min-w-20 !w-20"
			class-input="!min-w-20 !w-20"
			label="język"
			:options="languages"
			:is-loading="isLoadingLanguages"
			transform-options
			select-only
			label-visually-hidden
			@select-option="getFooterContent"
		/>
		<VButton
			ref="saveButton"
			class="menu-footer-controls-padding-right mr-12 h-fit md:mr-0 neon-green"
			:is-loading="isSaving"
			@click="saveChanges"
		>
			zapisz
		</VButton>
		<footer class="relative col-span-full max-w-360 min-h-10 w-full bg-humbak">
			test
			<VLoading v-show="isLoading" class="absolute inset-0" size="20" />
		</footer>
	</main>
</template>

<style>
@media (min-width: 1440px){
	.footer-language-select {
		left: 0;
	}
}
</style>
