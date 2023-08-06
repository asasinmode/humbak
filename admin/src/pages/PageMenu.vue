<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';
import MenuHiddenLinksWidget from '~/components/Menu/MenuHiddenLinksWidget.vue';
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
	{ id: 21, text: 'Bony i kariera zawodowa', href: 'menu', position: 3, parentId: 17 },
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
	{ id: 33, text: 'Schowane 8', href: 'menu', position: 0, parentId: -1 },
	{ id: 34, text: 'Schowane 9', href: 'menu', position: 0, parentId: -1 },
	{ id: 35, text: 'Schowane 10', href: 'menu', position: 0, parentId: -1 },
];
const originalMenuLinks = [...menuLinks];

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

const nav = ref<HTMLElement>();
const saveButton = ref<InstanceType<typeof VButton>>();
const hiddenLinksWidget = ref<InstanceType<typeof MenuHiddenLinksWidget>>();
const currentlyGrabbedLink = shallowRef<{
	item: IMenuTreeItem;
	element: HTMLLIElement;
	path: number[];
}>();
let dropTarget: {
	element: HTMLLIElement;
	path: number[];
	isBefore: boolean;
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
	element.style.zIndex = '21';
	element.classList.add('dragged-menu-link');
	element.classList.toggle('flex-1', true);

	const button = target.cloneNode() as HTMLButtonElement;
	button.innerText = target.innerText;
	element.appendChild(button);

	nav.value.appendChild(element);
	currentlyGrabbedLink.value = { item, element, path };
	dropTarget = { element: parentTarget, path, isBefore: false };

	document.addEventListener('mousemove', moveCurrentlyDraggedLink);
	document.addEventListener('mouseup', cleanupDrag);
}

