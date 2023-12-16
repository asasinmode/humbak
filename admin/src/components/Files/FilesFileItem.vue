<script setup lang="ts">
import { knownMimetypeExtensions } from '~/helpers';
import type { IFile } from '~/composables/useApi';
import type { IFilesGrabbedItem, ILocalFile, INewFile } from '~/types';

const props = defineProps<{
	index: number;
	isTiles: boolean;
	originalFile?: IFile;
	grabbedItem?: IFilesGrabbedItem;
}>();

defineEmits<{
	delete: [number, boolean];
	restore: [number];
	move: [number, MouseEvent, string, boolean, string, string];
	openDialog: [number, KeyboardEvent, boolean, boolean];
}>();

const file = defineModel<ILocalFile | INewFile>({ required: true });
const classes = useFilesLayoutClasses(computed(() => props.isTiles));

const isNew = computed(() => (!('id' in file.value) && 'file' in file.value));
const hasMoved = computed(() => (file.value as ILocalFile).movedToId !== undefined);
const disableInteractions = computed(() => (file.value as ILocalFile).isBeingDeleted || hasMoved.value);
const hasChanged = computed(() =>
	!props.originalFile
	|| hasMoved.value
	|| props.originalFile.title !== file.value.title
	|| props.originalFile.alt !== file.value.alt
	|| props.originalFile.name !== file.value.name
);
const isImage = computed(() => file.value.mimetype.slice(0, 5) === 'image');
const path = computed(() => isNew.value ? file.value.path : `public/files/${file.value.path}`);
const nonImageText = computed(() => knownMimetypeExtensions[file.value.mimetype] || file.value.mimetype);
</script>

<template>
	<article
		class="relative of-hidden border-2 rounded-lg shadow"
		:class="[classes.child, hasChanged ? 'border-blue' : 'border-neutral']"
	>
		<div class="relative" :class="classes.image">
			<img
				v-if="isImage"
				:src="path"
				:title="file.title"
				:alt="file.alt"
				class="h-full w-full object-cover"
				:class="disableInteractions ? 'grayscale-100 brightness-60' : ''"
			>
			<span
				v-else
				class="w-full h-full grid place-items-center text-center bg-black/15 hyphens-auto dark:bg-white/15 font-bold"
				:class="isTiles ? 'text-6 p-2 tracking-wide' : 'text-3 px-1'"
				:title="file.title"
				:alt="file.alt"
			>
				{{ nonImageText }}
			</span>
			<div v-if="(file as ILocalFile).isBeingDeleted" class="i-solar-trash-bin-trash-linear absolute left-1/2 top-1/2 h-full w-full translate-center text-red drop-shadow" />
			<div v-if="hasMoved" class="i-solar-move-to-folder-bold absolute left-1/2 top-1/2 h-full w-full translate-center text-blue drop-shadow" />
		</div>
		<VInput
			:id="`file${index}title`"
			v-model="file.title"
			label="tytuł"
			:class="classes.input"
			:disabled="disableInteractions"
		/>
		<VInput
			:id="`file${index}alt`"
			v-model="file.alt"
			label="alt"
			:class="classes.input"
			:disabled="disableInteractions"
		/>
		<VInput
			:id="`file${index}name`"
			v-model="file.name"
			label="nazwa"
			:class="classes.input"
			:disabled="disableInteractions"
		/>
		<VButton
			v-if="(file as ILocalFile).isBeingDeleted"
			class="neon-yellow"
			:class="classes.restoreButton"
			@click="$emit('restore', index)"
		>
			przywróć
		</VButton>
		<VButton v-else-if="hasMoved" class="neon-yellow" :class="classes.restoreButton" @click="file.movedToId = undefined">
			anuluj
		</VButton>
		<template v-else>
			<VButton
				class="justify-self-end neon-red"
				:class="classes.deleteButton"
				@click="$emit('delete', index, isNew)"
			>
				usuń
			</VButton>
			<VButton
				class="w-fit neon-blue"
				:class="classes.moveButton"
				@mousedown.left="$emit('move', index, $event, file.mimetype, isNew, path, file.name)"
				@keydown.enter.prevent="$emit('openDialog', index, $event, false, isNew)"
				@keydown.space.prevent="$emit('openDialog', index, $event, false, isNew)"
			>
				przenieś
			</VButton>
		</template>
	</article>
</template>
