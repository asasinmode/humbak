<script setup lang="ts">
import type { ComponentExposed } from 'vue-component-type-helpers';

import VCombobox from '~/components/V/VCombobox.vue';

const emit = defineEmits<{
	languagesLoaded: [string[]];
}>();

const api = useApi();
const { toast } = useToast();

const modelValue = defineModel<string>();
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

defineExpose({
	getInputRef: () => element.value?.getInputRef(),
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
	/>
</template>
