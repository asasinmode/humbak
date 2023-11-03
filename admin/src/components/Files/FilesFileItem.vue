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
		<img :src="file.name" :title="file.title" :alt="file.alt" class="object-cover" :class="classes.image">
		<VInput
			:id="`file${file.id}title`"
			v-model="file.title"
			label="tytuł"
			:class="classes.input"
		/>
		<VInput
			:id="`file${file.id}alt`"
			v-model="file.alt"
			label="alt"
			:class="classes.input"
		/>
		<VInput
			:id="`file${file.id}name`"
			v-model="file.name"
			label="nazwa"
			:class="classes.input"
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
