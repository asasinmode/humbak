<script setup lang="ts">
import PagesSnippetIcons2Paragraphs from '~/components/Pages/PagesSnippetIcons/PagesSnippetIcons2Paragraphs.vue';

const indentedParagraphs = `<p>Przykładowy tekst</p>
<p class="indent-4">Druga linijka przykładowego tekstu</p>
<p class="indent-4">Trzecia linijka przykładowego tekstu</p>`;

const snippets = [
	{
		icon: PagesSnippetIcons2Paragraphs,
		text: 'trzy paragrafy, kolejne wcięte',
		snippet: indentedParagraphs,
	},
];
</script>

<template>
	<VDialog
		class="mt-2 h-8 w-8 p-0 neon-teal"
		title="snippety"
		class-container="grid grid-cols-[1fr_1fr_min-content] gap-x-3 gap-y-5"
		class-close-button="col-span-full mx-auto w-fit"
		close-button-text="zamknij"
	>
		<template #button>
			<span class="visually-hidden">snippety</span>
			<div class="i-fluent-clipboard-code-24-regular group absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
		</template>

		<h3 class="col-span-full text-center text-5 font-600">
			snippety
		</h3>

		<div v-for="(snippet, index) in snippets" :key="index" class="col-span-full flex gap-4">
			<h6>
				<component :is="snippet.icon" class="inline-block mr-2" />
				{{ snippet.text }}
			</h6>
			<VButton class="neon-green ml-auto h-fit">
				kopiuj
			</VButton>
		</div>
	</VDialog>
</template>
