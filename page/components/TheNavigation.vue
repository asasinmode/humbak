<script setup lang="ts">
import { useMobileMenu } from '@humbak/shared';
import type { IMenuTreeItem } from '@humbak/shared';
import type { ComponentPublicInstance } from 'vue';

const props = defineProps<{
	language: string;
	menuLinks: IMenuTreeItem[];
}>();

function isMenuToTheLeft(indexOnLevel: number) {
	return indexOnLevel + 1 > Math.ceil(props.menuLinks.length / 2);
}

const secondFocusableNavElement = ref<ComponentPublicInstance>();
const menu = ref<HTMLMenuElement>();
let secondToLastMenuLink: HTMLElement;

const expandedMenuLinkId = ref<number>();

function toggleMenuLinkExpanded(id: number, event: MouseEvent, parentId?: number) {
	expandedMenuLinkId.value = expandedMenuLinkId.value === id ? parentId : id;
}

function expandIfChildNotExpanded(id: number, children?: IMenuTreeItem[], parentId?: number) {
	if (children) {
		for (const child of children) {
			if (child.pageId === expandedMenuLinkId.value) {
				return;
			}
		}
	}
	expandedMenuLinkId.value = expandedMenuLinkId.value === id ? parentId : id;
}

const expandedMenuIds = computed(() => {
	for (const menuLink of props.menuLinks) {
		if (menuLink.pageId === expandedMenuLinkId.value) {
			return [menuLink.pageId];
		}

		for (const child of menuLink.children) {
			if (child.pageId === expandedMenuLinkId.value) {
				return [menuLink.pageId, child.pageId];
			}

			for (const grandChild of child.children) {
				if (grandChild.pageId === expandedMenuLinkId.value) {
					return [menuLink.pageId, child.pageId, grandChild.pageId];
				}
			}
		}
	}
	return [];
});

function isMenuExpanded(id: number) {
	return expandedMenuIds.value.includes(id);
}

watch(expandedMenuIds, (newValue, oldValue) => {
	let previousNestedHeight = 0;
	const hasNestedChanged = oldValue[1] !== newValue[1];
	if (hasNestedChanged) {
		const { oldValue: oldNestedHeightValue } = updateMenuHeight(oldValue[1], { isNested: true, reset: true });
		previousNestedHeight = oldNestedHeightValue;
	}
	const hasTopChanged = oldValue[0] !== newValue[0];
	if (hasTopChanged) {
		updateMenuHeight(oldValue[0], { reset: true });
	}

	const { newValue: nestedHeight } = updateMenuHeight(newValue[1], { isNested: true });
	updateMenuHeight(newValue[0], {
		add: nestedHeight,
		previouslyNestedExpandedHeight: hasNestedChanged && !hasTopChanged ? previousNestedHeight : 0,
	});
});

function updateMenuHeight(
	id?: number,
	{ isNested, reset, add, previouslyNestedExpandedHeight }: {
		isNested?: boolean;
		reset?: boolean;
		add?: number;
		previouslyNestedExpandedHeight?: number;
	} = {}
) {
	const element = id !== undefined ? document.getElementById(`menu${id}`) : null;
	if (!element) {
		return { oldValue: 0, newValue: 0 };
	}
	const oldValue = element.scrollHeight;
	const property = isNested ? '--nested-scroll-height' : '--scroll-height';
	let value = reset ? 0 : (element.scrollHeight + (add ?? 0));
	value -= previouslyNestedExpandedHeight ?? 0;

	if (previouslyNestedExpandedHeight) {
		console.log('updating', { isNested, reset, add, previouslyNestedExpandedHeight }, element);
	}

	element.style.setProperty(property, `${value}px`);

	return { oldValue, newValue: element.scrollHeight };
}

const {
	isExpanded,
	toggleMenu,
	firstElementFocusIn,
	firstElementFocusOut,
	lastElementFocusIn,
	lastElementFocusOut,
} = useMobileMenu(
	1024,
	() => secondFocusableNavElement.value!.$el,
	() => secondToLastMenuLink
);

let previousWindowWidth = 0;
onMounted(() => {
	window.addEventListener('resize', onWindowResize, { passive: true });
	previousWindowWidth = window.innerWidth;

	if (!menu.value) {
		console.error('menu ref not found');
		return;
	}

	const buttons = menu.value.querySelectorAll<HTMLElement>('button:not(.hidden), a:not(.hidden)');

	secondToLastMenuLink = buttons.item(buttons.length - 2)!;

	const lastMenuLink = buttons.item(buttons.length - 1)!;
	lastMenuLink.addEventListener('focusin', lastElementFocusIn);
	lastMenuLink.addEventListener('focusout', lastElementFocusOut);
});

