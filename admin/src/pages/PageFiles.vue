<script setup lang="ts">
import type { IDir, IFile } from '~/composables/useApi';

const isTiles = ref(true);

const classContainer = computed(() => {
	let rv = 'grid grid-rows-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)_auto_auto_auto_auto] grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-y-4';

	if (!isTiles.value) {
		rv += ' md:flex md:flex-col';
	}
	return rv;
});

const isLoading = ref(false);
const allDirectories = ref<IDir[]>([]);
let originalCurrentDirFiles: IFile[] = [];

const currentDir = ref<number | null>(null);
const currentDirDirs = ref<IDir[]>([]);
const currentDirFiles = ref<IFile[]>([]);

const newDirName = ref('');

onMounted(async () => {
	allDirectories.value = [];
	currentDirDirs.value = allDirectories.value.map(dir => structuredClone(dir));

	originalCurrentDirFiles = await getDirFiles();
	currentDirFiles.value = structuredClone(originalCurrentDirFiles);
});

function createDir() {
	if (!newDirName.value) {
		return;
	}
	currentDirDirs.value.unshift({ id: allDirectories.value.length + 1, parentId: currentDir.value, name: newDirName.value });
	newDirName.value = '';
}

const dirsToDelete = ref<number[]>([]);
const filesToDelete = ref<number[]>([]);

function deleteDir(id: number) {
	const index = dirsToDelete.value.indexOf(id);
	if (index !== -1) {
		return;
	}
	const allDirsIndex = allDirectories.value.findIndex(dir => dir.id === id);
	const butFalse = false;
	if (allDirsIndex === -1 && butFalse) {
		const currentDirDirsIndex = currentDirDirs.value.findIndex(dir => dir.id === id);
		currentDirDirs.value.splice(currentDirDirsIndex, 1);
	} else {
		dirsToDelete.value.push(id);
	}
}

function restoreDir(id: number) {
	const index = dirsToDelete.value.indexOf(id);
	if (index !== -1) {
		dirsToDelete.value.splice(index, 1);
	}
}

function deleteFile(id: number) {
	const index = filesToDelete.value.indexOf(id);
	if (index !== -1) {
		return;
	}
	const originalFileIndex = originalCurrentDirFiles.findIndex(dir => dir.id === id);
	if (originalFileIndex === -1) {
		const currentDirFilesIndex = currentDirFiles.value.findIndex(dir => dir.id === id);
		currentDirFiles.value.splice(currentDirFilesIndex, 1);
	} else {
		filesToDelete.value.push(id);
	}
}

function restoreFile(id: number) {
	const index = filesToDelete.value.indexOf(id);
	if (index !== -1) {
		filesToDelete.value.splice(index, 1);
	}
}

async function getDirFiles() {
	isLoading.value = true;
	await new Promise(resolve => setTimeout(resolve, 500));

	let fileId = 1;
	const files: IFile[] = [];

	for (let i = 0; i < 8; i++) {
		const text = `file${fileId}`;
		const random = Math.random();
		const name = random <= 0.33
			? `https://picsum.photos/${500 + fileId}`
			: random <= 0.66
				? `https://picsum.photos/${400 + fileId}/${600 - fileId}`
				: `https://picsum.photos/${600 + fileId}/${400 - fileId}`;

		files.push({ id: fileId, parentId: null, title: text, alt: text, name, mimetype: 'image/png' });
		fileId += 1;
	}

	isLoading.value = false;
	return files;
}
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="mx-auto max-w-360 w-full flex justify-end gap-x-3 px-container md:px-0">
			<VButton class="hidden h-9 w-9 shrink-0 md:flex neon-blue" title="widok plików: kafelki" @click="isTiles = true">
				<span class="visually-hidden">widok plików: kafelki</span>
				<div class="i-fluent-grid-20-regular absolute left-1/2 top-1/2 h-[1.125rem] w-[1.125rem] translate-center" />
			</VButton>

			<VButton class="hidden h-9 w-9 shrink-0 -ml-1 md:flex neon-blue" title="widok plików: lista" @click="isTiles = false">
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
			:class="classContainer"
			aria-live="polite"
			:aria-busy="isLoading"
		>
			<div class="relative row-span-5 flex flex-col border-2 border-neutral rounded-lg shadow" :class="isTiles ? '' : 'md:flex-row'">
				<div class="flex basis-1/2 flex-col items-center justify-center gap-3 border-b border-neutral px-3 py-4" :class="isTiles ? '' : 'md:flex-row md:border-b-0 md:border-r'">
					<VInput
						id="newDirName"
						v-model="newDirName"
						label="nazwa folderu"
						:disabled="isLoading"
					/>
					<VButton
						class="h-fit shrink-0 neon-green"
						:class="isTiles ? '' : 'md:mt-[1.625rem]'"
						:disabled="isLoading"
						@click="createDir"
					>
						dodaj folder
					</VButton>
				</div>
				<div class="flex basis-1/2 items-center justify-center border-t border-neutral px-3 py-4" :class="isTiles ? '' : 'md:border-t-0 md:border-l'">
					<input hidden type="file">
					<VButton class="neon-blue" :disabled="isLoading">
						wgraj pliki
					</VButton>
				</div>
				<VLoading v-if="isLoading" class="absolute inset-0 bg-black/10 dark:bg-white/10" size="40" />
			</div>
			<FilesDirItem
				v-for="(dir, index) in currentDirDirs"
				:key="dir.id"
				v-model="currentDirDirs[index]"
				:is-tiles="isTiles"
				:dirs-to-delete="dirsToDelete"
				@delete="deleteDir"
				@restore="restoreDir"
			/>
			<FilesFileItem
				v-for="(file, index) in currentDirFiles"
				:key="file.id"
				v-model="currentDirFiles[index]"
				:is-tiles="isTiles"
				:files-to-delete="filesToDelete"
				@delete="deleteFile"
				@restore="restoreFile"
			/>
		</div>
	</main>
</template>
