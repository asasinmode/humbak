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
const isExpanded = ref(false);

let offsetX = 0;
let offsetY = 0;
let mouseDownTimestamp: number | undefined;

function initDrag(event: MouseEvent) {
	if (!container.value) {
		toastGenericError();
		throw new Error('container not found');
	}
	event.preventDefault();
	offsetX = event.offsetX;
	offsetY = event.offsetY;
	mouseDownTimestamp = Date.now();
	document.addEventListener('mousemove', handleMove);
	document.addEventListener('mouseup', cleanup);
}

function handleMove(event: MouseEvent) {
	if (!container.value) {
		toastGenericError();
		throw new Error('containe not found');
	}
	event.preventDefault();
	container.value.style.left = `${event.clientX - offsetX}px`;
	container.value.style.top = `${event.clientY - offsetY}px`;
}

function cleanup() {
	if (mouseDownTimestamp && mouseDownTimestamp + 250 > Date.now()) {
		isExpanded.value = !isExpanded.value;
	}
	mouseDownTimestamp = undefined;
	document.removeEventListener('mousemove', handleMove);
	document.removeEventListener('mouseup', cleanup);
}

defineExpose({
	container,
});
</script>

<template>
	<article
		ref="container"
		class="group fixed top-[4.6rem] z-20 hidden w-60 flex-col border border-neutral shadow lg:flex"
		:class="isExpanded ? 'min-h-20' : ''"
	>
		<button
			class="h-10 select-none border-neutral bg-white/70 px-2 text-neutral-8 dark:bg-black/70 dark:text-neutral-2"
			@mousedown.left="initDrag"
			@keydown.enter="isExpanded = !isExpanded"
		>
			schowane ({{ menuLinks.length }})
		</button>
		<ul
			v-if="menuLinks.length"
			class="max-h-80 flex flex-col of-x-hidden border-neutral bg-humbak text-black"
			:class="isExpanded ? 'h-auto of-y-auto flex-1 border-t' : 'h-0 of-y-hidden'"
		>
			<li
				v-for="hiddenLink in menuLinks"
				:key="hiddenLink.pageId"
				class="hoverable-child-menu-visible min-w-60 flex-center flex-1 list-none focus-within:bg-humbak-5 hover:bg-humbak-5"
			>
				<MenuLinkButton
					:item="hiddenLink"
					:path="[-1]"
					@mousedown="(...args) => $emit('menuLinkMouseDown', ...args)"
				/>
			</li>
		</ul>
		<div
			v-show="isLinkGrabbed"
			class="absolute inset-0 hidden flex-center bg-black/10 group-hover:flex dark:bg-white/10"
		>
			<div class="i-fa6-solid-plus h-6 w-6" />
		</div>
	</article>
</template>
