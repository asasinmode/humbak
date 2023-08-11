<script setup lang="ts">
import VInput from '~/components/V/VInput.vue';

const props = withDefaults(defineProps<{
	transformOptions?: boolean;
	options: Record<string, string> | string[];
	id: string;
	isLoading?: boolean;
}>(), {
	transformOptions: false,
	isLoading: false,
});

const modelValue = defineModel<string>();
const listbox = ref<HTMLUListElement | null>();

const computedOptions = computed(() => {
	if (props.transformOptions) {
		return (props.options as string[]).map(value => ({
			text: `${value}`,
			value,
		}));
	}

	return Object.entries(props.options as Record<string, string>).map(([text, value]) => ({ text, value }));
});

const {
	isExpanded,
	cursoredOverIndex,
	updateCursoredIndexToSelected,
	moveCursor,
	selectOption,
	expandAndSelectFirst,
	closeIfFocusedOutside,
} = useCombobox(modelValue, computedOptions, listbox);

updateCursoredIndexToSelected(modelValue.value);
</script>

<template>
	<VInput
		:id="id"
		v-model="modelValue"
		:container-attrs="{
			'role': 'combobox',
			'aria-labelledby': `${id}Label`,
			'aria-haspopup': 'listbox',
			'aria-expanded': 'isExpanded',
			'aria-controls': `${id}-listbox`,
			'aria-activedescendant': cursoredOverIndex !== undefined ? `${id}-option-${cursoredOverIndex}` : '',
		}"
		@focus="expandAndSelectFirst"
		@focusout="closeIfFocusedOutside"
		@update:model-value="updateCursoredIndexToSelected"
		@keydown.up.prevent="moveCursor(-1)"
		@keydown.down.prevent="moveCursor(1)"
		@keydown.esc="isExpanded = false"
		@keydown.enter="selectOption(cursoredOverIndex)"
		@click="isExpanded = true"
	>
		<ul
			v-show="isExpanded"
			:id="`${id}-listbox`"
			ref="listbox"
			class="absolute bottom-0 left-1/2 z-10 min-w-12 w-[calc(100%_-_1.5rem)] translate-y-full of-hidden border-2 border-neutral border-op-80 rounded-md bg-neutral-2/90 shadow-md -translate-x-1/2 dark:border-neutral-5 dark:bg-neutral-8/90"
			role="listbox"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
		>
			<v-loading v-if="isLoading" class="py-2" />
			<template v-else>
				<li
					v-for="({ text, value }, index) in computedOptions"
					:id="`${id}-option-${index}`"
					:key="text"
					class="relative w-full cursor-pointer select-none truncate bg-op-40 py-2 pl-2 pr-8 hover:bg-op-40"
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
					<div
						v-show="modelValue === value"
						class="i-fa6-solid-check absolute right-2 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2"
					/>
				</li>
			</template>
		</ul>
	</VInput>
</template>
