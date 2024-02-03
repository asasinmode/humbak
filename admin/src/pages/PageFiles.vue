<script setup lang="ts">
import { knownMimetypeExtensions } from '~/helpers';
import VDialog from '~/components/V/VDialog.vue';
import { env } from '~/env';
import VButton from '~/components/V/VButton.vue';
import { FetchError } from '~/composables/useErrors';
import type { IDirectory, IFile, IGetDirectoryResponse, IPutDirectoriesInput } from '~/composables/useApi';
import type { IFilesGrabbedItem, ILocalDirectory, ILocalFile, INewFile } from '~/types';

const api = useApi();
const route = useRoute();
const router = useRouter();
const { confirm } = useConfirm();
const { clearLoadedFiles } = useHumbakFiles();
const { toast, toastGenericError } = useToast();

const savedPreference = localStorage.getItem('files-display');
const isTiles = ref(savedPreference ? savedPreference === 'tiles' : true);

watch(isTiles, (value) => {
	localStorage.setItem('files-display', value ? 'tiles' : 'list');
});

const classContainer = computed(() => {
	let rv = 'grid grid-rows-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)_auto_auto_auto_auto] grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-y-4';

	if (!isTiles.value) {
		rv += ' md:flex md:flex-col';
	}
	return rv;
});

const isLoadingDirs = ref(false);
const isLoadingFiles = ref(false);
const computedIsLoading = computed(() => isLoadingDirs.value || isLoadingFiles.value);

const saveButton = ref<InstanceType<typeof VButton>>();
const allDirectories = ref<IDirectory[]>([]);

const currentDirDirs = ref<ILocalDirectory[]>([]);
const currentDirFiles = ref<ILocalFile[]>([]);
const originalCurrentDirDirs = shallowRef<IDirectory[]>([]);
const originalCurrentDirFiles = shallowRef<IFile[]>([]);

const newFiles = ref<INewFile[]>([]);

const isSavingDir = ref(false);
const newDirName = ref('');

const currentDir = computed(() => {
	const rawId = route.query.dir;
	const parsedId = Number.parseInt(`${rawId}`);
	const id = Number.isNaN(parsedId) ? null : parsedId;

	if (id === 0 || id === null) {
		return undefined;
	}

	return allDirectories.value.find(dir => dir.id === id);
});

const currentDirId = computed(() => currentDir.value?.id || null);

watch(currentDirId, () => {
	getDir(currentDirId.value);
}, { immediate: true });

type IBreadcrumb = {
	text: string;
	id: number | null;
	isActive?: boolean;
};

const pathBreadcrumbs = computed<IBreadcrumb[]>(() => {
	if (!currentDir.value) {
		return [{ text: 'root', id: null, isActive: true }];
	}

	const breadcrumbs: IBreadcrumb[] = [{ text: 'root', id: null }];

	let parent = allDirectories.value.find(dir => dir.id === currentDir.value!.parentId);
	while (parent) {
		breadcrumbs.splice(1, 0, { id: parent.id, text: parent.name });
		parent = allDirectories.value.find(dir => dir.id === parent!.parentId);
	}

	breadcrumbs.push({ id: currentDir.value.id, text: currentDir.value.name, isActive: true });

	return breadcrumbs;
});

onMounted(() => {
	getDirectories();
});

const {
	errors: createDirErrors,
	handleError: handleCreateDirError,
	clearErrors: clearCreateDirErrors,
} = useErrors({ parentId: currentDirId.value, name: newDirName.value });

async function createDir() {
	if (!newDirName.value) {
		return;
	}
	clearCreateDirErrors();

	isSavingDir.value = true;
	try {
		const directory = await api.directories.$post({ json: {
			parentId: currentDirId.value,
			name: newDirName.value,
		} }).then(res => res.json());

		allDirectories.value.unshift(structuredClone(directory));
		currentDirDirs.value.unshift(structuredClone(directory));
		originalCurrentDirDirs.value.unshift(structuredClone(directory));

		currentDirDirs.value.sort((a, b) => a.name.localeCompare(b.name));
		originalCurrentDirDirs.value.sort((a, b) => a.name.localeCompare(b.name));

		newDirName.value = '';
	} catch (e) {
		handleCreateDirError(e);
	} finally {
		isSavingDir.value = false;
	}
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
		addNewFile(file);
	}
}

