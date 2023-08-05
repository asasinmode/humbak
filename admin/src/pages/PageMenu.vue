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
	{ id: 1, text: 'Kursy', href: 'menu', position: 0, parentId: null },
	{ id: 2, text: 'Sekcja nurkowa', href: 'menu', position: 0, parentId: 1 },
	{ id: 3, text: 'Sekcja Brzesko', href: 'menu', position: 0, parentId: 2 },
	{ id: 4, text: 'Sekcja Proszówki', href: 'menu', position: 1, parentId: 2 },
	{ id: 5, text: 'Sekcja Dąbrowa Górnicza', href: 'menu', position: 2, parentId: 2 },
	{ id: 6, text: 'Sekcja przygoda', href: 'menu', position: 4, parentId: 2 },
	{ id: 7, text: 'Sekcja Niepołomice', href: 'menu', position: 3, parentId: 2 },
	{ id: 8, text: 'OWSD podstawowy', href: 'menu', position: 1, parentId: 1 },
	{ id: 9, text: 'Wyprawy i Aktywności', href: 'menu', position: 1, parentId: null },
	{ id: 10, text: 'Rejsy żeglarskie planowane', href: 'menu', position: 0, parentId: 9 },
	{ id: 11, text: 'Rejsy Ateny zatoka sarońska', href: 'menu', position: 0, parentId: 10 },
	{ id: 12, text: 'Wyprawy nurkowe planowane', href: 'menu', position: 1, parentId: 9 },
	{ id: 13, text: 'Safari Nurkowe Egipt - 11-18 listopad', href: 'menu', position: 0, parentId: 12 },
	{ id: 14, text: 'Wyprawa nurkowa na Maltę - 21-28 wrzesień', href: 'menu', position: 1, parentId: 12 },
	{ id: 15, text: 'Cennik', href: 'menu', position: 2, parentId: null },
	{ id: 16, text: 'O nas', href: 'menu', position: 3, parentId: null },
	{ id: 17, text: 'Usługi i serwis', href: 'menu', position: 4, parentId: null },
	{ id: 18, text: 'Sklep', href: 'menu', position: 0, parentId: 17 },
	{ id: 19, text: 'Wypożyczalnia', href: 'menu', position: 1, parentId: 17 },
	{ id: 20, text: 'Serwis sprzętu nurkowego', href: 'menu', position: 2, parentId: 17 },
	{ id: 21, text: 'Bony i kariera zawpdpwa', href: 'menu', position: 3, parentId: 17 },
	{ id: 22, text: 'Baseny', href: 'menu', position: 5, parentId: null },
	{ id: 23, text: 'Kuter port Nieznanowice', href: 'menu', position: 0, parentId: 22 },
	{ id: 24, text: 'Deep spot', href: 'menu', position: 1, parentId: 22 },
	{ id: 25, text: 'Basen Niepołomice', href: 'menu', position: 2, parentId: 22 },
	{ id: 26, text: 'Schowane 1', href: 'menu', position: 0, parentId: -1 },
	{ id: 27, text: 'Schowane 2', href: 'menu', position: 0, parentId: -1 },
	{ id: 28, text: 'Schowane 3', href: 'menu', position: 0, parentId: -1 },
	{ id: 29, text: 'Schowane 4', href: 'menu', position: 0, parentId: -1 },
	{ id: 30, text: 'Schowane 5', href: 'menu', position: 0, parentId: -1 },
	{ id: 31, text: 'Schowane 6', href: 'menu', position: 0, parentId: -1 },
	{ id: 32, text: 'Schowane 7', href: 'menu', position: 0, parentId: -1 },
];

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

const { toastGenericError, toast } = useToast();
const transformedHiddenMenuLinks = ref<IMenuTreeItem[]>(extractWithParentId(menuLinks, -1));
const transformedMenuLinks = ref<IMenuTreeItem[]>(extractWithParentId(menuLinks, null));

for (const child of transformedMenuLinks.value) {
	child.children = extractWithParentId(menuLinks, child.id);
	for (const grandchild of child.children) {
		grandchild.children = extractWithParentId(menuLinks, grandchild.id);
	}
}

const changedLinks: Pick<IMenuLink, 'id' | 'position' | 'parentId'>[] = [];

const nav = ref<HTMLElement | undefined>();
const currentlyGrabbedLink = shallowRef<{
	item: IMenuTreeItem;
	element: HTMLLIElement;
	path: number[];
}>();
let dropTarget: {
	element: HTMLLIElement;
	path: number[];
} | undefined;

