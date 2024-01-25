<script setup lang="ts">
import { useMobileMenu } from '@humbak/shared';
import type { IMenuTreeItem } from '@humbak/shared';

const props = defineProps<{
	menuLinks: IMenuTreeItem[];
}>();

function isMenuToTheLeft(indexOnLevel: number) {
	return indexOnLevel + 1 > Math.ceil(props.menuLinks.length / 2);
}

const firstFocusableNavElement = ref<HTMLButtonElement>();
const menu = ref<HTMLMenuElement>();
let secondToLastMenuLink: HTMLButtonElement;

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

onMounted(() => {
	if (!menu.value) {
		console.error('menu ref not found');
		return;
	}

	const buttons = menu.value.getElementsByTagName('button');

	secondToLastMenuLink = buttons.item(buttons.length - 2)!;

	const lastMenuLink = buttons.item(buttons.length - 1)!;
	lastMenuLink.addEventListener('focusin', lastElementFocusIn);
	lastMenuLink.addEventListener('focusout', lastElementFocusOut);
});
</script>

<template>
	<button
		id="menuToggle"
		title="menu"
		class="fixed z-100 flex items-start justify-end bg-black md:hidden"
		:class="[
			isExpanded
				? 'bg-opacity-40 top-0 right-0 w-screen h-screen p-5 cursor-default is-expanded'
				: 'bg-opacity-0 top-3 right-3 w-12 h-12 p-2',
		]"
		@click="toggleMenu(!isExpanded)"
		@focusin="toggleButtonFocusIn"
		@focusout="toggleButtonFocusOut"
	>
		<span class="visually-hidden">menu</span>
		<div class="i-fa6-solid-bars h-8 w-8" />
	</button>

	<nav
		id="mainNav"
		class="fixed w-full max-h-[calc(100vh_-_clamp(3rem,_-1rem_+_20vh,_8rem))] bg-humbak of-auto z-102 drop-shadow transition-transform lg:(sticky top-0 h-12 translate-y-0 of-visible)"
		:class="[isExpanded ? 'translate-y-0 shadow-md' : '-translate-y-full']"
	>
		<menu ref="menu" class="flex flex-col relative max-w-384 h-full text-black lg:(px-12 flex-row mx-auto)">
			<button
				ref="firstFocusableNavElement"
				class="w-12 h-12 absolute right-0 flex-center hoverable:bg-humbak-5"
				title="język"
			>
				<span class="visually-hidden">język</span>
				<div class="i-ph-translate-bold pointer-events-none w-6 h-6" />
			</button>

			<a
				id="skipContent"
				href="#content"
				class="fixed col-span-2 w-fit border border-black rounded-full bg-black px-3 py-1 text-5 text-white shadow transition-transform -translate-y-full focus-visible:translate-y-2 focus:translate-y-2 md:(-translate-y-[calc(100%_+_5rem)] left-1/2 -translate-x-1/2 focus-visible:translate-y-1 focus:translate-y-1)"
			>
				pomiń nawigację
			</a>

			<button class="w-12 h-12 absolute left-0 flex-center hoverable:bg-humbak-5" title="home">
				<span class="visually-hidden">home</span>
				<div class="i-ph-house-fill pointer-events-none w-6 h-6" />
			</button>

			<li
				v-for="(firstLevelLink, firstLevelIndex) in menuLinks"
				:key="firstLevelLink.pageId"
				class="hoverable-child-menu-visible horizontal relative min-w-0 flex-center flex-col list-none focus-within:bg-humbak-5 hover:bg-humbak-5 lg:(flex-1 h-full)"
			>
				<button class="relative w-full p-3 truncate lg:h-full">
					{{ firstLevelLink.text }}
					<div
						v-if="firstLevelLink.children.length"
						class="i-solar-alt-arrow-down-linear pointer-events-none absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2"
					/>
				</button>

				<menu
					v-if="firstLevelLink.children.length"
					class="absolute bottom-0 w-full translate-y-full bg-humbak-5"
				>
					<li
						v-for="secondLevelLink in firstLevelLink.children"
						:key="secondLevelLink.pageId"
						class="hoverable-child-menu-visible vertical relative list-none focus-within:bg-humbak-6 hover:bg-humbak-6"
					>
						<button class="relative w-full p-3 lg:h-full">
							{{ secondLevelLink.text }}
							<div
								v-if="secondLevelLink.children.length"
								class="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2"
								:class="
									isMenuToTheLeft(firstLevelIndex)
										? 'left-0 i-solar-alt-arrow-left-linear'
										: 'right-0 i-solar-alt-arrow-right-linear'
								"
							/>
						</button>

						<menu
							v-if="secondLevelLink.children.length"
							class="absolute top-0 w-full bg-humbak-6"
							:class="
								isMenuToTheLeft(firstLevelIndex)
									? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
							"
						>
							<li
								v-for="thirdLevelLink in secondLevelLink.children"
								:key="thirdLevelLink.pageId"
								class="vertical relative list-none focus-within:bg-humbak-7 hover:bg-humbak-7"
							>
								<button class="relative w-full p-3 lg:h-full">
									{{ thirdLevelLink.text }}
								</button>
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
		padding 0ms ease var(--nav-transition-duration);
}
#menuToggle.is-expanded {
	transition: background var(--nav-transition-duration) ease;
}

.hoverable-child-menu-visible > menu {
	display: none;
}

.hoverable-child-menu-visible:hover > menu,
.hoverable-child-menu-visible:focus-within > menu {
	display: block;
}

/* @media (max-width: 767px){ */
/* 	#skipContent:focus + a, #skipContent:focus-visible + a { */
/* 		margin-top: 3.125rem; */
/* 	} */
/* } */
</style>
