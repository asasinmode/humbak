<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		models: IModel[];
		currentModel?: number;
		isLoading?: boolean;
		error?: string | Record<string, unknown>;
	}>(),
	{ currentModel: 0 },
);

const emit = defineEmits<{
	'update:model-value': [string];
}>();

const editorRef = ref<HTMLDivElement>();

const { isLoading: editorIsLoading, updateModelValue, formatCurrentModel } = useMonaco(
	editorRef,
	toRef(() => props.models),
	toRef(() => props.currentModel),
	value => emit('update:model-value', value),
);

defineExpose({
	updateModelValue,
	formatCurrentModel,
});
</script>

<template>
	<div class="relative">
		<article ref="editorRef" class="size-full" />
		<AdminVLoading v-show="editorIsLoading || isLoading" class="absolute inset-0" :size="40" />
		<p v-if="error" class="pointer-events-none absolute bottom-2 left-1/2 whitespace-pre-wrap rounded-md bg-black p-3 text-[0.875rem] text-red-5 shadow-md -translate-x-1/2 dark:bg-white dark:text-red-6">
			{{ error }}
		</p>
	</div>
</template>
