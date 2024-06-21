<script setup lang="ts">
import type { IMenuTreeItem } from '@humbak/shared';

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

const link = ref<HTMLAnchorElement>();

const hasChildren = computed(() => !!props.menuLink.children.length);

const linkClass = computed(() => {
	const rv = [];

	if (!props.isSecondLevel) {
		rv.push('lg:truncate');
	}

	if (hasChildren.value) {
		rv.push(
			'absolute top-0 right-0 w-min transition-transform before:(content-empty transition-transform skew-x-10 top-0 w-[200%] -left-[0.125rem] z-1 h-full absolute) lg:before:hidden',
			props.isSecondLevel ? 'before:bg-humbak' : 'before:bg-humbak-3'
		);
		if (props.isExpanded) {
			rv.push(
				'translate-x-0 before:-translate-x-[calc(0%_+_var(--skew-width,_0px))]'
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
	const element = link.value as HTMLElement;
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
		class="relative text-center of-hidden z-2 p-3 w-full before:(content-empty transition-transform origin-bottom z-1 absolute w-full h-full bg-humbak/20 top-0 left-0) lg:(hidden h-full before:hidden)"
		:class="[
			hasChildren ? '' : 'hidden',
			isSecondLevel ? '' : 'lg:truncate',
			isExpanded ? 'before:scale-y-full' : 'before:scale-y-0',
		]"
		:title="menuLink.text"
		@click.left="$emit('buttonClick', menuLink.pageId, parentId)"
	>
		<div class="transition-transform pointer-events-none" :class="isExpanded ? '-translate-x-1/6' : ''">
			<span class="visually-hidden lg:hidden">Rozwiń</span>
			{{ menuLink.text }}
			<div
				v-if="hasChildren && !isSecondLevel"
				class="i-ph-caret-down-bold transition-transform text-humbak-8 inline-block pointer-events-none h-3 w-3 lg:(block absolute bottom-[0.125rem] left-1/2 -translate-x-1/2 rotate-0 text-inherit)"
				:class="isExpanded ? '-rotate-180' : ''"
			/>
			<div
				v-if="hasChildren && isSecondLevel"
				class="pointer-events-none h-3 w-3 transition-transform inline-block i-ph-caret-down-bold text-humbak-8 lg:(absolute block top-1/2 -translate-y-1/2 rotate-0 text-inherit)"
				:class="[
					isExpanded ? '-rotate-180' : '',
					isToLeft
						? 'lg:(left-[0.125rem] i-ph-caret-left-bold)'
						: 'lg:(right-[0.125rem] i-ph-caret-right-bold)',
				]"
			/>
		</div>
	</button>

	<a
		ref="link"
		class="p-3 text-center block z-2 lg:(h-full w-full translate-x-0 static bg-inherit hoverable:bg-humbak-6)"
		:class="linkClass"
		:title="menuLink.text"
		:href="`/${language}/${menuLink.href}`"
		@click.left="$emit('linkClick', menuLink.pageId)"
	>
		<span
			aria-hidden="true"
			class="whitespace-nowrap relative z-2"
			:class="hasChildren ? 'lg:hidden' : 'hidden'"
		>
			Przejdź do
		</span>
		<span :class="hasChildren ? 'visually-hidden lg:(undo-visually-hidden static)' : ''">
			{{ menuLink.text }}
		</span>
		<div
			v-if="hasChildren && !isSecondLevel"
			class="i-ph-caret-down-bold hidden pointer-events-none h-3 w-3 absolute bottom-[0.125rem] left-1/2 -translate-x-1/2 lg:block"
		/>
		<div
			v-if="hasChildren && isSecondLevel"
			class="pointer-events-none h-3 w-3 i-ph-caret-down-bold absolute block top-1/2 -translate-y-1/2 hidden lg:block"
			:class="
				isToLeft
					? 'left-[0.125rem] i-ph-caret-left-bold'
					: 'right-[0.125rem] i-ph-caret-right-bold'
			"
		/>
	</a>
</template>