function initLinkElementDrag(event: MouseEvent, item: IMenuTreeItem, path: number[]) {
	if (!nav.value) {
		toastGenericError();
		throw new Error('nav element not found');
	}

	if (event.button !== 0) {
		return;
	}
	event.preventDefault();

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
	currentlyGrabbedLink.value = { item, element, path };

	document.addEventListener('mousemove', moveCurrentlyDraggedLink);
	document.addEventListener('mouseup', cleanupDrag);
}

function moveCurrentlyDraggedLink(event: MouseEvent) {
	if (!currentlyGrabbedLink.value) {
		console.warn('Grabbed node not set');
		return;
	}
	currentlyGrabbedLink.value.element.style.left = `${event.clientX}px`;
	currentlyGrabbedLink.value.element.style.top = `${event.clientY}px`;
}

function handleDropIndicator(event: MouseEvent, path: number[]) {
	if (!currentlyGrabbedLink.value) {
		return;
	}

	const target = event.target as HTMLButtonElement;
	const element = target?.parentElement as HTMLLIElement;

	if (!element) {
		toastGenericError();
		throw new Error('parent of dragged element not found');
	}

	const isVertical = path.length > 1;
	const isBefore = event[isVertical ? 'offsetY' : 'offsetX'] < (
		target[isVertical ? 'offsetHeight' : 'offsetWidth'] / 2
	);
	const isOnSameLevel = arePathsTheSame(path.slice(0, -1), currentlyGrabbedLink.value.path.slice(0, -1));
	const isPathTheSame = isOnSameLevel
		&& path[path.length - 1] === currentlyGrabbedLink.value.path[currentlyGrabbedLink.value.path.length - 1];

	if (isPathTheSame) {
		return;
	}

	dropTarget?.element.classList.remove('drop-indicator-start', 'drop-indicator-end');
	dropTarget = { element, path };

	if (isOnSameLevel) {
		if (path[path.length - 1] === currentlyGrabbedLink.value.path[currentlyGrabbedLink.value.path.length - 1]) {
			return;
		}
		const oldIndexOnLastLevel = currentlyGrabbedLink.value.path[currentlyGrabbedLink.value.path.length - 1];
		const newIndexOnLastLevel = path[path.length - 1];

		const areSwapped = isBefore
			? newIndexOnLastLevel === oldIndexOnLastLevel + 1
			: newIndexOnLastLevel === oldIndexOnLastLevel - 1;
		if (areSwapped) {
			element.classList.toggle(isBefore ? 'drop-indicator-end' : 'drop-indicator-start', true);
			return;
		}
	}

	if ('menuDropPlaceholder' in element.dataset) {
		element.classList.toggle(
			element.dataset.indicatorOnStart === 'true'
				? 'drop-indicator-start'
				: 'drop-indicator-end',
			true
		);
	} else {
		element.classList.toggle(
			isBefore
				? 'drop-indicator-start'
				: 'drop-indicator-end',
			true
		);
	}
}

