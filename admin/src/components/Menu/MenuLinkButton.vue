<script setup lang="ts">
import type { IMenuTreeItem } from '~/types';

defineProps<{
	item: IMenuTreeItem;
	path: number[];
}>();

defineEmits<{
	mousedown: [MouseEvent, IMenuTreeItem, number[]];
	mouseenter: [MouseEvent, IMenuTreeItem, number[]];
	mousemove: [MouseEvent, IMenuTreeItem, number[]];
}>();
</script>

<template>
	<button
		class="relative h-full w-full p-2"
		@mousedown="$emit('mousedown', $event, item, path)"
		@mouseenter="$emit('mouseenter', $event, item, path)"
		@mousemove="$emit('mousemove', $event, item, path)"
	>
		{{ item.text }}
		<slot />
	</button>
</template>
