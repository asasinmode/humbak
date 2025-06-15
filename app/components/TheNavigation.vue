<script setup lang="ts">
import type { NuxtLink } from '#components';

const props = defineProps<{
	language: string;
	languages: string[];
	menuLinks: IMenuTreeItem[];
}>();

function isMenuToTheLeft(indexOnLevel: number) {
	return indexOnLevel + 1 > Math.ceil(props.menuLinks.length / 2);
}

const secondFocusableNavElement = ref<typeof NuxtLink>();
const menu = ref<HTMLMenuElement>();
let secondToLastMenuLink: HTMLElement;

const expandedMenuLinkId = ref<number>();

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
		const {
			oldValue: oldNestedHeightValue,
		} = updateMenuHeight(oldValue[1], '--nested-scroll-height', { reset: true });
		previousNestedHeight = oldNestedHeightValue;
	}
	const hasTopChanged = oldValue[0] !== newValue[0];
	if (hasTopChanged) {
		updateMenuHeight(oldValue[0], '--scroll-height', { reset: true });
	}

	const { newValue: nestedHeight } = updateMenuHeight(newValue[1], '--nested-scroll-height');
	updateMenuHeight(newValue[0], '--scroll-height', {
		add: nestedHeight,
		previouslyNestedExpandedHeight: hasNestedChanged && !hasTopChanged ? previousNestedHeight : 0,
	});
});

// todo handle keyboard navigation focus/expanded managment
// also handle large screens instead of focus within which stays after link click
// also change focus on page navigation to main instead of staying on menu
function expandButtonClick(id: number, parentId?: number) {
	if (expandedMenuIds.value[0] === id) {
		expandedMenuLinkId.value = undefined;
		return;
	}
	expandedMenuLinkId.value = expandedMenuLinkId.value === id ? parentId : id;
}