function moveCurrentlyDraggedLink(event: MouseEvent) {
	if (!currentlyGrabbedLink.value) {
		console.error('grabbed node not set');
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

	const isDropTargetTheSame = dropTarget && arePathsTheSame(path, dropTarget.path) && isBefore === dropTarget.isBefore;
	if (isDropTargetTheSame) {
		return;
	}

	dropTarget?.element.classList.remove('drop-indicator-start', 'drop-indicator-end');
	dropTarget = { element, path, isBefore };

	const isOnSameLevel = arePathsTheSame(path.slice(0, -1), currentlyGrabbedLink.value.path.slice(0, -1));
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
	document.removeEventListener('mousemove', moveCurrentlyDraggedLink);
	document.removeEventListener('mouseup', cleanupDrag);
	currentlyGrabbedLink.value?.element.remove();
	dropTarget?.element.classList.remove('drop-indicator-end', 'drop-indicator-start');

	if (!currentlyGrabbedLink.value || !dropTarget) {
		toastGenericError();
		throw new Error(`cleanup called with related variables not set ${{
			currentlyGrabbedLink: currentlyGrabbedLink.value,
			dropTarget,
		}}`);
	}

	const { path: oldPath, item: target } = currentlyGrabbedLink.value;
	const { path: newPath, isBefore } = dropTarget;
	currentlyGrabbedLink.value = undefined;
	dropTarget = undefined;

	if (!nav.value || !hiddenLinksWidget.value?.container || !saveButton.value?.element || !event.target) {
		toastGenericError();
		throw new Error(`one of related elements not detected ${{
			nav: nav.value,
			hiddenLinksWidget: hiddenLinksWidget.value?.container,
			saveButton: saveButton.value?.element,
			eventTarget: event.target,
		}}`);
	}

	const isBeingHidden = hiddenLinksWidget.value.container.contains(event.target as HTMLElement);
	const isHidden = oldPath[0] === -1;
	if (isBeingHidden) {
		if (isHidden) {
			return;
		}

		const { levelReference: oldLevelReference } = getLevelReference(oldPath);

		hideLink(oldLevelReference.splice(oldPath[oldPath.length - 1], 1)[0]);
		for (const child of target.children) {
			hideLink(child);
			for (const grandchild of child.children) {
				hideLink(grandchild);
			}
		}
		handleLevelChanges(oldLevelReference);
		return;
	}

	const isDroppedOutside = !nav.value.contains(event.target as HTMLElement)
		|| event.target === saveButton.value.element;
	const isNewPathOnTheSameLevel = arePathsTheSame(oldPath.slice(0, -1), newPath.slice(0, -1));
	const isNewPathTheSame = isNewPathOnTheSameLevel && newPath[newPath.length - 1] === oldPath[oldPath.length - 1];

	if (isDroppedOutside || isNewPathTheSame) {
		return;
	}

	if (isHidden) {
		const { levelReference: newLevelReference, parentId: newParentId } = getLevelReference(newPath);
		const indexInHidden = transformedHiddenMenuLinks.value.findIndex(item => item.id === target.id);
		newLevelReference.splice(
			newPath[newPath.length - 1] + (isBefore ? 0 : 1),
			0,
			transformedHiddenMenuLinks.value.splice(indexInHidden, 1)[0]
		);

		handleLevelChanges(newLevelReference);
		const changedLinkIndex = changedLinks.findIndex(link => link.id === target.id);
		changedLinks[changedLinkIndex].parentId = newParentId;

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

	const { levelReference: oldLevelReference } = getLevelReference(oldPath);
	const { levelReference: newLevelReference, parentId: newParentId } = getLevelReference(newPath);

	newLevelReference.splice(
		newPath[newPath.length - 1] + (isNewPathOnTheSameLevel || isBefore ? 0 : 1),
		0,
		oldLevelReference.splice(oldPath[oldPath.length - 1], 1)[0]
	);

	handleLevelChanges(newLevelReference);

	if (!isNewPathOnTheSameLevel) {
		handleLevelChanges(oldLevelReference);

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

function getLevelReference(path: number[]) {
	let levelReference = transformedMenuLinks.value;
	let parentId = null;
	for (const index of path.slice(0, -1)) {
		parentId = levelReference[index].id;
		levelReference = levelReference[index].children;
	}

	return { levelReference, parentId };
}

function handleLevelChanges(level: IMenuTreeItem[]) {
	for (let i = 0; i < level.length; i++) {
		const { id } = level[i];
		const indexInChanged = changedLinks.findIndex(link => link.id === id);

		if (indexInChanged === -1) {
			changedLinks.push({ id, position: i } as Pick<IMenuLink, 'id' | 'position' | 'parentId'>);
		} else {
			changedLinks[indexInChanged].id = id;
			changedLinks[indexInChanged].position = i;
		}
	}
}

function hideLink(link: IMenuTreeItem) {
	transformedHiddenMenuLinks.value.unshift(link);
	const indexInChanged = changedLinks.findIndex(l => l.id === link.id);
	const changedData = {
		id: link.id,
		parentId: -1,
		position: 0,
	};
	if (indexInChanged === -1) {
		changedLinks.push(changedData);
	} else {
		changedLinks[indexInChanged] = changedData;
	}
}

function saveChanges() {
	const actuallyChanged = changedLinks.filter((link) => {
		const original = originalMenuLinks.find(l => l.id === link.id);
		if (!original) {
			toastGenericError();
			throw new Error(`link with id ${link.id} not found in original links`);
		}
		return link.position !== original.position || (link.parentId !== undefined && link.parentId !== original.parentId);
	});

	console.log('actually changed', actuallyChanged);
}
</script>

<template>
	<main class="px-2 pb-4 pt-[3.625rem] md:px-0 lg:pt-[4.375rem]">
		<VAlert class="max-w-3xl md:mx-auto lg:hidden" variant="warning">
			edytowanie menu nie jest dostępne na małych ekranch
		</VAlert>
		<nav ref="nav" class="relative mx-auto hidden max-w-360 bg-humbak shadow lg:block">
			<VButton
				id="menu-save-button"
				ref="saveButton"
				class="right-0 h-fit !absolute -top-4 -translate-y-full neon-green"
				@click="saveChanges"
			>
				zapisz
			</VButton>
			<menu class="flex flex-row text-black">
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
	</main>
	<MenuHiddenLinksWidget
		id="menu-hidden-links-widget"
		ref="hiddenLinksWidget"
		:menu-links="transformedHiddenMenuLinks"
		:is-link-grabbed="!!currentlyGrabbedLink"
		@menu-link-mouse-down="initLinkElementDrag"
	/>
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
	@apply content-empty absolute z-1 pointer-events-none
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

#menu-save-button {
	right: clamp(0.00rem, calc(3.46rem + -3.85vw), 1.00rem);
}

#menu-hidden-links-widget {
	left: clamp(0.00rem, calc(3.46rem + -3.85vw), 1.00rem);
}

@media (min-width: 90rem) {
	#menu-save-button {
		right: 0;
	}

	#menu-hidden-links-widget {
		left: calc((100% - 90rem) / 2);
	}
}
</style>
