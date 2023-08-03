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
	id: number;
	path: number[];
	element: HTMLButtonElement;
};
type IDropPreview = {
	id: number;
	element: HTMLElement;
	isVertical: boolean;
	isBefore: boolean;
};

let currentlyGrabbedLink: IGrabbedLink | undefined;
let dropPreview: IDropPreview | undefined;
const nav = ref<HTMLElement | undefined>();

function initLinkElementDrag(event: MouseEvent, id: number, path: number[]) {
	event.preventDefault();
	if (!nav.value) {
		throw new Error('Nav element not found');
	}

	const target = event.target as HTMLButtonElement;
	const parentTarget = target.parentElement as HTMLLIElement;

	const element = parentTarget.cloneNode() as HTMLButtonElement;
	element.innerHTML = '';
	element.style.position = 'fixed';
	element.style.pointerEvents = 'none';
	element.style.left = `${event.clientX}px`;
	element.style.top = `${event.clientY}px`;
	element.style.width = `${parentTarget.offsetWidth}px`;
	element.style.height = `${parentTarget.offsetHeight}px`;
	element.style.opacity = '0.6';
	element.classList.add('dragged-menu-link', 'flex-1');

	const button = target.cloneNode() as HTMLButtonElement;
	button.innerText = target.innerText;
	element.appendChild(button);

	nav.value.appendChild(element);
	currentlyGrabbedLink = { id, path, element };

	document.addEventListener('mousemove', moveCurrentlyDraggedLink);
	document.addEventListener('mouseup', cleanupDrag);
}

function createDropPreview(event: MouseEvent, id: number, path: number[]) {
	if (!currentlyGrabbedLink || currentlyGrabbedLink.id === id) {
		return;
	}

	const target = event.target as HTMLButtonElement;
	const parentLi = target.parentElement as HTMLLIElement;
	const parentMenu = parentLi.parentElement as HTMLMenuElement;

	if (!parentLi || !parentMenu) {
		throw new Error('Parents for drop preview not found');
	}

	let currentLevelChildren = transformedMenuLinks.value;
	for (const index of path.slice(0, -1)) {
		currentLevelChildren = currentLevelChildren[index].children;
	}

	const isVertical = path.length > 1;
	const isBefore = event[isVertical ? 'offsetY' : 'offsetX'] < (
		target[isVertical ? 'offsetHeight' : 'offsetWidth'] / 2
	);
	const isAtTheEnd = !isBefore && path[path.length - 1] === currentLevelChildren.length - 1;

	let element = dropPreview?.element;
	if (!element) {
		element = currentlyGrabbedLink.element.cloneNode(true) as HTMLLIElement;
		element.style.position = '';
		element.style.top = '';
		element.style.left = '';
		element.style.width = '';
		element.style.height = '';
	}

	if (isAtTheEnd) {
		parentMenu.appendChild(element);
	} else {
		parentMenu.insertBefore(element, isBefore ? parentLi : parentLi.nextElementSibling);
	}

	dropPreview = {
		id,
		element,
		isVertical,
		isBefore,
	};
}

function adjustDropPreviewPosition(event: MouseEvent, id: number, path: number[]) {
	if (!dropPreview) {
		return;
	}

	const target = event.target as HTMLButtonElement;
	const isBefore = event[dropPreview.isVertical ? 'offsetY' : 'offsetX'] < (
		target[dropPreview.isVertical ? 'offsetHeight' : 'offsetWidth'] / 2
	);
}

function moveCurrentlyDraggedLink(event: MouseEvent) {
	if (!currentlyGrabbedLink) {
		console.warn('Grabbed node not set');
		return;
	}

	currentlyGrabbedLink.element.style.left = `${event.clientX}px`;
	currentlyGrabbedLink.element.style.top = `${event.clientY}px`;
}

function cleanupDrag() {
	document.removeEventListener('mousemove', moveCurrentlyDraggedLink);
	document.removeEventListener('mouseup', cleanupDrag);
	currentlyGrabbedLink?.element.remove();
	currentlyGrabbedLink = undefined;
	dropPreview?.element.remove();
	dropPreview = undefined;
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
								:item="secondLevelLink"
								:path="[firstLevelIndex, secondLevelIndex]"
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
										:item="thirdLevelLink"
										:path="[firstLevelIndex, secondLevelIndex, thirdLevelIndex]"
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
