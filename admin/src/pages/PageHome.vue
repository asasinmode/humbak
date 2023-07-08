<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';

const isLoading = ref(false);
const saveButton = ref<InstanceType<typeof VButton> | null>();

const { toast } = useToast();
const {
	handleError, resetErrors, resetForm, errors,
	title, language, slug, menuText, html,
} = useForm({
	title: '',
	language: '',
	slug: '',
	menuText: '',
	html: '',
});

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
</script>

<template>
	<main class="px-2 pb-4 pt-[18px] md:px-0">
		<section class="mb-4 w-[calc(100%-_3.5rem)] flex gap-4 md:mx-auto md:max-w-128">
			<VInput id="pageSearch" class="flex-1" suffix-icon="i-solar-magnifer-linear" />
			<VButton class="neon-blue">
				szukaj
			</VButton>
		</section>

		<section class="mx-auto mb-4 max-w-208 bg-green">
			here goes page select
		</section>

		<section class="grid grid-cols-[5fr_2fr] mx-auto max-w-6xl gap-x-4 gap-y-4 md:grid-cols-12">
			<VInput
				id="pageTitle"
				v-model="title"
				class="md:col-span-8"
				label="tytuł strony"
				:error="errors.title"
				@update:model-value="errors.title = ''"
			/>
			<VInput
				id="pageLanguage"
				v-model="language"
				class="md:col-span-4"
				label="język"
				:error="errors.language"
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
			<VButton ref="saveButton" class="neon-green" :loading="isLoading" @click="save">
				zapisz
			</VButton>
		</section>
	</main>
</template>
