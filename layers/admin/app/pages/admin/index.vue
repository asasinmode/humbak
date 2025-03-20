<script setup lang="ts">
import type { AdminPagesContentEditor, AdminPagesTable, AdminVButton } from '#components';
import type { ComponentExposed } from 'vue-component-type-helpers';
import { FetchError } from 'ofetch';

definePageMeta({ layout: 'admin' });
useHead({ title: 'strony - Admin' });

const { confirm } = useConfirm();
const { toast, toastGenericError } = useToast();
useGlobalPagesStylesheet();

const table = ref<ComponentExposed<typeof AdminPagesTable>>();
const resetButton = ref<InstanceType<typeof AdminVButton>>();
const saveButton = ref<InstanceType<typeof AdminVButton>>();
const contentEditor = ref<InstanceType<typeof AdminPagesContentEditor>>();

const loadingPageId = ref<number | undefined>();
const loadedPageId = ref<number | undefined>();

const isLoading = ref(false);
const languages = ref<string[]>([]);

onMounted(() => getLanguages());

const {
	clearForm,
	sendForm,
	updateValues,
	errors,
	isSaving,
	title,
	language,
	slug,
	menuText,
} = useForm(
	{
		title: '',
		language: '',
		slug: '',
		menuText: '',
		meta: '',
	},
	async () => {
		let contentFields;
		try {
			contentFields = contentEditor.value?.getChangedFields() || {};
		} catch (e) {
			toast('niewłaściwa wartość meta', 'error');
			console.error(e);
			return;
		}

		const page = await useApi('/api/admin/pages', { method: 'post', body: {
			id: loadedPageId.value,
			language: language.value,
			title: title.value,
			slug: slug.value,
			menuText: menuText.value,
			...contentFields,
		} });

		updateValues(page);
		contentEditor.value?.updateValues(page);
		await Promise.all([table.value?.callGetItems(true), getLanguages()]);
		loadingPageId.value = undefined;
		loadedPageId.value = page.id;

		toast('zapisano zmiany');
	},
	() => saveButton.value?.element,
	() => Object.keys(contentEditor.value?.getChangedFields() || {}).length > 0,
);

async function getLanguages() {
	isLoading.value = true;

	try {
		languages.value = await useApi('/api/admin/languages');
	} catch (e) {
		toast('błąd przy ładowaniu języków', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
}

async function getPages(offset: number, limit: number, query: string) {
	return useApi('/api/admin/pages', { query: { offset: offset.toString(), limit: limit.toString(), query } });
}

async function editPage(id: number, button: HTMLButtonElement) {
	const proceed = await clearForm(button, false, true);
	if (!proceed) {
		return;
	}

	loadingPageId.value = id;
	loadedPageId.value = undefined;
	contentEditor.value?.clear();

	try {
		const page = await useApi(`/api/admin/pages/${id}`);
		loadedPageId.value = page.id;
		updateValues(page);
		contentEditor.value?.updateValues(page);
	} catch (e) {
		toast('błąd przy ładowaniu strony', 'error');
		console.error(e);
	} finally {
		loadingPageId.value = undefined;
	}
}

async function deletePage(id: number, button: HTMLButtonElement) {
	const proceed = await confirm(button, { title: 'usuń stronę', text: 'Usuwasz stronę. Jesteś pewien?', okText: 'usuń' });
	if (!proceed) {
		return;
	}

	loadingPageId.value = id;

	try {
		await useApi(`/api/admin/pages/${id}`, { method: 'delete' });

		if (loadedPageId.value === id) {
			loadedPageId.value = undefined;
			clearForm(undefined, true);
			contentEditor.value?.clear();
		}
		await Promise.all([table.value?.callGetItems(), getLanguages()]);
	} catch (e) {
		if (!(e instanceof FetchError) || e.status !== 400) {
			toastGenericError();
			console.error(e);
			return;
		}
		toast(e.data, 'error');
		console.error(e);
	} finally {
		loadingPageId.value = undefined;
	}
}

async function clearFormAndLoadedPage() {
	const proceed = await clearForm(resetButton.value?.element);
	if (!proceed) {
		return;
	}

	loadedPageId.value = undefined;
	contentEditor.value?.clear();
}
</script>

<template>
	<main id="content" class="px-container pb-4 pt-[1.125rem] lg:px-0">
		<AdminPagesTable
			id="pages"
			ref="table"
			title="strona"
			plural-title="strony"
			:loading-item-id="loadingPageId"
			:labels="{
				id: 'id',
				title: 'tytuł',
				menuText: 'tekst w menu',
				language: 'język',
			}"
			:get-items="getPages"
			@edit="editPage"
			@delete="deletePage"
		/>

		<section class="grid grid-cols-[5fr_2fr] mx-auto max-w-6xl gap-x-4 gap-y-4 md:grid-cols-12 lg:px-container">
			<AdminVInput
				id="pageTitle"
				v-model="title"
				class="md:col-span-8"
				label="tytuł strony"
				:error="errors.title"
				@update:model-value="errors.title = ''"
			/>
			<AdminVCombobox
				id="pageLanguage"
				v-model="language"
				class="md:col-span-4"
				label="język"
				:options="languages"
				:error="errors.language"
				:is-loading="isLoading"
				transform-options
				@update:model-value="errors.language = ''"
			/>
			<AdminVInput
				id="pageSlug"
				v-model="slug"
				class="col-span-full md:col-span-6"
				label="url"
				:error="errors.slug"
				@update:model-value="errors.slug = ''"
			/>
			<AdminVInput
				id="pageMenuText"
				v-model="menuText"
				class="col-span-full md:col-span-6"
				label="tekst w menu"
				:error="errors.menuText"
				@update:model-value="errors.menuText = ''"
			/>
		</section>

		<AdminPagesContentEditor ref="contentEditor" v-model:meta-error="errors.meta" />

		<section class="mt-6 flex justify-center gap-4">
			<AdminVButton ref="resetButton" class="-ml-[0.8rem] neon-amber" @click="clearFormAndLoadedPage">
				wyczyść
			</AdminVButton>
			<AdminVButton
				ref="saveButton"
				class="min-w-20 neon-green"
				:is-loading="isSaving"
				@click="sendForm(false)"
			>
				{{ loadedPageId ? 'zapisz' : 'utwórz' }}
			</AdminVButton>
		</section>
	</main>
</template>
