<script setup lang="ts">
import type { IFile, INewFile } from '~/composables/useApi';

const props = defineProps<{
	index: number;
	isTiles: boolean;
	originalFile?: IFile;
}>();

defineEmits<{
	delete: [number, boolean];
	restore: [number];
}>();

const file = defineModel<IFile | INewFile>({ required: true });
const classes = useFilesLayoutClasses(computed(() => props.isTiles));

const isNew = computed(() => (!('id' in file.value) && 'file' in file.value));
const hasChanged = computed(() =>
	!props.originalFile
	|| props.originalFile.title !== file.value.title
	|| props.originalFile.alt !== file.value.alt
	|| props.originalFile.name !== file.value.name

);
</script>

<template>
	<article
		class="of-hidden border-2 rounded-lg shadow"
		:class="[classes.child, hasChanged ? 'border-blue' : 'border-neutral']"
	>
		<div class="relative" :class="classes.image">
			<img
				:src="file.src"
				:title="file.title"
				:alt="file.alt"
				class="h-full w-full object-cover"
				:class="file.isBeingDeleted ? 'grayscale-100 brightness-60' : ''"
			>
			<div v-if="file.isBeingDeleted" class="i-solar-trash-bin-trash-linear absolute left-1/2 top-1/2 h-full w-full translate-center text-red drop-shadow" />
		</div>
		<VInput
			:id="`file${index}title`"
			v-model="file.title"
			label="tytuł"
			:class="classes.input"
			:disabled="file.isBeingDeleted"
		/>
		<VInput
			:id="`file${index}alt`"
			v-model="file.alt"
			label="alt"
			:class="classes.input"
			:disabled="file.isBeingDeleted"
		/>
		<VInput
			:id="`file${index}name`"
			v-model="file.name"
			label="nazwa"
			:class="classes.input"
			:disabled="file.isBeingDeleted"
		/>
		<VButton v-if="file.isBeingDeleted" class="neon-yellow" :class="classes.restoreButton" @click="$emit('restore', index)">
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
			<VButton class="w-fit neon-blue" :class="classes.moveButton">
				przenieś
			</VButton>
		</template>
	</article>
</template>
