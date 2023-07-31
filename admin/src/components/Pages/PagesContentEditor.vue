<script setup lang="ts">
import VEditor from '~/components/V/VEditor.vue';
import type { IUpsertPageInput } from '~/composables/useApi';

const editor = ref<InstanceType<typeof VEditor>>();
const container = ref<HTMLDivElement>();

const contents = ref({
	html: {
		initValue: '',
		value: '',
	},
	css: {
		initValue: `.selector {
	background-color: hotpink;
}`,
		value: `.selector {
	background-color: hotpink;
}`,
	},
	meta: {
		initValue: '',
		value: '',
	},
});
const currentModelIndex = ref(0);
let wasMetaFormatted = false;

function updateCurrentModel(value: string) {
	const index = currentModelIndex.value;
	if (index === 0) {
		contents.value.html.value = value;
	} else if (index === 1) {
		contents.value.css.value = value;
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

let initY = 0;
let initHeight = 0;

function initResizeDrag(event: MouseEvent) {
	event.preventDefault();
	if (!container.value || !document.defaultView) {
		throw new Error('Container or document default view not found');
	}

	initY = event.clientY;
	initHeight = parseInt(document.defaultView.getComputedStyle(container.value).height);
	document.addEventListener('mousemove', onResizeMove);
	document.addEventListener('mouseup', cleanupResizeDrag);
}

function onResizeMove(event: MouseEvent) {
	event.preventDefault();
	if (!container.value) {
		throw new Error('Container not found');
	}
	container.value.style.height = `${initHeight + event.clientY - initY}px`;
}

function cleanupResizeDrag() {
	document.removeEventListener('mousemove', onResizeMove);
	document.removeEventListener('mouseup', cleanupResizeDrag);
}

function clear() {
	updateValues({ html: '', css: '', meta: '' });
}

function updateValues(
	data: {
		html: string;
		// css: string;
		meta: string;
	} & Record<string, any>
) {
	contents.value.html.value = data.html;
	contents.value.meta.value = data.meta;
	contents.value.css.value = `.selector {
	background-color: lime;
}`;

	for (const key in contents.value) {
		// @ts-expect-error it's a valid key
		contents.value[key].initValue = contents.value[key].value;
	}

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

defineExpose({
	clear,
	updateValues,
	getChangedFields,
});
</script>

<template>
	<section ref="container" class="mt-6 hidden h-[60vh] min-h-64 gap-x-2 md:flex">
		<!-- make resizable -->
		<VEditor
			ref="editor"
			class="flex-1"
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
			<VButton
				class="left-1/2 top-1/2 h-8 w-8 translate-center cursor-move p-0 !absolute neon-neutral"
				title="zmień rozmiar"
				@mousedown="initResizeDrag"
			>
				<span class="visually-hidden">zmień rozmiar</span>
				<div class="i-fa6-solid-arrows-up-down absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
			</VButton>
		</aside>
		<main class="bg-checker flex-1" v-text="contents.html.value" />
	</section>
</template>
