<script setup lang="ts">
const props = defineProps<{
	id: number;
	value: string;
	type: 'email' | 'phone' | 'location';
}>();

const modelValue = ref(props.value);

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

	if (updateValue) {
		console.log('updating value to', modelValue.value);
	}
}
</script>

<template>
	<div class="relative">
		<label class="visually-hidden" :for="`footer${type}${id}`">{{ value }}</label>
		<input
			v-if="isEditing"
			:id="`footer${type}${id}`"
			ref="inputRef"
			v-model="modelValue"
			class="absolute z-10 w-fit border-2 border-neutral-5 rounded-full bg-white px-2 py-[0.125rem] -left-[0.625rem] -top-[0.25rem]"
			@focusout="hideInput(true)"
			@keydown.esc="hideInput(false)"
			@keydown.enter.prevent="hideInput(true)"
		>
		<a
			ref="linkRef"
			:href="`mailto:${value}`"
			class="hoverable:underline"
			:class="isEditing ? 'op-0' : ''"
			:aria-hidden="isEditing"
		>
			{{ value }}
		</a>
		<FooterRowActionSelect
			v-if="!isEditing"
			class="top-1/2 translate-x-full !absolute -right-2 -translate-y-1/2"
			:index="id"
			:title="value"
			@edit="edit"
			@delete="remove"
		/>
	</div>
</template>
