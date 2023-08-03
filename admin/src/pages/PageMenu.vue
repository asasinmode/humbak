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
</script>

<template>
	<main class="px-2 pb-4 pt-[18px] md:px-0">
		<nav class="bg-humbak mx-auto max-w-360 text-black">
			<ul class="flex flex-row">
				<li
					v-for="(firstLevelLink, firstLevelIndex) in transformedMenuLinks"
					:key="firstLevelLink.id"
					class="hoverable-child-ul-visible hover:bg-humbak-5 focus-within:bg-humbak-5 relative flex-center flex-1 flex-col"
				>
					<button class="relative h-full w-full p-2">
						{{ firstLevelLink.text }}
						<div
							v-if="firstLevelLink.children.length"
							class="i-solar-alt-arrow-down-linear absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2"
						/>
					</button>

					<ul
						v-if="firstLevelLink.children.length"
						class="bg-humbak-5 absolute bottom-0 w-full translate-y-full"
					>
						<li
							v-for="secondLevelLink in firstLevelLink.children"
							:key="secondLevelLink.id"
							class="hoverable-child-ul-visible hover:bg-humbak-6 focus-within:bg-humbak-6 relative"
						>
							<button class="relative h-full w-full p-2">
								{{ secondLevelLink.text }}
								<div
									v-if="secondLevelLink.children.length"
									class="absolute top-1/2 h-3 w-3 -translate-y-1/2"
									:class="
										firstLevelIndex > Math.ceil(firstLevelLink.children.length / 2)
											? 'left-0 i-solar-alt-arrow-left-linear'
											: 'right-0 i-solar-alt-arrow-right-linear'
									"
								/>
							</button>

							<ul
								v-if="secondLevelLink.children.length"
								class="bg-humbak-6 absolute top-0 w-full"
								:class="
									firstLevelIndex > Math.ceil(firstLevelLink.children.length / 2)
										? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
								"
							>
								<li
									v-for="thirdLevelLink in secondLevelLink.children"
									:key="thirdLevelLink.id"
									class="hover:bg-humbak-7 focus-within:bg-humbak-7"
								>
									<button class="h-full w-full p-2">
										{{ thirdLevelLink.text }}
									</button>
								</li>
							</ul>
						</li>
					</ul>
				</li>
			</ul>
		</nav>
	</main>
</template>

<style>
.hoverable-child-ul-visible > ul {
	display: none;
}

.hoverable-child-ul-visible:hover > ul,
.hoverable-child-ul-visible:focus-within > ul {
	display: block;
}
</style>
