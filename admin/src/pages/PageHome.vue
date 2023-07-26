<script setup lang="ts">
import HPagesTable from '~/components/H/HPagesTable.vue';
import VButton from '~/components/V/VButton.vue';
import type { UniqueLanguage } from '~/composables/useApi';

const api = useApi();
const { confirm } = useConfirm();
const { toast } = useToast();

const table = ref<InstanceType<typeof HPagesTable> | null>();
const resetButton = ref<InstanceType<typeof VButton> | null>();
const saveButton = ref<InstanceType<typeof VButton> | null>();

const loadingPageId = ref<number | undefined>();
const loadedPageId = ref<number | undefined>();

const isLoading = ref(false);
const languages = ref<UniqueLanguage[]>([]);

onMounted(() => getLanguages());

const html = ref('');
const {
	resetForm, sendForm, updateValues,
	errors, isSaving,
	title, language, slug, menuText,
} = useForm(
	{
		title: '',
		language: '',
		slug: '',
		menuText: '',
	},
	async () => {
		const page = await api.pages.upsert.mutate({
			id: loadedPageId.value,
			language: language.value,
			title: title.value,
			slug: slug.value,
			menuText: menuText.value,
		});

		updateValues(page);
		await Promise.all([table.value?.getPages(true), getLanguages()]);
	},
	saveButton.value?.element
);

async function getLanguages() {
	isLoading.value = true;

	try {
		languages.value = await api.pages.uniqueLanguages.query();
	} catch (e) {
		toast('błąd przy ładowaniu danych', 'error');
		throw e;
	} finally {
		isLoading.value = false;
	}
}

async function editPage(id: number, button: HTMLButtonElement) {
	const proceed = await resetForm(button, false, true);
	if (!proceed) {
		return;
	}

	loadingPageId.value = id;

	try {
		const [page] = await Promise.all([api.pages.byId.query(id), getLanguages()]);
		loadedPageId.value = page.id;
		updateValues(page);
	} catch (e) {
		toast('nie udało się załadować strony', 'error');
		throw e;
	} finally {
		loadingPageId.value = undefined;
	}
}

async function deletePage(id: number, button: HTMLButtonElement) {
	if (
		!(await confirm(button, { title: 'usuń stronę', text: 'Usuwasz stronę. Jesteś pewien?', okText: 'usuń' }))
	) {
		return;
	}

	loadingPageId.value = id;

	try {
		await api.pages.delete.mutate(id);

		if (loadedPageId.value === id) {
			loadedPageId.value = undefined;
			resetForm(undefined, true);
		}
		await Promise.all([table.value?.getPages(), getLanguages()]);
	} catch (e) {
		toast('nie udało się usunąć strony', 'error');
		throw e;
	} finally {
		loadingPageId.value = undefined;
	}
}

function clearForm() {
	resetForm(resetButton.value?.element);
	loadedPageId.value = undefined;
}
</script>

<template>
	<main class="px-2 pb-4 pt-[18px] md:px-0">
		<HPagesTable ref="table" :loading-page-id="loadingPageId" @edit="editPage" @delete="deletePage" />

		<section class="grid grid-cols-[5fr_2fr] mx-auto max-w-6xl gap-x-4 gap-y-4 md:grid-cols-12">
			<VInput
				id="pageTitle"
				v-model="title"
				class="md:col-span-8"
				label="tytuł strony"
				:error="errors.title"
				@update:model-value="errors.title = ''"
			/>
			<VSelect
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
			<VInput
				id="pageSlug"
				v-model="slug"
				class="col-span-full md:col-span-6"
				label="url"
				:error="errors.slug"
				@update:model-value="errors.slug = ''"
			/>
			<VInput
				id="pageMenuText"
				v-model="menuText"
				class="col-span-full md:col-span-6"
				label="tekst w menu"
				:error="errors.menuText"
				@update:model-value="errors.menuText = ''"
			/>
		</section>

		<!-- make resizable with handle in the middle -->
		<section class="mt-6 hidden h-[60vh] gap-x-2 md:flex">
			<HEditor v-model="html" class="flex-1" />
			<aside class="w-8 shrink-0">
				<HEditorModeSelect />
			</aside>
			<main class="bg-checker flex-1" />
		</section>

		<section class="mt-6 flex justify-center gap-4">
			<VButton ref="resetButton" class="-ml-[0.8rem] neon-red" @click="clearForm">
				wyczyść
			</VButton>
			<VButton ref="saveButton" class="neon-green" :is-loading="isSaving" @click="sendForm">
				zapisz
			</VButton>
		</section>
	</main>
</template>