function handleFileInput(event: Event) {
	const target = event.target as HTMLInputElement | null;
	if (!target?.files) {
		return;
	}
	for (const file of target.files) {
		addNewFile(file);
	}
}

async function getDirectories() {
	isLoadingDirs.value = true;

	try {
		const directories = await api.directories.$get().then(r => r.json());
		allDirectories.value = directories;
	} catch (e) {
		console.error(e);
		toast('błąd przy ładowaniu folderów', 'error');
	} finally {
		isLoadingDirs.value = false;
	}
}

async function getDir(id: number | null) {
	isLoadingFiles.value = true;

	try {
		const { files, directories } = await api.directories[':id'].$get({ param: { id: `${id}` } }).then(r => r.json());

		originalCurrentDirDirs.value = directories.map(dir => structuredClone(dir));
		currentDirDirs.value = directories.map(dir => structuredClone(dir));

		originalCurrentDirFiles.value = files.map(file => structuredClone(file));
		currentDirFiles.value = files.map(file => structuredClone(file));
	} catch (e) {
		console.error(e);
		toast('błąd przy ładowaniu plików', 'error');
	} finally {
		isLoadingFiles.value = false;
	}
}

const container = ref<HTMLElement>();
const grabbedItem = ref<IFilesGrabbedItem>();
const grabPreviewElement = ref<HTMLElement>();
let	mouseDownTimestamp: number | undefined;
let createPreviewTimeout: NodeJS.Timeout | undefined;

type IDialogDir = IDirectory & { isBeingDeleted?: boolean; };
const dialog = ref<InstanceType<typeof VDialog>>();
const dialogActivator = ref<HTMLButtonElement>();
const dialogTargetId = ref<number | null>();
const dialogSearch = ref('');
const dialogAllDirs = computed<IDialogDir[]>(() => {
	if (!grabbedItem.value) {
		return [];
	}

	const matchingSearch: IDialogDir[] = [];
	for (const dir of allDirectories.value) {
		const currentDir = currentDirDirs.value.find(d => d.id === dir.id);
		if (!dialogSearch.value || dir.name.includes(dialogSearch.value)) {
			matchingSearch.push({
				...dir,
				isBeingDeleted: currentDir?.isBeingDeleted,
			});
		}
	}

	if (!grabbedItem.value.isNew && (!dialogSearch.value || 'root'.includes(dialogSearch.value))) {
		matchingSearch.unshift({
			id: null as unknown as number,
			parentId: -1,
			name: 'root',
		});
	}

	const rv = [];
	if (grabbedItem.value.isDir) {
		const grabbedDir = currentDirDirs.value[grabbedItem.value.index];
		if (!grabbedDir) {
			toastGenericError();
			throw new Error('grabbed dir not found');
		}

		for (const dir of matchingSearch) {
			if (dir.id !== grabbedDir.id && dir.id !== grabbedDir.parentId) {
				rv.push(dir);
			}
		}
	} else {
		const grabbedFile = (grabbedItem.value.isNew ? newFiles : currentDirFiles).value[grabbedItem.value.index];
		if (!grabbedFile) {
			toastGenericError();
			throw new Error('grabbed file not found');
		}

		for (const dir of matchingSearch) {
			const key = (grabbedItem.value.isNew ? 'movedToId' : 'directoryId') as keyof typeof grabbedFile;
			if (dir.id !== grabbedFile[key]) {
				rv.push(dir);
			}
		}
	}

	return rv;
});

const isSaving = ref(false);
const {
	errors,
	handleError,
	clearErrors,
} = useErrors({ deletedFileIds: {},	editedFiles: {}, deletedDirIds: {}, editedDirs: {} } as IPutDirectoriesInput);

const {
	errors: newFilesErrors,
	handleError: handleNewFilesError,
	clearErrors: clearNewFilesErrors,
} = useErrors({ newFiles: {} as INewFile[] });

