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

let previousTopLevelExpandedId: number | undefined;
const expandedMenuLinkId = ref<number>();

function toggleMenuLinkExpanded(id: number, event: MouseEvent, parentId?: number) {
	if (parentId !== undefined) {
		previousTopLevelExpandedId = parentId;
	}

	const parentMenu = (event.target as HTMLElement)?.closest('menu');
	const targetMenu = (event.target as HTMLElement)?.nextSibling as HTMLElement | null;

	if (parentId === undefined && expandedMenuLinkId.value !== undefined) {
		for (const menuLink of props.menuLinks) {
			if (menuLink.pageId !== id) {
				continue;
			}
			for (const child of menuLink.children) {
				if (child.pageId === expandedMenuLinkId.value) {
					targetMenu?.style.setProperty('--nested-scroll-height', `0px`);
					expandedMenuLinkId.value = undefined;
					return;
				}
			}
		}
	}

	const isToggling = expandedMenuLinkId.value === id;
	if (parentId !== undefined) {
		parentMenu?.style.setProperty(
			'--nested-scroll-height',
			`${isToggling ? 0 : targetMenu?.scrollHeight || 0}px`
		);
	} else if (!isToggling) {
		const previousToCollapse = previousTopLevelExpandedId !== undefined ? document.getElementById(`menu${previousTopLevelExpandedId}`) : undefined;
		previousToCollapse?.style.setProperty('--nested-scroll-height', '0px');
		previousTopLevelExpandedId = undefined;
	}

	expandedMenuLinkId.value = isToggling ? parentId : id;
}

