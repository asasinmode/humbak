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

const { isDark } = useTheme();

const isLoading = ref(false);
const editorRef = ref<HTMLDivElement>();
const editor = shallowRef<IMonacoStandalone>();
const editorModels = shallowRef<IMonacoTextModel[]>([]);
let setTheme: (theme: string) => void;
let getModels: () => IMonacoTextModel[];

// add loading & load only once
onMounted(async () => {
	if (!editorRef.value) {
		throw new Error('editor element not found');
	}

	isLoading.value = true;
	const monaco = await loader.init();

	getModels = monaco.editor.getModels;
	setTheme = monaco.editor.setTheme;
	setTheme(isDark.value ? 'vs-dark' : 'vs');

	const metaUri = monaco.Uri.parse('meta.json');

	for (const { value, language } of props.models) {
		editorModels.value.push(
			monaco.editor.createModel(value, language, language === 'json' ? metaUri : undefined)
		);
	}

	monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
		validate: true,
		schemas: [{
			uri: 'metaSchema.json',
			fileMatch: [metaUri.toString()],
			schema: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						name: {
							type: 'string',
							description: [
								'The name and content attributes can be used together to provide document metadata in terms of name-value pairs,',
								'with the name attribute giving the metadata name, and the content attribute giving the value.',
								'@see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-name',
							].join('\n'),
							anyOf: [
								{
									enum: [
										'description',
										'author',
										'creator',
										'publisher',
										'generator',
										'referrer',
										'robots',
										'google',
										'googlebot',
										'rating',
										'format-detection',
										'x-ua-compatible',
										'refresh',
										'keywords',
									],
								},
								{ pattern: '.*' },
							],
						},
						content: {
							description: [
								'This attribute contains the value for the http-equiv or name attribute, depending on which is used.',
								'@see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content',
							].join('\n'),
							type: 'string',
						},
					},
					additionalProperties: true,
				},
			},
		}],
	});

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
	for (const model of getModels()) {
		model.dispose();
	}
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

function formatCurrentModel() {
	return editor.value?.getAction('editor.action.formatDocument')?.run();
}

defineExpose({
	updateModelValue,
	formatCurrentModel,
});
</script>

<template>
	<div class="relative">
		<article ref="editorRef" class="h-full w-full" />
		<VLoading v-if="isLoading" class="absolute inset-0" :size="40" />
	</div>
</template>
