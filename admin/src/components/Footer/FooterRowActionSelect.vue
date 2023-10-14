<script setup lang="ts">
const props = defineProps<{
	id: number;
	title: string;
}>();

const emit = defineEmits<{
	edit: [];
	delete: [];
}>();

const options = [
	{
		text: 'edytuj',
		value: () => emit('edit'),
		class: 'hoverable:!bg-blue',
	},
	{
		text: 'usuń',
		value: () => emit('delete'),
		class: 'hoverable:!bg-red',
	},
];

const container = ref<HTMLDivElement>();
const toggle = ref<HTMLButtonElement>();

const isExpanded = ref(false);
const cursoredOverIndex = ref<number>();

function focusCursoredOver() {
	document.getElementById(`footerRowActions${props.id}Action${cursoredOverIndex.value}`)?.focus();
}

function moveCursor(value: number, focusCursoredItemIfExpanding = false) {
	if (!isExpanded.value) {
		cursoredOverIndex.value = undefined;
		isExpanded.value = true;

		if (focusCursoredItemIfExpanding) {
			cursoredOverIndex.value = value > 0 ? 0 : options.length - 1;
			focusCursoredItemIfExpanding && nextTick(() =>
				focusCursoredOver()
			);
		}

		return;
	}

	if (cursoredOverIndex.value === undefined) {
		cursoredOverIndex.value = value > 0 ? 0 : options.length - 1;
	} else {
		cursoredOverIndex.value = (cursoredOverIndex.value + value) % options.length;
		if (cursoredOverIndex.value < 0) {
			cursoredOverIndex.value = options.length + cursoredOverIndex.value;
		}
	}

	focusCursoredOver();
}

function closeIfFocusedOutside(event: FocusEvent) {
	const target = event.relatedTarget as HTMLElement | null;
	if (!target || !container.value || !container.value.contains(target)) {
		isExpanded.value = false;
	}
}

function toggleExpanded() {
	if (isExpanded.value) {
		isExpanded.value = false;
	} else {
		isExpanded.value = true;
		cursoredOverIndex.value = undefined;
	}
}

function collapseAndFocusToggle() {
	isExpanded.value = false;
	toggle.value?.focus();
}

function handleHomeEndKeys(e: KeyboardEvent) {
	if (!isExpanded.value) {
		return;
	}

	if (e.key === 'Home') {
		cursoredOverIndex.value = 0;
		focusCursoredOver();
		e.preventDefault();
	} else if (e.key === 'End') {
		cursoredOverIndex.value = options.length - 1;
		focusCursoredOver();
		e.preventDefault();
	}
}

function selectOption(index?: number) {
	if (index === undefined) {
		return;
	}

	options[index].value();
	isExpanded.value = false;
	cursoredOverIndex.value = undefined;
}
</script>

<template>
	<div
		ref="container"
		class="relative"
		:style="`z-index: ${25 - id}`"
		:title="`akcje dla ${title}`"
		@keydown.esc="collapseAndFocusToggle"
		@keydown.up.prevent="moveCursor(-1, true)"
		@keydown.left.prevent="moveCursor(-1)"
		@keydown.down.prevent="moveCursor(1, true)"
		@keydown.right.prevent="moveCursor(1)"
		@keydown.space="selectOption(cursoredOverIndex)"
		@keydown.enter="selectOption(cursoredOverIndex)"
		@focusout="closeIfFocusedOutside"
	>
		<button
			:id="`footerRowExpandActions${id}`"
			ref="toggle"
			class="relative h-8 w-8 cursor-pointer border-2 border-blue-5 rounded-1/2 bg-blue shadow hoverable:(brightness-110)"
			aria-haspopup="menu"
			:aria-controls="`footerRowActions${id}`"
			:aria-expanded="isExpanded"
			@click.prevent="toggleExpanded"
		>
			<span class="visually-hidden">akcje dla {{ title }}</span>
			<div class="i-mdi-wrench absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
		</button>

		<ul
			v-show="isExpanded"
			:id="`footerRowActions${id}`"
			class="absolute left-1/2 z-1 flex translate-y-full of-hidden border-2 border-neutral-7 border-op-80 rounded-md bg-white shadow-md -bottom-1 -translate-x-1/2"
			role="menu"
			aria-orientation="horizontal"
			:aria-activedescendant="cursoredOverIndex !== undefined ? `footerRowActionsAction${cursoredOverIndex}` : undefined"
			:aria-labelledby="`footerRowExpandActions${id}`"
			@keydown="handleHomeEndKeys"
		>
			<li
				v-for="(option, index) in options"
				:key="option.text"
				class="flex-1 select-none"
				:class="option.class"
				role="presentation"
				@focusin="cursoredOverIndex = index"
			>
				<button
					:id="`footerRowActions${id}Action${index}`"
					role="menuitem"
					class="h-full w-full bg-neutral-4 px-2 py-1"
					:class="option.class"
				>
					{{ option.text }}
				</button>
			</li>
		</ul>
	</div>
</template>
