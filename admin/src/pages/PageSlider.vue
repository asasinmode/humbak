<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';

import VButton from '~/components/V/VButton.vue';
import VEditor from '~/components/V/VEditor.vue';
import VCombobox from '~/components/V/VCombobox.vue';

import type { IListedSlide, IUniqueLanguage } from '~/composables/useApi';

useGlobalPagesStylesheet();
const api = useApi();
const { toast } = useToast();

const languageSelect = ref<ComponentExposed<typeof VCombobox>>();
const slideSelect = ref<ComponentExposed<typeof VCombobox>>();
const resetButton = ref<InstanceType<typeof VButton>>();
const saveButton = ref<InstanceType<typeof VButton>>();
const editor = ref<InstanceType<typeof VEditor>>();

const isLoadingLanguages = ref(false);
const isLoadingSlides = ref(false);
const availableSlides = ref<IListedSlide[]>([]);
const selectedSlideId = ref<string>();
const languages = ref<IUniqueLanguage[]>([]);
const selectedLanguage = ref('');

const {
	clearForm, sendForm, updateValues, isSaving,
	name, content, isHidden,
} = useForm(
	{ name: '', content: '', isHidden: false },
	async () => {},
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

		await nextTick();
		languageSelect.value && languageSelect.value.selectOption(0);

		getSlides();
	} catch (e) {
		toast('błąd przy ładowaniu języków', 'error');
	} finally {
		isLoadingLanguages.value = false;
	}
});

const slideSelectOptions = computed(() =>
	availableSlides.value.map(({ id, name, isHidden }) => ({ text: name, value: id, isHidden }))
);

// todo select on focus out & alert if changes
// add language input

async function getSlides() {
	const proceed = await clearForm(resetButton.value?.element);
	if (!proceed) {
		return;
	}

	isLoadingSlides.value = true;
	selectedSlideId.value = undefined;
	slideSelect.value?.selectOption(undefined);
	try {
		availableSlides.value = await api.slides.list.query(selectedLanguage.value);
	} catch (e) {
		toast('błąd przy ładowaniu slideów', 'error');
	} finally {
		isLoadingSlides.value = false;
	}
}

async function clearFormAndEditor() {
	const proceed = await clearForm(resetButton.value?.element);
	if (!proceed) {
		return;
	}

	selectedSlideId.value = undefined;
	editor.value?.updateModelValue(0, '');
}
</script>

<template>
	<main class="grid grid-cols-[auto_1fr] mx-auto max-w-256 w-full gap-x-3 gap-y-5 px-4 pb-4 pt-[1.125rem] lg:px-0">
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
			/>
			<VCombobox
				id="slideSelect"
				v-model="selectedSlideId"
				class="col-span-3 mr-12 md:mr-auto md:w-64"
				label="slide"
				:options="slideSelectOptions"
				:is-loading="isLoadingSlides"
				label-visually-hidden
				select-only
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
			@update:model-value="content = $event"
		/>

		<VInput id="slideName" v-model="name" label="nazwa" />
		<VCheckbox id="slideIsHidden" v-model="isHidden" :label="isHidden ? 'schowany' : 'schowaj'" />

		<div class="col-span-full" v-html="content" />
	</main>
</template>
