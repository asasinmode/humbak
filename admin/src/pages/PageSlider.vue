<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';

import VButton from '~/components/V/VButton.vue';
import VEditor from '~/components/V/VEditor.vue';
import VCombobox from '~/components/V/VCombobox.vue';

import type { IListedSlide, IUniqueLanguage } from '~/composables/useApi';

useGlobalPagesStylesheet();
const api = useApi();
const { confirm } = useConfirm();
const { toast, toastGenericError } = useToast();

const resetButton = ref<InstanceType<typeof VButton>>();
const saveButton = ref<InstanceType<typeof VButton>>();
const deleteButton = ref<InstanceType<typeof VButton>>();
const editor = ref<InstanceType<typeof VEditor>>();
const languageSelect = ref<ComponentExposed<typeof VCombobox>>();
const slideIdSelect = ref<ComponentExposed<typeof VCombobox>>();

const isLoadingLanguages = ref(false);
const isLoadingSlides = ref(false);
const availableSlides = ref<IListedSlide[]>([]);
const selectedSlideId = ref<number>();
const languages = ref<IUniqueLanguage[]>([]);
const selectedLanguage = ref<string>();
const previousLoadedSlidesLanguage = ref<string>();
const previousSelectedSlideId = ref<number>();

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

		const slideIndex = availableSlides.value.findIndex(element => element.name === slide.name);

		if (slide.language !== selectedLanguage.value) {
			console.log('different language', slideIndex, slide);
			selectedLanguage.value = slide.language;
			await getSlides();
			selectedSlideId.value = slide.id;
			await selectSlide();
		} else if (slideIndex === -1) {
			console.log('new slide same language', slideIndex, slide);
			availableSlides.value.push({
				name: slide.name,
				id: slide.id,
				isHidden: slide.isHidden,
			});
			selectedSlideId.value = slide.id;
		} else {
			console.log('existing slide', slideIndex, slide);
			availableSlides.value[slideIndex] = {
				name: slide.name,
				id: slide.id,
				isHidden: slide.isHidden,
			};
		}

		updateValues(slide);
		editor.value?.updateModelValue(0, slide.content);
	},
	saveButton.value?.element
);

onMounted(async () => {
	isLoadingLanguages.value = true;
	try {
		languages.value = await api.pages.uniqueLanguages.query();
		if (!languages.value.length) {
			return;
		}

		selectedLanguage.value = languages.value[0];
		previousLoadedSlidesLanguage.value = selectedLanguage.value;

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
	if (previousLoadedSlidesLanguage.value === selectedLanguage.value) {
		return;
	}
	if (hasChanged()) {
		const proceed = await confirm(languageSelect.value?.getInputRef()?.element, {
			text: 'Masz niezapisane zmiany. Czy na pewno chcesz kontynuować?',
			okText: 'kontynuuj',
		});
		if (!proceed) {
			selectedLanguage.value = previousLoadedSlidesLanguage.value;
			return;
		}
	}

	clearForm(undefined, true);
	editor.value?.updateModelValue(0, '');
	await getSlides();
	previousLoadedSlidesLanguage.value = selectedLanguage.value;
}

async function clearFormAndEditor() {
	const proceed = await clearForm(resetButton.value?.element);
	if (!proceed) {
		return;
	}

	selectedSlideId.value = undefined;
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

	isLoadingSlides.value = true;
	try {
		const slide = await api.slides.byId.query(selectedSlideId.value);
		updateValues(slide);
		editor.value?.updateModelValue(0, content.value);
		previousSelectedSlideId.value = selectedSlideId.value;
	} catch (e) {
		toast('błąd przy ładowaniu slideu', 'error');
		console.error(e);
	} finally {
		isLoadingSlides.value = false;
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
	}
}
</script>

<template>
	<main class="grid grid-cols-[auto_auto_1fr] mx-auto max-w-256 w-full gap-x-3 gap-y-5 px-4 pb-4 pt-[1.125rem] sm:grid-cols-[auto_auto_auto_1fr] lg:px-0">
		<div id="slidePageControls" class="grid col-span-full grid-cols-[min-content_1fr_max-content_max-content] w-full gap-3 md:flex">
			<VCombobox
				id="languageSelect"
				ref="languageSelect"
				v-model="selectedLanguage"
				class="!min-w-20 !w-20"
				input-class="!w-20 !min-w-20"
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
				class="col-span-3 mr-12 md:mr-auto md:w-64"
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
			<VButton class="col-span-2 h-9 w-9 p-0 neon-purple" title="formatuj" @click="editor?.formatCurrentModel">
				<span class="visually-hidden">formatuj</span>
				<div class="i-solar-magic-stick-3-bold absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
			</VButton>
			<VButton ref="resetButton" class="neon-amber" @click="clearFormAndEditor">
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
			:is-loading="isLoadingLanguages || isLoadingSlides"
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
			input-class="!w-20 !min-w-20"
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
			:is-loading="isLoadingSlides"
			@click="deleteSlide"
		>
			usuń
		</VButton>

		<div class="col-span-full" v-html="content" />
	</main>
</template>
