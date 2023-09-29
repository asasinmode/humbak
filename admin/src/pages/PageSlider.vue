<script setup lang="ts">
import { TRPCClientError } from '@trpc/client';
import type { ComponentExposed } from 'vue-component-type-helpers';

import VButton from '~/components/V/VButton.vue';
import VEditor from '~/components/V/VEditor.vue';
import VDialog from '~/components/V/VDialog.vue';
import TheSlider from '~/components/TheSlider.vue';
import VCombobox from '~/components/V/VCombobox.vue';

import type { IListedSlide, IUniqueLanguage } from '~/composables/useApi';

useGlobalPagesStylesheet();
const api = useApi();
const { confirm } = useConfirm();
const { toast, toastGenericError } = useToast();

const theSlider = ref<InstanceType<typeof TheSlider>>();
const resetButton = ref<InstanceType<typeof VButton>>();
const saveButton = ref<InstanceType<typeof VButton>>();
const deleteButton = ref<InstanceType<typeof VButton>>();
const editor = ref<InstanceType<typeof VEditor>>();
const languageSelect = ref<ComponentExposed<typeof VCombobox>>();
const slideIdSelect = ref<ComponentExposed<typeof VCombobox>>();

const isLoadingLanguages = ref(false);
const isLoadingSlides = ref(false);
const isLoadingSlide = ref(false);

const availableSlides = ref<IListedSlide[]>([]);
const selectedSlideId = ref<number>();
const previousSelectedSlideId = ref<number>();

const languages = ref<IUniqueLanguage[]>([]);
const selectedLanguage = ref<string>();
const previousSelectedLanguage = ref<string>();

const {
	clearForm, sendForm, updateValues, isSaving,
	errors, hasChanged,
	name, content, isHidden, language,
} = useForm(
	{ name: '', content: '', language: '', isHidden: false },
	async () => {
		const slide = await api.slides.upsert.mutate({
			id: selectedSlideId.value,
			name: name.value,
			content: content.value,
			isHidden: isHidden.value,
			language: language.value,
		});

		const slideIndex = availableSlides.value.findIndex(element => element.id === slide.id);

		if (slide.language !== selectedLanguage.value) {
			selectedLanguage.value = slide.language;
			previousSelectedLanguage.value = slide.language;
			await getSlides();
			selectedSlideId.value = slide.id;
			previousSelectedSlideId.value = slide.id;
			await selectSlide();
		} else if (slideIndex === -1) {
			availableSlides.value.push({
				name: slide.name,
				id: slide.id,
				isHidden: slide.isHidden,
			});
			selectedSlideId.value = slide.id;
			previousSelectedSlideId.value = slide.id;
			theSlider.value?.handleSlide(slide);
		} else {
			availableSlides.value[slideIndex] = {
				name: slide.name,
				id: slide.id,
				isHidden: slide.isHidden,
			};
			theSlider.value?.handleSlide(slide);
		}

		updateValues(slide);
		editor.value?.updateModelValue(0, slide.content);
	},
	saveButton.value?.element
);

const aspectRatio = ref('');
const previousAspectRatio = ref('');

onMounted(async () => {
	isLoadingLanguages.value = true;
	try {
		const [uniqueLanguages, savedAspectRatio] = await Promise.all([
			api.pages.uniqueLanguages.query(),
			api.slides.aspectRatio.query(),
		]);
		languages.value = uniqueLanguages;
		aspectRatio.value = savedAspectRatio;
		previousAspectRatio.value = savedAspectRatio;
		if (!languages.value.length) {
			return;
		}

		selectedLanguage.value = languages.value[0];
		previousSelectedLanguage.value = selectedLanguage.value;

		getSlides();
	} catch (e) {
		toast('błąd przy ładowaniu języków', 'error');
		console.error(e);
	} finally {
		isLoadingLanguages.value = false;
	}
});

const slideSelectOptions = computed(() =>
	availableSlides.value.map(({ id, name, isHidden }) => ({ text: name, value: id, isHidden }))
);

async function getSlides() {
	if (selectedLanguage.value === undefined) {
		toastGenericError();
		throw new Error('calling get slides without selected language');
	}

	isLoadingSlides.value = true;
	selectedSlideId.value = undefined;
	previousSelectedSlideId.value = undefined;

	try {
		availableSlides.value = await api.slides.list.query(selectedLanguage.value);
	} catch (e) {
		toast('błąd przy ładowaniu slideów', 'error');
		console.error(e);
	} finally {
		isLoadingSlides.value = false;
	}
}

