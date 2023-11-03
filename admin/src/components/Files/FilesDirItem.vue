<script setup lang="ts">
import type { IDir } from '~/composables/useApi';

const props = defineProps<{
	isTiles: boolean;
	dirsToDelete: number[];
}>();

defineEmits<{
	delete: [number];
	restore: [number];
}>();

const dir = defineModel<IDir>({ required: true });
const classes = useFilesLayoutClasses(computed(() => props.isTiles));

const isBeingDeleted = computed(() => props.dirsToDelete.includes(dir.value.id));
</script>

<template>
	<div
		class="of-hidden border-2 border-neutral rounded-lg shadow"
		:class="classes.child"
	>
		<div class="flex-center self-start" :class="classes.image">
			<div class="i-solar-folder-with-files-bold h-4/5 w-4/5" />
		</div>
		<VInput
			:id="`dir${dir.id}name`"
			v-model="dir.name"
			class="row-span-3"
			label="nazwa"
			:class="classes.input"
		/>
		<VButton v-if="isBeingDeleted" class="neon-yellow" :class="classes.restoreButton" @click="$emit('restore', dir.id)">
			przywróć
		</VButton>
		<template v-else>
			<VButton
				class="justify-self-end neon-red"
				:class="classes.deleteButton"
				@click="$emit('delete', dir.id)"
			>
				usuń
			</VButton>
			<VButton class="w-fit neon-blue" :class="classes.moveButton">
				przenieś
			</VButton>
		</template>
	</div>
</template>
