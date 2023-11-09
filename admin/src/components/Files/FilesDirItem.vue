<script setup lang="ts">
import type { IDir } from '~/composables/useApi';

const props = defineProps<{
	isTiles: boolean;
	index: number;
	grabbedItem?: {
		index: number;
		isDir: boolean;
		isNew: boolean;
		preview?: HTMLElement;
	};
}>();

defineEmits<{
	delete: [number];
	restore: [number];
}>();

const dir = defineModel<IDir>({ required: true });
const classes = useFilesLayoutClasses(computed(() => props.isTiles));
const applyHoverClasses = computed(() =>
	props.grabbedItem?.preview && (!props.grabbedItem.isDir || props.grabbedItem.index !== props.index)
);
</script>

<template>
	<div
		class="relative of-hidden border-2 border-neutral rounded-lg shadow before:(pointer-events-none absolute inset-0 z-10 border-neutral border-dashed content-empty) after:(absolute left-1/2 top-1/2 font-semibold text-neutral-5 -translate-x-1/2 dark:text-neutral-3)"
		:class="[
			classes.child,
			applyHoverClasses ? `hover:after:content-['przenieś_plik'] hover:before:border-3 hover:before:bg-black/10 dark:hover:before:bg-white/10` : '',
		]"
	>
		<div class="relative flex-center self-start bg-black/15 dark:bg-white/15" :class="classes.image">
			<div class="i-solar-folder-with-files-bold h-4/5 w-4/5" :class="dir.isBeingDeleted ? 'text-neutral' : ''" />
			<div v-if="dir.isBeingDeleted" class="i-solar-trash-bin-trash-linear absolute left-1/2 top-1/2 h-full w-full translate-center text-red drop-shadow" />
		</div>
		<VInput
			:id="`dir${dir.id}name`"
			v-model="dir.name"
			class="row-span-3"
			label="nazwa"
			:class="classes.input"
			:disabled="dir.isBeingDeleted"
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
			<VButton class="w-fit neon-blue" :class="classes.moveButton">
				przenieś
			</VButton>
		</template>
	</div>
</template>
