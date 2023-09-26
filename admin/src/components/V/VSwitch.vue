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
			class="v-switch visually-hidden"
			:title="label"
			v-bind="$attrs"
		>
		<label
			v-if="label"
			:id="`${id}Label`"
			:for="id"
			class="v-switch-label relative w-fit after:(absolute bottom-[calc(-0.125rem_-_2px)] left-[2px] h-[calc(2.25rem_-_4px)] w-[calc(2.25rem_-_4px)] translate-y-full rounded-1/2 bg-neutral-8 transition-transform content-empty dark:bg-neutral-2) before:(absolute bottom-[-0.125rem] h-9 w-[calc(4.5rem_-_4px)] translate-y-full rounded-full content-empty neon-neutral)"
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
.v-switch:checked + label::before {
	@apply border-green border-op-50 dark:border-op-80 bg-green bg-op-20
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
