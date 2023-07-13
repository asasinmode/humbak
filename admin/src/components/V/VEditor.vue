<script setup lang="ts">
import * as monaco from 'monaco-editor-core';

const value = defineModel<string>();
const editorRef = ref<HTMLDivElement | null>();
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined);

onMounted(() => {
	if (!editorRef.value) {
		throw new Error('cannot find editor element');
	}

	const editorInstance = monaco.editor.create(editorRef.value, {
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
	<article ref="editorRef" />
</template>
