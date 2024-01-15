<script setup lang="ts">
import VEditor from '~/components/V/VEditor.vue';
import type { IUpsertPageInput } from '~/composables/useApi';

const editor = ref<InstanceType<typeof VEditor>>();
const container = ref<HTMLDivElement>();

const { initResizeDrag } = useResizeHandler(container);
const { parsedContent, updateParsedContent } = useHumbakFiles();

const contents = ref({
	html: {
		initValue: '',
		value: '',
	},
	css: {
		initValue: '',
		value: '',
	},
	meta: {
		initValue: '',
		value: '',
	},
});
const currentModelIndex = ref(0);
let wasMetaFormatted = false;

const pageStylesheet = document.createElement('style');
let stylesheetUpdateTimeout: NodeJS.Timeout | undefined;
document.head.appendChild(pageStylesheet);

onUnmounted(() => {
	pageStylesheet.remove();
});

function updateCurrentModel(value: string) {
	const index = currentModelIndex.value;
	if (index === 0) {
		contents.value.html.value = value;
		updateParsedContent(contents.value.html.value);
	} else if (index === 1) {
		contents.value.css.value = value;
		updateStyleElement(value);
	} else {
		contents.value.meta.value = value;
	}
}

async function formatMeta() {
	if (!wasMetaFormatted && currentModelIndex.value === 2) {
		await nextTick();
		editor.value?.formatCurrentModel();
		wasMetaFormatted = true;
	}
}

function clear() {
	updateValues({ html: '', css: '', meta: '' });
}

function updateValues(
	data: {
		html: string;
		css: string;
		meta: string;
	} & Record<string, any>
) {
	contents.value.html.value = data.html;
	contents.value.meta.value = data.meta;
	contents.value.css.value = data.css;

	for (const key in contents.value) {
		// @ts-expect-error it's a valid key
		contents.value[key].initValue = contents.value[key].value;
	}

	pageStylesheet.innerHTML = contents.value.css.value;

	editor.value?.updateModelValue(0, contents.value.html.value);
	editor.value?.updateModelValue(1, contents.value.css.value);
	editor.value?.updateModelValue(2, contents.value.meta.value);

	wasMetaFormatted = false;
	formatMeta();
}

function getChangedFields() {
	const fields: Pick<IUpsertPageInput, 'html' | 'css' | 'meta'> = {};

	const { value: metaValue, initValue: metaInitValue } = contents.value.meta;
	if (metaValue || metaInitValue) {
		const parsedMetaValue = JSON.parse(contents.value.meta.value);
		if (metaInitValue) {
			const parsedInitMetaValue = JSON.parse(contents.value.meta.initValue);
			if (JSON.stringify(parsedMetaValue) !== JSON.stringify(parsedInitMetaValue)) {
				fields.meta = parsedMetaValue;
			}
		} else {
			fields.meta = parsedMetaValue;
		}
	}

	if (contents.value.html.value !== contents.value.html.initValue) {
		fields.html = contents.value.html.value;
	}
	if (contents.value.css.value !== contents.value.css.initValue) {
		fields.css = contents.value.css.value;
	}

	return fields;
}

function updateStyleElement(newValue: string) {
	if (stylesheetUpdateTimeout) {
		clearTimeout(stylesheetUpdateTimeout);
	}
	stylesheetUpdateTimeout = setTimeout(() => {
		pageStylesheet.innerHTML = newValue;
	}, 500);
}

// const parser = new DOMParser();
// const parsedContent = ref('');
// let fetchImagesTimeout: NodeJS.Timeout | undefined;

// const loadingIndicatorContainer = document.createElement('div');
// loadingIndicatorContainer.className = 'flex-center animate-duration-4500 text-black bg-black/10 min-h-[4rem] m-1';
// loadingIndicatorContainer.setAttribute('aria-hidden', 'true');
// const loadingIndicator = document.createElement('div');
// loadingIndicator.className = 'hourglass-loader after:block after:rounded-full after:content-empty';
// loadingIndicator.style.setProperty('--size', '20px');
// loadingIndicatorContainer.appendChild(loadingIndicator);

// const loadedFiles: Record<number, IDialogFile> = {};

// type ITempFileElement = {
// 	fid?: number;
// 	placeholder: HTMLElement;
// 	attributes: NamedNodeMap;
// };
// function updateParsedContent() {
// 	fetchImagesTimeout && clearTimeout(fetchImagesTimeout);

// 	let dom: Document;
// 	try {
// 		dom = parser.parseFromString(contents.value.html.value, 'text/html');
// 	} catch (e) {
// 		toastGenericError();
// 		throw e;
// 	}

// 	parsedContent.value = dom.body.innerHTML;

// 	const imageElements = dom.querySelectorAll('HumbakFile');
// 	if (!imageElements.length) {
// 		return;
// 	}

// 	const tempFiles: ITempFileElement[] = [];
// 	for (const element of imageElements) {
// 		const rawFid = element.attributes.getNamedItem('fid');
// 		let fid: number | undefined;
// 		if (rawFid !== null) {
// 			fid = Number.parseInt(rawFid.value);
// 			if (loadedFiles[fid]) {
// 				replaceTempWithImage({
// 					fid,
// 					attributes: element.attributes,
// 					placeholder: element as HTMLElement,
// 				}, loadedFiles[fid]);
// 				continue;
// 			}
// 		}

