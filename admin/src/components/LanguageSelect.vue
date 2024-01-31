<script setup lang="ts">
const emit = defineEmits<{
	languagesLoaded: [];
}>();

const api = useApi();
const { toast } = useToast();

const modelValue = defineModel<string>();
const isLoading = ref(false);
const languages = ref<string[]>([]);

onMounted(async () => {
	isLoading.value = true;
	try {
		languages.value = await api.languages.$get().then(r => r.json());
		if (!languages.value.length) {
			return;
		}

		modelValue.value = languages.value[0];
		emit('languagesLoaded');
	} catch (e) {
		toast('błąd przy ładowaniu języków', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
});
</script>

<template>
	<VCombobox
		id="languageSelect"
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
