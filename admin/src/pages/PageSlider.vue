<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';
import VEditor from '~/components/V/VEditor.vue';

useGlobalPagesStylesheet();

const selectedId = ref<string>();
const isLoading = ref(false);

const resetButton = ref<InstanceType<typeof VButton>>();
const saveButton = ref<InstanceType<typeof VButton>>();
const editor = ref<InstanceType<typeof VEditor>>();

const {
	clearForm, sendForm, updateValues, isSaving, value,
} = useForm(
	{ value: '' },
	async () => {},
	saveButton.value?.element
);

onMounted(async () => {
	updateValues({ value: '<span class="selector">init</span>' });
	editor.value?.updateModelValue(0, '<span class="selector">init</span>');
	await editor.value?.formatCurrentModel();
});

// todo select on focus out & alert if changes

async function clearFormAndEditor() {
	const proceed = await clearForm(resetButton.value?.element);
	if (!proceed) {
		return;
	}

	selectedId.value = undefined;
	editor.value?.updateModelValue(0, '');
}
</script>

<template>
	<main class="grid grid-cols-1 mx-auto max-w-256 w-full gap-y-5 px-4 pb-4 pt-[1.125rem] lg:px-0">
		<div class="flex gap-3 pr-12 md:pr-0">
			<VCombobox
				id="slideSelect"
				v-model="selectedId"
				label="slide"
				:options="[1, 2, 3]"
				label-visually-hidden
				transform-options
				select-only
			/>
			<VButton ref="resetButton" class="ml-auto neon-amber" @click="clearFormAndEditor">
				wyczyść
			</VButton>
			<VButton ref="saveButton" class="min-w-20 neon-green" :is-loading="isSaving" @click="sendForm">
				{{ selectedId ? 'zapisz' : 'utwórz' }}
			</VButton>
		</div>
		<VEditor
			ref="editor"
			class="h-72 shadow"
			:models="[
				{ language: 'html', value },
			]"
			:current-model="0"
			:is-loading="isLoading"
			@update:model-value="value = $event"
		/>

		<div v-html="value" />
	</main>
</template>
