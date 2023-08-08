<script setup lang="ts">
import type { IListedPage } from '~/composables/useApi';

defineProps<{
	loadingPageId?: number;
}>();

defineEmits<{
	edit: [id: number, button: HTMLButtonElement];
	delete: [id: number, button: HTMLButtonElement];
}>();

const isLoading = ref(false);
const pages = ref<IListedPage[]>([]);
const offset = ref(0);
const limit = ref(5);
const total = ref(0);
const search = ref('');

const labels = {
	id: 'id',
	title: 'tytuł',
	menuText: 'tekst w menu',
	language: 'język',
};

onMounted(() => {
	getPages();
});

const lastOffset = ref(0);
const lastPage = computed(() => Math.floor(total.value / limit.value));
const isPreviousPageDisabled = computed(() => offset.value === 0);
const isNextPageDisabled = computed(() => lastPage.value === offset.value);

async function getPages(resetOffset = false) {
	isLoading.value = true;

	if (resetOffset) {
		offset.value = 0;
	}

	try {
		const [loadedPages, count] = await Promise.all([
			useApi().pages.list.query({ offset: offset.value, limit: limit.value, query: search.value }),
			useApi().pages.count.query(search.value),
		]);
		pages.value = loadedPages;
		total.value = count;
	} catch (e) {
		useToast().toast('błąd przy ładowaniu danych', 'error');
		throw e;
	} finally {
		isLoading.value = false;
	}
}

function onPageInputBlur(event: FocusEvent) {
	const value = parseInt(`${(event.target as HTMLInputElement).value}`.replaceAll(/[^\d-]/g, ''));

	if (Number.isNaN(value) || value < 0) {
		offset.value = 0;
	} else if (value > lastPage.value) {
		offset.value = lastPage.value;
	} else {
		offset.value = value;
	}

	offset.value !== lastOffset.value && getPages();
	lastOffset.value = offset.value;
}

function changeOffset(value: number) {
	if ((offset.value === 0 && value < 0) || (offset.value === lastPage.value && value > 0)) {
		return;
	}
	offset.value += value;
	getPages();
}

function updateLastOffset() {
	lastOffset.value = offset.value;
}

defineExpose({
	getPages,
});
</script>

<template>
	<form class="mb-4 w-[calc(100%-_3.5rem)] flex gap-4 md:mx-auto md:max-w-128" @submit.prevent="getPages(true)">
		<VInput
			id="pagesSearch"
			v-model="search"
			label="szukaj"
			class="flex-1"
			suffix-icon="i-solar-magnifer-linear"
			label-visually-hidden
		/>
		<VButton class="neon-blue">
			szukaj
		</VButton>
	</form>

	<div
		class="relative mx-auto mb-4 max-w-208 of-auto border-2 border-neutral border-op-50 rounded-2 bg-neutral bg-op-20 md:min-h-[17.875rem] dark:border-op-80"
		tabindex="0"
		role="region"
		aria-labelledby="h-pages-caption"
	>
		<header class="flex justify-end gap-2 bg-black/10 px-2 py-2 dark:bg-white/20">
			<VButton
				class="relative h-9 w-9 shrink-0 dark:neon-violet neon-violet-5"
				:disabled="isPreviousPageDisabled"
				@click="changeOffset(-1)"
			>
				<span class="visually-hidden">poprzednia strona</span>
				<div class="i-fa6-solid-chevron-left absolute left-1/2 h-3 w-3 translate-center" />
			</VButton>
			<VInput
				id="pagesOffsetInput"
				:model-value="offset"
				label="numer strony"
				input-class="!min-w-14 !w-14 text-center neon-violet-5 dark:neon-violet"
				label-visually-hidden
				@focus="updateLastOffset"
				@blur="onPageInputBlur"
			/>
			<VButton
				class="relative h-9 w-9 shrink-0 dark:neon-violet neon-violet-5"
				:disabled="isNextPageDisabled"
				@click="changeOffset(1)"
			>
				<span class="visually-hidden">następna strona</span>
				<div class="i-fa6-solid-chevron-right absolute left-1/2 h-3 w-3 translate-center" />
			</VButton>
		</header>
		<table class="h-pages-table relative w-full table-fixed" role="table">
			<caption id="h-pages-caption" class="absolute left-0 text-start text-5 font-600 -top-[10px] md:left-4 -translate-y-full">
				strony ({{ total }})
			</caption>
			<thead>
				<tr role="row">
					<th
						v-for="(label, key) in labels"
						:key="key"
						class="px-4 pb-1 text-start"
						:class="{
							'md:text-end w-16': key === 'id',
							'w-2/7': key === 'menuText',
							'w-18': key === 'language',
						}"
						role="columnheader"
					>
						{{ label }}
					</th>
					<th class="w-30">
						<span class="visually-hidden">akcje</span>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="page in pages"
					:key="page.id"
					role="row"
				>
					<td
						v-for="(_, key) in labels"
						:key="key"
						:data-cell="`${labels[key]}:`"
						class="md:px-4 md:py-2 md:vertical-text-top"
						:class="{ 'md:text-end': key === 'id' }"
						role="cell"
					>
						{{ page[key] }}
					</td>
					<td role="cell">
						<div class="relative h-full flex items-center gap-2 md:w-full md:justify-around md:gap-0">
							<VLoading v-show="loadingPageId === page.id" class="absolute left-1/2 top-1/2 translate-center" />
							<VButton
								class="md:text-[0.85rem] neon-blue md:!px-2 md:!py-[2px]"
								:class="{ 'op-0': loadingPageId === page.id }"
								:disabled="loadingPageId === page.id"
								@click="$emit('edit', page.id, $event.target)"
							>
								edytuj
							</VButton>
							<VButton
								class="md:text-[0.85rem] neon-red md:!px-2 md:!py-[2px]"
								:class="{ 'op-0': loadingPageId === page.id }"
								:disabled="loadingPageId === page.id"
								@click="$emit('delete', page.id, $event.target)"
							>
								usuń
							</VButton>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<VLoading v-show="isLoading" class="absolute inset-0 bg-black/20 dark:bg-black/30" size="40" />
	</div>
</template>

<style>
.h-pages-table tbody tr:nth-of-type(even) {
	background-color: hsl(0 0% 0% / 0.05);
}

.dark .h-pages-table tbody tr:nth-of-type(even) {
	background-color: hsl(0 0% 100% / 0.08);
}

.h-pages-table thead tr{
	background-color: hsl(0 0% 0% / 0.1)
}

.dark .h-pages-table thead tr{
	background-color: hsl(0 0% 100% / 0.2)
}

@media (max-width: 767px){
	.h-pages-table caption, .h-pages-table tr {
		padding-inline: 0.5rem;
	}

	.h-pages-table thead tr:first-of-type {
		display: none;
	}

	.h-pages-table tr {
		display: block;
		padding-block: clamp(0.50rem, calc(0.23rem + 1.34vw), 0.88rem);
	}

	.h-pages-table td {
		display: grid;
		grid-template-columns: 6.25rem auto;
		gap: 1rem;
		font-weight: 700;
	}

	.h-pages-table td::before {
		content: attr(data-cell);
		font-weight: 400;
	}

	.h-pages-table td:last-of-type{
		display: flex;
		justify-content: end;
		gap: 0.5rem;
		padding-block-start: 0.375rem;
	}
}
</style>
