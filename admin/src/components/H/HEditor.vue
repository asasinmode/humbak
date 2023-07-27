<script setup lang="ts">
import loader from '@monaco-editor/loader';

type MonacoStandalone = ReturnType<Awaited<ReturnType<typeof loader['init']>>['editor']['create']>;

const value = defineModel<string>();
const editorRef = ref<HTMLDivElement>();
const editor = shallowRef<MonacoStandalone>();

onMounted(async () => {
	if (!editorRef.value) {
		throw new Error('cannot find editor element');
	}

	const monaco = await loader.init();

	const editorInstance = monaco.editor.create(editorRef.value, {
		value: value.value,
		language: 'html',
		automaticLayout: true,
		scrollBeyondLastLine: false,
		theme: 'vs-dark',
		minimap: {
			enabled: false,
		},
		tabSize: 2,
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
