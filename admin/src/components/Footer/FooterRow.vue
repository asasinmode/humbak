<script setup lang="ts">
const props = defineProps<{
	id: number;
	modelValue: string;
	type: 'email' | 'phone' | 'location';
}>();

const emit = defineEmits<{
	'update:model-value': [string];
}>();

const localValue = ref(props.modelValue);

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement>();
const linkRef = ref<HTMLAnchorElement>();

function edit() {
	isEditing.value = true;
	nextTick(() => {
		inputRef.value?.focus();
	});
}

function remove() {
	console.log('deleting');
}

function hideInput(updateValue: boolean) {
	isEditing.value = false;
	linkRef.value?.focus();

	updateValue && emit('update:model-value', localValue.value);
}
</script>

<template>
	<div class="relative">
		<label class="visually-hidden" :for="`footer${type}${id}`">{{ modelValue }}</label>
		<input
			v-if="isEditing"
			:id="`footer${type}${id}`"
			ref="inputRef"
			v-model="localValue"
			class="absolute z-10 w-fit border-2 border-neutral-5 rounded-full bg-white px-2 py-[0.125rem] -left-[0.625rem] -top-[0.25rem]"
			@focusout="hideInput(true)"
			@keydown.esc="hideInput(false)"
			@keydown.enter.prevent="hideInput(true)"
		>
		<a
			ref="linkRef"
			:href="`mailto:${modelValue}`"
			class="hoverable:underline"
			:class="isEditing ? 'op-0' : ''"
			:aria-hidden="isEditing"
		>
			{{ modelValue }}
		</a>
		<FooterRowActionSelect
			v-if="!isEditing"
			class="top-1/2 translate-x-full !absolute -right-2 -translate-y-1/2"
			:index="id"
			:title="modelValue"
			@edit="edit"
			@delete="remove"
		/>
	</div>
</template>
