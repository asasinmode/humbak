<script setup lang="ts">
import VEditor from '~/components/V/VEditor.vue';

const api = useApi();
const { toast, toastGenericError } = useToast();
const editor = ref<InstanceType<typeof VEditor>>();
const { value, isLoading, initValue, updateValue } = useGlobalPagesStylesheet(
	(value: string) => editor.value?.updateModelValue(0, value)
);
const isSaving = ref(false);

async function saveChanges() {
	isSaving.value = true;
	try {
		if (value.value !== initValue.value) {
			await api.pages.updateGlobalCss.mutate(value.value);
			initValue.value = value.value;
		}
		toast('zapisano zmiany');
	} catch (e) {
		toastGenericError();
		console.error(e);
	} finally {
		isSaving.value = false;
	}
}

function updateModelValue(newValue: string) {
	value.value = newValue;
	updateValue(newValue);
}
</script>

<template>
	<main class="grid grid-cols-[1fr_min-content] grid-rows-[min-content_1fr] mx-auto max-w-256 min-h-inherit w-full flex-1 gap-x-3 gap-y-5 px-4 pb-4 pt-[1.125rem] lg:px-0">
		<VButton class="h-9 w-9 justify-self-end p-0 neon-purple" title="formatuj" @click="editor?.formatCurrentModel">
			<span class="visually-hidden">formatuj</span>
			<div class="i-solar-magic-stick-3-bold absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
		</VButton>
		<VButton
			class="ml-auto mr-12 md:mr-0 neon-green"
			:is-loading="isSaving"
			@click="saveChanges"
		>
			zapisz
		</VButton>
		<VEditor
			ref="editor"
			class="col-span-full"
			:models="[
				{ language: 'css', value },
			]"
			:current-model="0"
			:is-loading="isLoading"
			@update:model-value="updateModelValue"
		/>
	</main>
</template>
