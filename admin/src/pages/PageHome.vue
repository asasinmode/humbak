<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';

const html = ref('');
const saveButton = ref<InstanceType<typeof VButton> | null>();

const {
	resetForm, sendForm,
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
		const page = await useApi().pages.create.mutate({
			language: language.value,
			title: title.value,
			slug: slug.value,
			menuText: menuText.value,
		});

		console.log('saved page', page);
	},
	saveButton.value?.element
);

const isLoading = ref(false);
const languages = ref<string[]>([]);
const listPagesQuery = useApi().pages.list.query;
const pages = ref([] as Awaited<ReturnType<typeof listPagesQuery>>);

const offset = ref(0);
const limit = ref(5);
const total = ref(0);
const pageSearch = ref('');

onMounted(async () => {
	isLoading.value = true;

	try {
		const [loadedPages, count, loadedLanguages] = await Promise.all([
			listPagesQuery({ offset: offset.value, limit: limit.value, query: pageSearch.value }),
			useApi().pages.count.query({ query: pageSearch.value }),
			useApi().pages.uniqueLanguages.query(),
		]);
		pages.value = loadedPages;
		total.value = count;
		languages.value = loadedLanguages;
	} catch (e) {
		useToast().toast('błąd przy ładowaniu danych', 'error');
		throw e;
	} finally {
		isLoading.value = false;
	}
});
</script>

<template>
	<main class="px-2 pb-4 pt-[18px] md:px-0">
		<section class="mb-4 w-[calc(100%-_3.5rem)] flex gap-4 md:mx-auto md:max-w-128">
			<VInput id="pageSearch" class="flex-1" suffix-icon="i-solar-magnifer-linear" />
			<VButton class="neon-blue">
				szukaj
			</VButton>
		</section>

		<VTable class="mx-auto mb-4 max-w-208" :rows="pages" :total="total" page-key="id" />

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
				:loading="isLoading"
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
		<section class="mt-6 hidden h-[60vh] resize-y gap-5 of-hidden md:flex">
			<VEditor v-model="html" class="flex-1" />
			<main class="bg-checker flex-1" />
		</section>

		<section class="mt-6 flex justify-center gap-4">
			<VButton class="-ml-[0.8rem] neon-red" @click="resetForm">
				wyczyść
			</VButton>
			<VButton ref="saveButton" class="neon-green" :loading="isSaving" @click="sendForm">
				zapisz
			</VButton>
		</section>
	</main>
</template>
