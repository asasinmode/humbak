<script setup lang="ts">
defineProps<{
	label?: string;
	id: string;
}>();
</script>

<template>
	<div class="flex flex-col">
		<label v-if="label" :for="id" class="w-fit">{{ label }}</label>
		<input :id="id" class="">
	</div>
</template>
