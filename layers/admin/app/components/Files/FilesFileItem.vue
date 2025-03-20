<script setup lang="ts">
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

const errors = defineModel<Record<string, string>>('errors');
function clearErrors(...keys: (keyof (IFile & { file: INewFile['file'] }))[]) {
	for (const key of keys) {
		if (errors.value?.[key]) {
			errors.value[key] = '';
		}
	}
}

const isNew = computed(() => (!('id' in file.value) && 'file' in file.value));
const hasMoved = computed(() => (file.value as ILocalFile).movedToId !== undefined);
const disableInteractions = computed(() => (file.value as ILocalFile).isBeingDeleted || hasMoved.value);
const hasChanged = computed(() =>
	!props.originalFile
	|| hasMoved.value
	|| props.originalFile.title !== file.value.title
	|| props.originalFile.alt !== file.value.alt
	|| props.originalFile.name !== file.value.name,
);
const isImage = computed(() => file.value.mimetype.slice(0, 5) === 'image');
const path = computed(() => isNew.value ? file.value.path : `/files${file.value.path}`);
const nonImageText = computed(() => knownMimetypeExtensions[file.value.mimetype] || file.value.mimetype || '?');

function cancelMove() {
	file.value.movedToId = undefined;
	clearErrors('directoryId', 'name');
}

const srcSet = computed(() => {
	if (!isNew.value && file.value.mimetype !== 'image/gif' && file.value.mimetype !== 'image/svg+xml') {
		const pathWithoutExtension = getPathWithoutExtension(path.value);
		return `${pathWithoutExtension}_500.webp 500w, ${pathWithoutExtension}_800.webp 800w, ${pathWithoutExtension}_1040.webp 1040w, ${pathWithoutExtension}_1280.webp 1280w`;
	}
});

const sizes = computed(() => {
	if (!isNew.value && file.value.mimetype !== 'image/gif' && file.value.mimetype !== 'image/svg+xml') {
		return '(max-width: 480px) 500px, (max-width: 768px) 800px, (max-width: 960px) 1040px, 1280px';
	}
});
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
				:class="disableInteractions ? 'grayscale-100 brightness-60' : ''"
				:srcset="srcSet"
				:sizes="sizes"
				:width="(file as any).width ?? undefined"
				:height="(file as any).height ?? undefined"
				class="size-full object-cover"
			>
			<span
				v-else
				class="grid size-full place-items-center bg-black/15 text-center font-bold hyphens-auto dark:bg-white/15"
				:class="[isTiles ? 'text-6 p-2 tracking-wide' : 'text-3 px-1', disableInteractions ? 'text-neutral' : '']"
				:title="file.title"
				:alt="file.alt"
			>
				{{ nonImageText }}
			</span>
			<div v-if="(file as ILocalFile).isBeingDeleted" class="i-solar-trash-bin-trash-linear absolute left-1/2 top-1/2 size-full translate-center text-red-5 drop-shadow dark:text-red" />
			<div v-if="hasMoved" class="i-solar-move-to-folder-bold absolute left-1/2 top-1/2 size-full translate-center text-blue drop-shadow" />
		</div>
		<a
			class="absolute right-0 top-0 border-b-2 border-l-2 border-r-0 rounded-bl-1 bg-blue p-[0.125rem] hoverable:text-blue-6"
			:class="hasChanged ? 'border-blue' : 'border-neutral'"
			title="pobierz"
			:href="path"
			:download="file.name"
			target="_blank"
		>
			<span class="sr-only">pobierz</span>
			<div class="i-fluent-arrow-download-16-filled h-5 w-5" />
		</a>
		<AdminVInput
			:id="`file${index}title`"
			v-model="file.title"
			label="tytuł"
			:class="classes.input"
			:disabled="disableInteractions"
			:error="errors?.title"
			@update:model-value="clearErrors('title')"
		/>
		<AdminVInput
			:id="`file${index}alt`"
			v-model="file.alt"
			label="alt"
			:class="classes.input"
			:disabled="disableInteractions"
			:error="errors?.alt"
			@update:model-value="clearErrors('alt')"
		/>
		<AdminVInput
			:id="`file${index}name`"
			v-model="file.name"
			label="nazwa"
			:class="classes.input"
			:disabled="disableInteractions"
			:error="errors?.id || errors?.directoryId || errors?.name || errors?.file"
			@update:model-value="clearErrors('id', 'directoryId', 'name', 'file')"
		/>
		<AdminVButton
			v-if="(file as ILocalFile).isBeingDeleted"
			class="neon-yellow"
			:class="classes.restoreButton"
			@click="$emit('restore', index)"
		>
			przywróć
		</AdminVButton>
		<AdminVButton v-else-if="hasMoved" class="neon-yellow" :class="classes.restoreButton" @click="cancelMove">
			anuluj
		</AdminVButton>
		<template v-else>
			<AdminVButton
				class="justify-self-end neon-red"
				:class="classes.deleteButton"
				@click="$emit('delete', index, isNew)"
			>
				usuń
			</AdminVButton>
			<AdminVButton
				class="w-fit neon-blue"
				:class="classes.moveButton"
				@mousedown.left="$emit('move', index, $event, file.mimetype, isNew, path, file.name)"
				@keydown.enter.prevent="$emit('openDialog', index, $event, false, isNew)"
				@keydown.space.prevent="$emit('openDialog', index, $event, false, isNew)"
			>
				przenieś
			</AdminVButton>
		</template>
	</article>
</template>
