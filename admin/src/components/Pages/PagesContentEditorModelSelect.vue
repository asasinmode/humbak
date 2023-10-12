<script setup lang="ts">
const value = defineModel<number>({ required: true });
const listbox = ref<HTMLUListElement>();

const options = [
	{ text: 'html', value: 0 },
	{ text: 'css', value: 1 },
	{ text: 'meta', value: 2 },
];

const {
	isExpanded,
	cursoredOverIndex,
	moveCursor,
	selectOption,
	closeIfFocusedOutside,
} = useCombobox(value, computed(() => options), listbox);

cursoredOverIndex.value = 0;
</script>

<template>
	<div class="relative" title="tryb edytora">
		<span id="editorModeComboboxLabel" class="visually-hidden">tryb edytora</span>
		<div
			aria-label="tryb edytora"
			class="relative h-8 w-8 cursor-pointer shadow neon-blue"
			role="combobox"
			tabindex="0"
			aria-haspopup="listbox"
			aria-controls="editorModeListbox"
			aria-labelledby="editorModeComboboxLabel"
			:aria-expanded="isExpanded"
			:aria-activedescendant="cursoredOverIndex !== undefined ? `editorModeOption-${cursoredOverIndex}` : ''"
			@focus="isExpanded = true"
			@focusout="closeIfFocusedOutside"
			@keydown.left.prevent="moveCursor(-1)"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.right.prevent="moveCursor(1)"
			@keydown.down.prevent="moveCursor(1)"
			@keydown.esc="isExpanded = false"
			@keydown.enter="selectOption(cursoredOverIndex)"
			@click="isExpanded = true"
		>
			<span class="visually-hidden">{{ options[modelValue].text }}</span>
			<div class="i-mdi-wrench absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
		</div>

		<ul
			v-show="isExpanded"
			id="editorModeListbox"
			ref="listbox"
			class="absolute left-1/2 z-10 flex translate-y-full of-hidden border-2 border-neutral border-op-80 rounded-md bg-neutral-2/90 shadow-md -bottom-2 -translate-x-1/2 dark:border-neutral-5 dark:bg-neutral-8/90"
			role="listbox"
			aria-orientation="horizontal"
			aria-labelledby="editorModeComboboxLabel"
		>
			<li
				v-for="({ text, value: optionValue }, index) in options"
				:id="`editorModeOption-${index}`"
				:key="text"
				class="relative flex-1 cursor-pointer select-none bg-op-40 px-3 py-2 hover:bg-op-40"
				:class=" [
					modelValue === optionValue ? 'after:(content-empty absolute right-[2px] top-[2px] h-1 w-1 rounded-1/2 bg-current)' : '',
					cursoredOverIndex === index ? modelValue === optionValue ? 'bg-green' : 'bg-blue' : '',
				]"
				tabindex="-1"
				role="option"
				:aria-selected="modelValue === optionValue"
				@click="selectOption(index)"
				@mouseenter="cursoredOverIndex = index"
			>
				{{ text }}
			</li>
		</ul>
	</div>
</template>