function grabFile(index: number, event: MouseEvent, mimetype: string, isNew?: boolean, src?: string, name?: string) {
	if (!event.target) {
		toastGenericError();
		throw new Error('grab file event has no target');
	}

	mouseDownTimestamp = Date.now();
	grabbedItem.value = {
		index,
		isNew,
		isDir: mimetype === 'directory',
	};
	dialogActivator.value = event.target as HTMLButtonElement;
	document.addEventListener('mouseup', moveFileOrOpenFiles);

	createPreviewTimeout = setTimeout(() => {
		if (!grabbedItem.value) {
			return;
		}
		grabPreviewElement.value = createPreviewElement(event.clientX, event.clientY, mimetype, src, name);
		document.addEventListener('mousemove', movePreview);
	}, 150);
}

function addNewFile(file: File) {
	const keys = Object.keys(newFilesErrors.value.newFiles);
	for (let i = keys.length; i >= 0; i--) {
		const parsedIndex = Number.parseInt(keys[i]);
		if (Number.isNaN(parsedIndex)) {
			continue;
		}

		const newIndex = parsedIndex + 1;
		newFilesErrors.value.newFiles[newIndex] = newFilesErrors.value.newFiles[i];

		if (i === 0) {
			newFilesErrors.value.newFiles[parsedIndex] = {};
		}
	}
	newFiles.value.unshift({
		title: '',
		alt: '',
		name: file.name,
		path: URL.createObjectURL(file),
		mimetype: file.type,
		file,
	});
}

function deleteFile(index: number, isNew: boolean) {
	if (isNew) {
		newFiles.value.splice(index, 1);
		if (newFilesErrors.value.newFiles[index]) {
			newFilesErrors.value.newFiles[index] = {};
			const keys = Object.keys(newFilesErrors.value.newFiles);
			for (let i = 0; i < keys.length; i++) {
				const parsedIndex = Number.parseInt(keys[i]);
				if (Number.isNaN(parsedIndex) || i <= index) {
					continue;
				}

				const newIndex = parsedIndex - 1;
				newFilesErrors.value.newFiles[newIndex] = newFilesErrors.value.newFiles[i];

				if (i === keys.length - 1) {
					newFilesErrors.value.newFiles[parsedIndex] = {};
				}
			}
		}
	} else {
		currentDirFiles.value[index].isBeingDeleted = true;
	}
}

function openFilesDialog(index: number, event: KeyboardEvent, isDir: boolean, isNew?: boolean) {
	if (!event.target) {
		toastGenericError();
		throw new Error('open files dialog event has no target');
	}
	mouseDownTimestamp = undefined;
	grabbedItem.value = {
		index,
		isNew,
		isDir,
	};
	dialogActivator.value = event.target as HTMLButtonElement;
	dialog.value?.open();
}

function moveFileOrOpenFiles(event: MouseEvent) {
	document.removeEventListener('mouseup', moveFileOrOpenFiles);
	document.removeEventListener('mousemove', movePreview);
	createPreviewTimeout && clearTimeout(createPreviewTimeout);

	if (!mouseDownTimestamp) {
		toastGenericError();
		throw new Error('move file or open files called without mousedown timestamp');
	}

	if (!grabbedItem.value) {
		toastGenericError();
		throw new Error('move file or open files called without grabbed item data');
	}

	grabPreviewElement.value?.remove();
	grabPreviewElement.value = undefined;

	if (mouseDownTimestamp && mouseDownTimestamp + 250 >= Date.now()) {
		mouseDownTimestamp = undefined;
		dialog.value?.open();
		return;
	}
	mouseDownTimestamp = undefined;

	const droppedOntoDir = (event.target as HTMLElement | null)?.closest('[data-dir-id]');
	if (!droppedOntoDir) {
		return;
	}

	const targetId = Number.parseInt((droppedOntoDir as HTMLElement).dataset.dirId as string);
	if (Number.isNaN(targetId)) {
		toastGenericError();
		throw new Error('found target id isn\'t a number');
	}

	moveGrabbedElement(targetId);
}

function movePreview(event: MouseEvent) {
	if (!grabPreviewElement.value) {
		toastGenericError();
		throw new Error('move preview called without preview element');
	}
	grabPreviewElement.value.style.left = `${event.clientX}px`;
	grabPreviewElement.value.style.top = `${event.clientY}px`;
}

