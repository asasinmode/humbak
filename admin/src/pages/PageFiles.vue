<script setup lang="ts">
const isTiles = ref(true);

const classContainer = computed(() => isTiles.value
	? 'grid auto-rows-[9rem] grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]'
	: ''
);

const classChild = computed(() => isTiles.value
	? ''
	: ''
);

const files = [
	{ id: 0, name: 'file1', title: 'file1', alt: 'file1', src: 'https://picsum.photos/500', mimetype: 'image/jpeg' },
	{ id: 1, name: 'file2', title: 'file2', alt: 'file2', src: 'https://picsum.photos/501', mimetype: 'image/jpeg' },
	{ id: 2, name: 'file3', title: 'file3', alt: 'file3', src: 'https://picsum.photos/502', mimetype: 'image/jpeg' },
	{ id: 3, name: 'file4', title: 'file4', alt: 'file4', src: 'https://picsum.photos/503', mimetype: 'image/jpeg' },
	{ id: 4, name: 'file5', title: 'file5', alt: 'file5', src: 'https://picsum.photos/504', mimetype: 'image/jpeg' },
];
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="mx-auto max-w-360 w-full flex justify-end gap-x-3 px-container md:px-0">
			<VButton class="h-9 w-9 neon-blue" title="widok plików: kafelki" @click="isTiles = true">
				<span class="visually-hidden">widok plików: kafelki</span>
				<div class="i-fluent-grid-20-regular absolute left-1/2 top-1/2 h-[1.125rem] w-[1.125rem] translate-center" />
			</VButton>

			<VButton class="h-9 w-9 -ml-1 neon-blue" title="widok plików: lista" @click="isTiles = false">
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
			<div v-for="file in files" :key="file.id" :class="classChild">
				<img :src="file.src" :title="file.title" :alt="file.alt">
			</div>
			<div :class="classChild">
				dodaj folder/wgraj pliki
			</div>
		</div>
	</main>
</template>
