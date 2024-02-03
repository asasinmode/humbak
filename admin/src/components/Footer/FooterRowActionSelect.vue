<script setup lang="ts">
const props = defineProps<{
	index: number;
	title: string;
	type: 'email' | 'phone' | 'location';
}>();

const emit = defineEmits<{
	edit: [];
	delete: [];
}>();

const options = [
	{ text: 'edytuj', value: () => emit('edit'), class: 'hoverable:!bg-blue' },
];

if (props.type !== 'location') {
	options.push({
		text: 'usuń',
		value: () => emit('delete'),
		class: 'hoverable:!bg-red',
	});
}

const container = ref<HTMLDivElement>();
const toggle = ref<HTMLButtonElement>();

const isExpanded = ref(false);
const cursoredOverIndex = ref<number>();

function focusCursoredOver() {
	document.getElementById(`footerRowActions${props.type}${props.index}-${cursoredOverIndex.value}`)?.focus();
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
	cursoredOverIndex.value = undefined;
	if (isExpanded.value) {
		isExpanded.value = false;
	} else {
		isExpanded.value = true;
	}
}

function collapseAndFocusToggle() {
	isExpanded.value = false;
	cursoredOverIndex.value = undefined;
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
		toggleExpanded();
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
		:style="`z-index: ${25 - index}`"
		:title="`akcje dla ${title}`"
		@keydown.esc="collapseAndFocusToggle"
		@keydown.up.prevent="moveCursor(-1, true)"
		@keydown.left.prevent="moveCursor(-1)"
		@keydown.down.prevent="moveCursor(1, true)"
		@keydown.right.prevent="moveCursor(1)"
		@keydown.space.prevent="selectOption(cursoredOverIndex)"
		@keydown.enter.prevent="selectOption(cursoredOverIndex)"
		@focusout="closeIfFocusedOutside"
	>
		<button
			:id="`footerRowExpandActions${type}${index}`"
			ref="toggle"
			class="relative h-8 w-8 border-2 border-blue-5 rounded-1/2 bg-blue shadow hoverable:(brightness-110)"
			aria-haspopup="menu"
			:aria-controls="`footerRowActions${type}${index}`"
			:aria-expanded="isExpanded"
			@click.prevent="toggleExpanded"
		>
			<span class="visually-hidden">akcje dla {{ title }}</span>
			<div class="i-mdi-wrench group absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
		</button>

		<ul
			v-show="isExpanded"
			:id="`footerRowActions${type}${index}`"
			class="absolute left-1/2 z-1 flex translate-y-full rounded-md bg-transparent shadow-lg -bottom-1 -translate-x-1/2"
			role="menu"
			aria-orientation="horizontal"
			:aria-labelledby="`footerRowExpandActions${type}${index}`"
			@keydown="handleHomeEndKeys"
		>
			<li
				v-for="(option, localIndex) in options"
				:key="option.text"
				class="group flex-1 select-none bg-transparent"
				role="presentation"
				@focusin="cursoredOverIndex = localIndex"
			>
				<button
					:id="`footerRowActions${type}${index}-${localIndex}`"
					role="menuitem"
					class="relative h-full w-full of-hidden border-y-2 border-neutral-7 bg-neutral-3 px-2 py-1 group-first:(border-l-2 rounded-l-md) group-last:(border-r-2 rounded-r-md)"
					:class="option.class"
					@click="selectOption(localIndex)"
				>
					{{ option.text }}
				</button>
			</li>
		</ul>
	</div>
</template>
