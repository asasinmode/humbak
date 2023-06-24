<script setup lang="ts">
import * as monaco from 'monaco-editor-core';

const value = defineModel<string>();
const containerRef = ref<HTMLDivElement | null>();
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined);

onMounted(() => {
	if (!containerRef.value) {
		throw new Error('cannot find editor container');
	}

	const editorInstance = monaco.editor.create(containerRef.value, {
		value: value.value,
		automaticLayout: true,
		scrollBeyondLastLine: false,
		theme: 'vs-dark',
		minimap: {
			enabled: false,
		},
		// 'inlineSuggest': {
		// 	enabled: false,
		// },
	});

	editor.value = editorInstance;

	editorInstance.onDidChangeModelContent(() => {
		value.value = editorInstance.getValue();
	});
});

onBeforeUnmount(() => {
	editor.value?.dispose();
});
</script>

<template>
	<article ref="containerRef" />
</template>
