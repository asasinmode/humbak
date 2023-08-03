<script setup lang="ts">
import type { IMenuTreeItem } from '~/types';

type IMenuLink = {
	id: number;
	text: string;
	href: string;
	position: number;
	parentId: null | number;
};

const menuLinks: IMenuLink[] = [
	{ id: 1, text: 'third', href: 'menu', position: 2, parentId: null },
	{ id: 2, text: 'second', href: 'menu', position: 1, parentId: null },
	{ id: 3, text: 'first', href: 'menu', position: 0, parentId: null },
	{ id: 4, text: 'third nested', href: 'menu', position: 2, parentId: 1 },
	{ id: 5, text: 'second nested second', href: 'menu', position: 1, parentId: 2 },
	{ id: 6, text: 'second nested first', href: 'menu', position: 0, parentId: 2 },
	{ id: 7, text: 'first nested', href: 'menu', position: 0, parentId: 3 },
	{ id: 8, text: 'first nested second', href: 'menu', position: 1, parentId: 4 },
	{ id: 9, text: 'first nested first', href: 'menu', position: 0, parentId: 4 },
	{ id: 10, text: 'first nested third', href: 'menu', position: 2, parentId: 4 },
	{ id: 11, text: 'second nested first', href: 'menu', position: 0, parentId: 5 },
	{ id: 12, text: 'second nested third', href: 'menu', position: 2, parentId: 5 },
	{ id: 13, text: 'second nested second', href: 'menu', position: 1, parentId: 5 },
	{ id: 14, text: 'third nested first', href: 'menu', position: 0, parentId: 6 },
	{ id: 15, text: 'third nested second', href: 'menu', position: 1, parentId: 6 },
	{ id: 16, text: 'third nested third', href: 'menu', position: 2, parentId: 6 },
];

function convertToTree(menuLinks: IMenuLink[]) {
	const rv = extractWithParentId(menuLinks, null);
	for (const child of rv) {
		child.children = extractWithParentId(menuLinks, child.id);
		for (const grandchild of child.children) {
			grandchild.children = extractWithParentId(menuLinks, grandchild.id);
		}
	}
	return rv;
}

function extractWithParentId(menuLinks: IMenuLink[], parentId: null | number): IMenuTreeItem[] {
	const rv: IMenuTreeItem[] = [];
	let index = 0;
	while (index < menuLinks.length) {
		let currentLink = menuLinks[index];

		if (currentLink.parentId === parentId) {
			let indexInDestination = 0;
			for (const { position } of rv) {
				if (position < currentLink.position) {
					indexInDestination += 1;
				}
			}

			currentLink = menuLinks.splice(index, 1)[0];

			rv.splice(indexInDestination, 0, {
				id: currentLink.id,
				text: currentLink.text,
				href: currentLink.href,
				position: currentLink.position,
				children: [],
			});

			index -= 1;
		}
		index += 1;
	}
	return rv;
}

const transformedMenuLinks = ref(convertToTree(menuLinks));

type IGrabbedLink = {
	item: IMenuTreeItem;
	element: HTMLLIElement;
	path: number[];
};
type IDropPreview = {
	element: HTMLLIElement;
	path: number[];
	isBefore: boolean;
};

let currentlyGrabbedLink: IGrabbedLink | undefined;
let dropPreview: IDropPreview | undefined;
const nav = ref<HTMLElement | undefined>();

function initLinkElementDrag(event: MouseEvent, item: IMenuTreeItem, path: number[]) {
	event.preventDefault();
	if (!nav.value) {
		throw new Error('Nav element not found');
	}

	const target = event.target as HTMLButtonElement;
	const parentTarget = target.parentElement as HTMLLIElement;

	const element = parentTarget.cloneNode() as HTMLLIElement;
	element.innerHTML = '';
	element.style.position = 'fixed';
	element.style.pointerEvents = 'none';
	element.style.left = `${event.clientX}px`;
	element.style.top = `${event.clientY}px`;
	element.style.width = `${parentTarget.offsetWidth}px`;
	element.style.height = `${parentTarget.offsetHeight}px`;
	element.style.opacity = '0.6';
	element.classList.add('dragged-menu-link');
	element.classList.toggle('flex-1', true);

	const button = target.cloneNode() as HTMLButtonElement;
	button.innerText = target.innerText;
	element.appendChild(button);

	nav.value.appendChild(element);
	currentlyGrabbedLink = { item, element, path };

	document.addEventListener('mousemove', moveCurrentlyDraggedLink);
	document.addEventListener('mouseup', cleanupDrag);
}

