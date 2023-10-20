<script setup lang="ts">
const props = defineProps<{
	id: number;
	value: string;
	type: 'email' | 'phone' | 'location';
}>();

const modelValue = ref(props.value);
const label = ref(props.value);

const isEditing = ref(false);

function edit() {
	isEditing.value = true;
}

function remove() {
	console.log('deleting');
}
</script>

<template>
	<VInput
		v-if="isEditing"
		:id="`footer${type}${id}`"
		v-model="modelValue"
		:label="label"
		label-visually-hidden
	/>
	<a v-else :href="`mailto:${value}`" class="hoverable:underline">
		{{ value }}
	</a>
	<FooterRowActionSelect
		class="top-1/2 translate-x-full !absolute -right-2 -translate-y-1/2"
		:index="id"
		:title="label"
		@edit="edit"
		@delete="remove"
	/>
</template>
