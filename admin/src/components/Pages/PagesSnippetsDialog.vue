<script setup lang="ts">
import IconsSnippetUnorderedList from '~/components/Icons/IconsSnippetUnorderedList.vue';
import IconsSnippetDescribedImage from '~/components/Icons/IconsSnippetDescribedImage.vue';
import IconsSnippetDoubleContainer from '~/components/Icons/IconsSnippetDoubleContainer.vue';
import IconsSnippetTripleContainer from '~/components/Icons/IconsSnippetTripleContainer.vue';
import IconsSnippetIndentedParagraphs from '~/components/Icons/IconsSnippetIndentedParagraphs.vue';

const indentedParagraphs = `<p>Przykładowy tekst</p>
<p class="indent">Druga linijka przykładowego tekstu</p>
<p class="indent">Trzecia linijka przykładowego tekstu</p>`;

const doubleContainer = `<div class="split-container-2">
	<div class="bg-humbak-3">pierwsza połowa</div>
	<div class="bg-humbak-5">druga połowa</div>
</div>`;

const tripleContainer = `<div class="split-container-3">
	<div class="bg-humbak-3">jedna trzecia</div>
	<div class="bg-humbak-5">druga trzecia</div>
	<div class="bg-humbak-3">trzecia trzecia</div>
</div>`;

const describedImage = `<div class="described-image">
	<HumbakFile fid=""></HumbakFile>
	<p>opis obrazka</p>
</div>`;

const orderedList = `<ol>
	<li>pierwszy przedmiot</li>
	<li>drugi przedmiot</li>
	<li>trzeci przedmiot</li>
</ol>`;

const unorderedList = `<ul>
	<li>pierwszy przedmiot</li>
	<li>drugi przedmiot</li>
	<li>trzeci przedmiot</li>
</ul>`;

const table = `<table>
	<thead>
		<tr>
			<th>kolumna 1</th>
			<th>kolumna 2</th>
			<th>kolumna 3</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>wiersz 1 1</td>
			<td>wiersz 1 2</td>
			<td>wiersz 1 3</td>
		</tr>
	</tbody>
</table>`;

const snippets = [
	{
		icon: IconsSnippetIndentedParagraphs,
		text: 'trzy paragrafy, kolejne wcięte',
		snippet: indentedParagraphs,
	},
	{
		icon: IconsSnippetDoubleContainer,
		text: 'podwójny kontener',
		snippet: doubleContainer,
	},
	{
		icon: IconsSnippetTripleContainer,
		text: 'potrójny kontener',
		snippet: tripleContainer,
	},
	{
		icon: IconsSnippetDescribedImage,
		text: 'opisany obraz',
		snippet: describedImage,
	},
	{
		icon: IconsSnippetUnorderedList,
		text: 'lista',
		snippet: unorderedList,
	},
	{
		iconClass: 'i-ph-list-numbers',
		text: 'ponumerowana lista',
		snippet: orderedList,
	},
	{
		iconClass: 'i-fluent-table-freeze-row-24-regular',
		text: 'tabela',
		snippet: table,
	},
];

const { toast } = useToast();

async function copy(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast('skopiowano do schowka');
	} catch (e) {
		console.error(e);
		toast('błąd przy kopiowaniu', 'error');
	}
}
</script>

<template>
	<VDialog
		class="mt-2 h-8 w-8 p-0 neon-teal"
		title="snippety"
		class-container="flex flex-col"
		class-close-button="mx-auto w-fit mt-3"
		close-button-text="zamknij"
	>
		<template #button>
			<span class="visually-hidden">snippety</span>
			<div class="i-fluent-clipboard-code-24-regular group absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
		</template>

		<h3 class="text-center text-5 font-600 mb-3">
			snippety
		</h3>

		<div
			v-for="(snippet, index) in snippets"
			:key="index"
			class="has-focused-button-highlight flex items-center py-2.5 gap-2 lg:flex hover:bg-black/10 dark:hover:bg-white/10"
		>
			<component :is="snippet.icon || 'div'" class="inline-block shrink-0 w-8 h-8" :class="snippet.iconClass" />
			<h6 class="flex-1 hyphens-auto">
				{{ snippet.text }}
			</h6>
			<VButton class="neon-green shrink-0 h-min" @click="copy(snippet.snippet)">
				kopiuj
			</VButton>
		</div>
	</VDialog>
</template>
