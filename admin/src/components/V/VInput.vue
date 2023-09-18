<script setup lang="ts">
defineProps<{
	id: string;
	label?: string;
	placeholder?: string;
	suffixIcon?: string;
	error?: string;
	class?: string;
	inputClass?: string;
	labelVisuallyHidden?: boolean;
	containerAttrs?: Record<string, unknown>;
	readonly?: boolean;
}>();

defineEmits(['focusout']);

defineOptions({
	inheritAttrs: false,
});

const value = defineModel<string | number>();
</script>

<template>
	<div
		class="relative flex flex-col gap-[0.125rem]"
		:class="$props.class"
		v-bind="containerAttrs"
		@focusout="$emit('focusout', $event)"
	>
		<label
			v-if="label"
			:id="`${id}Label`"
			:for="id"
			class="ml-3 w-fit"
			:class="labelVisuallyHidden ? 'visually-hidden' : ''"
		>
			{{ label }}
		</label>
		<input
			v-if="!readonly"
			:id="id"
			v-model="value"
			class="min-w-24 w-full py-1 pl-3 shadow placeholder:text-neutral"
			:title="label"
			:class="[suffixIcon ? 'pr-9' : 'pr-3', error ? 'neon-red' : 'neon-neutral', inputClass]"
			:placeholder="placeholder"
			v-bind="$attrs"
		>
		<div
			v-else
			:id="id"
			class="h-9 min-w-24 w-full cursor-pointer py-1 pl-3 shadow placeholder:text-neutral"
			tabindex="0"
			:title="label"
			:class="[suffixIcon ? 'pr-9' : 'pr-3', error ? 'neon-red' : 'neon-neutral', inputClass]"
			:aria-labelledby="`${id}Label`"
			v-bind="$attrs"
		>
			{{ value }}
		</div>
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
