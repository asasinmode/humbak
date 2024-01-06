<script setup lang="ts">
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

const snippets = [
	{
		icon: 'M4 8H20M8 12H20M8 16H20',
		text: 'trzy paragrafy, kolejne wcięte',
		snippet: indentedParagraphs,
	},
	{
		icon: 'M4 6H20 M4 18H20 M4 10H11v4H4zM13 10H20v4H13z',
		text: 'podwójny kontener',
		snippet: doubleContainer,
	},
	{
		icon: 'M4 6H20 M4 18H20 M4 10H8v4H4zM10 10H14v4H10zM16 10H20v4H16z',
		text: 'potrójny kontener',
		snippet: tripleContainer,
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

		<div v-for="(snippet, index) in snippets" :key="index" class="col-span-full items-center flex gap-4">
			<h6>
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="inline-block mr-2">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" :d="snippet.icon" />
				</svg>
				{{ snippet.text }}
			</h6>
			<VButton class="neon-green ml-auto h-fit">
				kopiuj
			</VButton>
		</div>
	</VDialog>
</template>
