<script setup lang="ts">
const isExpanded = ref(true);

function onMenuToggle(isOpen: boolean) {
	isExpanded.value = isOpen;
}
</script>

<template>
	<button
		id="menu-toggle"
		title="menu"
		class="fixed z-10 flex items-start justify-end bg-black"
		:class="[
			isExpanded
				? 'bg-opacity-40 top-0 right-0 w-screen h-screen p-5 is-expanded'
				: 'bg-opacity-0 top-3 right-3 w-12 h-12 p-2',
		]"
		@click="onMenuToggle(!isExpanded)"
	>
		<div class="i-fa6-solid-bars h-8 w-8" />
	</button>

	<nav
		class="absolute z-11 grid grid-cols-2 max-h-[calc(100%_-_4rem)] w-full justify-items-center gap-x-4 gap-y-2 overflow-auto bg-inherit py-2 transition-transform"
		:class="[isExpanded ? 'translate-y-0 shadow-md' : '-translate-y-full']"
	>
		<RouterLink to="/" class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-button-cyan" @click="onMenuToggle(false)">
			strony
		</RouterLink>
		<RouterLink to="/pliki" class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-button-green" @click="onMenuToggle(false)">
			pliki
		</RouterLink>
		<RouterLink to="/css" class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-button-rose" @click="onMenuToggle(false)">
			css
		</RouterLink>
		<RouterLink to="/slider" class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-button-orange" @click="onMenuToggle(false)">
			slider
		</RouterLink>
		<RouterLink to="/stopka" class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-button-teal" @click="onMenuToggle(false)">
			stopka
		</RouterLink>

		<TheThemeToggle class="mt-2 justify-self-end filter-drop-shadow filter-drop-shadow-color-black/20" />
		<TheSettings class="mt-2 justify-self-start filter-drop-shadow filter-drop-shadow-color-black/20" @click="onMenuToggle(false)" />
	</nav>
</template>

<style>
#menu-toggle {
	--nav-transition-duration: 150ms;

	transition: background var(--nav-transition-duration) ease,
		width 0ms ease var(--nav-transition-duration),
		height 0ms ease var(--nav-transition-duration),
		right 0ms ease var(--nav-transition-duration),
		top 0ms ease var(--nav-transition-duration),
		padding 0ms ease var(--nav-transition-duration);
}
#menu-toggle.is-expanded {
	transition: background var(--nav-transition-duration) ease;
}
</style>
