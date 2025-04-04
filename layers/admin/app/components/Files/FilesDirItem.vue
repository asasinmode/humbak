<script setup lang="ts">
const props = defineProps<{
	isTiles: boolean;
	index: number;
	isGrabbing: boolean;
	grabbedItem?: IFilesGrabbedItem;
	originalDir?: IDirectory;
}>();

defineEmits<{
	delete: [number];
	restore: [number];
	move: [number, MouseEvent, string, boolean];
	openDialog: [number, KeyboardEvent, boolean];
	goTo: [number, MouseEvent];
}>();

const dir = defineModel<ILocalDirectory>({ required: true });
const classes = useFilesLayoutClasses(computed(() => props.isTiles));

const errors = defineModel<Record<string, string>>('errors');
function clearErrors(...keys: (keyof IDirectory)[]) {
	for (const key of keys) {
		if (errors.value?.[key]) {
			errors.value[key] = '';
		}
	}
}

const hasMoved = computed(() => dir.value.movedToId !== undefined);
const disableInteractions = computed(() => dir.value.isBeingDeleted || hasMoved.value);
const applyHoverClasses = computed(() =>
	!dir.value.isBeingDeleted
	&& props.isGrabbing
	&& props.grabbedItem
	&& (!props.grabbedItem.isDir || props.grabbedItem.index !== props.index),
);

const hasChanged = computed(() =>
	hasMoved.value
	|| (props.originalDir
		&& (dir.value.name !== props.originalDir.name)),
);

function cancelMove() {
	dir.value.movedToId = undefined;
	clearErrors('parentId', 'name');
}
</script>

<template>
	<div
		class="relative of-hidden border-2 rounded-lg shadow before:(pointer-events-none absolute inset-0 z-10 border-neutral border-dashed content-empty) after:(absolute left-1/2 top-1/2 text-neutral-7 font-semibold -translate-x-1/2 dark:text-neutral-3)"
		:class="[
			classes.child,
			applyHoverClasses ? `hover:after:content-['przenieś_plik'] hover:before:border-3 hover:before:bg-black/10 dark:hover:before:bg-white/10` : '',
			hasChanged ? 'border-blue' : 'border-neutral',
		]"
		:data-dir-id="dir.id"
	>
		<div
			class="relative flex-center self-start"
			:class="[classes.image, disableInteractions ? 'bg-black/20 dark:bg-white/10' : 'bg-black/15 dark:bg-white/15']"
		>
			<div
				class="i-solar-folder-with-files-bold h-4/5 w-4/5"
				:class="disableInteractions ? 'text-neutral' : ''"
			/>
			<div
				v-if="dir.isBeingDeleted"
				class="i-solar-trash-bin-trash-linear absolute left-1/2 top-1/2 size-full translate-center text-red-5 drop-shadow dark:text-red"
			/>
			<div
				v-if="hasMoved"
				class="i-solar-move-to-folder-bold absolute left-1/2 top-1/2 size-full translate-center text-blue drop-shadow"
			/>
		</div>
		<AdminVInput
			:id="`dir${dir.id}name`"
			v-model="dir.name"
			label="nazwa"
			:class="classes.input"
			:disabled="disableInteractions"
			:error="errors?.name || errors?.id || errors?.parentId"
			@update:model-value="clearErrors('id', 'parentId', 'name')"
		/>
		<a
			:href="`?dir=${dir.id}`"
			class="px-3 py-1 text-center shadow neon-green"
			:class="[classes.goToDirButton, disableInteractions ? 'pointer-events-none border-op-30 bg-op-20 op-90 text-neutral-5 dark:(border-op-30 bg-op-20 text-neutral-4)' : '']"
			:tabindex="disableInteractions ? '-1' : '0'"
			@click.left.prevent="$emit('goTo', dir.id, $event)"
		>
			przejdź do
		</a>
		<AdminVButton v-if="dir.isBeingDeleted" class="row-span-2 neon-yellow" :class="classes.restoreButton" @click="$emit('restore', index)">
			przywróć
		</AdminVButton>
		<AdminVButton v-else-if="hasMoved" class="neon-yellow" :class="classes.restoreButton" @click="cancelMove">
			anuluj
		</AdminVButton>
		<template v-else>
			<AdminVButton
				class="justify-self-end neon-red"
				:class="classes.deleteButton"
				@click="$emit('delete', index)"
			>
				usuń
			</AdminVButton>
			<AdminVButton
				class="w-fit neon-blue"
				:class="classes.moveButton"
				@mousedown.left="$emit('move', index, $event, 'directory', false)"
				@keydown.enter.prevent="$emit('openDialog', index, $event, true)"
				@keydown.space.prevent="$emit('openDialog', index, $event, true)"
			>
				przenieś
			</AdminVButton>
		</template>
	</div>
</template>
