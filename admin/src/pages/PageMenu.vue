<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';
import MenuHiddenLinksWidget from '~/components/Menu/MenuHiddenLinksWidget.vue';
import type { IMenuLink, IUniqueLanguage } from '~/composables/useApi';
import type { IMenuTreeItem } from '~/types';

const api = useApi();
const { toastGenericError, toast } = useToast();
const { confirm } = useConfirm();

const isLoading = ref(false);
const isLoadingLanguages = ref(false);
const selectedLanguage = ref<string>();
let previousSelectedLanguage: string | undefined;
const languages = ref<IUniqueLanguage[]>([]);
const transformedHiddenMenuLinks = ref<IMenuTreeItem[]>([]);
const transformedMenuLinks = ref<IMenuTreeItem[]>([]);
const saveButton = ref<InstanceType<typeof VButton>>();

let originalMenuLinks: IMenuLink[] = [];
let changedLinks: Pick<IMenuLink, 'pageId' | 'position' | 'parentId'>[] = [];

onMounted(async () => {
	isLoadingLanguages.value = true;
	isLoading.value = true;
	try {
		languages.value = await api.languages.$get().then(r => r.json());

		if (!languages.value.length) {
			return;
		}

		selectedLanguage.value = languages.value[0];
		getMenuLinks();
	} catch (e) {
		toast('błąd przy ładowaniu języków', 'error');
		console.error(e);
	} finally {
		isLoadingLanguages.value = false;
		isLoading.value = false;
	}
});

