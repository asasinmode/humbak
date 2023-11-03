<script setup lang="ts">
import type { IFile } from '~/composables/useApi';

const props = defineProps<{
	isTiles: boolean;
	filesToDelete: number[];
}>();

defineEmits<{
	delete: [number];
	restore: [number];
}>();

const file = defineModel<IFile>({ required: true });
const classes = useFilesLayoutClasses(computed(() => props.isTiles));

const isBeingDeleted = computed(() => props.filesToDelete.includes(file.value.id));
</script>

<template>
	<article
		class="of-hidden border-2 border-neutral rounded-lg shadow"
		:class="classes.child"
	>
		<div class="relative" :class="classes.image">
			<img
				:src="file.name"
				:title="file.title"
				:alt="file.alt"
				class="h-full w-full object-cover"
				:class="isBeingDeleted ? 'grayscale-100 brightness-60' : ''"
			>
			<div v-if="isBeingDeleted" class="i-solar-trash-bin-trash-linear absolute left-1/2 top-1/2 h-full w-full translate-center text-red drop-shadow" />
		</div>
		<VInput
			:id="`file${file.id}title`"
			v-model="file.title"
			label="tytuł"
			:class="classes.input"
			:disabled="isBeingDeleted"
		/>
		<VInput
			:id="`file${file.id}alt`"
			v-model="file.alt"
			label="alt"
			:class="classes.input"
			:disabled="isBeingDeleted"
		/>
		<VInput
			:id="`file${file.id}name`"
			v-model="file.name"
			label="nazwa"
			:class="classes.input"
			:disabled="isBeingDeleted"
		/>
		<VButton v-if="isBeingDeleted" class="neon-yellow" :class="classes.restoreButton" @click="$emit('restore', file.id)">
			przywróć
		</VButton>
		<template v-else>
			<VButton
				class="justify-self-end neon-red"
				:class="classes.deleteButton"
				@click="$emit('delete', file.id)"
			>
				usuń
			</VButton>
			<VButton class="w-fit neon-blue" :class="classes.moveButton">
				przenieś
			</VButton>
		</template>
	</article>
</template>