function expandIfChildNotExpanded(id: number, children?: IMenuTreeItem[], parentId?: number, event?: FocusEvent) {
	if (children) {
		for (const child of children) {
			if (child.pageId === expandedMenuLinkId.value) {
				return;
			}
		}
	}
	previousTopLevelExpandedId = parentId;
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

	const menus = menu.value.getElementsByTagName('menu');
	for (const menu of menus) {
		menu.style.setProperty('--scroll-height', `${menu.scrollHeight}px`);
	}
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
				pomiń nawigację
			</a>

			<li
				v-for="(firstLevelLink, firstLevelIndex) in menuLinks"
				:key="firstLevelLink.pageId"
				class="hoverable-child-menu-visible flex flex-col col-span-full relative min-w-0 lg:(flex-1 h-full focus-within:bg-humbak-5 hover:bg-humbak-5)"
			>
				<button
					class="relative text-center of-hidden z-0 transition-transform p-3 w-full before:(content-empty transition-transform origin-bottom -z-1 absolute w-full h-full bg-humbak/20 top-0 left-0) lg:(hidden h-full truncate before:hidden)"
					:class="[
						firstLevelLink.children.length ? '' : 'hidden',
						isMenuExpanded(firstLevelLink.pageId) ? 'before:scale-y-full -translate-x-1/6' : 'before:scale-y-0',
					]"
					:title="firstLevelLink.text"
					@mousedown.left.prevent="toggleMenuLinkExpanded(firstLevelLink.pageId, $event)"
					@focus="expandIfChildNotExpanded(firstLevelLink.pageId, firstLevelLink.children)"
				>
					<span class="visually-hidden lg:hidden">rozwiń</span>
					{{ firstLevelLink.text }}
					<div
						v-if="firstLevelLink.children.length"
						class="i-ph-caret-down-bold transition-transform text-humbak-8 inline-block pointer-events-none h-3 w-3 lg:(block absolute bottom-[0.125rem] left-1/2 -translate-x-1/2 rotate-0 text-inherit)"
						:class="isMenuExpanded(firstLevelLink.pageId) ? '-rotate-180' : ''"
					/>
				</button>

				<NuxtLink
					class="w-1/3 bg-humbak absolute top-0 right-0 transition-transform p-3 text-center lg:(h-full block truncate translate-x-0 static bg-inherit w-full hoverable:bg-humbak-6)"
					:class="isMenuExpanded(firstLevelLink.pageId) ? 'translate-x-0' : 'translate-x-full'"
					:title="firstLevelLink.text"
					:to="`/${language}/${firstLevelLink.href}`"
					@click.left="closeMenuAndSetExpanded(firstLevelLink.pageId)"
					@focus="expandedMenuLinkId = firstLevelLink.pageId"
				>
					<span class="lg:hidden">Przejdź do</span>
					<span class="hidden lg:inline">
						{{ firstLevelLink.text }}
					</span>
					<div
						v-if="firstLevelLink.children.length"
						class="i-ph-caret-down-bold hidden pointer-events-none h-3 w-3 absolute bottom-[0.125rem] left-1/2 -translate-x-1/2 lg:block"
					/>
				</NuxtLink>

				<menu
					v-if="firstLevelLink.children.length"
					:id="`menu${firstLevelLink.pageId}`"
					class="w-full bg-humbak/20 col-span-full transition-height of-hidden lg:(absolute bg-humbak-5 bottom-0 translate-y-full h-auto of-visible)"
					:class="isMenuExpanded(firstLevelLink.pageId)
						? 'h-[calc(var(--scroll-height,_auto)_+_var(--nested-scroll-height,_0px))]' : 'h-0'
					"
				>
					<li
						v-for="secondLevelLink in firstLevelLink.children"
						:key="secondLevelLink.pageId"
						class="hoverable-child-menu-visible relative lg:(focus-within:bg-humbak-6 hover:bg-humbak-6)"
					>
						<NuxtLink
							class="w-full p-3 lg:h-full text-center lg:block"
							:class="secondLevelLink.children.length ? 'hidden' : 'block'"
							:title="secondLevelLink.text"
							:to="`/${language}/${secondLevelLink.href}`"
							@click.left="closeMenuAndSetExpanded(secondLevelLink.pageId)"
							@focus="expandedMenuLinkId = secondLevelLink.pageId"
						>
							{{ secondLevelLink.text }}
							<div
								v-if="secondLevelLink.children.length"
								class="pointer-events-none h-3 w-3 i-ph-caret-down-bold absolute block top-1/2 -translate-y-1/2 hidden lg:block"
								:class="
									isMenuToTheLeft(firstLevelIndex)
										? 'left-[0.125rem] i-ph-caret-left-bold'
										: 'right-[0.125rem] i-ph-caret-right-bold'
								"
							/>
						</NuxtLink>

						<button
							class="relative z-0 text-center p-3 w-full before:(content-empty transition-transform origin-bottom -z-1 absolute w-full h-full bg-humbak/20 top-0 left-0) lg:(hidden h-full before:hidden)"
							:class="[
								secondLevelLink.children.length ? '' : 'hidden',
								isMenuExpanded(secondLevelLink.pageId) ? 'before:scale-y-full' : 'before:scale-y-0',
							]"
							:title="secondLevelLink.text"
							@mousedown.left.prevent="toggleMenuLinkExpanded(secondLevelLink.pageId, $event, firstLevelLink.pageId)"
							@focus="expandIfChildNotExpanded(secondLevelLink.pageId, undefined, firstLevelLink.pageId, $event)"
						>
							<span class="visually-hidden lg:hidden">rozwiń</span>
							{{ secondLevelLink.text }}
							<div
								v-if="secondLevelLink.children.length"
								class="pointer-events-none h-3 w-3 transition-transform inline-block i-ph-caret-down-bold text-humbak-8 lg:(absolute block top-1/2 -translate-y-1/2 rotate-0 text-inherit)"
								:class="[
									isMenuExpanded(secondLevelLink.pageId) ? '-rotate-180' : '',
									isMenuToTheLeft(firstLevelIndex)
										? 'lg:(left-[0.125rem] i-ph-caret-left-bold)'
										: 'lg:(right-[0.125rem] i-ph-caret-right-bold)',
								]"
							/>
						</button>

						<menu
							v-if="secondLevelLink.children.length"
							class="w-full transition-height bg-humbak/20 of-hidden lg:(absolute bg-humbak-6 top-0 h-auto of-visible)"
							:class="[
								isMenuToTheLeft(firstLevelIndex)
									? 'lg:(left-0 -translate-x-full)' : 'lg:(right-0 translate-x-full)',
								isMenuExpanded(secondLevelLink.pageId)
									? 'h-[var(--scroll-height)]' : 'h-0',
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

/* @media (max-width: 767px){ */
/* 	#skipContent:focus + a, #skipContent:focus-visible + a { */
/* 		margin-top: 3.125rem; */
/* 	} */
/* } */
</style>
