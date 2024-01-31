<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';

import VCombobox from '~/components/V/VCombobox.vue';

const props = defineProps<{
	hasChanged: () => boolean;
	changedCallback: () => Promise<void>;
}>();

const emit = defineEmits<{
	languagesLoaded: [string[]];
}>();

const api = useApi();
const { confirm } = useConfirm();
const { toast } = useToast();

const modelValue = defineModel<string>();
let previousModelValue: string | undefined;
const isLoading = ref(false);
const languages = ref<string[]>([]);
const element = ref<ComponentExposed<typeof VCombobox>>();

onMounted(async () => {
	isLoading.value = true;
	try {
		languages.value = await api.languages.$get().then(r => r.json());

		modelValue.value = languages.value[0];
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
	<VCombobox
		id="languageSelect"
		ref="element"
		v-model="modelValue"
		class="!min-w-20 !w-20"
		class-input="!min-w-20 !w-20"
		label="język"
		:options="languages"
		:is-loading="isLoading"
		transform-options
		select-only
		label-visually-hidden
		@select-option="confirmIfChanged"
	/>
</template>
