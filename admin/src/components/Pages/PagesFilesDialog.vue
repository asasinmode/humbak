<script setup lang="ts">
import { getPathWithoutExtension, knownMimetypeExtensions } from '~/helpers';
import { env } from '~/env';
import type { IDialogFile } from '~/composables/useApi';

withDefaults(
	defineProps<{ iconClass?: string; }>(),
	{ iconClass: 'w-5 h-5' }
);

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

function isImage(mimetype: string) {
	return mimetype.slice(0, 5) === 'image';
}
function nonImageText(mimetype: string) {
	return knownMimetypeExtensions[mimetype] || mimetype;
}
function srcSet(path: string, mimetype: string, isImage: boolean) {
	if (isImage && mimetype !== 'image/gif') {
		const pathWithoutExtension = getPathWithoutExtension(path);
		return `${pathWithoutExtension}_500.webp 500w, ${pathWithoutExtension}_800.webp 800w, ${pathWithoutExtension}_1000.webp 1000w`;
	}
}
function sizes(mimetype: string, isImage: boolean) {
	if (isImage && mimetype !== 'image/gif') {
		return '(max-width: 500px) 500px, (max-width: 800px) 800px, 1000px';
	}
}

async function copy(file: IDialogFile) {
	let text: string;

	if (isImage(file.mimetype)) {
		text = `<HumbakFile fid="${file.id}"></HumbakFile>`;
	} else {
		text = `<a href="files${file.path}" target="_blank">${file.name}</a>`;
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
	<VDialog
		class="neon-indigo"
		title="pliki"
		class-container="flex flex-col"
		class-close-button="mx-auto w-fit mt-5"
		close-button-text="zamknij"
		@open="initLoadItems"
		@close="search = ''"
	>
		<template #button>
			<span class="visually-hidden">pliki</span>
			<div class="i-fluent-image-24-regular group absolute left-1/2 top-1/2 translate-center" :class="iconClass" />
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

		<div
			v-for="file in files"
			:key="file.id"
			class="has-focused-button-highlight relative hover:bg-black/10 dark:hover:bg-white/10 grid grid-cols-2 gap-2 py-[0.625rem] after:(content-empty absolute bottom-0 w-full h-px bg-neutral) last-of-type:after:hidden lg:grid-cols-[8rem_1fr_min-content] lg:grid-rows-2 lg:gap-x-3"
		>
			<img
				v-if="isImage(file.mimetype)"
				:src="`${env.VITE_PAGE_URL}/files${file.path}`"
				:title="file.title"
				:alt="file.alt"
				:srcset="srcSet(`${env.VITE_PAGE_URL}/files${file.path}`, file.mimetype, isImage(file.mimetype))"
				:sizes="sizes(file.mimetype, isImage(file.mimetype))"
				class="object-cover col-span-full h-18 w-full max-w-1/2 justify-self-center lg:row-span-full lg:col-span-1 lg:h-25 lg:max-w-none lg:self-center"
			>
			<span
				v-else
				class="col-span-full grid place-items-center text-center hyphens-auto font-bold h-18 lg:row-span-full lg:col-span-1 lg:h-25 lg:self-center"
				:title="file.title"
				:alt="file.alt"
			>
				{{ nonImageText(file.mimetype) }}
			</span>
			<h6 class="hyphens-auto lg:text-lg col-span-full text-center lg:row-span-full lg:col-span-1 lg:text-start lg:self-center">
				{{ file.name }}
			</h6>
			<a :href="`files${file.path}`" target="_blank" class="neon-blue text-sm px-3 py-1 shadow h-fit justify-self-end lg:self-end lg:justify-self-center lg:text-base">
				podgląd
			</a>
			<VButton class="neon-green text-sm h-fit justify-self-start lg:justify-self-center lg:text-base" @click="copy(file)">
				{{ isImage(file.mimetype) ? '&lt;img&gt;' : '&lt;a&gt;' }}
			</VButton>
		</div>

		<button
			v-show="files.length < total || isLoading"
			class="relative text-blue text-sm w-fit mx-auto hoverable:text-blue-5 mt-3 dark:hoverable:text-blue-3"
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