function createDropPreview(event: MouseEvent, path: number[]) {
	if (!currentlyGrabbedLink) {
		return;
	}

	const target = event.target as HTMLButtonElement;
	const parentLi = target.parentElement as HTMLLIElement;
	const parentMenu = parentLi.parentElement as HTMLMenuElement;

	if (!parentLi || !parentMenu) {
		throw new Error('Parents for drop preview not found');
	}

	const isVertical = path.length > 1;
	const isBefore = event[isVertical ? 'offsetY' : 'offsetX'] < (
		target[isVertical ? 'offsetHeight' : 'offsetWidth'] / 2
	);

	let element = dropPreview?.element;
	if (!element) {
		element = currentlyGrabbedLink.element.cloneNode(true) as HTMLLIElement;
		element.style.position = '';
		element.style.top = '';
		element.style.left = '';
		element.style.width = '';
		element.style.height = '';
	}

	dropPreview = { element, path, isBefore };

	const isPreviewInOriginalPosition = comparePreviewOriginalPosition(isBefore, path);
	if (!isPreviewInOriginalPosition) {
		parentMenu.insertBefore(element, isBefore ? parentLi : parentLi.nextElementSibling);
		return;
	}
	if (element.parentElement) {
		element.parentElement.removeChild(element);
	}
}

function adjustDropPreviewPosition(
	event: MouseEvent,
	path: number[]
) {
	if (!dropPreview) {
		return;
	}

	const target = event.target as HTMLButtonElement;
	const parentLi = target.parentElement as HTMLLIElement;
	const parentMenu = parentLi.parentElement as HTMLMenuElement;

	if (!parentLi || !parentMenu) {
		throw new Error('Parents for drop preview not found');
	}

	const isVertical = path.length > 1;
	const isBefore = event[isVertical ? 'offsetY' : 'offsetX'] < (
		target[isVertical ? 'offsetHeight' : 'offsetWidth'] / 2
	);

	dropPreview.path = path;
	dropPreview.isBefore = isBefore;

	const isPreviewInOriginalPosition = comparePreviewOriginalPosition(isBefore, path);
	if (!isPreviewInOriginalPosition) {
		parentMenu.insertBefore(dropPreview.element, isBefore ? parentLi : parentLi.nextElementSibling);
		return;
	}
	if (dropPreview.element.parentElement) {
		dropPreview.element.parentElement.removeChild(dropPreview.element);
	}
}

function moveCurrentlyDraggedLink(event: MouseEvent) {
	if (!currentlyGrabbedLink) {
		console.warn('Grabbed node not set');
		return;
	}

	currentlyGrabbedLink.element.style.left = `${event.clientX}px`;
	currentlyGrabbedLink.element.style.top = `${event.clientY}px`;
}

function cleanupDrag(event: MouseEvent) {
	if (!dropPreview || !currentlyGrabbedLink) {
		throw new Error('Associated variables not set');
	}

	const path = dropPreview.path;
	const isBefore = dropPreview.isBefore;

	document.removeEventListener('mousemove', moveCurrentlyDraggedLink);
	document.removeEventListener('mouseup', cleanupDrag);
	currentlyGrabbedLink?.element.remove();
	currentlyGrabbedLink = undefined;
	dropPreview?.element.remove();
	dropPreview = undefined;

	const isDroppedOutside = !event.target || !nav.value?.contains(event.target as HTMLElement);
	const isPreviewInOriginalPosition = comparePreviewOriginalPosition(isBefore, path);
	if (isDroppedOutside || isPreviewInOriginalPosition) {
		return;
	}

	console.log('moving thing from', [...currentlyGrabbedLink.path], 'to', [...path]);
}

