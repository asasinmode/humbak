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

const classes = computed(() => {
	let container = 'grid grid-rows-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)_auto_auto_auto_auto] grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-y-4';
	let child = 'grid grid-cols-2 gap-x-3 grid-rows-[subgrid] pb-4 gap-y-3 row-span-5 items-center';
	let image = 'w-full h-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)] mb-1 col-span-full';
	let input = 'col-span-full self-start mx-3';
	const baseButton = 'mt-3 h-fit w-fit';
	let deleteButton = baseButton;
	let moveButton = baseButton;
	let restoreButton = baseButton;

	if (!props.isTiles) {
		container += ' md:flex md:flex-col';
		child += ' md:flex md:gap-3 md:pr-4 md:pb-0';
		image += ' md:h-20 md:w-20 md:mb-0';
		input += ' md:self-auto md:mx-0';
		deleteButton += ' md:ml-3 md:mt-auto md:mb-[0.625rem]';
		moveButton += ' md:mt-auto md:mb-[0.625rem]';
		restoreButton += ' md:ml-3 md:mt-auto md:mb-[0.625rem]';
	} else {
		deleteButton += ' mr-2';
		moveButton += ' -ml-2';
		restoreButton += ' mx-auto col-span-full';
	}

	return { container, child, image, input, deleteButton, moveButton, restoreButton };
});
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
		<template v-if="!filesToDelete.includes(file.id)">
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
		<VButton v-else class="neon-yellow" :class="classes.restoreButton" @click="$emit('restore', file.id)">
			przywróć
		</VButton>
	</article>
</template>
