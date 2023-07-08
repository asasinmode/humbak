<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';

const title = ref('');
const language = ref('');
const slug = ref('');
const menuText = ref('');
const html = ref('');
const isLoading = ref(false);
const saveButton = ref<InstanceType<typeof VButton> | null>();

const { handleError, fieldToError, resetErrors } = useErrors(['title', 'language', 'slug', 'menuText'] as const);
const { toast } = useToast();

async function save() {
	resetErrors();
	isLoading.value = true;

	try {
		const thing = await useApi().pages.create.mutate({
			language: language.value,
			title: title.value,
			slug: slug.value,
			menuText: menuText.value,
		});

		console.log('got', thing);
		toast('Zapisano zmiany');
	} catch (e) {
		handleError(e);
		useShake(saveButton.value?.element);
	} finally {
		isLoading.value = false;
	}
}

function reset() {
	resetErrors();
	title.value = '';
	language.value = '';
	slug.value = '';
	menuText.value = '';
	html.value = '';
}
</script>

<template>
	<section class="grid grid-cols-[5fr_2fr] mx-auto max-w-6xl gap-x-4 gap-y-4 px-2 py-4 md:grid-cols-12 md:px-4 md:py-8">
		<div class="col-span-full mt-[2px] w-[calc(100%-_3.5rem)] flex gap-4 md:mx-auto md:max-w-128">
			<VInput id="pageSearch" class="flex-1" suffix-icon="i-solar-magnifer-linear" />
			<VButton class="neon-blue">
				szukaj
			</VButton>
		</div>

		<VInput
			id="pageTitle"
			v-model="title"
			class="md:col-span-8"
			label="tytuł strony"
			:error="fieldToError.title"
			@update:model-value="fieldToError.title = ''"
		/>
		<VInput
			id="pageLanguage"
			v-model="language"
			class="md:col-span-4"
			label="język"
			:error="fieldToError.language"
			@update:model-value="fieldToError.language = ''"
		/>
		<VInput
			id="pageSlug"
			v-model="slug"
			class="col-span-full md:col-span-6"
			label="url"
			:error="fieldToError.slug"
			@update:model-value="fieldToError.slug = ''"
		/>
		<VInput
			id="pageMenuText"
			v-model="menuText"
			class="col-span-full md:col-span-6"
			label="tekst w menu"
			:error="fieldToError.menuText"
			@update:model-value="fieldToError.menuText = ''"
		/>
	</section>

	<!-- make resizable with handle in the middle -->
	<section class="hidden h-[60vh] resize-y gap-5 overflow-hidden md:flex">
		<VEditor v-model="html" class="flex-1" />
		<main class="bg-checker flex-1" />
	</section>

	<section class="mt-4 flex justify-center gap-4 pb-4 md:mt-8">
		<VButton class="-ml-[0.8rem] neon-red" @click="reset">
			wyczyść
		</VButton>
		<VButton ref="saveButton" class="neon-green" :loading="isLoading" @click="save">
			zapisz
		</VButton>
	</section>
</template>
