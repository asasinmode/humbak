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

const isLoading = ref(false);
const editorRef = ref<HTMLDivElement>();
const editor = shallowRef<IMonacoStandalone>();
const editorModels = shallowRef<IMonacoTextModel[]>([]);
let setTheme: (theme: string) => void;

const { isDark } = useTheme();

// add loading & load only once
onMounted(async () => {
	if (!editorRef.value) {
		throw new Error('cannot find editor element');
	}

	isLoading.value = true;
	const monaco = await loader.init();

	setTheme = monaco.editor.setTheme;
	setTheme(isDark.value ? 'vs-dark' : 'vs');

	for (const { value, language } of props.models) {
		editorModels.value.push(monaco.editor.createModel(value, language));
	}

	const editorInstance = monaco.editor.create(editorRef.value, {
		model: editorModels.value[props.currentModel],
		automaticLayout: true,
		scrollBeyondLastLine: false,
		minimap: {
			enabled: false,
		},
		tabSize: 2,
	});

	editor.value = editorInstance;
	editor.value.onDidChangeModelContent(() => {
		emit('update:model-value', editorModels.value[props.currentModel].getValue());
	});

	isLoading.value = false;
});

onBeforeUnmount(() => {
	editor.value?.dispose();
});

watch(() => props.currentModel, (index) => {
	editor.value?.setModel(editorModels.value[index]);
});

watch(isDark, (value) => {
	setTheme(value ? 'vs-dark' : 'vs');
});

function updateModelValue(index: number, value: string) {
	editorModels.value[index].setValue(value);
}

defineExpose({
	updateModelValue,
});
</script>

<template>
	<div class="relative">
		<article ref="editorRef" class="h-full w-full" />
		<VLoading v-if="isLoading" class="absolute inset-0" :size="40" />
	</div>
</template>
