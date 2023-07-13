<script setup lang="ts">
import VInput from '~/components/V/VInput.vue';

const props = withDefaults(defineProps<{
	transformOptions?: boolean;
	options: Record<string, string> | string[];
	id: string;
}>(), {
	transformOptions: false,
});

const modelValue = defineModel<string>();
const isExpanded = ref(false);
const cursoredOverIndex = ref<number | undefined>();

const listId = Math.random().toString(36).substring(2, 9);
const input = ref<InstanceType<typeof VInput> | null>();
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

updateCursoredIndexToSelected(modelValue.value);

function updateCursoredIndexToSelected(value?: string) {
	cursoredOverIndex.value = undefined;
	if (value) {
		for (let i = 0; i < computedOptions.value.length; i++) {
			if (value === computedOptions.value[i].value) {
				cursoredOverIndex.value = i;
				break;
			}
		}
	}
}

function moveCursor(value: number) {
	if (!isExpanded.value) {
		isExpanded.value = true;
		return;
	}

	if (cursoredOverIndex.value === undefined) {
		cursoredOverIndex.value = value > 0 ? 0 : (computedOptions.value.length - 1);
		return;
	}

	cursoredOverIndex.value = (cursoredOverIndex.value + value) % computedOptions.value.length;
	if (cursoredOverIndex.value < 0) {
		cursoredOverIndex.value = computedOptions.value.length + cursoredOverIndex.value;
	}
}

function selectOption(index?: number) {
	isExpanded.value = false;
	if (index !== undefined) {
		modelValue.value = computedOptions.value[index].value;
		cursoredOverIndex.value = index;
	}
}

function closeIfFocusedOutside(event: FocusEvent) {
	const target = event.relatedTarget as HTMLElement | null;
	if (!target || !listbox.value || !listbox.value.contains(target)) {
		isExpanded.value = false;
	}
}
</script>

<template>
	<VInput
		:id="id"
		ref="input"
		v-model="modelValue"
		role="combobox"
		aria-haspopup="listbox"
		:aria-expanded="isExpanded"
		:aria-controls="listId"
		:aria-activedescendant="cursoredOverIndex !== undefined ? `${listId}-${cursoredOverIndex}` : ''"
		@focus="isExpanded = true"
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
			:id="listId"
			ref="listbox"
			class="absolute bottom-0 left-3 z-10 w-[calc(100%_-_1.5rem)] translate-y-full of-hidden border-2 border-neutral border-op-80 rounded-md bg-neutral-2/90 shadow-md dark:border-neutral-5 dark:bg-neutral-8/90"
			role="listbox"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
		>
			<li
				v-for="({ text, value }, index) in computedOptions"
				:id="`${listId}-${index}`"
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
				@click="selectOption(index)"
				@mouseenter="cursoredOverIndex = index"
			>
				{{ text }}
				<div v-show="modelValue === value" class="i-fa6-solid-check absolute right-2 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2" />
			</li>
		</ul>
	</VInput>
</template>