function comparePreviewOriginalPosition(isBefore: boolean, path: number[]) {
	if (
		!dropPreview
		|| !currentlyGrabbedLink
		|| path.length !== currentlyGrabbedLink.path.length
		|| isBefore !== dropPreview.isBefore
	) {
		return false;
	}

	let rv = true;
	for (let i = 0; i < path.length; i++) {
		rv = rv && currentlyGrabbedLink.path[i] === path[i];
	}

	const lastIndex = path.length - 1;
	if (isBefore && path[lastIndex] === currentlyGrabbedLink.path[lastIndex] + 1) {
		return true;
	} else if (!isBefore && path[lastIndex] === currentlyGrabbedLink.path[lastIndex] - 1) {
		return true;
	}

	return rv;
}
</script>

<template>
	<main class="px-2 pb-4 pt-[18px] md:px-0">
		<nav ref="nav" class="bg-humbak mx-auto max-w-360 text-black shadow">
			<menu class="flex flex-row">
				<li
					v-for="(firstLevelLink, firstLevelIndex) in transformedMenuLinks"
					:key="firstLevelLink.id"
					class="hoverable-child-menu-visible hover:bg-humbak-5 focus-within:bg-humbak-5 relative flex-center flex-1 flex-col list-none"
				>
					<MenuLinkButton
						:item="firstLevelLink"
						:path="[firstLevelIndex]"
						:current-level-children-length="transformedMenuLinks.length"
						@mousedown="initLinkElementDrag"
						@mouseenter="createDropPreview"
						@mousemove="adjustDropPreviewPosition"
					>
						<div
							v-if="firstLevelLink.children.length"
							class="i-solar-alt-arrow-down-linear pointer-events-none absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2"
						/>
					</MenuLinkButton>

					<menu
						v-if="firstLevelLink.children.length"
						class="bg-humbak-5 absolute bottom-0 w-full translate-y-full"
					>
						<li
							v-for="(secondLevelLink, secondLevelIndex) in firstLevelLink.children"
							:key="secondLevelLink.id"
							class="hoverable-child-menu-visible hover:bg-humbak-6 focus-within:bg-humbak-6 relative list-none"
						>
							<MenuLinkButton
								level-vertical
								:item="secondLevelLink"
								:path="[firstLevelIndex, secondLevelIndex]"
								:current-level-children-length="firstLevelLink.children.length"
								@mousedown="initLinkElementDrag"
								@mouseenter="createDropPreview"
								@mousemove="adjustDropPreviewPosition"
							>
								<div
									v-if="secondLevelLink.children.length"
									class="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2"
									:class="
										firstLevelIndex > Math.ceil(firstLevelLink.children.length / 2)
											? 'left-0 i-solar-alt-arrow-left-linear'
											: 'right-0 i-solar-alt-arrow-right-linear'
									"
								/>
							</MenuLinkButton>

							<menu
								v-if="secondLevelLink.children.length"
								class="bg-humbak-6 absolute top-0 w-full"
								:class="
									firstLevelIndex > Math.ceil(firstLevelLink.children.length / 2)
										? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
								"
							>
								<li
									v-for="(thirdLevelLink, thirdLevelIndex) in secondLevelLink.children"
									:key="thirdLevelLink.id"
									class="hover:bg-humbak-7 focus-within:bg-humbak-7 list-none"
								>
									<MenuLinkButton
										level-vertical
										:item="thirdLevelLink"
										:path="[firstLevelIndex, secondLevelIndex, thirdLevelIndex]"
										:current-level-children-length="secondLevelLink.children.length"
										@mousedown="initLinkElementDrag"
										@mouseenter="createDropPreview"
										@mousemove="adjustDropPreviewPosition"
									/>
								</li>
							</menu>
						</li>
					</menu>
				</li>
			</menu>
		</nav>
	</main>
</template>

<style>
.hoverable-child-menu-visible > menu {
	display: none;
}

.hoverable-child-menu-visible:hover > menu,
.hoverable-child-menu-visible:focus-within > menu {
	display: block;
}

.dragged-menu-link {
	@apply bg-black text-white dark:(bg-white text-black)
}
</style>
