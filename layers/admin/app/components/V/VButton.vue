<script setup lang="ts">
defineProps<{
	isLoading?: boolean;
	disabled?: boolean;
}>();

const element = ref<HTMLButtonElement>();

defineExpose({ element });
</script>

<template>
	<button
		ref="element"
		class="relative px-3 py-1 shadow"
		:disabled="isLoading || disabled"
		:aria-busy="isLoading"
	>
		<AdminVLoading v-show="isLoading" class="absolute left-1/2 top-1/2 translate-center" />
		<span class="pointer-events-none" :class="{ 'op-0': isLoading }">
			<slot />
		</span>
	</button>
</template>
