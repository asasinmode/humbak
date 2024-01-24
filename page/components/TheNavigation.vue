<script setup lang="ts">
import type { IMenuTreeItem } from '@humbak/shared';

const props = defineProps<{
	menuLinks: IMenuTreeItem[];
}>();

function isMenuToTheLeft(indexOnLevel: number) {
	return indexOnLevel + 1 > Math.ceil(props.menuLinks.length / 2);
}
</script>

<template>
	<nav class="relative col-span-full hidden max-w-360 min-h-10 w-full bg-humbak shadow lg:block">
		<menu
			class="flex flex-row text-black"
		>
			<li
				v-for="(firstLevelLink, firstLevelIndex) in menuLinks"
				:key="firstLevelLink.pageId"
				class="hoverable-child-menu-visible horizontal relative min-w-0 flex-center flex-1 flex-col list-none focus-within:bg-humbak-5 hover:bg-humbak-5"
			>
				<button class="relative h-full w-full p-2 truncate">
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
						<button class="relative h-full w-full p-2">
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
								<button class="relative h-full w-full p-2">
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
.hoverable-child-menu-visible > menu {
	display: none;
}

.hoverable-child-menu-visible:hover > menu,
.hoverable-child-menu-visible:focus-within > menu {
	display: block;
}
</style>
