<script setup lang="ts">
type IMenuLink = {
	id: number;
	text: string;
	href: string;
	position: number;
	parentId: null | number;
};

type IMenuTreeItem = {
	id: number;
	text: string;
	href: string;
	position: number;
	children: IMenuTreeItem[];
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

const transformedMenuLinks = convertToTree(menuLinks);

type IGrabbedLink = {
	id: number;
	path: (number | undefined)[];
	element: HTMLButtonElement;
};

let currentlyGrabbedLink: IGrabbedLink | undefined;
const nav = ref <HTMLElement | undefined>();

function initLinkElementDrag(event: MouseEvent, id: number, path: IGrabbedLink['path']) {
	event.preventDefault();
	if (!nav.value) {
		throw new Error('Nav element not found');
	}

	const originalElement = event.target as HTMLButtonElement;

	const element = originalElement.cloneNode() as HTMLButtonElement;
	element.style.position = 'fixed';
	element.style.pointerEvents = 'none';
	element.style.left = `${event.clientX}px`;
	element.style.top = `${event.clientY}px`;
	element.style.width = `${originalElement.offsetWidth}px`;
	element.style.height = `${originalElement.offsetHeight}px`;
	element.classList.add('bg-humbak');
	element.innerText = originalElement.innerText;

	nav.value.appendChild(element);
	currentlyGrabbedLink = { id, path, element };

	document.addEventListener('mousemove', moveCurrentlyDraggedLink);
	document.addEventListener('mouseup', cleanupDrag);
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
}
</script>

<template>
	<main class="px-2 pb-4 pt-[18px] md:px-0">
		<nav ref="nav" class="bg-humbak mx-auto max-w-360 text-black shadow">
			<menu class="flex flex-row">
				<li
					v-for="(firstLevelLink, firstLevelIndex) in transformedMenuLinks"
					:key="firstLevelLink.id"
					class="hoverable-child-menu-visible hover:bg-humbak-5 focus-within:bg-humbak-5 relative flex-center flex-1 flex-col"
				>
					<button
						class="relative h-full w-full p-2"
						@mousedown="initLinkElementDrag($event, firstLevelLink.id, [firstLevelIndex])"
					>
						{{ firstLevelLink.text }}
						<div
							v-if="firstLevelLink.children.length"
							class="i-solar-alt-arrow-down-linear pointer-events-none absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2"
						/>
					</button>

					<menu
						v-if="firstLevelLink.children.length"
						class="bg-humbak-5 absolute bottom-0 w-full translate-y-full"
					>
						<li
							v-for="(secondLevelLink, secondLevelIndex) in firstLevelLink.children"
							:key="secondLevelLink.id"
							class="hoverable-child-menu-visible hover:bg-humbak-6 focus-within:bg-humbak-6 relative"
						>
							<button
								class="relative h-full w-full p-2"
								@mousedown="initLinkElementDrag($event, secondLevelLink.id, [firstLevelIndex, secondLevelIndex])"
							>
								{{ secondLevelLink.text }}
								<div
									v-if="secondLevelLink.children.length"
									class="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2"
									:class="
										firstLevelIndex > Math.ceil(firstLevelLink.children.length / 2)
											? 'left-0 i-solar-alt-arrow-left-linear'
											: 'right-0 i-solar-alt-arrow-right-linear'
									"
								/>
							</button>

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
									class="hover:bg-humbak-7 focus-within:bg-humbak-7"
								>
									<button
										class="h-full w-full p-2"
										@mousedown="initLinkElementDrag($event, thirdLevelLink.id, [firstLevelIndex, secondLevelIndex, thirdLevelIndex])"
									>
										{{ thirdLevelLink.text }}
									</button>
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
</style>
