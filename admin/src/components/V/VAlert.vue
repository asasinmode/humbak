<script setup lang="ts">
const props = defineProps<{
	variant: 'warning';
}>();

const isWarning = computed(() => props.variant === 'warning');
</script>

<template>
	<article
		class="relative grid grid-cols-[min-content_1fr] gap-5 border-2 border-op-50 rounded-lg bg-op-20 p-3 pl-4 before:(absolute left-[0.48rem] top-1/2 z-100 h-10 w-10 border-2 rounded-1/2 content-empty -translate-y-1/2) dark:border-op-80 !before:bg-op-30"
		:class="{
			'bg-yellow border-yellow-6 before:(border-yellow-5 bg-yellow-3) dark:(border-yellow before:border-yellow before:bg-yellow)': isWarning,
		}"
	>
		<div
			class="h-6 w-6 self-center"
			:class="{
				'text-yellow-6 i-solar-danger-triangle-bold dark:text-yellow': isWarning,
			}"
		/>
		<h6 class="text-2xl font-500">
			<slot />
		</h6>
	</article>
</template>
