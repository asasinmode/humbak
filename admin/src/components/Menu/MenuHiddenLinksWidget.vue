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
const article = ref<HTMLElement>();

function initDrag(event: MouseEvent) {
	if (!article.value) {
		toast('coś poszło nie tak');
		throw new Error();
	}
}
</script>

<template>
	<article ref="article" class="fixed min-h-20 w-60 flex flex-col border border-neutral">
		<h3
			class="h-10 flex cursor-move select-none items-center border-b border-b-neutral bg-white/50 dark:bg-black/50"
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
