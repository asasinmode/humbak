<script setup lang="ts">
import type { IMenuTreeItem } from '@humbak/shared';

const props = defineProps<{
	language: string;
	menuLink: IMenuTreeItem;
	isExpanded: boolean;
}>();

defineEmits<{
	buttonClick: [number, MouseEvent];
	buttonFocus: [number, IMenuTreeItem[]];
	linkClick: [number];
}>();

const expandedMenuLinkId = defineModel<number | undefined>({ required: true });

const hasChildren = computed(() => !!props.menuLink.children.length);

const linkClass = computed(() => {
	const rv = [];

	if (hasChildren.value) {
		rv.push('absolute bg-humbak top-0 right-0 w-min transition-transform');
		if (props.isExpanded) {
			rv.push('translate-x-0');
		} else {
			rv.push('translate-x-full');
		}
	} else {
		rv.push('w-full');
		props.isExpanded && rv.push();
	}

	return rv;
});
</script>

<template>
	<button
		class="relative text-center of-hidden z-0 p-3 w-full before:(content-empty transition-transform origin-bottom -z-1 absolute w-full h-full bg-humbak/20 top-0 left-0) lg:(hidden h-full truncate before:hidden)"
		:class="[
			hasChildren ? '' : 'hidden',
			isExpanded ? 'before:scale-y-full' : 'before:scale-y-0',
		]"
		:title="menuLink.text"
		@mousedown.left.prevent="$emit('buttonClick', menuLink.pageId, $event)"
		@focus="$emit('buttonFocus', menuLink.pageId, menuLink.children)"
	>
		<div class="transition-transform" :class="isExpanded ? '-translate-x-1/6' : ''">
			<span class="visually-hidden lg:hidden">Rozwiń</span>
			{{ menuLink.text }}
			<div
				v-if="hasChildren"
				class="i-ph-caret-down-bold transition-transform text-humbak-8 inline-block pointer-events-none h-3 w-3 lg:(block absolute bottom-[0.125rem] left-1/2 -translate-x-1/2 rotate-0 text-inherit)"
				:class="isExpanded ? '-rotate-180' : ''"
			/>
		</div>
	</button>

	<NuxtLink
		class="p-3 text-center lg:(h-full block truncate translate-x-0 static bg-inherit w-full hoverable:bg-humbak-6)"
		:class="linkClass"
		:title="menuLink.text"
		:to="`/${language}/${menuLink.href}`"
		@click.left="$emit('linkClick', menuLink.pageId)"
		@focus="expandedMenuLinkId = menuLink.pageId"
	>
		<span aria-hidden="true" class="whitespace-nowrap" :class="hasChildren ? 'lg:hidden' : 'hidden'">Przejdź do</span>
		<span :class="hasChildren ? 'visually-hidden lg:(undo-visually-hidden static)' : ''">
			{{ menuLink.text }}
		</span>
		<div
			v-if="hasChildren"
			class="i-ph-caret-down-bold hidden pointer-events-none h-3 w-3 absolute bottom-[0.125rem] left-1/2 -translate-x-1/2 lg:block"
		/>
	</NuxtLink>
</template>
