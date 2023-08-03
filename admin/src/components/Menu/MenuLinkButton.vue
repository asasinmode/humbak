<script setup lang="ts">
import type { IMenuTreeItem } from '~/types';

defineProps<{
	item: IMenuTreeItem;
	path: number[];
}>();

defineEmits<{
	mousedown: [MouseEvent, number, number[]];
	mouseenter: [MouseEvent, number, number[]];
	mousemove: [MouseEvent, number, number[]];
}>();
</script>

<template>
	<button
		class="relative h-full w-full p-2"
		@mousedown="$emit('mousedown', $event, item.id, path)"
		@mouseenter="$emit('mouseenter', $event, item.id, path)"
		@mousemove="$emit('mousemove', $event, item.id, path)"
	>
		{{ item.text }}
		<slot />
	</button>
</template>
