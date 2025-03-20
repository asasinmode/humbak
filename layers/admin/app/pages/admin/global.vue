<script setup lang="ts">
import type { AdminLanguageSelect, AdminVButton, AdminVCombobox, AdminVEditor } from '#components';

import type { ComponentExposed } from 'vue-component-type-helpers';

definePageMeta({ layout: 'admin' });
useHead({ title: 'global - Admin' });

const { toast } = useToast();
const { confirm } = useConfirm();

const editor = ref<InstanceType<typeof AdminVEditor>>();
const saveButton = ref<InstanceType<typeof AdminVButton>>();
const languageSelect = ref<InstanceType<typeof AdminLanguageSelect>>();
const isLoading = ref(false);

const selectedLanguage = ref<string>();

let initMeta = '';
const {
	isSaving,
	errors: metaErrors,
	clearForm: clearMetaForm,
	value: metaValue,
	sendForm: sendMeta,
	updateValues: updateMetaValues,
} = useForm({ value: '' }, async () => {
	let value: Record<string, string>[];
	try {
		value = JSON.parse(metaValue.value);
	} catch (e) {
		toast('niewłaściwa wartość meta', 'error');
		console.error(e);
		return;
	}

	await useApi('/api/admin/meta', { method: 'post', body: { value, language: selectedLanguage.value as string } });

	updateMetaValues({ value: metaValue.value });
	initMeta = metaValue.value;

	toast('zapisano zmiany');
}, () => saveButton.value?.element);

const { value: cssValue, initValue: initCssValue, updateValue: updateCssValue } = useGlobalPagesStylesheet(
	isLoading,
	(value: string) => editor.value?.updateModelValue(0, value),
);

async function saveChanges() {
	isSaving.value = true;
	try {
		if (hasChanged(false)) {
			await useApi('/api/admin/globalCss', { method: 'post', body: { value: cssValue.value } });
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

const modelSelect = ref<ComponentExposed<typeof AdminVCombobox>>();
const editorModel = ref(0);
let previousEditorModel = 0;

async function changeEditorModel() {
	if (previousEditorModel === editorModel.value) {
		return;
	}
	if (hasChanged(true)) {
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
		languageSelect.value?.setPrevious(selectedLanguage.value);
	} else {
		clearMetaForm(undefined, true);
		editor.value?.updateModelValue(1, metaValue.value);
	}
}

function hasChanged(usePrevious: boolean) {
	function hasMetaChanged() {
		try {
			const rv = JSON.stringify(JSON.parse(metaValue.value)) !== JSON.stringify(JSON.parse(initMeta));
			return rv;
		} catch (error) {
			console.error('JSON parsing error');
			console.error(error);
			return true;
		}
	}

	if (usePrevious) {
		return previousEditorModel === 0
			? cssValue.value !== initCssValue.value
			: hasMetaChanged();
	}

	return editorModel.value === 0
		? cssValue.value !== initCssValue.value
		: hasMetaChanged();
}

async function getMeta() {
	if (!selectedLanguage.value || isLoading.value) {
		return;
	}

	isLoading.value = true;
	try {
		const { value } = await useApi('/api/admin/meta', { query: { language: selectedLanguage.value } });

		updateMetaValues({ value });
		initMeta = value;
		editor.value?.updateModelValue(1, value);

		await nextTick();
		editor.value?.formatCurrentModel();
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
</script>

<template>
	<main
		id="content"
		class="grid grid-cols-[min-content_1fr_max-content] mx-auto h-screen max-w-256 min-h-100 w-full gap-x-3 gap-y-5 px-container pb-4 pt-[1.125rem] md:h-[calc(100vh_-_3.75rem)] md:min-h-88"
		:class="editorModel === 1
			? 'grid-rows-[min-content_min-content_1fr] md:(grid-cols-[min-content_min-content_1fr_max-content] grid-rows-[min-content_1fr])'
			: 'grid-rows-[min-content_1fr]'
		"
	>
		<AdminVCombobox
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
			label-sr-only
			select-only
			hide-check
			@select-option="changeEditorModel"
		/>
		<AdminLanguageSelect
			v-show="editorModel === 1"
			ref="languageSelect"
			v-model="selectedLanguage"
			class="col-span-full row-start-2 md:(col-span-1 row-start-auto mt-0) -mt-2"
			:has-changed="() => hasChanged(false)"
			:changed-callback="clearFormAndGetMeta"
		/>
		<AdminVButton class="h-9 w-9 justify-self-end p-0 neon-purple" title="formatuj" @click="editor?.formatCurrentModel">
			<span class="sr-only">formatuj</span>
			<div class="i-solar-magic-stick-3-bold absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
		</AdminVButton>
		<AdminVButton
			class="mr-12 md:mr-0 neon-green"
			:is-loading="isSaving"
			@click="editorModel === 0 ? saveChanges() : sendMeta(false)"
		>
			zapisz
		</AdminVButton>
		<AdminVEditor
			ref="editor"
			class="col-span-full min-h-64"
			:models="[
				{ language: 'css', value: cssValue },
				{ language: 'json', value: metaValue },
			]"
			:error="metaErrors.value ? JSON.stringify(metaErrors.value, null, 2).slice(2, -2) : ''"
			:current-model="editorModel"
			:is-loading="isLoading"
			@update:model-value="updateModelValue"
		/>
	</main>
</template>
