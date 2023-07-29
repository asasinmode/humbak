<script setup lang="ts">
import loader from '@monaco-editor/loader';

type IModel = { value: string; language: 'html' | 'css' | 'json'; };
type IMonacoEditor = Awaited<ReturnType<typeof loader['init']>>['editor'];
type IMonacoTextModel = ReturnType<IMonacoEditor['createModel']>;
type IMonacoStandalone = ReturnType<IMonacoEditor['create']>;

const props = withDefaults(
	defineProps<{
		models: IModel[];
		currentModel?: number;
	}>(),
	{ currentModel: 0 }
);

const emit = defineEmits<{
	'update:model-value': [string];
}>();

const editorRef = ref<HTMLDivElement>();
const editor = shallowRef<IMonacoStandalone>();
const editorModels = shallowRef<IMonacoTextModel[]>([]);

// add loading & load only once
onMounted(async () => {
	if (!editorRef.value) {
		throw new Error('cannot find editor element');
	}

	const monaco = await loader.init();

	for (const { value, language } of props.models) {
		editorModels.value.push(monaco.editor.createModel(value, language));
	}

	const editorInstance = monaco.editor.create(editorRef.value, {
		model: editorModels.value[props.currentModel],
		automaticLayout: true,
		scrollBeyondLastLine: false,
		theme: 'vs-dark',
		minimap: {
			enabled: false,
		},
		tabSize: 2,
	});

	editor.value = editorInstance;
	editor.value.onDidChangeModelContent(() => {
		emit('update:model-value', editorModels.value[props.currentModel].getValue());
	});
});

onBeforeUnmount(() => {
	editor.value?.dispose();
});

watch(() => props.currentModel, (index) => {
	editor.value?.setModel(editorModels.value[index]);
});
</script>

<template>
	<article ref="editorRef" />
</template>
