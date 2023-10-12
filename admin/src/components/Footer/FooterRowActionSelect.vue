<script setup lang="ts">
defineProps<{
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
		class: '!bg-blue',
	},
	{
		text: 'usuń',
		value: () => emit('delete'),
		class: '!bg-red',
	},
];

const container = ref<HTMLDivElement>();

const isExpanded = ref(false);
const cursoredOverIndex = ref<number>();

function expandOrSelectOption() {
	if (isExpanded.value && cursoredOverIndex.value !== undefined) {
		selectOption(cursoredOverIndex.value);
		isExpanded.value = false;
		return;
	}

	isExpanded.value = true;
	cursoredOverIndex.value = 0;
}

function moveCursor(value: number) {
	if (!isExpanded.value) {
		isExpanded.value = true;
		cursoredOverIndex.value = 0;
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
}

function closeIfFocusedOutside(event: FocusEvent) {
	const target = event.relatedTarget as HTMLElement | null;
	if (!target || !container.value || !container.value.contains(target)) {
		isExpanded.value = false;
	}
}

function selectOption(index: number) {
	console.log('selecting', options[index]);
}
</script>

<template>
	<div
		ref="container"
		class="relative"
		@keydown.esc="isExpanded = false"
	>
		<!-- @focusout="closeIfFocusedOutside" -->
		<button
			:id="`footerRowExpandActions${id}`"
			class="relative h-8 w-8 cursor-pointer shadow neon-blue"
			aria-haspopup="menu"
			:aria-controls="`footerRowActions${id}`"
			@click="expandOrSelectOption"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.left.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
			@keydown.right.prevent="moveCursor(1)"
		>
			<span class="visually-hidden">akcje dla {{ title }}</span>
			<div class="i-mdi-wrench absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
		</button>

		<ul
			v-show="isExpanded"
			:id="`footerRowActions${id}`"
			class="absolute left-1/2 isolate z-10 flex translate-y-full of-hidden border-2 border-neutral-7 border-op-80 rounded-md bg-white shadow-md -bottom-1 -translate-x-1/2"
			role="menu"
			aria-orientation="horizontal"
			:aria-labelledby="`footerRowExpandActions${id}`"
		>
			<li
				v-for="(option, index) in options"
				:key="option.text"
				class="flex-1 select-none bg-neutral-5"
				:class="[cursoredOverIndex === index ? option.class : '']"
				role="presentation"
				@mouseenter="cursoredOverIndex = index"
			>
				<button
					role="menuitem"
					class="h-full w-full px-2 py-1"
				>
					{{ option.text }}
				</button>
			</li>
		</ul>
	</div>
</template>
