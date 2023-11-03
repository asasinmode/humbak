<script setup lang="ts">
type IDir = { id: number; parentId: null | number; name: string; };
type IFile = { id: number; parentId: null | number; title: string; alt: string; name: string; mimetype: string; };

const isTiles = ref(true);

const classes = computed(() => {
	let container = 'grid grid-rows-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)_auto_auto_auto_auto] grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-y-4';
	let child = 'grid grid-cols-2 gap-x-3 grid-rows-[subgrid] pb-4 gap-y-3 row-span-5 items-center';
	let image = 'w-full h-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)] mb-1 col-span-full';
	let input = 'col-span-full self-start mx-3';
	let saveDeleteButton = 'mt-3 h-fit w-fit';

	if (!isTiles.value) {
		container += ' flex flex-col';
		child += ' sm:flex sm:gap-3 sm:pr-4 sm:pb-0';
		image += ' sm:h-20 sm:w-20 sm:mb-0';
		input += ' sm:self-auto sm:mx-0';
		saveDeleteButton += ' sm:ml-3 sm:mt-auto sm:mr-0 sm:mb-[0.625rem]';
	}

	return { container, child, image, input, saveDeleteButton };
});

const isLoading = ref(false);
const directories = ref<IDir[]>([]);
const currentDir = ref<number | null>(null);
const currentDirFiles = ref<IFile[]>([]);
const currentDirDirs = computed(() => directories.value.filter(dir => dir.parentId === currentDir.value));

const newDirName = ref('');

onMounted(async () => {
	currentDirFiles.value = await getDirFiles();
});

function createDir() {
	if (!newDirName.value) {
		return;
	}
	directories.value.push({ id: directories.value.length + 1, parentId: currentDir.value, name: newDirName.value });
	newDirName.value = '';
}

async function getDirFiles() {
	isLoading.value = true;
	await new Promise(resolve => setTimeout(resolve, 500));

	let fileId = 1;
	const files: IFile[] = [];

	for (let i = 0; i < 8; i++) {
		const text = `file${fileId}`;
		files.push({ id: fileId, parentId: null, title: text, alt: text, name: randomImageSrc(fileId), mimetype: 'image/png' });
		fileId += 1;
	}

	isLoading.value = false;
	return files;
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
			<VButton class="hidden h-9 w-9 shrink-0 sm:flex neon-blue" title="widok plików: kafelki" @click="isTiles = true">
				<span class="visually-hidden">widok plików: kafelki</span>
				<div class="i-fluent-grid-20-regular absolute left-1/2 top-1/2 h-[1.125rem] w-[1.125rem] translate-center" />
			</VButton>

			<VButton class="hidden h-9 w-9 shrink-0 -ml-1 sm:flex neon-blue" title="widok plików: lista" @click="isTiles = false">
				<span class="visually-hidden">widok plików: lista</span>
				<div class="i-fluent-text-bullet-list-20-filled absolute left-1/2 top-1/2 h-[1.375rem] w-[1.375rem] translate-center" />
			</VButton>

			<VButton
				ref="saveButton"
				class="mr-12 h-fit md:mr-container neon-green"
				@click="isLoading = !isLoading"
			>
				zapisz
			</VButton>
		</div>
		<div
			class="mx-auto max-w-360 w-full gap-x-5 px-container"
			:class="classes.container"
			aria-live="polite"
			:aria-busy="isLoading"
		>
			<div class="relative flex flex-col border-2 border-neutral rounded-lg shadow" :class="isTiles ? 'row-span-5' : 'sm:flex-row'">
				<div class="flex basis-1/2 flex-col items-center justify-center gap-3 border-b border-neutral px-3 py-4" :class="isTiles ? '' : 'sm:flex-row sm:border-b-0 sm:border-r'">
					<VInput
						id="newDirName"
						v-model="newDirName"
						label="nazwa folderu"
						:disabled="isLoading"
					/>
					<VButton
						class="h-fit shrink-0 neon-green"
						:class="isTiles ? '' : 'sm:mt-[1.625rem]'"
						:disabled="isLoading"
						@click="createDir"
					>
						dodaj folder
					</VButton>
				</div>
				<div class="flex basis-1/2 items-center justify-center border-t border-neutral px-3 py-4" :class="isTiles ? '' : 'sm:border-t-0 sm:border-l'">
					<input hidden type="file">
					<VButton class="neon-blue" :disabled="isLoading">
						wgraj pliki
					</VButton>
				</div>
				<VLoading v-if="isLoading" class="absolute inset-0 bg-black/10 dark:bg-white/10" size="40" />
			</div>
			<div
				v-for="(directory, index) in currentDirDirs"
				:key="directory.id"
				class="of-hidden border-2 border-neutral rounded-lg shadow"
				:class="classes.child"
			>
				<div class="flex-center self-start" :class="classes.image">
					<div class="i-solar-folder-with-files-bold h-4/5 w-4/5" />
				</div>
				<VInput
					:id="`dir${directory.id}name`"
					v-model="currentDirDirs[index].name"
					class="row-span-3"
					label="nazwa"
					:class="classes.input"
				/>
				<VButton class="mr-2 justify-self-end neon-red" :class="classes.saveDeleteButton">
					usuń
				</VButton>
				<VButton class="-ml-2 neon-blue" :class="classes.saveDeleteButton">
					przenieś
				</VButton>
			</div>
			<article
				v-for="(file, index) in currentDirFiles"
				:key="file.id"
				class="of-hidden border-2 border-neutral rounded-lg shadow"
				:class="classes.child"
			>
				<img :src="file.name" :title="file.title" :alt="file.alt" class="object-cover" :class="classes.image">
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
					:id="`file${file.id}name`"
					v-model="currentDirFiles[index].name"
					label="nazwa"
					:class="classes.input"
				/>
				<VButton class="mr-2 justify-self-end neon-red" :class="classes.saveDeleteButton">
					usuń
				</VButton>
				<VButton class="-ml-2 neon-blue" :class="classes.saveDeleteButton">
					przenieś
				</VButton>
			</article>
		</div>
	</main>
</template>
