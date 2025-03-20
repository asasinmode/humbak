<script setup lang="ts">
import type { NuxtLink } from '#components';

const props = defineProps<{
	language: string;
	menuLink: IMenuTreeItem;
	isExpanded: boolean;
	isSecondLevel?: boolean;
	isToLeft?: boolean;
	parentId?: number;
}>();

defineEmits<{
	buttonClick: [id: number, parentId?: number];
	linkClick: [number];
}>();

const link = ref<typeof NuxtLink>();

const hasChildren = computed(() => !!props.menuLink.children.length);

const linkClass = computed(() => {
	const rv = [];

	if (!props.isSecondLevel) {
		rv.push('lg:truncate');
	}

	if (hasChildren.value) {
		rv.push(
			'absolute top-0 right-0 w-min transition-transform before:(content-empty transition-transform skew-x-10 top-0 w-[200%] -left-[0.125rem] z-1 h-full absolute) lg:before:hidden',
			props.isSecondLevel ? 'before:bg-humbak' : 'before:bg-humbak-3',
		);
		if (props.isExpanded) {
			rv.push(
				'translate-x-0 before:-translate-x-[calc(0%_+_var(--skew-width,_0px))]',
			);
		} else {
			rv.push('translate-x-full before:translate-x-5');
		}
	} else {
		rv.push('w-full');
		props.isExpanded && rv.push();
	}

	return rv;
});

onMounted(() => {
	const element: HTMLAnchorElement | undefined = link.value?.$el;
	if (!element) {
		console.warn('no link element found');
		return;
	}
	if (props.isSecondLevel || !hasChildren.value) {
		return;
	}

	const height = element.clientHeight;
	const skewedWidth = height * Math.tan(Math.PI * 10 / 180);
	element.style.setProperty('--skew-width', `${skewedWidth}px`);
});
</script>

<template>
	<button
		class="relative z-2 w-full of-hidden p-3 text-center before:(absolute left-0 top-0 z-1 size-full origin-bottom bg-humbak/20 transition-transform content-empty) lg:(hidden h-full before:hidden)"
		:class="[
			hasChildren ? '' : 'hidden',
			isSecondLevel ? '' : 'lg:truncate',
			isExpanded ? 'before:scale-y-full' : 'before:scale-y-0',
		]"
		:title="menuLink.text"
		@click.left="$emit('buttonClick', menuLink.pageId, parentId)"
	>
		<div class="pointer-events-none transition-transform" :class="isExpanded ? '-translate-x-1/6' : ''">
			<span class="sr-only lg:hidden">Rozwiń</span>
			{{ menuLink.text }}
			<div
				v-if="hasChildren && !isSecondLevel"
				class="i-ph-caret-down-bold pointer-events-none inline-block h-3 w-3 text-humbak-8 transition-transform lg:(absolute bottom-[0.125rem] left-1/2 block rotate-0 text-inherit -translate-x-1/2)"
				:class="isExpanded ? '-rotate-180' : ''"
			/>
			<div
				v-if="hasChildren && isSecondLevel"
				class="i-ph-caret-down-bold pointer-events-none inline-block h-3 w-3 text-humbak-8 transition-transform lg:(absolute top-1/2 block rotate-0 text-inherit -translate-y-1/2)"
				:class="[
					isExpanded ? '-rotate-180' : '',
					isToLeft
						? 'lg:(left-[0.125rem] i-ph-caret-left-bold)'
						: 'lg:(right-[0.125rem] i-ph-caret-right-bold)',
				]"
			/>
		</div>
	</button>

	<NuxtLink
		ref="link"
		class="z-2 block p-3 text-center lg:(static size-full translate-x-0 bg-inherit hoverable:bg-humbak-6)"
		:class="linkClass"
		:title="menuLink.text"
		:to="`/${language}/${menuLink.href}`"
		@click.left="$emit('linkClick', menuLink.pageId)"
	>
		<span
			aria-hidden="true"
			class="relative z-2 whitespace-nowrap"
			:class="hasChildren ? 'lg:hidden' : 'hidden'"
		>
			Przejdź do
		</span>
		<span :class="hasChildren ? 'sr-only lg:(not-sr-only static)' : ''">
			{{ menuLink.text }}
		</span>
		<div
			v-if="hasChildren && !isSecondLevel"
			class="i-ph-caret-down-bold pointer-events-none absolute bottom-[0.125rem] left-1/2 hidden h-3 w-3 lg:block -translate-x-1/2"
		/>
		<div
			v-if="hasChildren && isSecondLevel"
			class="i-ph-caret-down-bold pointer-events-none absolute top-1/2 block hidden h-3 w-3 lg:block -translate-y-1/2"
			:class="
				isToLeft
					? 'left-[0.125rem] i-ph-caret-left-bold'
					: 'right-[0.125rem] i-ph-caret-right-bold'
			"
		/>
	</NuxtLink>
</template>
