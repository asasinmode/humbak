<script setup lang="ts">
import type { IDialogFile } from '~/composables/useApi';

const api = useApi();
const { toast } = useToast();

const isLoading = ref(false);

let searchTimeout: NodeJS.Timeout | undefined;
function startSearchTimeout() {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
		searchTimeout = undefined;
	}
	searchTimeout = setTimeout(() => {
		searchTimeout = undefined;
		!isLoading.value && getItems(false);
	}, 500);
}

const search = ref('');
let previousSearch = '';
const total = ref(0);
const files = ref<IDialogFile[]>([]);

async function getItems(skipTotalCheck: boolean) {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
		searchTimeout = undefined;
	}

	let offset = files.value.length;
	if (previousSearch !== search.value) {
		skipTotalCheck = true;
		offset = 0;
	}

	if (!skipTotalCheck && files.value.length >= total.value) {
		return;
	}

	isLoading.value = true;

	try {
		const { items, count } = await api.files
			.$get({ query: { offset: offset.toString(), limit: '5', query: search.value } })
			.then(r => r.json());
		previousSearch = search.value;
		total.value = count;
		if (offset === 0) {
			files.value = items;
		} else {
			files.value.push(...items);
		}
	} catch (e) {
		toast('błąd przy ładowaniu danych', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
}

let wasLoaded = false;
async function initLoadItems() {
	if (!wasLoaded) {
		files.value = [];
		total.value = 0;
		await getItems(true);
		wasLoaded = true;
	}
}
</script>

<template>
	<VDialog
		class="mt-2 h-8 w-8 p-0 neon-indigo"
		title="pliki"
		class-container="flex flex-col"
		class-close-button="mx-auto w-fit mt-5"
		close-button-text="zamknij"
		@open="initLoadItems"
		@close="search = ''"
	>
		<template #button>
			<span class="visually-hidden">pliki</span>
			<div class="i-fluent-image-24-regular group absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
		</template>

		<h3 class="text-center text-5 font-600 mb-3">
			pliki
		</h3>

		<form class="flex gap-x-3 mb-5" @submit.prevent="getItems(false)">
			<VInput
				id="filesDialogSearch"
				v-model="search"
				label="szukaj"
				class="flex-1"
				suffix-icon="i-solar-magnifer-linear"
				label-visually-hidden
				@update:model-value="startSearchTimeout"
			/>
			<VButton class="neon-blue" :is-loading="isLoading">
				szukaj
			</VButton>
		</form>

		<p v-if="!total && !files.length && !isLoading" class="text-center text-lg">
			brak wyników
		</p>

		<div v-for="file in files" :key="file.id">
			{{ file }}
		</div>

		<button
			v-show="files.length < total || isLoading"
			class="relative text-blue text-sm w-fit mx-auto hoverable:text-blue-5 dark:hoverable:text-blue-3"
			:disabled="isLoading"
			@click="getItems(false)"
		>
			<span :class="isLoading ? 'op-0' : ''">
				załaduj więcej
			</span>
			<VLoading v-show="isLoading" class="absolute left-1/2 top-1/2 translate-center" />
		</button>
	</VDialog>
</template>
