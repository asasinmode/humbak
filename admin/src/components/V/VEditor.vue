<script setup lang="ts">
import type { IModel } from '~/composables/useMonaco';

const props = withDefaults(
	defineProps<{
		models: IModel[];
		currentModel?: number;
		isLoading?: boolean;
		error?: string;
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
		<VLoading v-if="editorIsLoading || isLoading" class="absolute inset-0" :size="40" />
		<p v-if="error" class="pointer-events-none absolute bottom-0 left-3 translate-y-full text-3 text-red-500">
			{{ error }}
		</p>
	</div>
</template>
