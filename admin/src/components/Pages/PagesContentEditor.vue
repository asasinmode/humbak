<script setup lang="ts">
import VEditor from '~/components/V/VEditor.vue';

const editor = ref<InstanceType<typeof VEditor>>();

type IContent = {
	initValue: string;
	value: string;
};

const contents = ref<{
	html: IContent;
	css: IContent;
	meta: IContent;
}>({
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
// const html = ref(`
// <section>
// 	<h1>Content</h1>
// </section>
// `);
// const css = ref(`

// `);
// const meta = ref(`
// [
// 	{ "name": "robots", "content": "index, follow" }
// ]
// `);
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
	for (const key in contents.value) {
		// @ts-expect-error it's a valid key
		contents.value[key].value = '';
		// @ts-expect-error it's a valid key
		contents.value[key].initValue = '';
	}
}

async function updateValues(
	data: {
		html: string;
		// css: string;
		meta: string;
		[key: string]: any;
	}
) {
	for (const key in contents.value) {
		// @ts-expect-error it's a valid key
		contents.value[key].value = data[key];
		// @ts-expect-error it's a valid key
		contents.value[key].initValue = data[key];
	}

	// tmp
	contents.value.css.value = `.selector {
	background-color: lime;
}`;
	contents.value.css.initValue = contents.value.css.value;

	editor?.value?.updateModelValue(0, contents.value.html.value);
	editor?.value?.updateModelValue(1, contents.value.css.value);
	editor?.value?.updateModelValue(2, contents.value.meta.value);
}

defineExpose({
	clear,
	updateValues,
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
