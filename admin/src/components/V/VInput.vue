<script setup lang="ts">
defineProps<{
	id: string;
	label?: string;
	placeholder?: string;
	suffixIcon?: string;
	error?: string;
	class?: string;
}>();

defineEmits(['focusout']);

defineOptions({
	inheritAttrs: false,
});

const value = defineModel<string>();
const element = ref<HTMLInputElement | null>();

defineExpose({
	element,
});
</script>

<template>
	<div class="relative flex flex-col gap-[2px]" :class="$props.class" @focusout="$emit('focusout', $event)">
		<label v-if="label" :for="id" class="ml-3 w-fit">{{ label }}</label>
		<input
			:id="id"
			ref="element"
			v-model="value"
			v-bind="$attrs"
			class="min-w-24 w-full py-1 pl-3 shadow"
			:class="[suffixIcon ? 'pr-9' : 'pr-3', error ? 'neon-red' : 'neon-stone']"
			:placeholder="placeholder"
		>
		<p v-if="error" class="pointer-events-none absolute bottom-0 left-3 translate-y-full text-3 text-red-500">
			{{ error }}
		</p>

		<div
			v-if="suffixIcon"
			class="pointer-events-none absolute right-4 top-1/2 text-neutral -translate-y-1/2"
			:class="suffixIcon"
		/>
		<slot />
	</div>
</template>