async function getSlidesIfLanguageChanged() {
	if (previousSelectedLanguage.value === selectedLanguage.value) {
		return;
	}
	if (hasChanged()) {
		const proceed = await confirm(languageSelect.value?.getInputRef()?.element, {
			text: 'Masz niezapisane zmiany. Czy na pewno chcesz kontynuować?',
			okText: 'kontynuuj',
		});
		if (!proceed) {
			selectedLanguage.value = previousSelectedLanguage.value;
			return;
		}
	}

	clearForm(undefined, true);
	editor.value?.updateModelValue(0, '');
	await getSlides();
	previousSelectedLanguage.value = selectedLanguage.value;
}

async function clearFormAndEditor() {
	const proceed = await clearForm(resetButton.value?.element);
	if (!proceed) {
		return;
	}

	selectedSlideId.value = undefined;
	previousSelectedSlideId.value = undefined;
	editor.value?.updateModelValue(0, '');
}

function updateContent(value: string) {
	content.value = value;
	errors.value.content = '';
}

async function selectSlide() {
	if (selectedSlideId.value === undefined) {
		toastGenericError();
		throw new Error('calling select slide without selected slide id');
	}

	if (selectedSlideId.value === previousSelectedSlideId.value) {
		return;
	}
	if (hasChanged()) {
		const proceed = await confirm(slideIdSelect.value?.getInputRef()?.element, {
			text: 'Masz niezapisane zmiany. Czy na pewno chcesz kontynuować?',
			okText: 'kontynuuj',
		});
		if (!proceed) {
			selectedSlideId.value = previousSelectedSlideId.value;
			return;
		}
	}

	isLoadingSlide.value = true;
	try {
		const slide = await api.slides.byId.query(selectedSlideId.value);
		updateValues(slide);
		editor.value?.updateModelValue(0, content.value);
		previousSelectedSlideId.value = selectedSlideId.value;
	} catch (e) {
		toast('błąd przy ładowaniu slideu', 'error');
		console.error(e);
	} finally {
		isLoadingSlide.value = false;
	}
}

async function deleteSlide() {
	if (selectedSlideId.value === undefined) {
		toastGenericError();
		throw new Error('calling delete slide without selected slide id');
	}

	const proceed = await confirm(
		deleteButton.value?.element,
		{ title: 'usuń slide', text: 'Usuwasz slide. Jesteś pewien?', okText: 'usuń' }
	);
	if (!proceed) {
		return;
	}

	isLoadingSlide.value = true;
	isLoadingSlides.value = true;
	try {
		await api.slides.delete.mutate(selectedSlideId.value);

		const slideIndex = availableSlides.value.findIndex(slide => slide.id === selectedSlideId.value);
		selectedSlideId.value = undefined;
		previousSelectedSlideId.value = undefined;
		availableSlides.value.splice(slideIndex, 1);

		clearForm(undefined, true);
		editor.value?.updateModelValue(0, '');
	} catch (e) {
		toast('błąd przy usuwaniu slideu', 'error');
		console.error(e);
	} finally {
		isLoadingSlides.value = false;
		isLoadingSlide.value = false;
	}
}

const aspectRatioError = ref('');
const isSavingAspectRatio = ref(false);
const configurationDialog = ref<InstanceType<typeof VDialog>>();

async function saveAspectRatio() {
	isSavingAspectRatio.value = true;

	try {
		await api.slides.updateAspectRatio.mutate(aspectRatio.value);
		previousAspectRatio.value = aspectRatio.value;
		configurationDialog.value?.close();
	} catch (error) {
		if (!(error instanceof TRPCClientError) || error.data.httpStatus !== 400) {
			toast('błąd przy zapisywaniu aspect ratio', 'error');
			console.error(error);
			return;
		}

		aspectRatioError.value = '';

		try {
			aspectRatioError.value = JSON.parse(error.message).unknown;
		} catch (e) {
			toastGenericError();
			throw new Error(`Parsing error message failed. ${error.message}`);
		}
	} finally {
		isSavingAspectRatio.value = false;
	}
}

function revertAspectRatioIfUnsaved() {
	aspectRatioError.value = '';
	if (aspectRatio.value !== previousAspectRatio.value) {
		aspectRatio.value = previousAspectRatio.value;
	}
}
</script>

