<script setup lang="ts">
import type { IMenuTreeItem } from '~/types';

defineProps<{
	menuLinks: IMenuTreeItem[];
	isLinkGrabbed: boolean;
}>();

defineEmits<{
	menuLinkMouseDown: [MouseEvent, IMenuTreeItem, number[]];
}>();

const { toastGenericError } = useToast();
const container = ref<HTMLElement>();

let offsetX = 0;
let offsetY = 0;

function initDrag(event: MouseEvent) {
	if (!container.value) {
		toastGenericError();
		throw new Error('container ref not set');
	}
	offsetX = event.offsetX;
	offsetY = event.offsetY;
	document.addEventListener('mousemove', handleMove);
	document.addEventListener('mouseup', cleanup);
}

function handleMove(event: MouseEvent) {
	if (!container.value) {
		toastGenericError();
		throw new Error('container ref not set');
	}
	event.preventDefault();
	container.value.style.left = `${event.clientX - offsetX}px`;
	container.value.style.top = `${event.clientY - offsetY}px`;
}

function cleanup() {
	document.removeEventListener('mousemove', handleMove);
	document.removeEventListener('mouseup', cleanup);
}
</script>

<template>
	<article ref="container" class="fixed min-h-20 w-60 flex flex-col border border-neutral">
		<h3
			class="h-10 flex cursor-move select-none items-center border-b border-b-neutral bg-white/70 px-2 text-neutral-8 dark:bg-black/70 dark:text-neutral-2"
			@mousedown="initDrag"
		>
			schowane
		</h3>
		<ul v-if="menuLinks.length" class="group flex flex-1 flex-col of-x-hidden of-y-auto bg-humbak text-black">
			<li
				v-for="hiddenLink in menuLinks"
				:key="hiddenLink.id"
				class="hoverable-child-menu-visible min-w-60 flex-center flex-1 list-none"
				:class="!isLinkGrabbed ? 'focus-within:bg-humbak-5 hover:bg-humbak-5' : ''"
			>
				<MenuLinkButton
					:item="hiddenLink"
					:path="[]"
					@mousedown="(...args) => $emit('menuLinkMouseDown', ...args)"
				/>
			</li>
			<div
				v-show="isLinkGrabbed"
				class="pointer-events-none absolute inset-0 hidden flex-center bg-black/10 group-hover:flex dark:bg-white/10"
			>
				<div class="i-fa6-solid-plus" />
			</div>
		</ul>
	</article>
</template>
