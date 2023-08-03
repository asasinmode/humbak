<script setup lang="ts">
import type { IMenuTreeItem } from '~/types';

withDefaults(
	defineProps<{
		item: IMenuTreeItem;
		path: number[];
		currentLevelChildrenLength: number;
		levelVertical?: boolean;
	}>(),
	{ levelVertical: false }
);

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
		{{ item.text }}
		<slot />
	</button>
</template>
