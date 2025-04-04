<script setup lang="ts">
import type { AdminLanguageSelect, AdminTheSlider, AdminVButton, AdminVCombobox, AdminVDialog, AdminVEditor } from '#components';
import type { ComponentExposed } from 'vue-component-type-helpers';

definePageMeta({ layout: 'admin' });
useHead({ title: 'slider - Admin' });

useGlobalPagesStylesheet();
const { confirm } = useConfirm();
const { toast, toastGenericError } = useToast();
const { parsedContent, updateParsedContent } = useHumbakFiles();

const theSlider = ref<InstanceType<typeof AdminTheSlider>>();
const resetButton = ref<InstanceType<typeof AdminVButton>>();
const saveButton = ref<InstanceType<typeof AdminVButton>>();
const deleteButton = ref<InstanceType<typeof AdminVButton>>();
const editor = ref<InstanceType<typeof AdminVEditor>>();
const languageSelect = ref<InstanceType<typeof AdminLanguageSelect>>();
const slideIdSelect = ref<ComponentExposed<typeof AdminVCombobox>>();

const isLoadingSlides = ref(false);
const isLoadingSlide = ref(false);
const isLoadingLanguages = ref(true);
const isLoadingAspectRatio = ref(false);

const availableSlides = ref<IListedSlide[]>([]);
const selectedSlideId = ref<number>();
const previousSelectedSlideId = ref<number>();

const languages = ref<string[]>([]);
const selectedLanguage = ref<string>();

const {
	clearForm,
	updateValues,
	sendForm,
	isSaving,
	errors,
	hasChanged,
	name,
	content,
	isHidden,
	language,
} = useForm(
	{ name: '', content: '', language: '', isHidden: false },
	async () => {
		const slide = await useApi('/api/admin/slides', { method: 'post', body: {
			id: selectedSlideId.value,
			name: name.value,
			content: content.value,
			isHidden: isHidden.value,
			language: language.value,
		} });

		const slideIndex = availableSlides.value.findIndex(item => item.id === slide.id);

		updateValues(slide);
		editor.value?.updateModelValue(0, slide.content);

		if (slide.language !== selectedLanguage.value) {
			selectedLanguage.value = slide.language;
			languageSelect.value?.setPrevious(slide.language);
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
			theSlider.value?.handleSlide(slide, parsedContent.value);
		} else {
			availableSlides.value[slideIndex] = {
				name: slide.name,
				id: slide.id,
				isHidden: slide.isHidden,
			};
			theSlider.value?.handleSlide(slide, parsedContent.value);
		}
	},
	() => saveButton.value?.element,
);

const aspectRatio = ref('');
const previousAspectRatio = ref('');

onMounted(async () => {
	isLoadingAspectRatio.value = true;
	try {
		const savedAspectRatio = await useApi('/api/admin/slides/aspectRatio');

		aspectRatio.value = savedAspectRatio;
		previousAspectRatio.value = savedAspectRatio;
	} catch (e) {
		toast('błąd przy ładowaniu aspect ratio', 'error');
		console.error(e);
	} finally {
		isLoadingAspectRatio.value = false;
	}
});

const slideSelectOptions = computed(() =>
	availableSlides.value.map(({ id, name, isHidden }) => ({ text: name, value: id, isHidden })),
);

async function getSlides() {
	if (selectedLanguage.value === undefined || isLoadingSlides.value) {
		return;
	}

	isLoadingSlides.value = true;
	selectedSlideId.value = undefined;
	previousSelectedSlideId.value = undefined;

	try {
		availableSlides.value = await useApi('/api/admin/slides', { query: { language: selectedLanguage.value } });
	} catch (e) {
		toast('błąd przy ładowaniu slideów', 'error');
		console.error(e);
	} finally {
		isLoadingSlides.value = false;
	}
}

async function clearFormAndGetSlides() {
	clearForm(undefined, true);
	editor.value?.updateModelValue(0, '');
	await getSlides();
}

