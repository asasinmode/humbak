<script setup lang="ts">
import type { IMenuTreeItem } from '~/types';

defineProps<{
	item?: IMenuTreeItem;
	path: number[];
}>();

defineEmits<{
	mousedown: [MouseEvent, IMenuTreeItem, number[]];
	mouseenter: [MouseEvent, number[]];
	mousemove: [MouseEvent, number[]];
}>();
</script>

<template>
	<button
		class="relative h-full w-full p-2"
		@mousedown="$emit('mousedown', $event, item, path)"
		@mouseenter="$emit('mouseenter', $event, path)"
		@mousemove="$emit('mousemove', $event, path)"
	>
		{{ item?.text }}
		<slot />
	</button>
</template>
