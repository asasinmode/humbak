<script setup lang="ts" generic="T">
const props = withDefaults(defineProps<{
	transformOptions?: boolean;
	options: Record<string, T> | T[];
}>(), {
	transformOptions: false,
});

const value = defineModel<T>();
const computedOptions = computed<Record<string, T>>(() => {
	if (props.transformOptions) {
		return (props.options as string[]).reduce((p, c) => ({
			...p,
			[c]: c,
		}), {});
	}

	return props.options;
});

// trap focus inside
// add keyboard navigation from https://headlessui.com/vue/listbox#keyboard-interaction
// local value for searching here
// another ref for tracking what's currently under arrow nav
// then on enter either select first matching or keep going
</script>

<template>
	<VInput v-model="value" class="group">
		<form
			class="invisible absolute bottom-0 left-0 z-100 w-full translate-y-full border-neutral-500 rounded-md bg-neutral-500 group-focus-within:visible"
			@submit.prevent="console.log"
		>
			<button
				v-for="(optionValue, key) in computedOptions"
				:key="key"
				class="block w-full py-2"
			>
				{{ key }}: {{ optionValue }}
			</button>
		</form>
	</VInput>
</template>
