<script setup lang="ts">
defineProps<{
	id: number;
	value: string;
}>();

const emit = defineEmits<{
	edit: [];
	delete: [];
}>();

const options = [
	{ text: 'edytuj', value: () => emit('edit'), class: 'bg-blue bg-op-80 border-r' },
	{ text: 'usuń', value: () => emit('delete'), class: 'bg-red bg-op-70 border-l' },
];

const isExpanded = ref(false);
const cursoredOverIndex = ref<number>();

function expandOrSelectOption() {
	if (isExpanded.value && cursoredOverIndex.value !== undefined) {
		selectOption(cursoredOverIndex.value);
		collapse();
		return;
	}

	isExpanded.value = true;
	cursoredOverIndex.value = 0;
}

function collapse() {
	isExpanded.value = false;
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

function selectOption(index: number) {
	console.log('selecting', options[index]);
}
</script>

<template>
	<article
		class="relative"
	>
		<button
			class="relative h-8 w-8 cursor-pointer shadow neon-blue"
			aria-haspopup="menu"
			:aria-expanded="isExpanded"
			@click="expandOrSelectOption"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
			@focusout="collapse"
		>
			<span class="visually-hidden">akcje dla {{ value }}</span>
			<div class="i-mdi-wrench absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
		</button>

		<ul
			v-show="isExpanded"
			class="absolute left-1/2 z-10 flex translate-y-full of-hidden border-2 border-neutral border-op-80 rounded-md bg-white shadow-md -bottom-2 -translate-x-1/2 dark:border-neutral-5"
			role="menu"
			aria-orientation="horizontal"
		>
			<li
				v-for="option in options"
				:key="option.text"
				class="relative flex-1 cursor-pointer select-none border-neutral px-2 py-1 text-3 dark:border-neutral-5 hoverable:bg-op-90"
				:class="option.class"
				role="menuitem"
			>
				{{ option.text }}
			</li>
		</ul>
	</article>
</template>
