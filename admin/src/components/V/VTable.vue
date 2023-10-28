<script setup lang="ts" generic="T extends { id: number }">
const props = defineProps<{
	id: string;
	title: string;
	pluralTitle: string;
	labels: Record<keyof T, string>;
	getItems: (offset: number, limit: number, search: string) => [T[], number] | Promise<[T[], number]>;
	loadingItemId?: number;
}>();

defineEmits<{
	edit: [id: number, button: HTMLButtonElement];
	delete: [id: number, button: HTMLButtonElement];
}>();

const items = shallowRef<T[]>([]);
const isLoading = ref(false);
const total = ref(0);
const offset = ref(1);
const limit = ref(5);
const search = ref('');

let previousOffset = 1;
let previousLimit = 5;
const lastPage = computed(() => {
	const raw = total.value / limit.value;
	const parsed = Math.floor(raw);
	return parsed + (raw > parsed ? 1 : 0);
});
const isPreviousPageDisabled = computed(() => offset.value === 1);
const isNextPageDisabled = computed(() => lastPage.value === offset.value);

onMounted(() => {
	callGetItems();
});

let searchTimeout: NodeJS.Timeout | undefined;

async function callGetItems(resetOffset = false) {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
		searchTimeout = undefined;
	}

	if (limit.value as number | string === '') {
		return;
	}

	isLoading.value = true;

	if (resetOffset) {
		offset.value = 1;
	}

	previousOffset = offset.value;
	previousLimit = limit.value;
	try {
		const [loadedItems, count] = await props.getItems(offset.value - 1, limit.value, search.value);
		items.value = loadedItems;
		total.value = count;
	} catch (e) {
		useToast().toast('błąd przy ładowaniu danych', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
}

function parseOffsetAndGetItems(event: FocusEvent) {
	const value = parseInt(`${(event.target as HTMLInputElement).value}`.replaceAll(/[^\d-\.]/g, ''));

	if (Number.isNaN(value) || value < 1) {
		offset.value = 1;
	} else if (value > lastPage.value) {
		offset.value = lastPage.value;
	} else {
		offset.value = value;
	}

	(event.target as HTMLInputElement).value = offset.value.toString();
	offset.value !== previousOffset && callGetItems();
}

function parseLimitAndGetItems(event: FocusEvent) {
	const value = parseInt(`${(event.target as HTMLInputElement).value}`.replaceAll(/[^\d-\.]/g, ''));

	if (Number.isNaN(value) || value < 1) {
		limit.value = 1;
	} else if (value > 100) {
		limit.value = 100;
	} else {
		limit.value = value;
	}

	(event.target as HTMLInputElement).value = limit.value.toString();
	limit.value !== previousLimit && callGetItems(true);
}

function changeOffset(value: number) {
	if ((offset.value === 1 && value < 0) || (offset.value === lastPage.value && value > 0)) {
		return;
	}
	offset.value += value;
	callGetItems();
}

function updatePreviousOffset() {
	previousOffset = offset.value;
}

function startSearchTimeout() {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
		searchTimeout = undefined;
	}
	searchTimeout = setTimeout(() => {
		searchTimeout = undefined;
		callGetItems(true);
	}, 500);
}

defineExpose({
	callGetItems,
});
</script>

