import loader from '@monaco-editor/loader';

const { isDark } = useTheme();
const { toastGenericError } = useToast();

export type IModel = { value: string; language: 'html' | 'css' | 'json'; };
type IMonaco = Awaited<ReturnType<typeof loader['init']>>;
type IMonacoEditor = Awaited<ReturnType<typeof loader['init']>>['editor'];
type IMonacoTextModel = ReturnType<IMonacoEditor['createModel']>;
type IMonacoStandalone = ReturnType<IMonacoEditor['create']>;

let monaco: IMonaco;
let getModels: IMonaco['editor']['getModels'];
let setTheme: IMonaco['editor']['setTheme'];
let metaUri: ReturnType<IMonaco['Uri']['parse']>;

export const useMonaco = (
	containerRef: Ref<HTMLElement | undefined>,
	models: Ref<IModel[]>,
	currentModel: Ref<number>,
	emitUpdate: (value: string) => void
) => {
	const isLoading = ref(false);
	const editor = shallowRef<IMonacoStandalone>();
	const editorModels = shallowRef<IMonacoTextModel[]>([]);

	onMounted(async () => {
		if (!monaco) {
			isLoading.value = true;

			monaco = await loader.init();
			metaUri = monaco.Uri.parse('meta.json');

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

			getModels = monaco.editor.getModels;
			setTheme = monaco.editor.setTheme;
			setTheme(isDark.value ? 'vs-dark' : 'vs');

			isLoading.value = false;
		}

		for (const { value, language } of models.value) {
			editorModels.value.push(
				monaco.editor.createModel(value, language, language === 'json' ? metaUri : undefined)
			);
		}

		if (!containerRef.value) {
			toastGenericError();
			throw new Error('editor container not found');
		}

		const editorInstance = monaco.editor.create(containerRef.value, {
			model: editorModels.value[currentModel.value],
			automaticLayout: true,
			scrollBeyondLastLine: false,
			minimap: {
				enabled: false,
			},
			tabSize: 2,
		});

		editor.value = editorInstance;

		editor.value.onDidChangeModelContent(() => {
			emitUpdate(editorModels.value[currentModel.value].getValue());
		});
	});

	onBeforeUnmount(() => {
		editor.value?.dispose();
		if (!getModels) {
			return;
		}
		for (const model of getModels()) {
			model.dispose();
		}
	});

	watch(currentModel, (index) => {
		editor.value?.setModel(editorModels.value[index]);
	});

	watch(isDark, (value) => {
		setTheme(value ? 'vs-dark' : 'vs');
	});

	return {
		isLoading,
		updateModelValue: (index: number, value: string) => {
			if (editorModels.value[index] !== undefined) {
				editorModels.value[index].setValue(value);
			}
		},
		formatCurrentModel: () => {
			return editor.value?.getAction('editor.action.formatDocument')?.run();
		},
	};
};