// 		const loadingCopy = loadingIndicatorContainer.cloneNode(true) as HTMLElement;
// 		element.replaceWith(loadingCopy);
// 		tempFiles.push({
// 			fid,
// 			placeholder: loadingCopy,
// 			attributes: element.attributes,
// 		});
// 	}

// 	parsedContent.value = dom.body.innerHTML;
// 	fetchImagesTimeout = setTimeout(() => fetchAndReplaceImages(dom, tempFiles), 1000);
// }

// async function fetchAndReplaceImages(dom: Document, tempFiles: ITempFileElement[]) {
// 	const ids: number[] = [];
// 	const placeholdersAndIds: { id: number; tempFile: ITempFileElement; }[] = [];

// 	for (const tempFile of tempFiles) {
// 		if (tempFile.fid === undefined) {
// 			placeholderError('HumbakFile nie ma ustawionego "fid"', tempFile.placeholder);
// 			continue;
// 		}
// 		if (Number.isNaN(tempFile.fid)) {
// 			placeholderError('HumbakFile fid musi być liczbą', tempFile.placeholder);
// 			continue;
// 		}
// 		if (!ids.includes(tempFile.fid)) {
// 			ids.push(tempFile.fid);
// 		}
// 		placeholdersAndIds.push({ id: tempFile.fid, tempFile });
// 	}

// 	if (!ids.length) {
// 		parsedContent.value = dom.body.innerHTML;
// 		return;
// 	}

// 	try {
// 		const files = await api.files.byIds.$get({ query: {
// 			ids: JSON.stringify(ids),
// 		} }).then(r => r.json());
// 		for (const file of files) {
// 			loadedFiles[file.id] = file;
// 		}
// 	} catch (e) {
// 		toast('błąd przy ładowaniu obrazów', 'error');
// 		console.error(e);
// 		return;
// 	}

// 	for (const { id, tempFile } of placeholdersAndIds) {
// 		const file = loadedFiles[id];
// 		if (!file) {
// 			placeholderError(`plik id "${id}" nieznaleziony w bazie danych`, tempFile.placeholder);
// 			continue;
// 		}
// 		replaceTempWithImage(tempFile, file);
// 	}

// 	parsedContent.value = dom.body.innerHTML;
// }

// function replaceTempWithImage(temp: ITempFileElement, file: IDialogFile) {
// 	const element = document.createElement('img');
// 	element.src = `files${file.path}`;
// 	element.title = file.title;
// 	element.alt = file.alt;

// 	if (file.mimetype !== 'image/gif') {
// 		const pathWithoutExtension = getPathWithoutExtension(`files${file.path}`);
// 		element.srcset = `${pathWithoutExtension}_500.webp 500w, ${pathWithoutExtension}_800.webp 800w, ${pathWithoutExtension}_1000.webp 1000w`;
// 		element.sizes = '(max-width: 500px) 500px, (max-width: 800px) 800px, 1000px';
// 	}

// 	for (const attribute of temp.attributes) {
// 		if (attribute.name !== 'fid') {
// 			element.setAttribute(attribute.name, attribute.value);
// 		}
// 	}
// 	temp.placeholder.replaceWith(element);
// }

// function placeholderError(message: string, replaceTarget: HTMLElement) {
// 	toast(message, 'warning');

// 	const element = document.createElement('p');
// 	element.textContent = message;
// 	element.className = 'text-red-5 font-600 border-2 border-red-5 border-dashed flex-center p-1 m-1 bg-red/10';

// 	replaceTarget.replaceWith(element);
// }

defineExpose({
	clear,
	updateValues,
	getChangedFields,
});
</script>

<template>
	<section ref="container" class="mt-6 hidden h-[60vh] min-h-88 gap-x-2 lg:flex">
		<VEditor
			ref="editor"
			class="flex-1 shadow"
			:models="[
				{ language: 'html', value: contents.html.value },
				{ language: 'css', value: contents.css.value },
				{ language: 'json', value: contents.meta.value },
			]"
			:current-model="currentModelIndex"
			@update:model-value="updateCurrentModel"
		/>
		<aside class="relative w-8 shrink-0">
			<PagesContentEditorModelSelect v-model="currentModelIndex" @update:model-value="formatMeta" />
			<VButton class="mt-2 h-8 w-8 p-0 neon-purple" title="formatuj" @click="editor?.formatCurrentModel">
				<span class="visually-hidden">formatuj</span>
				<div class="i-solar-magic-stick-3-bold absolute left-1/2 top-1/2 h-[1.15rem] w-[1.15rem] translate-center" />
			</VButton>
			<PagesSnippetsDialog />
			<PagesFilesDialog class="mt-2 h-8 w-8 p-0" />
			<VButton
				class="left-1/2 top-1/2 h-8 w-8 translate-center cursor-move p-0 !absolute neon-neutral"
				title="zmień rozmiar"
				@mousedown="initResizeDrag"
			>
				<span class="visually-hidden">zmień rozmiar</span>
				<div class="i-fa6-solid-arrows-up-down absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
			</VButton>
		</aside>
		<main class="flex-1 bg-white text-black shadow of-auto" v-html="parsedContent" />
	</section>
	<VAlert class="mt-4 max-w-3xl md:mx-auto lg:hidden" variant="warning">
		edytowanie zawartości nie jest dostępne na małych ekranach
	</VAlert>
</template>