async function getMenuLinks() {
	if (selectedLanguage.value === undefined) {
		toastGenericError();
		throw new Error('calling get menu links without selected language');
	}

	if (previousSelectedLanguage === selectedLanguage.value) {
		return;
	}
	if (getActuallyChanged().length) {
		const proceed = await confirm(saveButton.value?.element);
		if (!proceed) {
			selectedLanguage.value = previousSelectedLanguage;
			return;
		}
	}

	isLoading.value = true;
	console.log('loading');
	try {
		await new Promise(resolve => setTimeout(resolve, 5000))
		const menuLinks = await api.menuLinks.$get({ query: { language: selectedLanguage.value } }).then(r => r.json());
		originalMenuLinks = [...menuLinks];
		changedLinks = [];
		previousSelectedLanguage = selectedLanguage.value;

		transformedHiddenMenuLinks.value = extractWithParentId(menuLinks, -1);
		transformedMenuLinks.value = extractWithParentId(menuLinks, null);
		for (const child of transformedMenuLinks.value) {
			child.children = extractWithParentId(menuLinks, child.pageId);
			for (const grandchild of child.children) {
				grandchild.children = extractWithParentId(menuLinks, grandchild.pageId);
			}
		}
	} catch (e) {
		toast('błąd przy ładowaniu menu', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
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
				pageId: currentLink.pageId,
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

const nav = ref<HTMLElement>();
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
	button.textContent = target.textContent;
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

	if (!isDropTargetTheSame) {
		dropTarget?.element.classList.remove('drop-indicator-start', 'drop-indicator-end');
	}

	dropTarget = { element, path, isBefore };

	const isOnSameLevel = arePathsTheSame(path.slice(0, -1), currentlyGrabbedLink.value.path.slice(0, -1));
	if (isOnSameLevel) {
		if (path[path.length - 1] === currentlyGrabbedLink.value.path[currentlyGrabbedLink.value.path.length - 1]) {
			return;
		}
		const oldIndexOnLastLevel = currentlyGrabbedLink.value.path[currentlyGrabbedLink.value.path.length - 1];
		const newIndexOnLastLevel = path[path.length - 1];

		const areSwapped = isBefore
			? (newIndexOnLastLevel === oldIndexOnLastLevel + 1) && oldIndexOnLastLevel !== -1
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
		throw new Error(`one of related variables not set ${{
			currentlyGrabbedLink: currentlyGrabbedLink.value,
			dropTarget,
		}}`);
	}

	const { path: oldPath, item: target } = currentlyGrabbedLink.value;
	const { path: newPath, isBefore } = dropTarget;
	currentlyGrabbedLink.value = undefined;
	dropTarget = undefined;

	if (!nav.value || !hiddenLinksWidget.value?.container || !event.target) {
		toastGenericError();
		throw new Error(`one of related elements not found ${{
			nav: nav.value,
			hiddenLinksWidget: hiddenLinksWidget.value?.container,
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

		for (const child of target.children) {
			hideLink(child);
			for (const grandchild of child.children) {
				hideLink(grandchild);
			}
			child.children = [];
		}
		target.children = [];

		hideLink(oldLevelReference.splice(oldPath[oldPath.length - 1], 1)[0]);
		handleLevelChanges(oldLevelReference);
		return;
	}

	const isDroppedOutside = !nav.value.contains(event.target as HTMLElement);
	const isNewPathOnTheSameLevel = arePathsTheSame(oldPath.slice(0, -1), newPath.slice(0, -1));
	const isNewPathTheSame = isNewPathOnTheSameLevel && newPath[newPath.length - 1] === oldPath[oldPath.length - 1];

	if (isDroppedOutside || isNewPathTheSame) {
		return;
	}

	if (isHidden) {
		const { levelReference: newLevelReference, parentId: newParentId } = getLevelReference(newPath);
		const indexInHidden = transformedHiddenMenuLinks.value.findIndex(item => item.pageId === target.pageId);
		newLevelReference.splice(
			newPath[newPath.length - 1] + (isBefore ? 0 : 1),
			0,
			transformedHiddenMenuLinks.value.splice(indexInHidden, 1)[0]
		);

		handleLevelChanges(newLevelReference);
		const changedLinkIndex = changedLinks.findIndex(link => link.pageId === target.pageId);
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
		const changedLinkIndex = changedLinks.findIndex(link => link.pageId === target.pageId);
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
		parentId = levelReference[index].pageId;
		levelReference = levelReference[index].children;
	}

	return { levelReference, parentId };
}

function handleLevelChanges(level: IMenuTreeItem[]) {
	for (let i = 0; i < level.length; i++) {
		const { pageId } = level[i];
		const indexInChanged = changedLinks.findIndex(link => link.pageId === pageId);

		if (indexInChanged === -1) {
			changedLinks.push({ pageId, position: i } as Pick<IMenuLink, 'pageId' | 'position' | 'parentId'>);
		} else {
			changedLinks[indexInChanged].pageId = pageId;
			changedLinks[indexInChanged].position = i;
		}
	}
}

function hideLink(link: IMenuTreeItem) {
	transformedHiddenMenuLinks.value.unshift(link);
	const indexInChanged = changedLinks.findIndex(l => l.pageId === link.pageId);
	const changedData = {
		pageId: link.pageId,
		parentId: -1,
		position: 0,
	};
	if (indexInChanged === -1) {
		changedLinks.push(changedData);
	} else {
		changedLinks[indexInChanged] = changedData;
	}
}

const isSaving = ref(false);
const {
	errors,
	handleError,
	clearErrors,
} = useErrors({ menuLinks: {} as Record<number, string> });

async function saveChanges() {
	clearErrors();
	const actuallyChanged = getActuallyChanged();

	if (actuallyChanged.length === 0) {
		toast('zapisano zmiany');
		return;
	}

	isSaving.value = true;
	try {
		await api.menuLinks.$put({ json: { menuLinks: actuallyChanged } });
		changedLinks = [];
		toast('zapisano zmiany');
	} catch (e) {
		handleError(e);
	} finally {
		isSaving.value = false;
	}
}

function getActuallyChanged() {
	return changedLinks.filter((link) => {
		const original = originalMenuLinks.find(l => l.pageId === link.pageId);
		if (!original) {
			toastGenericError();
			throw new Error(`link with id ${link.pageId} not found in original links`);
		}
		return link.position !== original.position || (link.parentId !== undefined && link.parentId !== original.parentId);
	});
}
</script>

<template>
	<main id="content" class="px-container grid grid-cols-[1fr_min-content] mx-auto max-w-360 gap-x-3 gap-y-5 pb-4 pt-[3.625rem] lg:px-0 lg:pt-[1.125rem]">
		<VAlert class="col-span-full mt-4 max-w-3xl md:mx-auto lg:hidden" variant="warning">
			edytowanie menu nie jest dostępne na małych ekranch
		</VAlert>
		<VCombobox
			id="menuLinksLanguage"
			v-model="selectedLanguage"
			class="menu-controls-padding-right justify-self-end !hidden !min-w-20 !w-20 lg:!flex"
			class-input="!w-20 !min-w-20"
			label="język"
			:options="languages"
			:is-loading="isLoadingLanguages"
			transform-options
			select-only
			label-visually-hidden
			@select-option="getMenuLinks"
		/>
		<VButton
			ref="saveButton"
			class="lg:mr-container hidden h-fit lg:block neon-green"
			:is-loading="isSaving"
			@click="saveChanges"
		>
			zapisz
		</VButton>
		<nav ref="nav" class="relative col-span-full hidden max-w-360 min-h-10 w-full bg-humbak shadow lg:block">
			<menu
				class="flex flex-row text-black"
				@mouseleave="dropTarget?.element.classList.remove('drop-indicator-start', 'drop-indicator-end')"
			>
				<li
					v-for="(firstLevelLink, firstLevelIndex) in transformedMenuLinks"
					:key="firstLevelLink.pageId"
					class="hoverable-child-menu-visible horizontal relative min-w-0 flex-center flex-1 flex-col list-none focus-within:bg-humbak-5 hover:bg-humbak-5"
				>
					<MenuLinkButton
						:item="firstLevelLink"
						:path="[firstLevelIndex]"
						@mousedown.left="initLinkElementDrag"
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
							|| (currentlyGrabbedLink && currentlyGrabbedLink.item.pageId !== firstLevelLink.pageId)"
						class="absolute bottom-0 w-full translate-y-full bg-humbak-5"
					>
						<li
							v-for="(secondLevelLink, secondLevelIndex) in firstLevelLink.children"
							:key="secondLevelLink.pageId"
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
									|| (currentlyGrabbedLink && currentlyGrabbedLink.item.pageId !== secondLevelLink.pageId)"
								class="absolute top-0 w-full bg-humbak-6"
								:class="
									isMenuToTheLeft(firstLevelIndex)
										? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
								"
							>
								<li
									v-for="(thirdLevelLink, thirdLevelIndex) in secondLevelLink.children"
									:key="thirdLevelLink.pageId"
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
				<li
					v-if="currentlyGrabbedLink && !transformedMenuLinks.length"
					class="horizontal relative w-full list-none focus-within:bg-humbak-5 hover:bg-humbak-5"
					data-menu-drop-placeholder
				>
					<MenuLinkButton
						class="min-h-10"
						:path="[0]"
						@mouseenter="handleDropIndicator"
						@mousemove="handleDropIndicator"
					>
						<div class="i-fa6-solid-plus pointer-events-none mx-auto h-4 w-4" />
					</MenuLinkButton>
				</li>
				<VLoading v-show="isLoading" class="absolute inset-0" size="20" />
			</menu>
		</nav>
		<p class="text-red-5">
			{{ errors.menuLinks }}
		</p>
	</main>
	<MenuHiddenLinksWidget
		ref="hiddenLinksWidget"
		class="menu-controls-padding-left"
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

.menu-controls-padding-left {
	left: 1rem;
}

@media(min-width: 90rem){
	.menu-controls-padding-left {
		left: clamp((100% - 90rem) / 2, 37rem + -40vw, 1rem);
	}
}
</style>
