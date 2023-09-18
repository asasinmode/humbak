<script setup lang="ts">
defineProps<{
	id: string;
	label?: string;
	error?: string;
	class?: string;
	inputClass?: string;
	labelVisuallyHidden?: boolean;
}>();

defineEmits(['focusout']);

defineOptions({
	inheritAttrs: false,
});

const value = defineModel<boolean>();
</script>

<template>
	<div
		class="h-fit min-w-18 flex flex-col pb-[2.375rem]"
		:class="$props.class"
		@focusout="$emit('focusout', $event)"
	>
		<input
			:id="id"
			v-model="value"
			type="checkbox"
			class="v-checkbox visually-hidden"
			:title="label"
			v-bind="$attrs"
		>
		<label
			v-if="label"
			:id="`${id}Label`"
			:for="id"
			class="relative ml-3 w-fit after:(absolute bottom-[calc(-0.125rem_-_2px)] h-[calc(2.25rem_-_4px)] w-[calc(2.25rem_-_4px)] translate-y-full rounded-1/2 bg-white transition-transform content-empty -left-[calc(0.75rem_-_2px)]) before:(absolute bottom-[-0.125rem] h-9 w-[calc(4.5rem_-_4px)] translate-y-full rounded-full content-empty -left-3 neon-neutral)"
			:class="labelVisuallyHidden ? 'visually-hidden' : ''"
		>
			{{ label }}
		</label>
		<p v-if="error" class="pointer-events-none absolute bottom-0 left-3 translate-y-full text-3 text-red-500">
			{{ error }}
		</p>
	</div>
</template>

<style>
.v-checkbox:checked + label::after {
	@apply translate-x-full
}
</style>
