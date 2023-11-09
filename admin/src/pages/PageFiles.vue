<script setup lang="ts">
import type { IDir, IFile, INewFile } from '~/composables/useApi';

const { toastGenericError } = useToast();

const isTiles = ref(true);

const classContainer = computed(() => {
	let rv = 'grid grid-rows-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)_auto_auto_auto_auto] grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-y-4';

	if (!isTiles.value) {
		rv += ' md:flex md:flex-col';
	}
	return rv;
});

const isLoading = ref(false);
const allDirectories = shallowRef<IDir[]>([]);
let originalCurrentDirFiles: IFile[] = [];

const currentDir = ref<number | null>(null);
const currentDirDirs = ref<IDir[]>([]);
const currentDirFiles = ref<IFile[]>([]);
const newFiles = ref<INewFile[]>([]);

const newDirName = ref('');

onMounted(async () => {
	allDirectories.value = [{ id: 1, parentId: null, name: 'temp' }];
	currentDirDirs.value = allDirectories.value.map((dir) => {
		const value = toValue(dir);
		return structuredClone(value);
	});

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

function deleteDir(index: number) {
	if (allDirectories.value.find(dir => dir.id === currentDirDirs.value[index].id)) {
		currentDirDirs.value[index].isBeingDeleted = true;
	} else {
		currentDirDirs.value.splice(index, 1);
	}
}

function restoreDir(index: number) {
	currentDirDirs.value[index].isBeingDeleted = false;
}

function deleteFile(index: number, isNew: boolean) {
	if (isNew) {
		newFiles.value.splice(index, 1);
	} else {
		currentDirFiles.value[index].isBeingDeleted = true;
	}
}

function restoreFile(index: number) {
	currentDirFiles.value[index].isBeingDeleted = false;
}

const isDraggingOverFiles = ref(false);
const fileInput = ref<HTMLInputElement>();

function openFileInput() {
	if (!fileInput.value) {
		toastGenericError();
		throw new Error('file input ref not found');
	}
	fileInput.value.click();
}

function handleFileDrop(event: DragEvent) {
	isDraggingOverFiles.value = false;
	if (!event.dataTransfer?.items) {
		return;
	}

	for (const item of event.dataTransfer.items) {
		if (item.kind !== 'file') {
			continue;
		}
		const file = item.getAsFile();
		if (!file) {
			continue;
		}
		newFiles.value.unshift({
			title: '',
			alt: '',
			name: '',
			src: URL.createObjectURL(file),
			mimetype: file.type,
			file,
		});
	}
}

function handleFileInput(event: Event) {
	const target = event.target as HTMLInputElement | null;
	if (!target?.files) {
		return;
	}
	for (const file of target.files) {
		newFiles.value.unshift({
			title: '',
			alt: '',
			name: '',
			src: URL.createObjectURL(file),
			mimetype: file.type,
			file,
		});
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
		const src = random <= 0.33
			? `https://picsum.photos/${500 + fileId}`
			: random <= 0.66
				? `https://picsum.photos/${400 + fileId}/${600 - fileId}`
				: `https://picsum.photos/${600 + fileId}/${400 - fileId}`;

		files.push({ id: fileId, parentId: null, title: text, alt: text, name: text, src, mimetype: 'image/png' });
		fileId += 1;
	}

	isLoading.value = false;
	return files;
}

const container = ref<HTMLElement>();
let	mouseDownTimestamp: number | undefined;
let createPreviewTimeout: Timeout | undefined;
let grabbedItemData: {
	buttonElement: HTMLButtonElement;
	index: number;
	preview?: HTMLElement;
	isDir: boolean;
} | undefined;

function grabFile(index: number, event: MouseEvent, src?: string) {
	console.log('grabbing', { index, src, target: event.target });
	if (!event.target) {
		throw new Error('grab file event has no target');
	}

	mouseDownTimestamp = Date.now();
	grabbedItemData = {
		index,
		buttonElement: event.target as HTMLButtonElement,
		isDir: false,
	};

	document.addEventListener('mouseup', moveFileOrOpenFiles);
	createPreviewTimeout = setTimeout(() => {
		console.log('timeout happening');
		if (!grabbedItemData) {
			return;
		}
		grabbedItemData.preview = createPreviewElement(false, event.clientX, event.clientY);
		document.addEventListener('mousemove', movePreview);
	}, 250);
}

function moveFileOrOpenFiles() {
	document.removeEventListener('mouseup', moveFileOrOpenFiles);
	document.removeEventListener('mousemove', movePreview);
	createPreviewTimeout && clearTimeout(createPreviewTimeout);

	if (!mouseDownTimestamp) {
		toastGenericError();
		throw new Error('move file or open files called without mousedown timestamp');
	}

	if (!grabbedItemData) {
		toastGenericError();
		throw new Error('move file or open files called without grabbed item data');
	}
	grabbedItemData.preview?.remove();

	if (mouseDownTimestamp && mouseDownTimestamp + 250 >= Date.now()) {
		console.log('clicked will open dialog from', grabbedItemData.buttonElement);
		mouseDownTimestamp = undefined;
		grabbedItemData = undefined;
		return;
	}

	mouseDownTimestamp = undefined;
	grabbedItemData = undefined;

	console.log('dragged');
}

function movePreview(event: MouseEvent) {
	if (!grabbedItemData?.preview) {
		toastGenericError();
		throw new Error('move preview called without preview element');
	}
	event.preventDefault();
	grabbedItemData.preview.style.left = `${event.clientX}px`;
	grabbedItemData.preview.style.top = `${event.clientY}px`;
}

function createPreviewElement(isDir: boolean, x: number, y: number) {
	console.log('creating preview');
	if (!container.value) {
		throw new Error('create preview element called without container');
	}

	const element = document.createElement('div');
	element.style.position = 'absolute';
	element.style.width = '10px';
	element.style.height = '10px';
	element.style.background = isDir ? 'lightblue' : 'hotpink';
	element.style.left = `${x}px`;
	element.style.top = `${y}px`;
	element.style.zIndex = '25';
	container.value.appendChild(element);

	return element;
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
			ref="container"
			class="relative mx-auto max-w-360 w-full gap-x-5 px-container"
			:class="classContainer"
			aria-live="polite"
			:aria-busy="isLoading"
		>
			<div
				class="relative row-span-5 flex flex-col of-hidden border-2 border-neutral rounded-lg shadow"
				:class="isTiles ? '' : 'md:flex-row'"
			>
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
				<div
					class="relative flex basis-1/2 items-center justify-center border-t border-neutral px-3 py-4 after:(absolute font-semibold text-neutral) before:(absolute inset-0 border-neutral border-dashed content-empty)"
					:class="[
						isTiles ? '' : 'md:border-t-0 md:border-l',
						isDraggingOverFiles ? `after:content-['upuść_pliki'] before:border-3` : '']
					"
					@drop.prevent="handleFileDrop"
					@dragenter.prevent="isDraggingOverFiles = true"
					@dragleave="isDraggingOverFiles = false"
					@dragover.prevent=""
				>
					<input ref="fileInput" type="file" multiple hidden @input="handleFileInput">
					<VButton v-show="!isDraggingOverFiles" class="neon-blue" :disabled="isLoading" @click="openFileInput">
						wgraj pliki
					</VButton>
				</div>
				<VLoading v-if="isLoading" class="absolute inset-0 bg-black/10 dark:bg-white/10" size="40" />
			</div>
			<FilesDirItem
				v-for="(dir, index) in currentDirDirs"
				:key="dir.id"
				v-model="currentDirDirs[index]"
				:index="index"
				:is-tiles="isTiles"
				@delete="deleteDir"
				@restore="restoreDir"
			/>
			<FilesFileItem
				v-for="(file, index) in newFiles"
				:key="file.src"
				v-model="newFiles[index]"
				:index="index"
				:is-tiles="isTiles"
				@delete="deleteFile"
				@restore="restoreFile"
				@mousedown="grabFile(index, $event)"
			/>
			<FilesFileItem
				v-for="(file, index) in currentDirFiles"
				:key="file.id"
				v-model="currentDirFiles[index]"
				:index="index"
				:is-tiles="isTiles"
				:original-file="originalCurrentDirFiles[index]"
				@delete="deleteFile"
				@restore="restoreFile"
				@mousedown="grabFile(index, $event, file.src)"
			/>
		</div>
	</main>
</template>
