<script setup lang="ts">
import type { IFilesGrabbedItem } from '~/types';
import type { IFile, INewFile } from '~/composables/useApi';

const props = defineProps<{
	index: number;
	isTiles: boolean;
	originalFile?: IFile;
	grabbedItem?: IFilesGrabbedItem;
}>();

defineEmits<{
	delete: [number, boolean];
	restore: [number];
	move: [number, MouseEvent, boolean, string];
}>();

const file = defineModel<IFile | INewFile>({ required: true });
const classes = useFilesLayoutClasses(computed(() => props.isTiles));

const isNew = computed(() => (!('id' in file.value) && 'file' in file.value));
const hasMoved = computed(() => file.value.movedTo !== undefined);
const disableInteractions = computed(() => file.value.isBeingDeleted || hasMoved.value);
const hasChanged = computed(() =>
	!props.originalFile
	|| hasMoved.value
	|| props.originalFile.title !== file.value.title
	|| props.originalFile.alt !== file.value.alt
	|| props.originalFile.name !== file.value.name
);
</script>

<template>
	<article
		class="relative of-hidden border-2 rounded-lg shadow"
		:class="[classes.child, hasChanged ? 'border-blue' : 'border-neutral']"
	>
		<div class="relative" :class="classes.image">
			<img
				:src="file.src"
				:title="file.title"
				:alt="file.alt"
				class="h-full w-full object-cover"
				:class="disableInteractions ? 'grayscale-100 brightness-60' : ''"
			>
			<div v-if="file.isBeingDeleted" class="i-solar-trash-bin-trash-linear absolute left-1/2 top-1/2 h-full w-full translate-center text-red drop-shadow" />
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
			v-if="file.isBeingDeleted"
			class="neon-yellow"
			:class="classes.restoreButton"
			@click="$emit('restore', index)"
		>
			przywróć
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
				@mousedown.left="$emit('move', index, $event, isNew, file.src)"
			>
				przenieś
			</VButton>
		</template>
	</article>
</template>