<template>
	<main id="content" class="grid grid-cols-[min-content_min-content_1fr] mx-auto max-w-256 w-full gap-x-3 gap-y-5 px-4 pb-4 pt-[1.125rem] sm:grid-cols-[auto_auto_auto_1fr] lg:px-0">
		<div id="slidePageControls" class="grid col-span-full grid-cols-[min-content_1fr_max-content] w-full gap-3 md:flex">
			<VCombobox
				id="languageSelect"
				ref="languageSelect"
				v-model="selectedLanguage"
				class="!min-w-20 !w-full md:!w-fit"
				class-input="!w-full !min-w-20"
				label="język"
				:options="languages"
				:is-loading="isLoadingLanguages"
				transform-options
				label-visually-hidden
				select-only
				@select-option="getSlidesIfLanguageChanged"
			/>
			<VCombobox
				id="slideIdSelect"
				ref="slideIdSelect"
				v-model="selectedSlideId"
				class="col-span-2 mr-12 md:mr-auto md:w-64"
				label="slide"
				:options="slideSelectOptions"
				:is-loading="isLoadingSlides"
				label-visually-hidden
				select-only
				@select-option="selectSlide"
			>
				<template #item="itemProps">
					<div
						class="mr-[2px] inline-block h-3 align-mid text-neutral"
						:class="itemProps.isHidden ? 'i-fa6-solid:eye-slash' : 'i-fa6-solid:eye'"
					/>
					{{ itemProps.text }}
				</template>
			</VCombobox>
			<div class="flex gap-3">
				<VDialog
					ref="configurationDialog"
					class="h-9 w-9 neon-blue"
					class-container="grid grid-cols-2 gap-x-2 gap-y-3"
					class-close-button="justify-self-end"
					close-button-text="zamknij"
					@open="previousAspectRatio = aspectRatio"
					@close="revertAspectRatioIfUnsaved"
				>
					<template #button>
						<span class="visually-hidden">konfiguracja slidera</span>
						<div class="i-mdi-wrench absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
					</template>

					<h3 class="col-span-full text-center text-5 font-600">
						konfiguracja slidera
					</h3>
					<VInput
						id="sliderAspectRatio"
						v-model="aspectRatio"
						class="col-span-full mb-2"
						class-input="!w-fit"
						label="aspect ratio"
						:error="aspectRatioError"
						@update:model-value="aspectRatioError = ''"
					/>

					<template #post>
						<VButton class="justify-self-start neon-green" :is-loading="isSavingAspectRatio" @click="saveAspectRatio">
							zapisz
						</VButton>
					</template>
				</VDialog>
				<VButton class="h-9 w-9 p-0 neon-purple" title="formatuj" @click="editor?.formatCurrentModel">
					<span class="visually-hidden">formatuj</span>
					<div class="i-solar-magic-stick-3-bold absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
				</VButton>
			</div>
			<VButton ref="resetButton" class="w-fit justify-self-end neon-amber" @click="clearFormAndEditor">
				wyczyść
			</VButton>
			<VButton ref="saveButton" class="min-w-20 neon-green" :is-loading="isSaving" @click="sendForm">
				{{ selectedSlideId ? 'zapisz' : 'utwórz' }}
			</VButton>
		</div>

		<VEditor
			ref="editor"
			class="col-span-full h-72 shadow"
			:models="[
				{ language: 'html', value: content },
			]"
			:current-model="0"
			:is-loading="isLoadingSlide"
			:error="errors.content"
			@update:model-value="updateContent"
		/>

		<VInput
			id="slideName"
			v-model="name"
			label="nazwa"
			class="col-span-full sm:col-span-1"
			:error="errors.name"
			@update:model-value="errors.name = ''"
		/>
		<VCombobox
			id="editedLanguageSelect"
			v-model="language"
			class="!min-w-20 !w-20"
			class-input="!w-20 !min-w-20"
			label="język"
			:options="languages"
			:is-loading="isLoadingLanguages"
			transform-options
			select-only
			:error="errors.language"
			@update:model-value="errors.language = ''"
		/>
		<VSwitch
			id="slideIsHidden"
			v-model="isHidden"
			:label="isHidden ? 'schowany' : 'schowaj'"
			:error="errors.isHidden"
			@update:model-value="errors.isHidden = ''"
		/>
		<VButton
			v-if="selectedSlideId !== undefined"
			ref="deleteButton"
			class="h-fit self-end justify-self-end neon-red"
			:is-loading="isLoadingSlide"
			@click="deleteSlide"
		>
			usuń
		</VButton>

		<article
			class="relative col-span-full w-full outline-(1px black dashed) outline dark:outline-white"
			:style="{ paddingTop: `calc(${aspectRatio} * 100%)` }"
			aria-hidden
			tabindex="-1"
		>
			<div class="absolute inset-0" v-html="content" />
		</article>

		<TheSlider ref="theSlider" class="col-span-full" :language="selectedLanguage" :aspect-ratio="aspectRatio" />
	</main>
</template>