function createPreviewElement(x: number, y: number, mimetype: string, src?: string, name?: string) {
	if (!container.value) {
		toastGenericError();
		throw new Error('create preview element called without container');
	}

	const element = document.createElement('div');
	element.style.position = 'fixed';
	element.style.width = '100px';
	element.style.height = '100px';
	element.style.left = `${x}px`;
	element.style.top = `${y}px`;
	element.style.zIndex = '25';
	element.style.pointerEvents = 'none';
	element.ariaHidden = 'true';

	const nodeType = src && mimetype.slice(0, 5) === 'image' ? 'img' : 'div';
	const child = document.createElement(nodeType);
	child.style.width = '100%';
	child.style.height = '100%';

	if (nodeType === 'img') {
		(child as HTMLImageElement).src = src as string;
		child.style.objectFit = 'cover';
	} else if (mimetype === 'directory') {
		child.className = 'i-solar-folder-with-files-bold';
	} else {
		child.className = 'grid place-items-center text-center bg-black/15 hyphens-auto dark:bg-white/15 tracking-wide text-3 p-1';
		child.textContent = name || knownMimetypeExtensions[mimetype] || mimetype;
	}

	element.appendChild(child);
	document.body.appendChild(element);
	return element;
}

function moveGrabbedElement(targetId?: number | null, closeDialog = false) {
	if (targetId === undefined) {
		closeDialog && dialog.value?.close();
		return;
	}
	if (!grabbedItem.value) {
		toastGenericError();
		throw new Error('move grabbed element called without grabbed element set');
	}

	let target: IDirectory | undefined;

	if (targetId === null) {
		target = {
			id: null as unknown as number,
			parentId: -1,
			name: 'root',
		};
	} else {
		target = allDirectories.value.find(dir => dir.id === targetId);
	}

	if (!target) {
		toastGenericError();
		throw new Error('target dir not found');
	}

	const currentTarget = currentDirDirs.value.find(dir => dir.id === target!.id);
	if (currentTarget?.isBeingDeleted) {
		closeDialog && dialog.value?.close();
		return;
	}

	if (grabbedItem.value.isDir) {
		const dirBeingMoved = currentDirDirs.value[grabbedItem.value.index];
		if (!dirBeingMoved) {
			toastGenericError();
			throw new Error('dir being moved not found');
		}

		// is being moved to itself
		if (dirBeingMoved.id === targetId) {
			grabbedItem.value = undefined;
			closeDialog && dialog.value?.close();
			return;
		}

		// is being moved to its child
		let parent: IDirectory | undefined = target;
		while (parent) {
			if (parent.parentId === dirBeingMoved.id) {
				toast('folder nie może być przeniesiony do swojego podfolderu', 'error');
				if (!closeDialog) {
					grabbedItem.value = undefined;
				}
				return;
			}
			parent = allDirectories.value.find(dir => dir.id === parent!.parentId);
		}

		if (errors.value.editedDirs[dirBeingMoved.id]) {
			errors.value.editedDirs[dirBeingMoved.id] = {};
		}
		currentDirDirs.value[grabbedItem.value.index].movedToId = targetId;
	} else if (grabbedItem.value.isNew) {
		if (newFilesErrors.value.newFiles[grabbedItem.value.index]) {
			newFilesErrors.value.newFiles[grabbedItem.value.index] = {};
		}
		newFiles.value[grabbedItem.value.index].movedToId = targetId;
	} else {
		const fileBeingMoved = currentDirFiles.value[grabbedItem.value.index];
		if (!fileBeingMoved) {
			toastGenericError();
			throw new Error('file being moved not found');
		}
		if (errors.value.editedFiles[fileBeingMoved.id]) {
			errors.value.editedFiles[fileBeingMoved.id] = {};
		}
		currentDirFiles.value[grabbedItem.value.index].movedToId = targetId;
	}

	grabbedItem.value = undefined;
	closeDialog && dialog.value?.close();
}

function cleanupDrag() {
	grabbedItem.value = undefined;
	dialogTargetId.value = undefined;
	dialogSearch.value = '';
}

const editableFileKeys = ['title', 'alt', 'name'] as const;
const editableDirKeys = ['name'] as const;

