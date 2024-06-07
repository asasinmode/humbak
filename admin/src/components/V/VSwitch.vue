<script setup lang="ts">
defineOptions({
	inheritAttrs: false,
});

defineProps<{
	id: string;
	label?: string;
	error?: string;
	class?: string;
	inputClass?: string;
	labelVisuallyHidden?: boolean;
}>();

defineEmits(['focusout']);

const value = defineModel<boolean>();
</script>

<template>
	<div
		class="h-fit relative min-w-18 flex flex-col pb-[2.375rem]"
		:class="$props.class"
		@focusout="$emit('focusout', $event)"
	>
		<input
			:id="id"
			v-model="value"
			type="checkbox"
			class="v-switch visually-hidden"
			:title="label"
			v-bind="$attrs"
		>
		<label
			v-if="label"
			:id="`${id}Label`"
			:for="id"
			class="v-switch-label relative ml-3 w-fit after:(absolute bottom-[calc(-0.125rem_-_2px)] h-[calc(2.25rem_-_4px)] w-[calc(2.25rem_-_4px)] translate-y-full rounded-1/2 bg-neutral-8 transition-transform content-empty -left-[calc(0.75rem_-_2px)] dark:bg-neutral-2) before:(absolute bottom-[-0.125rem] h-9 w-[calc(4.5rem_-_4px)] translate-y-full rounded-full content-empty -left-3)"
			:class="[
				labelVisuallyHidden ? 'visually-hidden' : '',
				error ? 'error before:neon-red' : 'before:neon-neutral',
			]"
		>
			{{ label }}
		</label>
		<p v-if="error" class="pointer-events-none absolute bottom-0 left-3 translate-y-full text-3 text-red-6 dark:text-red-5">
			{{ error }}
		</p>
	</div>
</template>

<style>
.v-switch:checked + label::before {
	@apply border-green border-op-50 dark:border-op-80 bg-green bg-op-20
}
.v-switch:checked + label.error::before {
	@apply border-red border-op-50 dark:border-op-80 bg-red bg-op-20
}
.v-switch:checked + label::after {
	@apply translate-x-full
}
.v-switch:indeterminate + label::after {
	@apply translate-x-1/2
}
.v-switch:focus + label::before,
.v-switch:focus-visible + label::before,
.v-switch-label:hover::before {
	@apply !border-op-100 !bg-op-30
}
.v-switch:focus + label::after,
.v-switch-label:hover::after {
	@apply bg-black dark:bg-white
}
.v-switch:focus + label::before,
.v-switch:focus-visible + label::before {
	@apply outline-auto
}
</style>
