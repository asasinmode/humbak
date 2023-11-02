<script setup lang="ts">
type IDir = { id: number; name: string; };
type IFile = { id: number; parentId: null | number; title: string; alt: string; src: string; mimetype: string; };

const isTiles = ref(true);

const classes = computed(() => {
	if (isTiles.value) {
		return {
			container: 'grid grid-rows-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)_auto_auto_auto_auto] grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-y-3',
			child: 'grid grid-cols-2 gap-x-3 grid-rows-subgrid pb-4 gap-y-3 row-span-5 items-center',
			image: 'w-full h-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)] mb-1 col-span-full',
			input: 'col-span-full mx-3',
		};
	}

	return {
		container: 'flex flex-col gap-y-3',
		child: 'w-full flex flex-row gap-3 pr-4',
		image: 'h-20 w-20',
		input: 'mt-2',
	};
});

const isLoading = ref(false);
const directories: IDir[] = [];
const currentDir = ref<number | null>(null);
const currentDirFiles = ref<IFile[]>([]);

onMounted(async () => {
	currentDirFiles.value = await getDirFiles();
});

async function getDirFiles() {
	isLoading.value = true;
	await new Promise(resolve => setTimeout(resolve, randomInt(0, 300)));

	let fileId = 1;
	const files: IFile[] = [];

	for (let i = 0; i < 8; i++) {
		const text = `file${fileId}`;
		files.push({ id: fileId, parentId: null, title: text, alt: text, src: randomImageSrc(fileId), mimetype: 'image/png' });
		fileId += 1;
	}

	isLoading.value = false;
	return files;
}

function randomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomImageSrc(id: number) {
	const random = Math.random();
	return random <= 0.33
		? `https://picsum.photos/${500 + id}`
		: random <= 0.66
			? `https://picsum.photos/${400 + id}/${600 - id}`
			: `https://picsum.photos/${600 + id}/${400 - id}`;
}
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
		<div class="mx-auto max-w-360 w-full gap-x-5 px-container" :class="classes.container">
			<div class="border-2 border-neutral rounded-lg shadow" :class="isTiles ? ' row-span-5' : 'h-20'">
				dodaj folder/wgraj pliki
			</div>
			<article
				v-for="(file, index) in currentDirFiles"
				:key="file.id"
				class="of-hidden border-2 border-neutral rounded-lg shadow"
				:class="classes.child"
			>
				<img :src="file.src" :title="file.title" :alt="file.alt" class="object-cover" :class="classes.image">
				<VInput
					:id="`file${file.id}title`"
					v-model="currentDirFiles[index].title"
					label="tytuł"
					:class="classes.input"
				/>
				<VInput
					:id="`file${file.id}alt`"
					v-model="currentDirFiles[index].alt"
					label="alt"
					:class="classes.input"
				/>
				<VInput
					:id="`file${file.id}path`"
					v-model="currentDirFiles[index].src"
					label="ścieżka"
					:class="classes.input"
				/>
				<VButton class="h-fit w-fit neon-red" :class="isTiles ? 'mt-3 mr-2 justify-self-end' : 'ml-3 mt-auto mb-[0.625rem]'">
					usuń
				</VButton>
				<VButton class="h-fit w-fit neon-blue" :class="isTiles ? 'mt-3 -ml-2' : 'mt-auto mb-[0.625rem]'">
					przenieś
				</VButton>
			</article>
		</div>
	</main>
</template>