function getChanged(): IPutDirectoriesInput {
	const deletedFileIds: IPutDirectoriesInput['deletedFileIds'] = [];
	const editedFiles: IPutDirectoriesInput['editedFiles'] = [];

	for (const file of currentDirFiles.value) {
		if (file.isBeingDeleted) {
			deletedFileIds.push(file.id);
			continue;
		}

		const originalFile = originalCurrentDirFiles.value.find(originalFile => originalFile.id === file.id);
		if (!originalFile) {
			toastGenericError();
			throw new Error('changed file not found in original current dir files');
		}

		const directoryId = file.movedToId !== undefined ? file.movedToId : file.directoryId;
		const hasFileChanged = directoryId !== file.directoryId || editableFileKeys.some(key => originalFile[key] !== file[key]);
		hasFileChanged && editedFiles.push({
			id: file.id,
			name: file.name,
			title: file.title,
			alt: file.alt,
			directoryId,
		});
	}

	const deletedDirIds: IPutDirectoriesInput['deletedDirIds'] = [];
	const editedDirs: IPutDirectoriesInput['editedDirs'] = [];

	for (const dir of currentDirDirs.value) {
		if (dir.isBeingDeleted) {
			deletedDirIds.push(dir.id);
			continue;
		}

		const originalDir = originalCurrentDirDirs.value.find(originalDir => originalDir.id === dir.id);
		if (!originalDir) {
			toastGenericError();
			throw new Error('changed dir not found in original current dir dirs');
		}

		const parentId = dir.movedToId !== undefined ? dir.movedToId : originalDir.parentId;
		const hasDirChanged = parentId !== dir.parentId || editableDirKeys.some(key => originalDir[key] !== dir[key]);
		hasDirChanged && editedDirs.push({
			id: dir.id,
			name: dir.name,
			parentId,
		});
	}

	return {
		deletedFileIds,
		editedFiles,
		deletedDirIds,
		editedDirs,
	};
}

function hasChanged() {
	const {
		deletedFileIds,
		editedFiles,
		deletedDirIds,
		editedDirs,
	} = getChanged();

	return !!(
		newFiles.value.length
		|| deletedFileIds.length
		|| editedFiles.length
		|| deletedDirIds.length
		|| editedDirs.length
	);
}

async function saveChanges() {
	isSaving.value = true;
	clearErrors();
	clearNewFilesErrors();

	const {
		deletedFileIds,
		editedFiles,
		deletedDirIds,
		editedDirs,
	} = getChanged();

	if (deletedFileIds.length || editedFiles.length || deletedDirIds.length || editedDirs.length) {
		const responseReturnsData = !newFiles.value.length;
		try {
			const response = await api.directories.$put({
				json: {
					deletedFileIds,
					editedFiles,
					deletedDirIds,
					editedDirs,
				},
			}, {
				headers: responseReturnsData ? { 'return-for-dir': `${currentDirId.value}` } : {},
			});

			if (responseReturnsData) {
				clearLoadedFiles();
				handlePutResponse(await response.json() as IGetDirectoryResponse);
				toast('zapisano zmiany');
			}
		} catch (e) {
			handleError(e);
			// map error keys from array positions to file/dir ids
			errors.value.editedFiles = Object.fromEntries(
				Object.entries(errors.value.editedFiles).map(([key, value]) => {
					return [editedFiles[+key].id, value];
				})
			);
			errors.value.editedDirs = Object.fromEntries(
				Object.entries(errors.value.editedDirs).map(([key, value]) => {
					return [editedDirs[+key].id, value];
				})
			);
			useShake(saveButton.value?.element);
			return;
		} finally {
			isSaving.value = false;
		}
	} else if (!newFiles.value.length) {
		toast('zapisano zmiany');
		isSaving.value = false;
	}

	if (!newFiles.value.length) {
		return;
	}

	isSaving.value = true;
	const formdata = new FormData();
	for (let i = 0; i < newFiles.value.length; i++) {
		const file = newFiles.value[i];
		formdata.append(`file[${i}]`, file.file, file.name);
		formdata.append(`title[${i}]`, file.title);
		formdata.append(`alt[${i}]`, file.alt);
		const directoryId = `${file.movedToId !== undefined ? file.movedToId : currentDirId.value}`;
		formdata.append(`directoryId[${i}]`, directoryId);
	}

	try {
		const response: IGetDirectoryResponse = await fetch(
				`${env.VITE_API_URL}/directories/${currentDirId.value}`,
				{ method: 'post', body: formdata }
		).then(async (r) => {
			if (r.ok) {
				return r;
			}
			const contentType = r.headers.get('content-type');
			if (contentType && contentType.slice(0, 16) === 'application/json') {
				return r.json().then((v) => {
					throw new FetchError(v, r.status);
				});
			}

			return r.text().then((v) => {
				throw new FetchError(v, r.status);
			});
		}).then(r => r.json());
		handlePutResponse(response);
		clearLoadedFiles();
		newFiles.value = [];
		toast('zuploadowano pliki');
	} catch (e) {
		handleNewFilesError(e);
		useShake(saveButton.value?.element);
	} finally {
		isSaving.value = false;
	}
}

