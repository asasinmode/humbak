<script setup lang="ts">
const isTiles = ref(true);

const classContainer = computed(() => isTiles.value
	? 'grid grid-rows-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)_auto_auto_auto] grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] sm:grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))]'
	: ''
);

const classChild = computed(() => isTiles.value
	? 'grid grid-cols-2 gap-x-3 grid-rows-subgrid pb-4 gap-y-3 row-span-4 items-center shadow border-2 rounded-lg border-neutral'
	: ''
);

const classImage = computed(() => isTiles.value
	? 'w-full h-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)] object-cover mb-1 col-span-full'
	: ''
);

const files = [
	{ id: 0, title: 'file1', alt: 'file1', src: 'https://picsum.photos/500', mimetype: 'image/jpeg' },
	{ id: 1, title: 'file2', alt: 'file2', src: 'https://picsum.photos/501', mimetype: 'image/jpeg' },
	{ id: 2, title: 'file3', alt: 'file3', src: 'https://picsum.photos/500/300', mimetype: 'image/jpeg' },
	{ id: 3, title: 'file4', alt: 'file4', src: 'https://picsum.photos/503', mimetype: 'image/jpeg' },
	{ id: 4, title: 'file5', alt: 'file5', src: 'https://picsum.photos/300/500', mimetype: 'image/jpeg' },
	{ id: 5, title: 'file6', alt: 'file6', src: 'https://picsum.photos/400', mimetype: 'image/jpeg' },
];
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="mx-auto max-w-360 w-full flex justify-end gap-x-3 px-container md:px-0">
			<VButton class="h-9 w-9 shrink-0 neon-blue" title="widok plików: kafelki" @click="isTiles = true">
				<span class="visually-hidden">widok plików: kafelki</span>
				<div class="i-fluent-grid-20-regular absolute left-1/2 top-1/2 h-[1.125rem] w-[1.125rem] translate-center" />
			</VButton>

			<VButton class="h-9 w-9 shrink-0 -ml-1 neon-blue" title="widok plików: lista" @click="isTiles = false">
				<span class="visually-hidden">widok plików: lista</span>
				<div class="i-fluent-text-bullet-list-20-filled absolute left-1/2 top-1/2 h-[1.375rem] w-[1.375rem] translate-center" />
			</VButton>

			<VButton
				ref="saveButton"
				class="mr-12 h-fit md:mr-container neon-green"
			>
				zapisz
			</VButton>
		</div>
		<div class="mx-auto max-w-360 w-full gap-x-5 gap-y-4 px-container" :class="classContainer">
			<div :class="classChild">
				dodaj folder/wgraj pliki
			</div>
			<article v-for="(file, index) in files" :key="file.id" class="of-hidden" :class="classChild">
				<img :src="file.src" :title="file.title" :alt="file.alt" :class="classImage">
				<VInput
					:id="`file${file.id}title`"
					v-model="files[index].title"
					label="tytuł"
					class="col-span-full mx-3"
				/>
				<VInput
					:id="`file${file.id}alt`"
					v-model="files[index].alt"
					label="alt"
					class="col-span-full mx-3"
				/>
				<VInput
					:id="`file${file.id}path`"
					v-model="files[index].src"
					label="ścieżka"
					class="col-span-full mx-3"
				/>
				<VButton class="mr-2 mt-3 w-fit justify-self-end neon-red">
					usuń
				</VButton>
				<VButton class="mt-3 w-fit -ml-2 neon-blue">
					przenieś
				</VButton>
			</article>
		</div>
	</main>
</template>
