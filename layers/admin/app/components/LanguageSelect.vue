<script setup lang="ts">
import type { AdminVCombobox } from '#components';
import type { ComponentExposed } from 'vue-component-type-helpers';

const props = defineProps<{
	hasChanged: () => boolean;
	changedCallback: () => Promise<void>;
}>();

const emit = defineEmits<{
	languagesLoaded: [string[]];
}>();

const { confirm } = useConfirm();
const { toast } = useToast();
const { defaultLanguage } = useRuntimeConfig().public;

const modelValue = defineModel<string>();
let previousModelValue: string | undefined;
const isLoading = ref(false);
const languages = ref<string[]>([]);
const element = ref<ComponentExposed<typeof AdminVCombobox>>();

onMounted(async () => {
	isLoading.value = true;
	try {
		languages.value = await useApi('/api/admin/languages');

		modelValue.value = languages.value.includes(defaultLanguage)
			? defaultLanguage
			: languages.value[0];
		emit('languagesLoaded', languages.value);
	} catch (e) {
		toast('błąd przy ładowaniu języków', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
});

async function confirmIfChanged() {
	if (previousModelValue === modelValue.value) {
		return;
	}
	if (props.hasChanged?.()) {
		const proceed = await confirm(element.value?.getInputRef()?.element);
		if (!proceed) {
			modelValue.value = previousModelValue;
			return;
		}
	}

	await props.changedCallback();
	previousModelValue = modelValue.value;
}

defineExpose({
	setPrevious: (value: string | undefined) => previousModelValue = value,
});
</script>

<template>
	<AdminVCombobox
		id="languageSelect"
		ref="element"
		v-model="modelValue"
		class="!min-w-20 !w-20"
		class-input="!min-w-20 !w-20"
		label="język"
		:options="languages"
		:is-loading="isLoading"
		label-sr-only
		transform-options
		select-only
		@select-option="confirmIfChanged"
	/>
</template>