function handlePutResponse(data: IGetDirectoryResponse) {
	const { directories, files } = data;
	allDirectories.value = directories;

	originalCurrentDirDirs.value = directories.filter(dir => dir.parentId === currentDirId.value).map(dir => structuredClone(dir));
	currentDirDirs.value = originalCurrentDirDirs.value.map(dir => structuredClone(dir));

	originalCurrentDirFiles.value = files.map(file => structuredClone(file));
	currentDirFiles.value = files.map(file => structuredClone(file));
}

async function goToDir(id: number | null, event: MouseEvent) {
	const targetDir = allDirectories.value.find(dir => dir.id === id);
	if (id !== null && !targetDir) {
		toastGenericError();
		throw new Error('target dir not found');
	}

	if (id !== currentDirId.value && hasChanged()) {
		const target = event.target as HTMLElement;
		if (!target) {
			console.warn('no dir link element found');
		}

		const proceed = await confirm(target, {
			text: `Masz niezapisane zmiany. Czy na pewno chcesz przejść do folderu ${targetDir?.name || 'root'}?`,
			okText: 'przejdź',
		});
		if (!proceed) {
			return;
		}
	}

	clearErrors();
	clearCreateDirErrors();
	clearNewFilesErrors();
	newFiles.value = [];
	await router.push(id ? { query: { dir: id } } : {});
}
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="mx-auto max-w-360 w-full flex gap-x-3 px-container md:px-0">
			<p class="mr-auto text-lg dark:text-neutral-3 text-neutral-5 md:ml-container self-center">
				<template v-for="{ id, isActive, text } in pathBreadcrumbs" :key="id">
					<a
						:href="id ? `?dir=${id}` : ''"
						:class="isActive ? 'text-black dark:text-white underline' : ''"
						class="hoverable:underline hoverable:text-black dark:hoverable:text-white"
						@click.left.prevent="goToDir(id, $event)"
					>
						{{ text }}
					</a>
					<br v-if="!isActive" class="sm:hidden">
					<span v-if="!isActive" class="i-fa6-solid-angle-right inline-block w-3 h-3 mr-1 -ml-[0.125rem] sm:ml-1" />
				</template>
			</p>
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
				:is-loading="isSaving"
				:disabled="computedIsLoading"
				@click="saveChanges"
			>
				zapisz
			</VButton>
		</div>
		<div
			ref="container"
			class="relative mx-auto max-w-360 w-full gap-x-5 px-container"
			:class="classContainer"
			aria-live="polite"
			:aria-busy="computedIsLoading || isSaving"
		>
			<div
				class="relative row-span-5 flex flex-col of-hidden border-2 border-neutral rounded-lg shadow"
				:class="isTiles ? '' : 'md:flex-row'"
			>
				<div class="flex basis-1/2 flex-col items-center justify-center border-b border-neutral px-3 py-4" :class="isTiles ? 'gap-4' : 'md:flex-row md:gap-3 md:border-b-0 md:border-r'">
					<VInput
						id="newDirName"
						v-model="newDirName"
						label="nazwa folderu"
						:error="createDirErrors.name || createDirErrors.parentId"
						:disabled="computedIsLoading"
						@update:model-value="clearCreateDirErrors"
					/>
					<VButton
						class="h-fit shrink-0 neon-green"
						:class="isTiles ? '' : 'md:mt-[1.625rem]'"
						:disabled="computedIsLoading"
						:is-loading="isSavingDir"
						@click="createDir"
					>
						dodaj folder
					</VButton>
				</div>
				<div
					class="relative flex basis-1/2 items-center justify-center border-t border-neutral px-3 py-4 after:(absolute font-semibold text-neutral-5 dark:text-neutral-3) before:(absolute inset-0 border-neutral border-dashed content-empty)"
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
					<VButton v-show="!isDraggingOverFiles" class="neon-blue" :disabled="computedIsLoading" @click="openFileInput">
						wgraj pliki
					</VButton>
				</div>
				<VLoading v-if="computedIsLoading" class="absolute inset-0 bg-black/10 dark:bg-white/10" size="40" />
			</div>
			<FilesDirItem
				v-for="(dir, index) in currentDirDirs"
				:key="dir.id"
				v-model="currentDirDirs[index]"
				v-model:errors="errors.editedDirs[dir.id]"
				:index="index"
				:is-tiles="isTiles"
				:original-dir="originalCurrentDirDirs[index]"
				:grabbed-item="grabbedItem"
				:is-grabbing="!!grabPreviewElement"
				@delete="deleteDir"
				@restore="restoreDir"
				@move="grabFile"
				@open-dialog="openFilesDialog"
				@go-to="goToDir"
			/>
			<FilesFileItem
				v-for="(file, index) in newFiles"
				:key="file.path"
				v-model="newFiles[index]"
				v-model:errors="newFilesErrors.newFiles[index]"
				:index="index"
				:is-tiles="isTiles"
				:grabbed-item="grabbedItem"
				@delete="deleteFile"
				@restore="restoreFile"
				@move="grabFile"
				@open-dialog="openFilesDialog"
			/>
			<FilesFileItem
				v-for="(file, index) in currentDirFiles"
				:key="file.id"
				v-model="currentDirFiles[index]"
				v-model:errors="errors.editedFiles[file.id]"
				:index="index"
				:is-tiles="isTiles"
				:original-file="originalCurrentDirFiles[index]"
				:grabbed-item="grabbedItem"
				@delete="deleteFile"
				@restore="restoreFile"
				@move="grabFile"
				@open-dialog="openFilesDialog"
			/>
		</div>
	</main>
	<VDialog
		ref="dialog"
		:activator="dialogActivator"
		no-open-button
		class-container="grid grid-cols-2 gap-x-2 gap-y-3"
		class-close-button="justify-self-end"
		close-button-text="anuluj"
		@close="cleanupDrag"
	>
		<h3 class="col-span-full text-center text-5 font-600">
			przenieś do
		</h3>
		<VInput
			id="dirDialogSearch"
			v-model="dialogSearch"
			label="szukaj"
			class="col-span-full mb-3"
			suffix-icon="i-solar-magnifer-linear"
			label-visually-hidden
		/>
		<label
			v-for="dir in dialogAllDirs"
			:key="dir.id"
			:for="`dirCheckbox${dir.id}`"
			class="col-span-full flex justify-between border-2 relative border-neutral rounded-lg px-2 py-2"
			:class="[
				dialogTargetId === dir.id ? '!border-black dark:!border-white bg-blue/30' : '',
				dir.isBeingDeleted ? 'text-neutral border-op-50' : 'focus-within:border-black hover:border-black dark:focus-within:border-white dark:hover:border-white',
			]"
		>
			{{ dir.name + (dir.isBeingDeleted ? ' (usuwany)' : '') }}
			<input
				:id="`dirCheckbox${dir.id}`"
				type="radio"
				name="dialogTargetId"
				:class="dir.isBeingDeleted ? 'op-0' : ''"
				:checked="dialogTargetId === dir.id"
				:disabled="dir.isBeingDeleted"
				@input="dialogTargetId = dir.id"
			>
			<div v-if="dir.isBeingDeleted" class="i-solar-trash-bin-trash-linear absolute top-1/2 -translate-y-1/2 right-[0.3125rem] w-5 h-5 text-red-6 dark:text-red-5 pointer-events-none" />
		</label>

		<template #post>
			<VButton class="justify-self-start neon-green" @click="moveGrabbedElement(dialogTargetId, true)">
				zapisz
			</VButton>
		</template>
	</VDialog>
</template>
