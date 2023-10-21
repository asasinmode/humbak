<script setup lang="ts">
const props = defineProps<{
	id: number;
	value: string;
	type: 'email' | 'phone' | 'location';
}>();

const modelValue = ref(props.value);

const isEditing = ref(false);

function edit() {
	isEditing.value = true;
}

function remove() {
	console.log('deleting');
}
</script>

<template>
	<div class="relative">
		<label class="visually-hidden" :for="`footer${type}${id}`">{{ value }}</label>
		<input
			:id="`footer${type}${id}`"
			v-model="modelValue"
			class="absolute w-fit border-2 border-neutral rounded-full bg-white px-2 op-50 -left-[0.625rem] -top-[0.125rem]"
		>
		<a :href="`mailto:${value}`" class="hoverable:underline">
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
