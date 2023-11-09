<script setup lang="ts">
import type { IFilesGrabbedItem } from '~/types';
import type { IDir } from '~/composables/useApi';

const props = defineProps<{
	isTiles: boolean;
	index: number;
	grabbedItem?: IFilesGrabbedItem;
	originalDir?: IDir;
}>();

defineEmits<{
	delete: [number];
	restore: [number];
	move: [number, MouseEvent, boolean];
}>();

const dir = defineModel<IDir>({ required: true });
const classes = useFilesLayoutClasses(computed(() => props.isTiles));

const hasMoved = computed(() => dir.value.movedTo !== undefined);
const disableInteractions = computed(() => dir.value.isBeingDeleted || hasMoved.value);
const applyHoverClasses = computed(() =>
	!disableInteractions.value && props.grabbedItem?.preview && (!props.grabbedItem.isDir || props.grabbedItem.index !== props.index)
);

const hasChanged = computed(() =>
	hasMoved.value
	|| !props.originalDir
	|| dir.value.name !== props.originalDir.name
);
</script>

<template>
	<div
		class="relative of-hidden border-2 rounded-lg shadow before:(pointer-events-none absolute inset-0 z-10 border-neutral border-dashed content-empty) after:(absolute left-1/2 top-1/2 font-semibold text-neutral-5 -translate-x-1/2 dark:text-neutral-3)"
		:class="[
			classes.child,
			applyHoverClasses ? `hover:after:content-['przenieś_plik'] hover:before:border-3 hover:before:bg-black/10 dark:hover:before:bg-white/10` : '',
			hasChanged ? 'border-blue' : 'border-neutral',
		]"
	>
		<div
			class="relative flex-center self-start"
			:class="[classes.image, disableInteractions ? 'bg-black/20 dark:bg-white/10' : 'bg-black/15 dark:bg-white/15']"
		>
			<div
				class="i-solar-folder-with-files-bold h-4/5 w-4/5"
				:class="disableInteractions ? 'text-neutral' : ''"
			/>
			<div v-if="dir.isBeingDeleted" class="i-solar-trash-bin-trash-linear absolute left-1/2 top-1/2 h-full w-full translate-center text-red drop-shadow" />
			<div v-if="hasMoved" class="i-solar-move-to-folder-bold absolute left-1/2 top-1/2 h-full w-full translate-center text-blue drop-shadow" />
		</div>
		<VInput
			:id="`dir${dir.id}name`"
			v-model="dir.name"
			class="row-span-3"
			label="nazwa"
			:class="classes.input"
			:disabled="disableInteractions"
		/>
		<VButton v-if="dir.isBeingDeleted" class="neon-yellow" :class="classes.restoreButton" @click="$emit('restore', index)">
			przywróć
		</VButton>
		<template v-else>
			<VButton
				class="justify-self-end neon-red"
				:class="classes.deleteButton"
				@click="$emit('delete', index)"
			>
				usuń
			</VButton>
			<VButton
				class="w-fit neon-blue"
				:class="classes.moveButton"
				@mousedown.left="$emit('move', index, $event, false)"
			>
				przenieś
			</VButton>
		</template>
	</div>
</template>
