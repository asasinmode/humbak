<script setup lang="ts">
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// import only whats needed
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';

const value = defineModel<string>();
const editorRef = ref<HTMLDivElement | null>();
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>();

onMounted(() => {
	if (!editorRef.value) {
		throw new Error('cannot find editor element');
	}

	const editorInstance = monaco.editor.create(editorRef.value, {
		value: value.value,
		language: 'html',
		automaticLayout: true,
		scrollBeyondLastLine: false,
		theme: 'vs-dark',
		minimap: {
			enabled: false,
		},
	});

	editor.value = editorInstance;

	editorInstance.onDidChangeModelContent(() => {
		value.value = editorInstance.getValue();
	});

	console.log(monaco.languages.getLanguages());
});

onBeforeUnmount(() => {
	editor.value?.dispose();
});
</script>

<template>
	<article ref="editorRef" />
</template>
