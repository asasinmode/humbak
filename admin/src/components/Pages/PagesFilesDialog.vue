<script setup lang="ts">
const api = useApi();

let searchTimeout: NodeJS.Timeout | undefined;
function startSearchTimeout() {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
		searchTimeout = undefined;
	}
	searchTimeout = setTimeout(() => {
		searchTimeout = undefined;
		getItems(false);
	}, 500);
}

const isLoading = ref(false);
const search = ref('');

const total = ref(0);
const files = ref([]);

async function getItems(skipTotalCheck: boolean) {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
		searchTimeout = undefined;
	}

	if (!skipTotalCheck && files.value.length >= total.value) {
		return;
	}

	isLoading.value = true;

	try {
		const { items, count } = await api.files.$get();
		files.value = items;
		total.value = count;
	} catch (e) {
		useToast().toast('błąd przy ładowaniu danych', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
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
	</VDialog>
</template>
