<script setup lang="ts" generic="T">
import VInput from '~/components/V/VInput.vue';

const props = withDefaults(defineProps<{
	transformOptions?: boolean;
	options: Record<string, T> | T[];
}>(), {
	transformOptions: false,
});

const modelValue = defineModel<T>();
const isExpanded = ref(false);
const cursoredOverIndex = ref<number | undefined>();

const listId = Math.random().toString(36).substring(2, 9);
const input = ref<InstanceType<typeof VInput> | null>();
const listbox = ref<HTMLUListElement | null>();

const computedOptions = computed(() => {
	if (props.transformOptions) {
		return (props.options as T[]).map(value => ({
			text: `${value}`,
			value,
		}));
	}

	return Object.entries(props.options as Record<string, T>).map(([text, value]) => ({ text, value }));
});

updateCursoredIndexToSelected(modelValue.value);

function updateCursoredIndexToSelected(value?: T) {
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
		ref="input"
		v-model="modelValue"
		role="combobox"
		aria-autocomplete="list"
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
			class="absolute bottom-0 left-3 z-100 w-[calc(100%_-_1.5rem)] translate-y-full of-hidden border-2 border-neutral border-op-80 rounded-md bg-neutral bg-op-100"
			aria-role="listbox"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
		>
			<li
				v-for="({ text, value }, index) in computedOptions"
				:id="`${listId}-${index}`"
				:key="text"
				class="w-full cursor-pointer select-none py-2"
				:class="{ 'bg-pink': cursoredOverIndex === index }"
				tabindex="-1"
				aria-role="option"
				@click="selectOption(index)"
			>
				{{ text }}
				<div v-show="modelValue === value" class="i-fa6-solid-check ml-auto inline-block h-4 w-4" />
			</li>
		</ul>
	</VInput>
</template>
