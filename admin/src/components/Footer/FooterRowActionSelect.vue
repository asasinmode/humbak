<script setup lang="ts">
defineProps<{
	value: string;
}>();

defineEmits<{
	edit: [];
	delete: [];
}>();

const placeholderValue = ref(0);
const listbox = ref<HTMLUListElement>();

const options = [
	{ text: 'edytuj', value: 0 },
	{ text: 'usuń', value: 1 },
];

const {
	isExpanded,
	cursoredOverIndex,
	moveCursor,
	selectOption,
	closeIfFocusedOutside,
} = useCombobox(placeholderValue, computed(() => options), listbox);

cursoredOverIndex.value = 0;
</script>

<template>
	<article class="relative" title="tryb edytora">
		<span id="editorModeComboboxLabel" class="visually-hidden">akcje dla {{ value }}</span>
		<div
			aria-label="tryb edytora"
			class="relative h-8 w-8 cursor-pointer shadow neon-blue"
			role="combobox"
			tabindex="0"
			aria-haspopup="listbox"
			aria-controls="editorModeListbox"
			aria-labelledby="editorModeComboboxLabel"
			:aria-expanded="isExpanded"
			@focus="isExpanded = true"
			@focusout="closeIfFocusedOutside"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
			@keydown.esc="isExpanded = false"
			@keydown.enter="selectOption(cursoredOverIndex)"
			@click="isExpanded = true"
		>
			<span class="visually-hidden">pokaż akcje</span>
			<div class="i-mdi-wrench absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
		</div>

		<ul
			v-show="isExpanded"
			id="editorModeListbox"
			ref="listbox"
			class="absolute left-1/2 z-10 flex translate-y-full of-hidden border-2 border-neutral border-op-80 rounded-md bg-white shadow-md -bottom-2 -translate-x-1/2 dark:border-neutral-5"
			role="listbox"
			aria-orientation="horizontal"
			aria-labelledby="editorModeComboboxLabel"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
		>
			<button
				id="editorModeOption-0"
				class="relative flex-1 cursor-pointer select-none bg-blue bg-op-80 px-3 py-2 hoverable:bg-op-90"
				role="option"
				@click="$emit('edit')"
				@mouseenter="cursoredOverIndex = 0"
			>
				edytuj
			</button>
			<button
				id="editorModeOption-1"
				class="relative flex-1 cursor-pointer select-none bg-red bg-op-60 px-3 py-2 hoverable:bg-op-80"
				role="option"
				@click="$emit('delete')"
				@mouseenter="cursoredOverIndex = 1"
			>
				usuń
			</button>
		</ul>
	</article>
</template>
