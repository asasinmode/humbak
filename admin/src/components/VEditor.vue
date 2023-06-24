<script setup lang="ts">
import * as monaco from 'monaco-editor-core';

const temp = ref('');
const container = ref<HTMLDivElement | null>();
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined);

onMounted(() => {
	if (!container.value) {
		throw new Error('cannot find editor container');
	}

	const editorInstance = monaco.editor.create(container.value, {
		value: temp.value,
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
		temp.value = editorInstance.getValue();
	});
});

onBeforeUnmount(() => {
	editor.value?.dispose();
});
</script>

<template>
	<article ref="container" />
</template>
