<script setup lang="ts">
import { useMobileMenu } from '@humbak/shared';
import type { IMenuTreeItem } from '@humbak/shared';

const props = defineProps<{
	language: string;
	menuLinks: IMenuTreeItem[];
}>();

function isMenuToTheLeft(indexOnLevel: number) {
	return indexOnLevel + 1 > Math.ceil(props.menuLinks.length / 2);
}

const firstFocusableNavElement = ref<HTMLButtonElement>();
const menu = ref<HTMLMenuElement>();
let secondToLastMenuLink: HTMLElement;

const expandedMenuLinkId = ref<number>();

function toggleMenuLinkExpanded(id: number, parentId?: number) {
	if (parentId === undefined && expandedMenuLinkId.value !== undefined) {
		for (const menuLink of props.menuLinks) {
			if (menuLink.pageId !== id) {
				continue;
			}
			for (const child of menuLink.children) {
				if (child.pageId === expandedMenuLinkId.value) {
					expandedMenuLinkId.value = undefined;
					return;
				}
			}
		}
	}
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

const {
	isExpanded,
	toggleMenu,
	toggleButtonFocusIn,
	toggleButtonFocusOut,
	lastElementFocusIn,
	lastElementFocusOut,
} = useMobileMenu(
	1024,
	() => firstFocusableNavElement.value!,
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
		@click="toggleMenu(!isExpanded)"
		@focusin="toggleButtonFocusIn"
		@focusout="toggleButtonFocusOut"
	>
		<span class="visually-hidden">menu</span>
		<div class="i-fa6-solid-bars h-5 w-5" />
	</button>

	<nav
		id="mainNav"
		class="fixed w-full max-h-[calc(100vh_-_clamp(3rem,_-1rem_+_20vh,_8rem))] bg-humbak of-auto z-102 drop-shadow transition-transform lg:(sticky top-0 h-12 translate-y-0 of-visible)"
		:class="[isExpanded ? 'translate-y-0 shadow-md' : '-translate-y-full']"
	>
		<menu ref="menu" class="flex flex-col relative max-w-384 h-full text-black lg:(px-12 flex-row mx-auto)">
			<button
				ref="firstFocusableNavElement"
				class="w-12 h-12 absolute right-0 flex-center hoverable:bg-humbak-5 z-10"
				title="język"
			>
				<span class="visually-hidden">język</span>
				<div class="i-ph-translate-bold pointer-events-none w-6 h-6" />
			</button>

			<NuxtLink
				class="w-12 h-12 absolute left-0 flex-center hoverable:bg-humbak-5 z-10"
				title="home"
				:to="`/${language}`"
				@click="closeMenuAndSetExpanded()"
			>
				<span class="visually-hidden">home</span>
				<div class="i-ph-house-fill pointer-events-none w-6 h-6" />
			</NuxtLink>

			<a
				id="skipContent"
				href="#content"
				class="fixed col-span-2 w-fit z-10 border border-black rounded-full bg-black px-3 py-1 text-5 text-white shadow transition-transform -translate-y-full focus-visible:translate-y-2 focus:translate-y-2 lg:(-translate-y-[calc(100%_+_5rem)] left-1/2 -translate-x-1/2 focus-visible:translate-y-1 focus:translate-y-1)"
			>
				pomiń nawigację
			</a>

			<li
				v-for="(firstLevelLink, firstLevelIndex) in menuLinks"
				:key="firstLevelLink.pageId"
				class="hoverable-child-menu-visible relative min-w-0 flex-center flex-col lg:(flex-1 h-full focus-within:bg-humbak-5 hover:bg-humbak-5)"
			>
				<NuxtLink
					class="w-full p-3 lg:h-full text-center"
					:class="firstLevelLink.children.length ? 'hidden' : 'block'"
					:title="firstLevelLink.text"
					:to="`/${language}/${firstLevelLink.href}`"
					@click="closeMenuAndSetExpanded(firstLevelLink.pageId)"
					@focus="expandedMenuLinkId = firstLevelLink.pageId"
				>
					{{ firstLevelLink.text }}
				</NuxtLink>

				<button
					class="relative w-full p-3 lg:(h-full truncate)"
					:class="firstLevelLink.children.length ? '' : 'hidden'"
					:title="`rozwiń ${firstLevelLink.text}`"
					@mousedown.prevent="toggleMenuLinkExpanded(firstLevelLink.pageId)"
					@focus="expandIfChildNotExpanded(firstLevelLink.pageId, firstLevelLink.children)"
				>
					<span class="visually-hidden">rozwiń</span>
					{{ firstLevelLink.text }}
					<div
						v-if="firstLevelLink.children.length"
						class="i-ph-caret-down-bold inline-block pointer-events-none h-3 w-3 lg:(block absolute bottom-[0.125rem] left-1/2 -translate-x-1/2 rotate-0)"
						:class="isMenuExpanded(firstLevelLink.pageId) ? 'rotate-180' : ''"
					/>
				</button>

				<menu
					v-if="firstLevelLink.children.length"
					class="bg-humbak-5 w-full lg:(absolute bottom-0 translate-y-full max-h-unset of-visible)"
					:class="isMenuExpanded(firstLevelLink.pageId)
						? 'max-h-unset' : 'max-h-0 of-hidden'
					"
				>
					<li class="lg:hidden">
						<NuxtLink
							class="w-full p-3 text-center block"
							:title="firstLevelLink.text"
							:to="`/${language}/${firstLevelLink.href}`"
							@click="closeMenuAndSetExpanded(firstLevelLink.pageId)"
							@focus="expandedMenuLinkId = firstLevelLink.pageId"
						>
							{{ firstLevelLink.text }}
							<span class="i-fa6-solid-arrow-up-right-from-square inline-block w-3 h-3 text-dark-3 ml-[0.125rem] align-baseline" />
						</NuxtLink>
					</li>

					<li
						v-for="secondLevelLink in firstLevelLink.children"
						:key="secondLevelLink.pageId"
						class="hoverable-child-menu-visible relative lg:(focus-within:bg-humbak-6 hover:bg-humbak-6)"
					>
						<NuxtLink
							class="w-full p-3 lg:h-full text-center"
							:class="secondLevelLink.children.length ? 'hidden' : 'block'"
							:title="secondLevelLink.text"
							:to="`/${language}/${secondLevelLink.href}`"
							@click="closeMenuAndSetExpanded(secondLevelLink.pageId)"
							@focus="expandedMenuLinkId = secondLevelLink.pageId"
						>
							{{ secondLevelLink.text }}
						</NuxtLink>

						<button
							class="relative w-full p-3 lg:h-full"
							:class="secondLevelLink.children.length ? '' : 'hidden'"
							:title="`rozwiń ${secondLevelLink.text}`"
							@mousedown.prevent="toggleMenuLinkExpanded(secondLevelLink.pageId, firstLevelLink.pageId)"
							@focus="expandIfChildNotExpanded(secondLevelLink.pageId, undefined, firstLevelLink.pageId)"
						>
							<span class="visually-hidden">rozwiń</span>
							{{ secondLevelLink.text }}
							<div
								v-if="secondLevelLink.children.length"
								class="pointer-events-none h-3 w-3 inline-block i-ph-caret-down-bold lg:(absolute block top-1/2 -translate-y-1/2 rotate-0)"
								:class="[
									isMenuExpanded(secondLevelLink.pageId) ? 'rotate-180' : '',
									isMenuToTheLeft(firstLevelIndex)
										? 'lg:(left-[0.125rem] i-ph-caret-left-bold)'
										: 'lg:(right-[0.125rem] i-ph-caret-right-bold)',
								]"
							/>
						</button>

						<menu
							v-if="secondLevelLink.children.length"
							class="bg-humbak-6 w-full lg:(absolute top-0 max-h-unset of-visible)"
							:class="[
								isMenuToTheLeft(firstLevelIndex)
									? 'lg:(left-0 -translate-x-full)' : 'lg:(right-0 translate-x-full)',
								isMenuExpanded(secondLevelLink.pageId)
									? 'max-h-unset' : 'max-h-0 of-hidden',
							]"
						>
							<li class="lg:hidden">
								<NuxtLink
									class="w-full p-3 text-center block"
									:to="`/${language}/${secondLevelLink.href}`"
									:title="secondLevelLink.text"
									@click="closeMenuAndSetExpanded(secondLevelLink.pageId)"
									@focus="expandedMenuLinkId = secondLevelLink.pageId"
								>
									{{ secondLevelLink.text }}
									<span class="i-fa6-solid-arrow-up-right-from-square inline-block w-3 h-3 text-dark-3 ml-[0.125rem] align-baseline" />
								</NuxtLink>
							</li>

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
									@click="closeMenuAndSetExpanded(secondLevelLink.pageId)"
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