onBeforeUnmount(() => {
	window.removeEventListener('resize', onWindowResize);
});

function onWindowResize() {
	if (previousWindowWidth > window.innerWidth && previousWindowWidth >= 1024 && window.innerWidth < 1024) {
		expandedMenuLinkId.value = undefined;
		toggleMenu(false);
	}
	previousWindowWidth = window.innerWidth;

	// const nestedExpandedMenuId = expandedMenuIds.value[1];
	// const nestedExpandedMenu = nestedExpandedMenuId !== undefined ? document.getElementById(`menu${nestedExpandedMenuId}`) : null;
	// let nestedExpandedMenuScrollHeight = 0;
	// if (nestedExpandedMenu) {
	// 	nestedExpandedMenu.style.height = 'auto';
	// 	nestedExpandedMenuScrollHeight = nestedExpandedMenu.scrollHeight;
	// 	nestedExpandedMenu.style.setProperty('--scroll-height', `${nestedExpandedMenu.scrollHeight}`);
	// 	nestedExpandedMenu.style.height = '';
	// 	console.log('set nested to', nestedExpandedMenu.style.getPropertyValue('--scroll-height'), nestedExpandedMenu);
	// }

	// const expandedMenuId = expandedMenuIds.value[0];
	// const expandedMenu = expandedMenuId !== undefined ? document.getElementById(`menu${expandedMenuId}`) : null;
	// if (!expandedMenu) {
	// 	return;
	// }

	// expandedMenu.style.height = 'auto';
	// expandedMenu.style.setProperty('--scroll-height', `${expandedMenu.scrollHeight}px`);
	// expandedMenu.style.height = '';
	// console.log('set top to', expandedMenu.style.getPropertyValue('--scroll-height'), expandedMenu);

	// expandedMenu.style.setProperty(
	// 	'--nested-scroll-height',
	// 	`${nestedExpandedMenuScrollHeight}px`
	// );
}

function closeMenuAndSetExpanded(id?: number) {
	toggleMenu(false);
	expandedMenuLinkId.value = id;
}
</script>

