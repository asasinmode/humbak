<script setup lang="ts">
defineOptions({
	inheritAttrs: false,
});

const props = defineProps<{
	id: string;
	label?: string;
	suffixIcon?: string;
	error?: string;
	class?: string;
	classInput?: string;
	labelVisuallyHidden?: boolean;
	readonly?: boolean;
	disabled?: boolean;
}>();

defineEmits(['focusout']);

const value = defineModel<string | number>();

const element = ref<HTMLInputElement>();

function manageReadonlyFocus() {
	if (!props.readonly) {
		return;
	}
	element.value?.focus();
}

defineExpose({ element });
</script>

<template>
	<div
		class="relative flex flex-col gap-[0.125rem]"
		:class="$props.class"
		@focusout="$emit('focusout', $event)"
	>
		<label
			v-if="label"
			:id="`${id}Label`"
			:for="id"
			class="v-input-label ml-[0.875rem] w-fit"
			:class="[labelVisuallyHidden ? 'visually-hidden' : '', disabled ? 'op-60' : '']"
			@click="manageReadonlyFocus"
		>
			{{ label }}
		</label>
		<input
			v-if="!readonly"
			:id="id"
			ref="element"
			v-model="value"
			class="min-w-24 w-full py-1 pl-3 shadow disabled:pointer-events-none"
			:title="label"
			:class="[suffixIcon ? 'pr-9' : 'pr-3', error ? 'neon-red' : 'neon-neutral', classInput]"
			:disabled="disabled"
			v-bind="$attrs"
		>
		<div
			v-else
			:id="id"
			ref="element"
			class="v-input-readonly h-9 min-w-24 w-full cursor-pointer py-1 pl-3 shadow focus:outline-auto"
			tabindex="0"
			:title="label"
			:class="[suffixIcon ? 'pr-9' : 'pr-3', error ? 'neon-red' : 'neon-neutral', classInput]"
			:aria-labelledby="`${id}Label`"
			v-bind="$attrs"
		>
			{{ value }}
		</div>
		<p v-if="error" class="pointer-events-none absolute bottom-0 left-3 translate-y-full text-3 text-red-5">
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

<style>
.v-input-label:hover + .v-input-readonly,
.v-input-readonly:focus {
	@apply bg-op-30 border-op-100
}
</style>
