<script setup lang="ts">
defineProps<{
	languages: string[];
}>();
</script>

<template>
	<button
		class="w-12 h-12 col-start-2 row-start-1 ml-2 my-2 hoverable:text-humbak-8 flex-center lg:(m-0 absolute right-0 hoverable:bg-humbak-5 hoverable:text-inherit z-10)"
		title="język"
	>
		<span class="visually-hidden">język</span>
		<div class="i-ph-translate-bold pointer-events-none w-6 h-6" />
	</button>
</template>