<template>
	<button
		id="menuToggle"
		title="menu"
		class="fixed z-100 flex items-start justify-end outline-offset-2 bg-black lg:hidden before:(fixed content-empty top-[0.625rem] right-[0.625rem] shadow w-11 h-11 bg-humbak rounded-full)"
		:class="[
			isExpanded
				? 'bg-opacity-40 top-0 right-0 w-screen h-screen p-[1.375rem] cursor-default is-expanded'
				: 'bg-opacity-0 top-3 right-3 w-10 h-10 p-[0.625rem] rounded-full',
		]"
		@click.left="toggleMenu(!isExpanded)"
	>
		<span class="visually-hidden">menu</span>
		<div class="i-fa6-solid-bars h-5 w-5" />
	</button>

	<nav
		id="mainNav"
		tabindex="-1"
		class="fixed w-full top-0 max-h-[calc(100vh_-_clamp(3rem,_-1rem_+_20vh,_8rem))] bg-white of-y-auto of-x-hidden z-102 drop-shadow transition-transform lg:(bg-humbak sticky h-12 translate-y-0 of-visible)"
		:class="[isExpanded ? 'translate-y-0 shadow-md' : '-translate-y-full']"
	>
		<menu ref="menu" class="grid grid-cols-2 relative max-w-384 h-full text-black lg:(px-12 flex flex-row mx-auto)">
			<button
				class="w-12 h-12 col-start-2 row-start-1 ml-2 my-2 hoverable:text-humbak-8 flex-center lg:(m-0 absolute right-0 hoverable:bg-humbak-5 hoverable:text-inherit z-10)"
				title="język"
				@focusin="firstElementFocusIn"
				@focusout="firstElementFocusOut"
			>
				<span class="visually-hidden">język</span>
				<div class="i-ph-translate-bold pointer-events-none w-6 h-6" />
			</button>

			<NuxtLink
				ref="secondFocusableNavElement"
				class="w-12 h-12 col-start-1 row-start-1 my-2 hoverable:text-humbak-8 justify-self-end mr-2 flex-center lg:(m-0 absolute left-0 hoverable:bg-humbak-5 hoverable:text-inherit z-10)"
				title="home"
				:to="`/${language}`"
				@click.left="closeMenuAndSetExpanded()"
			>
				<span class="visually-hidden">home</span>
				<div class="i-ph-house-fill pointer-events-none w-6 h-6" />
			</NuxtLink>

			<a
				id="skipContent"
				href="#content"
				class="fixed col-span-full w-fit whitespace-nowrap z-10 border border-black rounded-full bg-black px-3 py-1 text-5 text-white shadow transition-transform -translate-y-full left-1/2 -translate-x-1/2 focus-visible:translate-y-3 focus:translate-y-3 lg:(-translate-y-[calc(100%_+_5rem)] left-1/2 -translate-x-1/2 focus-visible:translate-y-1 focus:translate-y-1)"
			>
				pomiń nawigację h-full
			</a>

			<li
				v-for="(firstLevelLink, firstLevelIndex) in menuLinks"
				:key="firstLevelLink.pageId"
				class="hoverable-child-menu-visible flex flex-col col-span-full relative min-w-0 lg:(flex-1 h-full focus-within:bg-humbak-5 hover:bg-humbak-5)"
			>
				<MenuLinkButton
					v-model="expandedMenuLinkId"
					:menu-link="firstLevelLink"
					:is-expanded="isMenuExpanded(firstLevelLink.pageId)"
					:language
					@button-click="toggleMenuLinkExpanded"
					@button-focus="expandIfChildNotExpanded"
					@link-click="closeMenuAndSetExpanded"
				/>

				<menu
					v-if="firstLevelLink.children.length"
					:id="`menu${firstLevelLink.pageId}`"
					class="w-full h-[var(--scroll-height,_0px)] transition-height bg-humbak/20 of-hidden lg:(absolute bg-humbak-5 bottom-0 translate-y-full h-auto of-visible)"
				>
					<li
						v-for="secondLevelLink in firstLevelLink.children"
						:key="secondLevelLink.pageId"
						class="hoverable-child-menu-visible relative flex flex-col lg:(focus-within:bg-humbak-6 hover:bg-humbak-6)"
					>
						<MenuLinkButton
							v-model="expandedMenuLinkId"
							:menu-link="secondLevelLink"
							:is-expanded="isMenuExpanded(secondLevelLink.pageId)"
							:is-to-left="isMenuToTheLeft(firstLevelIndex)"
							:parent-id="firstLevelLink.pageId"
							:language
							is-second-level
							@button-click="toggleMenuLinkExpanded"
							@button-focus="expandIfChildNotExpanded"
							@link-click="closeMenuAndSetExpanded"
						/>

						<menu
							v-if="secondLevelLink.children.length"
							:id="`menu${secondLevelLink.pageId}`"
							class="w-full h-[var(--nested-scroll-height,_0px)] transition-height bg-humbak/20 of-hidden lg:(absolute bg-humbak-6 top-0 h-auto of-visible)"
							:class="[
								isMenuToTheLeft(firstLevelIndex)
									? 'lg:(left-0 -translate-x-full)' : 'lg:(right-0 translate-x-full)',
							]"
						>
							<li
								v-for="thirdLevelLink in secondLevelLink.children"
								:key="thirdLevelLink.pageId"
								class="lg:(focus-within:bg-humbak-7 hover:bg-humbak-7)"
							>
								<NuxtLink
									class="w-full p-3 lg:h-full block text-center"
									:to="`/${language}/${thirdLevelLink.href}`"
									:title="thirdLevelLink.text"
									@focus="expandedMenuLinkId = thirdLevelLink.pageId"
									@click.left="closeMenuAndSetExpanded(secondLevelLink.pageId)"
								>
									{{ thirdLevelLink.text }}
								</NuxtLink>
							</li>
						</menu>
					</li>
				</menu>
			</li>
		</menu>
	</nav>
</template>

<style>
#menuToggle {
	--nav-transition-duration: 150ms;

	transition: background var(--nav-transition-duration) ease,
		width 0ms ease var(--nav-transition-duration),
		height 0ms ease var(--nav-transition-duration),
		right 0ms ease var(--nav-transition-duration),
		top 0ms ease var(--nav-transition-duration),
		border-radius 0ms ease var(--nav-transition-duration),
		padding 0ms ease var(--nav-transition-duration);
}
#menuToggle.is-expanded {
	transition: background var(--nav-transition-duration) ease;
}

@media (min-width: 1024px) {
	.hoverable-child-menu-visible > menu {
		display: none;
	}

	.hoverable-child-menu-visible:hover > menu,
	.hoverable-child-menu-visible:focus-within > menu {
		display: block;
	}
}
</style>
