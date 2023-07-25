<script setup lang="ts">
const modelValue = ref('html');
const listbox = ref<HTMLUListElement | null>();

const options = [
	{ text: 'html', value: 'html' },
	{ text: 'css', value: 'css' },
	{ text: 'meta', value: 'meta' },
];

const {
	isExpanded,
	cursoredOverIndex,
	updateCursoredIndexToSelected,
	moveCursor,
	selectOption,
	expandAndSelectFirst,
	closeIfFocusedOutside,
} = useCombobox(modelValue, options, listbox);

updateCursoredIndexToSelected(modelValue.value);
</script>

<template>
	<article class="relative">
		<label for="editor-mode-select-combobox" class="visually-hidden">editor mode</label>
		<button
			id="editor-mode-select-combobox"
			class="relative h-8 w-8 shadow neon-blue"
			title="editor mode"
			role="combobox"
			aria-haspopup="listbox"
			aria-controls="editor-mode-select-listbox"
			:aria-expanded="isExpanded"
			:aria-activedescendant="cursoredOverIndex !== undefined ? `editor-mode-select-option-${cursoredOverIndex}` : ''"
			@focus="expandAndSelectFirst"
			@focusout="closeIfFocusedOutside"
			@update:model-value="updateCursoredIndexToSelected"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
			@keydown.esc="isExpanded = false"
			@keydown.enter="selectOption(cursoredOverIndex)"
			@click="isExpanded = true"
		>
			<span class="visually-hidden">{{ modelValue }}</span>
			<div class="i-mdi-wrench absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
		</button>

		<ul
			v-show="isExpanded"
			id="editor-mode-select-listbox"
			ref="listbox"
			aria-label="editor mode"
			class="absolute left-1/2 z-10 flex translate-y-full of-hidden border-2 border-neutral border-op-80 rounded-md bg-neutral-2/90 shadow-md -bottom-2 -translate-x-1/2 dark:border-neutral-5 dark:bg-neutral-8/90"
			role="listbox"
			aria-orientation="horizontal"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
		>
			<li
				v-for="({ text, value }, index) in options"
				:id="`editor-mode-select-option-${index}`"
				:key="text"
				class="relative flex-1 cursor-pointer select-none bg-op-40 px-3 py-2 hover:bg-op-40"
				:class="cursoredOverIndex === index
					? modelValue === value
						? 'bg-green'
						: 'bg-blue'
					: ''
				"
				tabindex="-1"
				role="option"
				:aria-selected="modelValue === value"
				@click="selectOption(index)"
				@mouseenter="cursoredOverIndex = index"
			>
				{{ text }}
				<div v-show="modelValue === value" class="absolute right-[2px] top-[2px] h-1 w-1 shrink-0 rounded-1/2 bg-current" />
			</li>
		</ul>
	</article>
</template>