function updateMenuHeight(
	id: number | undefined,
	property: string,
	{ reset, add, previouslyNestedExpandedHeight }: {
		reset?: boolean;
		add?: number;
		previouslyNestedExpandedHeight?: number;
	} = {},
) {
	const element = id !== undefined ? document.getElementById(`menu${id}`) : null;
	if (!element) {
		return { oldValue: 0, newValue: 0 };
	}
	const oldValue = element.scrollHeight;
	let value = reset ? 0 : (element.scrollHeight + (add ?? 0));
	value -= previouslyNestedExpandedHeight ?? 0;

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
	() => (secondFocusableNavElement.value!.$el) as HTMLElement,
	() => secondToLastMenuLink,
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
	if (previousWindowWidth < window.innerWidth && previousWindowWidth < 1024 && window.innerWidth >= 1024) {
		expandedMenuLinkId.value = undefined;
		toggleMenu(false);
	}
	previousWindowWidth = window.innerWidth;

	if (window.innerWidth >= 1024) {
		return;
	}

	const nestedId = expandedMenuIds.value[1];
	const nestedElement = nestedId !== undefined ? document.getElementById(`menu${nestedId}`) : null;
	if (nestedElement) {
		nestedElement.style.height = 'auto';
		nestedElement.style.setProperty('--nested-scroll-height', `${nestedElement.scrollHeight}px`);
		nestedElement.style.height = '';
	}

	const topId = expandedMenuIds.value[0];
	const topElement = topId !== undefined ? document.getElementById(`menu${topId}`) : null;
	if (topElement) {
		topElement.style.height = 'auto';
		topElement.style.setProperty('--scroll-height', `${topElement.scrollHeight}px`);
		topElement.style.height = '';
	}
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
		class="fixed z-100 flex items-start justify-end bg-black outline-offset-2 before:(fixed right-[0.625rem] top-[0.625rem] h-11 w-11 rounded-full bg-humbak shadow content-empty) lg:hidden"
		:class="[
			isExpanded
				? 'bg-opacity-40 top-0 right-0 w-screen h-screen p-[1.375rem] cursor-default is-expanded'
				: 'bg-opacity-0 top-3 right-3 w-10 h-10 p-[0.625rem] rounded-full',
		]"
		@click.left="toggleMenu(!isExpanded)"
	>
		<span class="sr-only">menu</span>
		<div class="i-fa6-solid-bars h-5 w-5" />
	</button>

	<nav
		tabindex="-1"
		class="fixed top-0 z-102 max-h-[calc(100vh_-_clamp(3rem,_-1rem_+_20vh,_8rem))] w-full of-x-hidden of-y-auto bg-white drop-shadow-md transition-transform lg:(sticky h-12 translate-y-0 of-visible bg-humbak shadow-none)"
		:class="[isExpanded ? 'translate-y-0 shadow-md' : '-translate-y-full']"
	>
		<menu ref="menu" class="relative grid grid-cols-2 h-full max-w-384 text-black lg:(mx-auto flex flex-row px-12)">
			<TheLanguageSelect
				:language
				:languages
				@focusin="firstElementFocusIn"
				@focusout="firstElementFocusOut"
			/>

			<NuxtLink
				ref="secondFocusableNavElement"
				class="relative z-1 col-start-1 row-start-1 my-2 mr-2 h-12 w-12 flex-center justify-self-end lg:(absolute left-0 z-10 m-0 hoverable:bg-humbak-5 hoverable:text-inherit) hoverable:text-humbak-8"
				title="home"
				:to="`/${language}`"
				@click.left="closeMenuAndSetExpanded()"
			>
				<span class="sr-only">home</span>
				<div class="i-fa6-solid-house pointer-events-none h-6 w-6" />
			</NuxtLink>

			<NuxtLink
				id="skipContent"
				to="#humbakContent"
				class="fixed left-1/2 z-10 col-span-full w-fit whitespace-nowrap border border-black rounded-full bg-black px-3 py-1 text-5 text-white shadow transition-transform lg:(left-1/2 -translate-x-1/2 -translate-y-[calc(100%_+_5rem)] focus-visible:translate-y-1 focus:translate-y-1) -translate-x-1/2 -translate-y-full focus-visible:translate-y-3 focus:translate-y-3"
			>
				pomiń nawigację
			</NuxtLink>

			<li
				v-for="(firstLevelLink, firstLevelIndex) in menuLinks"
				:key="firstLevelLink.pageId"
				class="child-menu-visible-hoverable relative col-span-full min-w-0 flex flex-col of-clip lg:(h-full flex-1 of-visible hover:bg-humbak-5)"
			>
				<MenuLinkButton
					:menu-link="firstLevelLink"
					:is-expanded="isMenuExpanded(firstLevelLink.pageId)"
					:language
					@button-click="expandButtonClick"
					@link-click="closeMenuAndSetExpanded"
				/>

				<menu
					v-if="firstLevelLink.children.length"
					:id="`menu${firstLevelLink.pageId}`"
					class="h-[var(--scroll-height,_0px)] w-full of-hidden bg-humbak/20 transition-height lg:(absolute bottom-0 h-auto translate-y-full of-visible bg-humbak-5)"
				>
					<li
						v-for="secondLevelLink in firstLevelLink.children"
						:key="secondLevelLink.pageId"
						class="child-menu-visible-hoverable relative flex flex-col of-clip lg:(of-visible hover:bg-humbak-6)"
					>
						<MenuLinkButton
							:menu-link="secondLevelLink"
							:is-expanded="isMenuExpanded(secondLevelLink.pageId)"
							:is-to-left="isMenuToTheLeft(firstLevelIndex)"
							:parent-id="firstLevelLink.pageId"
							:language
							is-second-level
							@button-click="expandButtonClick"
							@link-click="closeMenuAndSetExpanded"
						/>

						<menu
							v-if="secondLevelLink.children.length"
							:id="`menu${secondLevelLink.pageId}`"
							class="h-[var(--nested-scroll-height,_0px)] w-full of-hidden bg-humbak/20 transition-height lg:(absolute top-0 h-auto of-visible bg-humbak-6)"
							:class="[
								isMenuToTheLeft(firstLevelIndex)
									? 'lg:(left-0 -translate-x-full)' : 'lg:(right-0 translate-x-full)',
							]"
						>
							<li
								v-for="thirdLevelLink in secondLevelLink.children"
								:key="thirdLevelLink.pageId"
								class="lg:(hover:bg-humbak-7)"
							>
								<NuxtLink
									class="block w-full p-3 text-center lg:h-full"
									:to="`/${language}/${thirdLevelLink.href}`"
									:title="thirdLevelLink.text"
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

	transition:
		background var(--nav-transition-duration) ease,
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
	.child-menu-visible-hoverable > menu {
		height: 0;
		overflow: hidden;
	}

	.child-menu-visible-hoverable:hover > menu {
		height: auto;
		overflow: visible;
	}
}
</style>