function cleanupDrag(event: MouseEvent) {
	const target = currentlyGrabbedLink.value?.item;
	const oldPath = currentlyGrabbedLink.value?.path;
	const newPath = dropTarget?.path;

	document.removeEventListener('mousemove', moveCurrentlyDraggedLink);
	document.removeEventListener('mouseup', cleanupDrag);
	currentlyGrabbedLink.value?.element.remove();
	currentlyGrabbedLink.value = undefined;
	dropTarget?.element.classList.remove('drop-indicator-end', 'drop-indicator-start');
	dropTarget = undefined;

	if (!oldPath || !newPath || !target) {
		return;
	}

	const isDroppedOutside = !event.target || !nav.value?.contains(event.target as HTMLElement);
	const isNewPathOnTheSameLevel = arePathsTheSame(oldPath.slice(0, -1), newPath.slice(0, -1));
	const isNewPathTheSame = isNewPathOnTheSameLevel && newPath[newPath.length - 1] === oldPath[oldPath.length - 1];

	if (isDroppedOutside || isNewPathTheSame) {
		return;
	}

	let isMovedIntoItself = newPath[0] === oldPath[0];
	if (isMovedIntoItself) {
		for (let i = 1; i < oldPath.length; i++) {
			isMovedIntoItself = isMovedIntoItself && newPath[i] === oldPath[i];
		}
		if (isMovedIntoItself) {
			toast('nowa pozycja nie może być w sobie', 'error');
			return;
		}
	}

	let maxMenuLevel = 3;
	for (const child of target.children) {
		maxMenuLevel = 2;
		if (child.children.length) {
			maxMenuLevel = 1;
			break;
		}
	}

	if (newPath.length > maxMenuLevel) {
		toast('nowa pozycja nie mieści w sobie dzieci', 'error');
		return;
	}

	let oldLevelReference = transformedMenuLinks.value;
	for (const index of oldPath.slice(0, -1)) {
		oldLevelReference = oldLevelReference[index].children;
	}
	let newLevelReference = transformedMenuLinks.value;
	let newParentId = null;
	for (const index of newPath.slice(0, -1)) {
		newParentId = newLevelReference[index].id;
		newLevelReference = newLevelReference[index].children;
	}

	newLevelReference.splice(
		newPath[newPath.length - 1],
		0,
		oldLevelReference.splice(oldPath[oldPath.length - 1], 1)[0]
	);

	for (let i = 0; i < newLevelReference.length; i++) {
		const { id } = newLevelReference[i];
		const indexInChanged = changedLinks.findIndex(link => link.id === id);

		if (indexInChanged === -1) {
			changedLinks.push({ id, position: i } as Pick<IMenuLink, 'id' | 'position' | 'parentId'>);
		} else {
			changedLinks[indexInChanged].id = id;
			changedLinks[indexInChanged].position = i;
		}
	}

	if (!isNewPathOnTheSameLevel) {
		for (let i = 0; i < oldLevelReference.length; i++) {
			const { id } = oldLevelReference[i];
			const indexInChanged = changedLinks.findIndex(link => link.id === id);

			if (indexInChanged === -1) {
				changedLinks.push({ id, position: i } as Pick<IMenuLink, 'id' | 'position' | 'parentId'>);
			} else {
				changedLinks[indexInChanged].id = id;
				changedLinks[indexInChanged].position = i;
			}
		}

		const changedLinkIndex = changedLinks.findIndex(link => link.id === target.id);
		changedLinks[changedLinkIndex].parentId = newParentId;
	}
}

function arePathsTheSame(path1: number[], path2: number[]) {
	let rv = path1.length === path2.length;
	if (!rv) {
		return false;
	}

	const biggerLength = path1.length > path2.length ? path1.length : path2.length;
	for (let i = 0; i < biggerLength; i++) {
		rv = rv && path1[i] === path2[i];
	}
	return rv;
}

function isMenuToTheLeft(indexOnLevel: number) {
	return indexOnLevel + 1 > Math.ceil(transformedMenuLinks.value.length / 2);
}

function saveChanges() {
	console.log('saving', changedLinks);
}
</script>

