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
	clearForm, sendForm, updateValues, isSaving,
	name, content, isHidden,
} = useForm(
	{ name: '', content: '', isHidden: false },
	async () => {},
	saveButton.value?.element
);

onMounted(async () => {
	console.log('get slides');
	// updateValues({ content: '<div><h1 class="selector">init</h1></div>' });
	// editor.value?.updateModelValue(0, '<div><h1 class="selector">init</h1></div>');
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
	<main class="grid grid-cols-[auto_1fr] mx-auto max-w-256 w-full gap-x-3 gap-y-5 px-4 pb-4 pt-[1.125rem] lg:px-0">
		<div id="slidePageControls" class="grid col-span-full grid-cols-[1fr_max-content_max-content] w-full gap-3 md:flex">
			<VCombobox
				id="slideSelect"
				v-model="selectedId"
				class="col-span-full mr-12 md:mr-auto md:w-76"
				label="slide"
				:options="[1, 2, 3]"
				label-visually-hidden
				transform-options
				select-only
			/>
			<VButton class="h-9 w-9 p-0 neon-purple" title="formatuj" @click="editor?.formatCurrentModel">
				<span class="visually-hidden">formatuj</span>
				<div class="i-solar-magic-stick-3-bold absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
			</VButton>
			<VButton ref="resetButton" class="neon-amber" @click="clearFormAndEditor">
				wyczyść
			</VButton>
			<VButton ref="saveButton" class="min-w-20 neon-green" :is-loading="isSaving" @click="sendForm">
				{{ selectedId ? 'zapisz' : 'utwórz' }}
			</VButton>
		</div>

		<VEditor
			ref="editor"
			class="col-span-full h-72 shadow"
			:models="[
				{ language: 'html', value: content },
			]"
			:current-model="0"
			:is-loading="isLoading"
			@update:model-value="content = $event"
		/>

		<VInput id="slideName" v-model="name" label="nazwa" />
		<VCheckbox id="slideIsHidden" v-model="isHidden" :label="isHidden ? 'schowany' : 'schowaj'" />

		<div class="col-span-full" v-html="content" />
	</main>
</template>
