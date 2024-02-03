<script setup lang="ts">
import type { IModel } from '~/composables/useMonaco';

const props = withDefaults(
	defineProps<{
		models: IModel[];
		currentModel?: number;
		isLoading?: boolean;
		error?: string | Record<string, unknown>;
	}>(),
	{ currentModel: 0 }
);

const emit = defineEmits<{
	'update:model-value': [string];
}>();

const editorRef = ref<HTMLDivElement>();

const { isLoading: editorIsLoading, updateModelValue, formatCurrentModel } = useMonaco(
	editorRef,
	toRef(() => props.models),
	toRef(() => props.currentModel),
	value => emit('update:model-value', value)
);

defineExpose({
	updateModelValue,
	formatCurrentModel,
});
</script>

<template>
	<div class="relative">
		<article ref="editorRef" class="h-full w-full" />
		<VLoading v-show="editorIsLoading || isLoading" class="absolute inset-0" :size="40" />
		<p v-if="error" class="pointer-events-none whitespace-pre-wrap absolute bottom-2 bg-black rounded-md p-3 dark:bg-white shadow-md left-1/2 -translate-x-1/2 text-[0.875rem] text-red-5 dark:text-red-6">
			{{ error }}
		</p>
	</div>
</template>