function setLanguagesAndGetSlides(loadedLanguages: string[]) {
	languages.value = loadedLanguages;
	isLoadingLanguages.value = false;
	getSlides().then(() => languageSelect.value?.setPrevious(selectedLanguage.value));
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
	updateParsedContent(value);
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
		const slide = await useApi(`/api/admin/slides/${selectedSlideId.value}`);
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
		{ title: 'usuń slide', text: 'Usuwasz slide. Jesteś pewien?', okText: 'usuń' },
	);
	if (!proceed) {
		return;
	}

	isLoadingSlide.value = true;
	isLoadingSlides.value = true;
	try {
		await useApi(`/api/admin/slides/${selectedSlideId.value}`, { method: 'delete' });
		selectedLanguage.value && theSlider.value?.handleSlide({ id: selectedSlideId.value, isHidden: true, content: '', name: '', language: selectedLanguage.value }, '');

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

const isSavingAspectRatio = ref(false);
const configurationDialog = ref<InstanceType<typeof AdminVDialog>>();
const {
	errors: aspectRatioErrors,
	clearErrors: clearAspectRatioErrors,
	handleError: handleAspectRatioError,
} = useErrors({ value: '' });

async function saveAspectRatio() {
	clearAspectRatioErrors();
	isSavingAspectRatio.value = true;

	try {
		await useApi('/api/admin/slides/aspectRatio', { method: 'put', body: { value: aspectRatio.value } });
		previousAspectRatio.value = aspectRatio.value;
		configurationDialog.value?.close();
	} catch (e) {
		handleAspectRatioError(e);
	} finally {
		isSavingAspectRatio.value = false;
	}
}

function revertAspectRatioIfUnsaved() {
	aspectRatioErrors.value.value = '';
	if (aspectRatio.value !== previousAspectRatio.value) {
		aspectRatio.value = previousAspectRatio.value;
	}
}
</script>

<template>
	<main id="content" class="mx-auto max-w-360 w-full flex flex-col gap-y-5 px-container pb-4 pt-[1.125rem]">
		<div class="grid grid-cols-[min-content_min-content_1fr] mx-auto max-w-256 w-full gap-x-3 gap-y-5 sm:grid-cols-[auto_auto_auto_1fr]">
			<div class="grid col-span-full grid-cols-[min-content_1fr_max-content] mx-auto max-w-256 w-full items-end gap-x-3 gap-y-5 md:flex">
				<AdminLanguageSelect
					ref="languageSelect"
					v-model="selectedLanguage"
					:has-changed="hasChanged"
					:changed-callback="clearFormAndGetSlides"
					@languages-loaded="setLanguagesAndGetSlides"
				/>
				<AdminVCombobox
					id="slideIdSelect"
					ref="slideIdSelect"
					v-model="selectedSlideId"
					class="col-span-2 mr-12 md:mr-auto md:w-64"
					label="slide"
					:options="slideSelectOptions"
					:is-loading="isLoadingSlides"
					label-sr-only
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
				</AdminVCombobox>
				<div class="relative flex gap-2 pt-12 md:gap-3 md:pt-0">
					<AdminHumbakFilesDialog class="h-9 w-9 neon-blue" icon-class="w-[1.375rem] h-[1.375rem]" />
					<AdminVDialog
						ref="configurationDialog"
						class="top-0 h-9 w-9 !absolute md:!relative neon-blue"
						class-container="grid grid-cols-2 gap-x-2 gap-y-3"
						class-close-button="justify-self-end"
						close-button-text="zamknij"
						title="konfiguracja slidera"
						:disabled="isLoadingAspectRatio"
						@open="previousAspectRatio = aspectRatio"
						@close="revertAspectRatioIfUnsaved"
					>
						<template #button>
							<span class="sr-only">konfiguracja slidera</span>
							<AdminVLoading v-if="isLoadingAspectRatio" />
							<div v-else class="i-mdi-wrench absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
						</template>

						<h3 class="col-span-full text-center text-5 font-600">
							konfiguracja slidera
						</h3>
						<AdminVInput
							id="sliderAspectRatio"
							v-model="aspectRatio"
							class="col-span-full mb-2"
							class-input="!w-fit"
							label="aspect ratio"
							:error="aspectRatioErrors.value"
							@update:model-value="aspectRatioErrors.value = ''"
						/>

						<template #post>
							<AdminVButton class="justify-self-start neon-green" :is-loading="isSavingAspectRatio" @click="saveAspectRatio">
								zapisz
							</AdminVButton>
						</template>
					</AdminVDialog>
					<AdminVButton class="h-9 w-9 p-0 neon-purple" title="formatuj" @click="editor?.formatCurrentModel">
						<span class="sr-only">formatuj</span>
						<div class="i-solar-magic-stick-3-bold absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
					</AdminVButton>
				</div>
				<AdminVButton ref="resetButton" class="w-fit justify-self-end neon-amber" @click="clearFormAndEditor">
					wyczyść
				</AdminVButton>
				<AdminVButton ref="saveButton" class="min-w-20 neon-green" :is-loading="isSaving" @click="sendForm">
					{{ selectedSlideId ? 'zapisz' : 'utwórz' }}
				</AdminVButton>
			</div>

			<AdminVEditor
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

			<AdminVInput
				id="slideName"
				v-model="name"
				label="nazwa"
				class="col-span-full sm:col-span-1"
				:error="errors.name"
				@update:model-value="errors.name = ''"
			/>
			<AdminVCombobox
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
			<AdminVSwitch
				id="slideIsHidden"
				v-model="isHidden"
				:label="isHidden ? 'schowany' : 'schowaj'"
				:error="errors.isHidden"
				@update:model-value="errors.isHidden = ''"
			/>
			<AdminVButton
				v-if="selectedSlideId !== undefined"
				ref="deleteButton"
				class="h-fit self-end justify-self-end neon-red"
				:is-loading="isLoadingSlide"
				@click="deleteSlide"
			>
				usuń
			</AdminVButton>
		</div>

		<article
			class="relative min-h-40 w-full outline-(1px black dashed) outline dark:outline-white"
			:style="{ paddingTop: `calc(${aspectRatio} * 100%)` }"
			aria-hidden="true"
			tabindex="-1"
		>
			<div class="absolute inset-0" v-html="parsedContent" />
		</article>

		<AdminTheSlider ref="theSlider" :language="selectedLanguage" :aspect-ratio="aspectRatio" />
	</main>
</template>
