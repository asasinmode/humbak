<script setup lang="ts">
import IconsSnippetTable from '~/components/Icons/IconsSnippetTable.vue';
import IconsSnippetOrderedList from '~/components/Icons/IconsSnippetOrderedList.vue';
import IconsSnippetUnorderedList from '~/components/Icons/IconsSnippetUnorderedList.vue';
import IconsSnippetDoubleContainer from '~/components/Icons/IconsSnippetDoubleContainer.vue';
import IconsSnippetTripleContainer from '~/components/Icons/IconsSnippetTripleContainer.vue';
import IconsSnippetIndentedParagraphs from '~/components/Icons/IconsSnippetIndentedParagraphs.vue';

const indentedParagraphs = `<p>Przykładowy tekst</p>
<p class="indent-4">Druga linijka przykładowego tekstu</p>
<p class="indent-4">Trzecia linijka przykładowego tekstu</p>`;

const doubleContainer = `<div class="grid md:grid-cols-2">
	<div>pierwsza połowa</div>
	<div>druga połowa</div>
</div>`;

const tripleContainer = `<div class="grid lg:grid-cols-3">
	<div>jedna trzecia</div>
	<div>druga trzecia</div>
	<div>trzecia trzecia</div>
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
		icon: IconsSnippetUnorderedList,
		text: 'lista',
		snippet: unorderedList,
	},
	{
		icon: IconsSnippetOrderedList,
		text: 'ponumerowana lista',
		snippet: orderedList,
	},
	{
		icon: IconsSnippetTable,
		text: 'tabela',
		snippet: table,
	},
];
</script>

<template>
	<VDialog
		class="mt-2 h-8 w-8 p-0 neon-teal"
		title="snippety"
		class-container="grid grid-cols-[1fr_1fr_min-content] gap-x-3"
		class-close-button="col-span-full mx-auto w-fit mt-3"
		close-button-text="zamknij"
	>
		<template #button>
			<span class="visually-hidden">snippety</span>
			<div class="i-fluent-clipboard-code-24-regular group absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
		</template>

		<h3 class="col-span-full text-center text-5 font-600 mb-3">
			snippety
		</h3>

		<div
			v-for="(snippet, index) in snippets"
			:key="index"
			class="has-focused-button-highlight col-span-full flex items-center py-2.5 gap-2 lg:flex hover:bg-black/10 dark:hover:bg-white/10"
		>
			<component :is="snippet.icon" class="inline-block shrink-0 w-8 h-8" />
			<h6 class="flex-1 hyphens-auto">
				{{ snippet.text }}
			</h6>
			<VButton class="neon-green shrink-0 h-min">
				kopiuj
			</VButton>
		</div>
	</VDialog>
</template>

<style>
.has-focused-button-highlight:has(button:focus-visible) {
	@apply bg-black/10 dark:bg-white/10
}
</style>
