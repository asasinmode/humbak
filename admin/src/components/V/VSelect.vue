<script setup lang="ts" generic="T">
import VInput from '~/components/V/VInput.vue';

const props = withDefaults(defineProps<{
	transformOptions?: boolean;
	options: Record<string, T> | T[];
}>(), {
	transformOptions: false,
});

const listId = Math.random().toString(36).substring(2, 9);
const modelValue = defineModel<T>();
const cursoredOverIndex = ref<number | undefined>();
const input = ref<InstanceType<typeof VInput> | null>();
const isExpanded = ref(false);
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

// add keyboard navigation from https://headlessui.com/vue/combobox#keyboard-interaction
// local value for searching here
// another ref for tracking what's currently under arrow nav
// then on enter either select first matching or keep going

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
	isExpanded.value = true;

	if (cursoredOverIndex.value === undefined) {
		cursoredOverIndex.value = value > 0 ? 0 : (computedOptions.value.length - 1);
	} else {
		cursoredOverIndex.value = (cursoredOverIndex.value + value) % computedOptions.value.length;
		if (cursoredOverIndex.value < 0) {
			cursoredOverIndex.value = computedOptions.value.length + cursoredOverIndex.value;
		}
	}

	modelValue.value = computedOptions.value[cursoredOverIndex.value].value;
}

function selectOption(index?: number) {
	if (index) {
		modelValue.value = computedOptions.value[index].value;
		cursoredOverIndex.value = index;
	}

	isExpanded.value = false;
}
</script>

<template>
	<VInput
		ref="input"
		v-model="modelValue"
		aria-role="combobox"
		:aria-expanded="isExpanded"
		:aria-controls="isExpanded ? listId : ''"
		:aria-activedescendant="cursoredOverIndex !== undefined ? `${listId}-${cursoredOverIndex}` : ''"
		@focus="isExpanded = true"
		@blur="isExpanded = false"
		@update:model-value="updateCursoredIndexToSelected"
		@keydown.up.prevent="moveCursor(-1)"
		@keydown.down.prevent="moveCursor(1)"
		@keydown.esc="isExpanded = false"
		@keydown.enter="selectOption(cursoredOverIndex)"
	>
		<ul
			v-show="isExpanded"
			:id="listId"
			class="absolute bottom-0 left-3 z-100 w-[calc(100%_-_1.5rem)] translate-y-full of-hidden border-2 border-neutral border-op-80 rounded-md bg-neutral bg-op-80"
			aria-role="listbox"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
		>
			<li
				v-for="({ text }, index) in computedOptions"
				:id="`${listId}-${index}`"
				:key="text"
				class="w-full cursor-pointer select-none py-2"
				:class="{ 'bg-pink': cursoredOverIndex === index }"
				tabindex="-1"
				aria-role="option"
				@click="selectOption(index)"
			>
				{{ text }}
			</li>
		</ul>
	</VInput>
</template>
