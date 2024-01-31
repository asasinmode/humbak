<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';

import VButton from '~/components/V/VButton.vue';
import VEditor from '~/components/V/VEditor.vue';
import VCombobox from '~/components/V/VCombobox.vue';
import LanguageSelect from '~/components/LanguageSelect.vue';

const api = useApi();
const { toast } = useToast();
const { confirm } = useConfirm();

const editor = ref<InstanceType<typeof VEditor>>();
const saveButton = ref<InstanceType<typeof VButton>>();
const languageSelect = ref<InstanceType<typeof LanguageSelect>>();
const isLoading = ref(false);

const selectedLanguage = ref<string>();

const initMetaValue = '';
const {
	isSaving,
	clearForm: clearMetaForm,
	value: metaValue,
	sendForm: sendMeta,
	hasChanged: hasMetaChanged,
	updateValues: updateMetaValues,
} = useForm({ value: '' }, async () => {
	console.log('saving', metaValue.value);
	throw new Error('oopsie');
	// let contentFields;
	// try {
	// 	contentFields = contentEditor.value?.getChangedFields() || {};
	// } catch (e) {
	// 	toast('zła wartość meta', 'error');
	// 	console.error(e);
	// 	return;
	// }

	// await api.pages.$post({
	// 	json: {
	// 		value: metaValue.value,
	// 	},
	// }).then(r => r.json());

	// updateMetaValues({value: metaValue.value});

	// toast('zapisano zmiany');
},	() => saveButton.value?.element);

const { value: cssValue, initValue: initCssValue, updateValue: updateCssValue } = useGlobalPagesStylesheet(
	isLoading,
	(value: string) => editor.value?.updateModelValue(0, value)
);

function hasChanged() {
	return cssValue.value !== initCssValue.value || hasMetaChanged();
}

async function saveChanges() {
	isSaving.value = true;
	try {
		if (hasChanged()) {
			await api.globalCss.$post({ json: { value: cssValue.value } });
			initCssValue.value = cssValue.value;
		}
		toast('zapisano zmiany');
	} catch (e) {
		toast('błąd przy zapisywaniu stylów', 'error');
		useShake(saveButton.value?.element);
		console.error(e);
	} finally {
		isSaving.value = false;
	}
}

const modelSelect = ref<ComponentExposed<typeof VCombobox>>();
const editorModel = ref(0);
let previousEditorModel = 0;

async function changeEditorModel() {
	if (previousEditorModel === editorModel.value) {
		return;
	}
	if (hasChanged()) {
		const proceed = await confirm(modelSelect.value?.getInputRef()?.element, {
			text: 'Masz niezapisane zmiany. Czy na pewno chcesz kontynuować?',
			okText: 'kontynuuj',
		});
		if (!proceed) {
			editorModel.value = previousEditorModel;
			return;
		}
	}

	previousEditorModel = editorModel.value;
	if (editorModel.value === 1) {
		cssValue.value = initCssValue.value;
		editor.value?.updateModelValue(0, cssValue.value);
		await getMeta();
	} else {
		metaValue.value = initMetaValue;
		editor.value?.updateModelValue(1, metaValue.value);
	}
}

async function getMeta() {
	if (!selectedLanguage.value || isLoading.value) {
		return;
	}

	isLoading.value = true;
	try {
		const { value } = await api.meta.$get({
			query: { language: selectedLanguage.value as string },
		}).then(r => r.json());

		updateMetaValues({ value });
		editor.value?.updateModelValue(1, JSON.stringify(value));
	} catch (e) {
		console.error(e);
		toast('błąd przy ładowaniu meta', 'error');
	} finally {
		isLoading.value = false;
	}
}

function updateModelValue(newValue: string) {
	if (editorModel.value === 0) {
		cssValue.value = newValue;
		updateCssValue(newValue);
	} else {
		metaValue.value = newValue;
	}
}

async function clearFormAndGetMeta() {
	clearMetaForm(undefined, true);
	editor.value?.updateModelValue(1, '');
	await getMeta();
}

function getMetaAndSetPreviousLanguage() {
	getMeta().then(() => languageSelect.value?.setPrevious(selectedLanguage.value));
}
</script>

<template>
	<main
		id="content"
		class="grid grid-cols-[min-content_1fr_max-content] mx-auto max-w-256 min-h-inherit w-full gap-x-3 gap-y-5 px-container pb-4 pt-[1.125rem]"
		:class="editorModel === 1
			? 'grid-rows-[min-content_min-content_1fr] md:(grid-cols-[min-content_min-content_1fr_max-content] grid-rows-[min-content_1fr])'
			: 'grid-rows-[min-content_1fr]'
		"
	>
		<VCombobox
			id="modelSelect"
			ref="modelSelect"
			v-model="editorModel"
			class="!min-w-20 !w-20 md:!w-fit"
			class-input="!w-20 !min-w-20"
			label="tryb edytora"
			:options="[
				{ text: 'css', value: 0 },
				{ text: 'meta', value: 1 },
			]"
			label-visually-hidden
			select-only
			hide-check
			@select-option="changeEditorModel"
		/>
		<LanguageSelect
			v-show="editorModel === 1"
			ref="languageSelect"
			v-model="selectedLanguage"
			class="row-start-2 col-span-full -mt-2 md:(row-start-auto col-span-1 mt-0)"
			:has-changed="hasChanged"
			:changed-callback="clearFormAndGetMeta"
			@languages-loaded="getMetaAndSetPreviousLanguage"
		/>
		<VButton class="h-9 w-9 justify-self-end p-0 neon-purple" title="formatuj" @click="editor?.formatCurrentModel">
			<span class="visually-hidden">formatuj</span>
			<div class="i-solar-magic-stick-3-bold absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
		</VButton>
		<VButton
			class="mr-12 md:mr-0 neon-green"
			:is-loading="isSaving"
			@click="editorModel === 0 ? saveChanges() : sendMeta(false)"
		>
			zapisz
		</VButton>
		<VEditor
			ref="editor"
			class="col-span-full min-h-64"
			:models="[
				{ language: 'css', value: cssValue },
				{ language: 'json', value: metaValue },
			]"
			:current-model="editorModel"
			:is-loading="isLoading"
			@update:model-value="updateModelValue"
		/>
	</main>
</template>