<template>
	<main class="px-2 pb-4 pt-[18px] md:px-0">
		<VButton class="ml-auto neon-green" @click="saveChanges">
			zapisz
		</VButton>
		<nav ref="nav" class="mx-auto max-w-360 bg-humbak text-black shadow">
			<menu class="flex flex-row">
				<li
					v-for="(firstLevelLink, firstLevelIndex) in transformedMenuLinks"
					:key="firstLevelLink.id"
					class="hoverable-child-menu-visible horizontal relative flex-center flex-1 flex-col list-none focus-within:bg-humbak-5 hover:bg-humbak-5"
				>
					<MenuLinkButton
						:item="firstLevelLink"
						:path="[firstLevelIndex]"
						@mousedown="initLinkElementDrag"
						@mouseenter="handleDropIndicator"
						@mousemove="handleDropIndicator"
					>
						<div
							v-if="firstLevelLink.children.length"
							class="i-solar-alt-arrow-down-linear pointer-events-none absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2"
						/>
					</MenuLinkButton>

					<menu
						v-if="firstLevelLink.children.length
							|| (currentlyGrabbedLink && currentlyGrabbedLink.item.id !== firstLevelLink.id)"
						class="absolute bottom-0 w-full translate-y-full bg-humbak-5"
					>
						<li
							v-for="(secondLevelLink, secondLevelIndex) in firstLevelLink.children"
							:key="secondLevelLink.id"
							class="hoverable-child-menu-visible vertical relative list-none focus-within:bg-humbak-6 hover:bg-humbak-6"
						>
							<MenuLinkButton
								:item="secondLevelLink"
								:path="[firstLevelIndex, secondLevelIndex]"
								@mousedown="initLinkElementDrag"
								@mouseenter="handleDropIndicator"
								@mousemove="handleDropIndicator"
							>
								<div
									v-if="secondLevelLink.children.length"
									class="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2"
									:class="
										isMenuToTheLeft(firstLevelIndex)
											? 'left-0 i-solar-alt-arrow-left-linear'
											: 'right-0 i-solar-alt-arrow-right-linear'
									"
								/>
							</MenuLinkButton>

							<menu
								v-if="secondLevelLink.children.length
									|| (currentlyGrabbedLink && currentlyGrabbedLink.item.id !== secondLevelLink.id)"
								class="absolute top-0 w-full bg-humbak-6"
								:class="
									isMenuToTheLeft(firstLevelIndex)
										? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
								"
							>
								<li
									v-for="(thirdLevelLink, thirdLevelIndex) in secondLevelLink.children"
									:key="thirdLevelLink.id"
									class="vertical relative list-none focus-within:bg-humbak-7 hover:bg-humbak-7"
								>
									<MenuLinkButton
										:item="thirdLevelLink"
										:path="[firstLevelIndex, secondLevelIndex, thirdLevelIndex]"
										@mousedown="initLinkElementDrag"
										@mouseenter="handleDropIndicator"
										@mousemove="handleDropIndicator"
									/>
								</li>
								<li
									v-if="currentlyGrabbedLink && !secondLevelLink.children.length"
									class="horizontal relative list-none focus-within:bg-humbak-7 hover:bg-humbak-7"
									data-menu-drop-placeholder
									:data-indicator-on-start="isMenuToTheLeft(firstLevelIndex)"
								>
									<MenuLinkButton
										:path="[firstLevelIndex, secondLevelIndex, 0]"
										class="min-h-10"
										@mouseenter="handleDropIndicator"
										@mousemove="handleDropIndicator"
									>
										<div class="i-fa6-solid-plus pointer-events-none mx-auto h-4 w-4" />
									</MenuLinkButton>
								</li>
							</menu>
						</li>
						<li
							v-if="currentlyGrabbedLink && !firstLevelLink.children.length"
							class="vertical relative list-none focus-within:bg-humbak-6 hover:bg-humbak-6"
							data-menu-drop-placeholder
						>
							<MenuLinkButton
								class="min-h-10"
								:path="[firstLevelIndex, 0]"
								@mouseenter="handleDropIndicator"
								@mousemove="handleDropIndicator"
							>
								<div class="i-fa6-solid-plus pointer-events-none mx-auto h-4 w-4" />
							</MenuLinkButton>
						</li>
					</menu>
				</li>
			</menu>
		</nav>
		<MenuHiddenLinksWidget
			:menu-links="transformedHiddenMenuLinks"
			:is-link-grabbed="!!currentlyGrabbedLink"
			@menu-link-mouse-down="initLinkElementDrag"
		/>
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

.drop-indicator-start:before,
.drop-indicator-end:before{
	@apply bg-black dark:bg-white
}

.drop-indicator-start:after,
.drop-indicator-end:after,
.drop-indicator-start:before,
.drop-indicator-end:before {
	@apply content-empty absolute z-100 pointer-events-none
}

.horizontal.drop-indicator-start:after,
.horizontal.drop-indicator-end:after {
  border-left: 0.25rem solid transparent;
  border-right: 0.25rem solid transparent;
  border-top: 0.35rem solid hsl(0 0% 0%);
}
.dark .horizontal.drop-indicator-start:after,
.dark .horizontal.drop-indicator-end:after {
	border-top: 0.35rem solid hsl(0 0% 100%);
}

.vertical.drop-indicator-start:after,
.vertical.drop-indicator-end:after {
  border-top: 0.25rem solid transparent;
  border-bottom: 0.25rem solid transparent;
  border-right: 0.35rem solid hsl(0 0% 0%);
}
.dark .vertical.drop-indicator-start:after,
.dark .vertical.drop-indicator-end:after {
	border-right: 0.35rem solid hsl(0 0% 100%);
}

.horizontal.drop-indicator-start,
.horizontal.drop-indicator-end {
	@apply before:(h-full w-[2px]) after:(top-0 -translate-y-full)
}

.horizontal.drop-indicator-start:before,
.horizontal.drop-indicator-start:after {
	@apply left-0 -translate-x-1/2
}

.horizontal.drop-indicator-end:before,
.horizontal.drop-indicator-end:after {
	@apply right-0 translate-x-1/2
}

.vertical.drop-indicator-start,
.vertical.drop-indicator-end {
	@apply before:(w-full h-[2px] right-0) after:(right-0 translate-x-full)
}

.vertical.drop-indicator-start:before,
.vertical.drop-indicator-start:after {
	@apply top-0 -translate-y-1/2
}

.vertical.drop-indicator-end:before,
.vertical.drop-indicator-end:after {
	@apply bottom-0 translate-y-1/2
}
</style>