<template>
	<form class="mb-5 flex gap-x-3 md:mx-auto md:max-w-128" @submit.prevent="callGetItems(true)">
		<VInput
			:id="`${id}VTableSearch`"
			v-model="search"
			label="szukaj"
			class="flex-1"
			suffix-icon="i-solar-magnifer-linear"
			label-visually-hidden
			@update:model-value="startSearchTimeout"
		/>
		<VButton class="mr-12 neon-blue">
			szukaj
		</VButton>
	</form>

	<div
		class="relative mx-auto mb-4 max-w-208 of-auto border-2 border-neutral border-op-50 rounded-2 bg-neutral bg-op-20 md:min-h-[17.875rem] dark:border-op-80"
		tabindex="0"
		role="region"
		:aria-labelledby="`${id}VTableCaption`"
	>
		<header class="flex justify-end gap-2 bg-black/10 px-2 py-2 dark:bg-white/20">
			<VCombobox
				:id="`${id}VTableLimit`"
				v-model.number="limit"
				class="!hidden !min-w-14 !w-14 sm:flex"
				class-input="!min-w-14 !w-14 neon-neutral text-center"
				label="pokazywana ilość naraz"
				:options="[5, 10, 15]"
				transform-options
				label-visually-hidden
				hide-check
				@blur="parseLimitAndGetItems"
				@select-option="callGetItems(true)"
			/>
			<VButton
				class="relative h-9 w-9 shrink-0 dark:neon-violet neon-violet-5"
				:disabled="isPreviousPageDisabled"
				:title="`poprzednia ${title}`"
				@click="changeOffset(-1)"
			>
				<span class="visually-hidden">poprzednia {{ title }}</span>
				<div class="i-fa6-solid-chevron-left absolute left-1/2 h-3 w-3 translate-center" />
			</VButton>
			<VInput
				:id="`${id}VTableOffset`"
				:model-value="offset"
				:label="`numer ${pluralTitle}`"
				class-input="!min-w-14 !w-14 text-center neon-violet-5 dark:neon-violet"
				label-visually-hidden
				@focus="updatePreviousOffset"
				@blur="parseOffsetAndGetItems"
			/>
			<VButton
				class="relative h-9 w-9 shrink-0 dark:neon-violet neon-violet-5"
				:disabled="isNextPageDisabled"
				:title="`następna ${title}`"
				@click="changeOffset(1)"
			>
				<span class="visually-hidden">następna {{ title }}</span>
				<div class="i-fa6-solid-chevron-right absolute left-1/2 h-3 w-3 translate-center" />
			</VButton>
		</header>
		<table class="vTable relative w-full table-fixed" role="table">
			<caption :id="`${id}VTableCaption`" class="absolute left-0 text-start text-5 font-600 -top-[10px] md:left-4 -translate-y-full">
				{{ pluralTitle }} ({{ total }})
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
					v-for="item in items"
					:key="item.id"
					role="row"
				>
					<td
						v-for="(value, key) in labels"
						:key="key"
						:data-cell="value"
						class="md:px-4 md:py-2 md:vertical-text-top"
						:class="{ 'md:text-end': key === 'id' }"
						role="cell"
					>
						{{ item[key as never] }}
					</td>
					<td role="cell">
						<div class="relative h-full flex items-center gap-2 md:w-full md:justify-around md:gap-0">
							<VLoading v-show="loadingItemId === item.id" class="absolute left-1/2 top-1/2 translate-center" />
							<VButton
								class="neon-blue md:text-[0.85rem] md:!px-2 md:!py-[2px]"
								:class="{ 'op-0': loadingItemId === item.id }"
								:disabled="loadingItemId === item.id"
								@click="$emit('edit', item.id, $event.target)"
							>
								edytuj
							</VButton>
							<VButton
								class="neon-red md:text-[0.85rem] md:!px-2 md:!py-[2px]"
								:class="{ 'op-0': loadingItemId === item.id }"
								:disabled="loadingItemId === item.id"
								@click="$emit('delete', item.id, $event.target)"
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
.vTable tbody tr:nth-of-type(even) {
	background-color: hsl(0 0% 0% / 0.05);
}

.dark .vTable tbody tr:nth-of-type(even) {
	background-color: hsl(0 0% 100% / 0.08);
}

.vTable thead tr{
	background-color: hsl(0 0% 0% / 0.1)
}

.dark .vTable thead tr{
	background-color: hsl(0 0% 100% / 0.2)
}

@media (max-width: 767px){
	.vTable caption, .vTable tr {
		padding-inline: 0.5rem;
	}

	.vTable thead tr:first-of-type {
		display: none;
	}

	.vTable tr {
		display: block;
		padding-block: clamp(0.50rem, 0.23rem + 1.34vw, 0.88rem);
	}

	.vTable td {
		display: grid;
		grid-template-columns: 6.25rem auto;
		gap: 1rem;
		font-weight: 700;
	}

	.vTable td::before {
		content: attr(data-cell);
		font-weight: 400;
	}

	.vTable td:last-of-type{
		display: flex;
		justify-content: end;
		gap: 0.5rem;
		padding-block-start: 0.375rem;
	}
}
</style>
