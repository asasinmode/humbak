<script setup lang="ts" generic="T extends { text: string; value: string | number }">
import VInput from './VInput.vue';

const props = defineProps<{
	options: Array<T | T['value']>;
	transformOptions?: boolean;
	id: string;
	isLoading?: boolean;
	hideCheck?: boolean;
	selectOnly?: boolean;
}>();

const emit = defineEmits<{
	selectOption: [T['value'] | undefined];
}>();

const modelValue = defineModel<T['value'] | undefined>();
const listbox = ref<HTMLUListElement>();
const inputComponent = ref<InstanceType<typeof VInput>>();

const computedOptions = computed(() => {
	if (props.transformOptions) {
		return (props.options as T['value'][]).map(value => ({
			text: `${value}`,
			value,
		})) as T[];
	}
	return props.options as T[];
});

const {
	isExpanded,
	cursoredOverIndex,
	moveCursor,
	selectOption,
	confirmChoice,
	closeIfFocusedOutside,
	selectedOptionText,
} = useCombobox(
	modelValue,
	computedOptions,
	listbox,
	toRef(() => props.selectOnly),
	value => emit('selectOption', value)
);

function updateValue(value?: T['value']) {
	modelValue.value = value;
}

const activeDescendantId = computed(() => cursoredOverIndex.value !== undefined
	? `${props.id}-option-${cursoredOverIndex.value}`
	: '');

defineExpose({
	getInputRef: () => inputComponent.value,
});
</script>

<template>
	<VInput
		:id="id"
		ref="inputComponent"
		:model-value="selectOnly ? selectedOptionText : modelValue"
		role="combobox"
		aria-haspopup="listbox"
		:aria-labelledby="`${id}Label`"
		:aria-expanded="isExpanded"
		:aria-controls="`${id}-listbox`"
		:aria-activedescendant="activeDescendantId"
		:readonly="selectOnly"
		@focus="isExpanded = true"
		@focusout="closeIfFocusedOutside"
		@keydown.up.prevent="moveCursor(-1)"
		@keydown.down.prevent="moveCursor(1)"
		@keydown.esc.stop="isExpanded = false"
		@keydown.enter="confirmChoice"
		@click="isExpanded = true"
		@update:model-value="updateValue"
	>
		<ul
			v-show="isExpanded && (isLoading || computedOptions.length)"
			:id="`${id}-listbox`"
			ref="listbox"
			class="absolute bottom-0 left-1/2 z-10 min-w-12 w-[calc(100%_-_1.5rem)] translate-y-full of-hidden border-2 border-neutral border-op-80 rounded-md bg-neutral-2/90 shadow-md -translate-x-1/2 dark:border-neutral-5 dark:bg-neutral-8/90"
			role="listbox"
			tabindex="-1"
			:aria-labelledby="`${id}Label`"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
		>
			<v-loading v-if="isLoading" class="py-2" />
			<template v-else>
				<li
					v-for="(option, index) in computedOptions"
					:id="`${id}-option-${index}`"
					:key="option.text"
					class="relative w-full cursor-pointer select-none truncate bg-op-40 py-2 pl-2 pr-8 hover:bg-op-40"
					:class="cursoredOverIndex === index
						? modelValue === option.value
							? 'bg-green'
							: 'bg-blue'
						: ''
					"
					role="option"
					:aria-selected="modelValue === option.value"
					@click="selectOption(index)"
					@mouseenter="cursoredOverIndex = index"
				>
					<slot name="item" v-bind="option">
						{{ option.text }}
					</slot>
					<div
						v-show="!hideCheck && modelValue === option.value"
						class="i-fa6-solid-check absolute right-2 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2"
					/>
				</li>
			</template>
		</ul>
	</VInput>
</template>
