<script setup lang="ts">
withDefaults(
	defineProps<{ iconClass?: string }>(),
	{ iconClass: 'w-5 h-5' },
);

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
		const { items, count } = await useApi('/api/admin/files', { query: { offset: offset.toString(), limit: 15, query: search.value } });
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

function isImage(mimetype: string) {
	return mimetype.slice(0, 5) === 'image';
}
function nonImageText(mimetype: string) {
	return knownMimetypeExtensions[mimetype] || mimetype;
}
function srcSet(path: string, mimetype: string, isImage: boolean) {
	if (isImage && mimetype !== 'image/gif' && mimetype !== 'image/svg+xml') {
		const pathWithoutExtension = getPathWithoutExtension(path);
		return `${pathWithoutExtension}_500.webp 500w, ${pathWithoutExtension}_800.webp 800w, ${pathWithoutExtension}_1040.webp 1040w, ${pathWithoutExtension}_1280.webp 1280w`;
	}
}
function sizes(mimetype: string, isImage: boolean) {
	if (isImage && mimetype !== 'image/gif' && mimetype !== 'image/svg+xml') {
		return '(max-width: 480px) 500px, (max-width: 768px) 800px, (max-width: 960px) 1040px, 1280px';
	}
}

async function copy(file: IDialogFile) {
	let text: string;

	if (isImage(file.mimetype)) {
		text = `<HumbakFile fid="${file.id}"></HumbakFile>`;
	} else {
		text = `<a href="/files${file.path}" target="_blank" class="text-link">${file.name}</a>`;
	}

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
	<AdminVDialog
		class="neon-indigo"
		title="pliki"
		class-container="grid auto-rows-min grid-cols-1 md:grid-cols-2 lg:!max-w-[90vw] md:!w-auto xl:grid-cols-3"
		class-close-button="mx-auto col-span-full w-fit mt-5"
		close-button-text="zamknij"
		@open="initLoadItems"
		@close="search = ''"
	>
		<template #button>
			<span class="sr-only">pliki</span>
			<div class="group i-fluent-image-24-regular absolute left-1/2 top-1/2 translate-center" :class="iconClass" />
		</template>

		<h3 class="col-span-full mb-3 text-center text-5 font-600">
			pliki
		</h3>

		<form class="col-span-full mx-auto mb-5 max-w-xl w-full flex gap-x-3" @submit.prevent="getItems(false)">
			<AdminVInput
				id="filesDialogSearch"
				v-model="search"
				label="szukaj"
				class="flex-1"
				suffix-icon="i-solar-magnifer-linear"
				label-sr-only
				@update:model-value="startSearchTimeout"
			/>
			<AdminVButton class="neon-blue" :is-loading="isLoading">
				szukaj
			</AdminVButton>
		</form>

		<p v-if="!total && !files.length && !isLoading" class="col-span-full text-center text-lg">
			brak wyników
		</p>

		<div
			v-for="file in files"
			:key="file.id"
			class="humbak-file-dialog-item relative grid grid-cols-2 gap-2 overflow-visible px-4 py-[0.625rem] lg:grid-cols-[10rem_1fr_min-content] md:grid-cols-[8rem_1fr_min-content] md:grid-rows-2 md:gap-x-3 hover:bg-black/10 dark:hover:bg-white/10"
		>
			<img
				v-if="isImage(file.mimetype)"
				:src="`/files${file.path}`"
				:title="file.title"
				:alt="file.alt"
				:srcset="srcSet(`/files${file.path}`, file.mimetype, isImage(file.mimetype))"
				:sizes="sizes(file.mimetype, isImage(file.mimetype))"
				:width="file.width ?? undefined"
				:height="file.height ?? undefined"
				class="col-span-full h-24 max-w-1/2 w-full justify-self-center object-cover md:col-span-1 md:row-span-full md:h-28 md:max-w-none md:self-center"
			>
			<span
				v-else
				class="grid col-span-full h-24 place-items-center text-center font-bold hyphens-auto md:col-span-1 md:row-span-full md:h-28 md:self-center"
				:title="file.title"
				:alt="file.alt"
			>
				{{ nonImageText(file.mimetype) }}
			</span>
			<h6 class="col-span-full break-all text-center hyphens-auto md:col-span-1 md:row-span-full md:max-w-48 md:self-center md:text-start">
				malediwy-jacht-ocean-saphire-05.jpg
			</h6>
			<a :href="`/files${file.path}`" target="_blank" class="h-fit justify-self-end px-3 py-1 text-sm shadow md:self-end md:justify-self-center md:text-base neon-blue">
				podgląd
			</a>
			<AdminVButton class="h-fit justify-self-start text-sm md:justify-self-center md:text-base neon-green" @click="copy(file)">
				{{ isImage(file.mimetype) ? '&lt;img&gt;' : '&lt;a&gt;' }}
			</AdminVButton>
		</div>

		<button
			v-show="files.length < total || isLoading"
			class="relative col-span-full mx-auto mt-3 w-fit text-sm text-blue dark:hoverable:text-blue-3 hoverable:text-blue-5"
			:disabled="isLoading"
			@click="getItems(false)"
		>
			<span :class="isLoading ? 'op-0' : ''">
				załaduj więcej
			</span>
			<AdminVLoading v-show="isLoading" class="absolute left-1/2 top-1/2 translate-center" />
		</button>
	</AdminVDialog>
</template>
