<script setup lang="ts">
const html = ref(`
<section>
	<h1>Content</h1>
</section>
`);
const css = ref(`
.selector {
	background-color: hotpink;
}
`);
const meta = ref(`
[
	{ "name": "robots", "content": "index, follow" }
]
`);
const currentModelIndex = ref(0);

function updateCurrentModel(value: string) {
	const index = currentModelIndex.value;
	if (index === 0) {
		html.value = value;
	} else if (index === 1) {
		css.value = value;
	} else {
		meta.value = value;
	}
}
</script>

<template>
	<section class="mt-6 hidden h-[60vh] gap-x-2 md:flex">
		<!-- make resizable -->
		<VEditor
			class="flex-1"
			:models="[
				{ language: 'html', value: html },
				{ language: 'css', value: css },
				{ language: 'json', value: meta },
			]"
			:current-model="currentModelIndex"
			@update:model-value="updateCurrentModel"
		/>
		<aside class="w-8 shrink-0">
			<PagesContentEditorModelSelect v-model="currentModelIndex" />
		</aside>
		<main class="bg-checker flex-1" v-text="html" />
	</section>
</template>
