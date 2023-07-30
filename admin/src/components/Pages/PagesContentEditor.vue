<script setup lang="ts">
import VEditor from '~/components/V/VEditor.vue';
import type { IUpsertPageInput } from '~/composables/useApi';

const editor = ref<InstanceType<typeof VEditor>>();

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
}

function getChangedFields() {
	const fields: Pick<IUpsertPageInput, 'html' | 'css' | 'meta'> = {};

	if (contents.value.meta.value || contents.value.meta.initValue) {
		const parsedMetaValue = JSON.parse(contents.value.meta.value);
		const parsedInitMetaValue = JSON.parse(contents.value.meta.initValue);
		if (JSON.stringify(parsedMetaValue) !== JSON.stringify(parsedInitMetaValue)) {
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
	<section class="mt-6 hidden h-[60vh] gap-x-2 md:flex">
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
		<aside class="w-8 shrink-0">
			<PagesContentEditorModelSelect v-model="currentModelIndex" />
		</aside>
		<main class="bg-checker flex-1" v-text="contents.html.value" />
	</section>
</template>
